from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.crew import run_analysis

router = APIRouter()


class AnalysisRequest(BaseModel):
    project_id: str
    topic: str


class AnalysisResponse(BaseModel):
    topic: str
    project_id: str
    report: str
    agents_used: list[str]
    process: str


@router.post("/analyze", response_model=AnalysisResponse)
def analyze_documents(request: AnalysisRequest):
    if not request.topic or len(request.topic.strip()) < 3:
        raise HTTPException(
            status_code=400,
            detail="Topic must be at least 3 characters"
        )

    try:
        result = run_analysis(
            project_id=request.project_id,
            topic=request.topic
        )
        return AnalysisResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analyze/health")
def analyze_health():
    return {"status": "ok", "service": "crewai-multi-agent"}