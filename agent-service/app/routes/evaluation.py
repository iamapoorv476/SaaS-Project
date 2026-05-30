from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.evaluation import run_evaluation

router = APIRouter()

class EvaluationRequest(BaseModel):
    project_id: str
    questions: list[str]

class EvaluationResponse(BaseModel):
    project_id: str
    questions_evaluated: int
    scores: dict
    interpretation: dict

@router.post("/evaluate", response_model=EvaluationResponse)
def evaluate_rag(request: EvaluationRequest):
    if len(request.questions) == 0:
        raise HTTPException(
            status_code=400,
            detail="At least one question is required"
        )
    
    if len(request.questions) > 10:
        raise HTTPException(
            status_code=400,
            detail="Maximum 10 questions per evaluation to control costs"
        )
    
    try:
        result = run_evaluation(
            project_id=request.project_id,
            questions=request.questions
        )
        return EvaluationResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.get("/evaluate/health")
def evaluation_health():
    return {"status": "ok", "service": "rags-evaluation"}