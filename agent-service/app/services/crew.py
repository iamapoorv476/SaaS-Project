from crewai import Agent, Task, Crew, Process
from crewai.tools import BaseTool

from app.services.supabase import search_documents, supabase
from app.config import config
from pydantic import BaseModel, Field
import os
os.environ["ANTHROPIC_API_KEY"] = config.ANTHROPIC_API_KEY

class DocumentSearchTool(BaseTool):
    name: str ="search_documents"
    description: str = """Search through uploaded documents using semantic similarity.
    Input should be a search query string.
    Returns relevant document chunks with similarity scores."""
    project_id: str = Field(default="")

    def _run(self, query: str) -> str:
        chunks = search_documents(
            query=query,
            project_id=self.project_id,
            match_count=5
        )
        if not chunks:
            return "No relevant documents found."
        

        results = []
        for i, chunk in enumerate(chunks):
            results.append(
                f"[Chunk {i+1}] similarity={chunk['similarity']:.2f}\n{chunk['content']}"

            )
        return "\n\n---\n\n".join(results)
    
class DocumentListTool(BaseTool):
    name: str = "list_documents"
    description: str = """List all documents available in the project.
    Returns document names and previews.
    Use this first to understand what documents are available."""
    
    project_id: str = Field(default="")

    def _run(self, query: str = "") -> str:
        result = supabase.from_("documents") \
            .select("name, content") \
            .eq("project_id", self.project_id) \
            .execute()
        
        if not result.data:
            return "No documents found in this project."
        
        docs = []
        for doc in result.data:
            preview = doc["content"][:200]
            docs.append(f"Document: {doc['name']}\nPreview: {preview}...")

        return "\n\n---\n\n".join(docs)
    

def create_analysis_crew(project_id: str, topic: str) -> Crew:
    """
    Creates a crew of three agents that collaborate to analyze documents.

    Process.sequential means agents run one after another:
    Researcher → Analyst → Writer
    Each agent's output becomes context for the next.
    """

    llm = "claude-haiku-4-5-20251001"


    search_tool = DocumentSearchTool(project_id=project_id)
    list_tool = DocumentListTool(project_id=project_id)


    # Agent 1 — Researcher
    # Responsible for finding all relevant information

    researcher = Agent(
        role="Document Researcher",
        goal=f"Find all relevant information about: {topic}",
        backstory="""You are an expert researcher who thoroughly reads
        documents and extracts every relevant piece of information.
        You never miss important details and always cite your sources.
        """,
        tools=[search_tool, list_tool],
        llm=llm,
        verbose=True,
        max_iter=5,
    )

    # Agent 2 — Analyst
    # Takes researcher output and identifies patterns, risks, insights
    analyst= Agent(
        role="Data Analyst",
        goal="Analyze the research findings and identify key insights, patterns, and gaps",
        backstory="""You are a senior analyst who takes raw research and
        transforms it into structured insights. You identify what's important,
        what's missing, and what implications the information has.""",
        tools=[search_tool],
        llm=llm,
        verbose=True,
        max_iter=3,
    )

    # Agent 3 — Writer
    # Takes analysis and produces clean structured report
    writer = Agent(
        role="Report Writer",
        goal="Write a clear, structured analysis report based on the research and analysis",
        backstory="""You are a technical writer who transforms complex analysis 
        into clear, well-structured reports. Your reports are concise, 
        actionable, and easy to understand.""",
        tools=[],
        llm=llm,
        verbose=True,
        max_iter=2,
    )

    # Tasks — what each agent needs to do
    research_task = Task(
        description=f"""Research the following topic using the available documents: {topic}


        Steps:
        1. First list all available documents to understand what's available
        2. Search for relevant information about the topic
        3. Compile all findings with source references

        Output: A comprehensive list of all relevant information found.""",
        agent=researcher,
        expected_output="Detailed research findings with source references"

    )

    analysis_task = Task(
        description=f"""Analyze the research findings about: {topic}

        Based on the researcher's findings:
        1. Identify the 3-5 most important insights
        2. Note any gaps or missing information
        3. Identify patterns or contradictions
        4. Assess the completeness of the information

        Output: Structured analysis with key insights and gaps identified.""",
        agent=analyst,
        expected_output="Structured analysis with insights, gaps, and patterns",
        context=[research_task]
    )

    writing_task = Task(
        description=f"""Write a professional analysis report about: {topic}


        Using the research and analysis provided:
        1. Write an executive summary (2-3 sentences)
        2. List key findings (bullet points)
        3. List identified gaps or limitations
        4. Write a conclusion with recommendations

        Keep it concise and professional.""",
        agent=writer,
        expected_output="Professional report with executive summary, findings, gaps, and recommendations",
        context=[research_task, analysis_task]

    )

    crew = Crew(
        agent=[researcher, analyst, writer],
        tasks=[research_task, analysis_task, writing_task],
        process=Process.sequential,
        verbose=True,
    )

    return crew


def run_analysis(project_id: str, topic: str) -> dict:
    crew = create_analysis_crew(project_id, topic)
    result = crew.kickoff()

    return {
        "topic": topic,
        "project_id": project_id,
        "report": str(result),
        "agents_used": ["Document Researcher", "Data Analyst", "Report Writer"],
        "process": "sequential"
    }
