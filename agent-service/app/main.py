from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.chat import router as chat_router
from app.routes.agent import router as agent_router
from app.routes.evaluation import router as evaluation_router

app = FastAPI(title="ProjectFlow Agent Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router, prefix="/api/v1")
app.include_router(agent_router, prefix="/api/v1")
app.include_router(evaluation_router, prefix="/api/v1")


@app.get("/health")
def health():
    return {"status": "ok"}