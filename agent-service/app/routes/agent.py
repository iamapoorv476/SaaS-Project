from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.agent import run_agent

router = APIRouter()


class AgentRequest(BaseModel):
    query: str
    project_id: str


class AgentResponse(BaseModel):
    answer: str
    steps: list[str]
    sources: list[dict]
    tools_used: int


@router.post("/agent/chat", response_model=AgentResponse)
def agent_chat(request: AgentRequest):
    try:
        result = run_agent(
            query=request.query,
            project_id=request.project_id
        )
        return AgentResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/agent/health")
def agent_health():
    return {"status": "ok", "agent": "langgraph-react"}