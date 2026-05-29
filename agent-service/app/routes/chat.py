from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from anthropic import Anthropic
from app.services.supabase import search_documents
from app.config import config


router = APIRouter()
anthropic_client = Anthropic(api_key=config.ANTHROPIC_API_KEY)


class ChatRequest(BaseModel):
    query:str
    project_id:str


class Source(BaseModel):
    content:str
    similarity:float

class ChatResponse(BaseModel):
    answer:str
    sources:list[Source]
    context_used:bool


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    chunks= search_documents(
        query=request.query,
        project_id=request.project_id
    )

    context_used = len(chunks) > 0


    if context_used:
        context = "\n\n---\n\n".join([
            f"[Source {i+1}]\n{chunk['content']}"
            for i, chunk in enumerate(chunks)
        ])
        system_prompt = f"""Answer the user's question based strictly on this context:
<context>
{context}
</context>

If the answer is not in the context, say so clearly."""
    else:
        system_prompt = "Answer the user's question as helpfully as possible."


    response = anthropic_client.messages.create(
    model="claude-haiku-4-5-20251001",
    max_tokens=1000,
    system=system_prompt,
    messages=[{"role": "user", "content": request.query}]
)

    answer = response.content[0].text

    sources = [
        Source(
            content=chunk["content"][:150],
            similarity=chunk["similarity"]
        )
        for chunk in chunks
    ]

    return ChatResponse(
        answer=answer,
        sources=sources,
        context_used=context_used
    )