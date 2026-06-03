from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import create_react_agent
from langchain_anthropic import ChatAnthropic
from langchain_core.tools import tool
from app.services.supabase import search_documents, supabase
from app.config import config

# TypedDict — defines the shape of state that flows through the graph
class AgentState(TypedDict):
    query: str
    project_id: str
    answer: str
    sources: list[dict]
    steps: list[str]


# @tool decorator — turns a regular function into a LangGraph tool
# The docstring is what the agent reads to decide when to use this tool
@tool
def search_project_documents(query: str, project_id: str) -> str:
    """
    Search through the organization's uploaded documents using semantic similarity.
    Use this when the user asks about anything that might be in their documents,
    company knowledge base, or uploaded files.
    """
    chunks = search_documents(query=query, project_id=project_id)

    if not chunks:
        return "No relevant documents found for this query."

    results = []
    for i, chunk in enumerate(chunks):
        results.append(f"[Source {i+1}] (similarity: {chunk['similarity']:.2f})\n{chunk['content']}")

    return "\n\n---\n\n".join(results)


@tool
def get_project_info(project_id: str) -> str:
    """
    Get basic information about the project — document count, name, and description.
    Use this when the user asks about their project or what documents are available.
    """
    try:
        project = supabase.from_("projects") \
            .select("name, description, status") \
            .eq("id", project_id) \
            .single() \
            .execute()

        doc_count = supabase.from_("documents") \
            .select("id", count="exact") \
            .eq("project_id", project_id) \
            .execute()

        if not project.data:
            return "Project not found."

        p = project.data
        count = doc_count.count or 0

        return f"Project: {p['name']}\nDescription: {p.get('description', 'No description')}\nStatus: {p['status']}\nDocuments uploaded: {count}"

    except Exception as e:
        return f"Could not fetch project info: {str(e)}"


@tool
def summarize_all_documents(project_id: str) -> str:
    """
    Retrieve and summarize all documents in the project.
    Use this when the user wants an overview of everything in their knowledge base.
    """
    try:
        docs = supabase.from_("documents") \
            .select("name, content") \
            .eq("project_id", project_id) \
            .execute()

        if not docs.data:
            return "No documents found in this project."

        summaries = []
        for doc in docs.data:
            # First 300 chars of each document as preview
            preview = doc["content"][:300]
            summaries.append(f"Document: {doc['name']}\nPreview: {preview}...")

        return "\n\n---\n\n".join(summaries)

    except Exception as e:
        return f"Could not fetch documents: {str(e)}"


def create_agent(project_id: str):
    model = ChatAnthropic(
        model="claude-haiku-4-5-20251001",
        api_key=config.ANTHROPIC_API_KEY,
        temperature=0
    )

    tools = [
        search_project_documents,
        get_project_info,
        summarize_all_documents,
    ]

    system_prompt = f"""You are an AI assistant for a specific project (ID: {project_id}).

You have access to three tools:
1. search_project_documents — semantic search through uploaded documents
2. get_project_info — get project metadata and document count  
3. summarize_all_documents — get previews of all documents

Always use project_id = "{project_id}" when calling tools.

Think step by step:
- What is the user asking?
- Which tool(s) would best answer this?
- After getting results, synthesize a clear answer with source references.

If documents don't contain relevant information, say so clearly."""

    from langchain_core.messages import SystemMessage

    agent = create_react_agent(
        model=model,
        tools=tools,
        messages_modifier=SystemMessage(content=system_prompt),
    )

    return agent


def run_agent(query: str, project_id: str) -> dict:
    """
    Runs the ReAct agent and returns structured response.
    """
    agent = create_agent(project_id)

    # Invoke the agent with the user query
    result = agent.invoke({
        "messages": [{"role": "user", "content": query}]
    })

    # Extract final answer from last message
    final_message = result["messages"][-1]
    answer = final_message.content

    # Extract tool calls made during reasoning (the "steps")
    steps = []
    sources = []

    for message in result["messages"]:
        # ToolMessage = result returned by a tool call
        if hasattr(message, "type") and message.type == "tool":
            steps.append(f"Used tool: {message.name}")
            # If it was a document search, extract as source
            if message.name == "search_project_documents":
                sources.append({
                    "tool": message.name,
                    "result_preview": str(message.content)[:200]
                })

    return {
        "answer": answer,
        "steps": steps,
        "sources": sources,
        "tools_used": len(steps)
    }