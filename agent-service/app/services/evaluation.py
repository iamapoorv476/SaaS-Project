from ragas import evaluate
from ragas.metrics import (
    faithfulness,
    answer_relevancy,
    context_precision,
)
from ragas.llms import LangchainLLMWrapper
from ragas.embeddings import LangchainEmbeddingsWrapper
from langchain_anthropic import ChatAnthropic
from langchain_openai import OpenAIEmbeddings
from datasets import Dataset
from app.services.supabase import search_documents, supabase
from app.config import config


def get_llm():
    return LangchainLLMWrapper(
        ChatAnthropic(
            model="claude-haiku-4-5-20251001",
            api_key=config.ANTHROPIC_API_KEY,
        )
    )


def get_embeddings():
    return LangchainEmbeddingsWrapper(
        OpenAIEmbeddings(
            model="text-embedding-3-small",
            api_key=config.OPENAI_API_KEY,
        )
    )


def fetch_project_documents(project_id: str) -> list[dict]:
    """Fetch all documents for a project from Supabase."""
    result = supabase.from_("documents") \
        .select("id, name, content") \
        .eq("project_id", project_id) \
        .execute()
    return result.data or []


def build_test_dataset(project_id: str, questions: list[str]) -> dict:
    """
    For each question:
    1. Search pgvector for relevant chunks (contexts)
    2. Generate an answer using Claude
    3. Store question + contexts + answer for evaluation
    """
    from anthropic import Anthropic

    anthropic_client = Anthropic(api_key=config.ANTHROPIC_API_KEY)

    all_questions = []
    all_answers = []
    all_contexts = []
    all_ground_truths = []

    for question in questions:
        # Get relevant chunks from pgvector
        chunks = search_documents(
            query=question,
            project_id=project_id,
            match_count=3
        )

        # Build context list — RAGAS expects list of strings per question
        contexts = [chunk["content"] for chunk in chunks]

        if not contexts:
            contexts = ["No relevant context found."]

        # Generate answer using Claude with context
        context_str = "\n\n".join(contexts)
        system_prompt = f"""Answer based strictly on this context:

<context>
{context_str}
</context>

If the answer is not in the context, say so."""

        response = anthropic_client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=500,
            system=system_prompt,
            messages=[{"role": "user", "content": question}]
        )

        answer = response.content[0].text

        all_questions.append(question)
        all_answers.append(answer)
        all_contexts.append(contexts)
        all_ground_truths.append("")  # empty — we use reference-free metrics

    return {
        "question": all_questions,
        "answer": all_answers,
        "contexts": all_contexts,
        "ground_truth": all_ground_truths,
    }


def run_evaluation(project_id: str, questions: list[str]) -> dict:
    raw_data = build_test_dataset(project_id, questions)
    dataset = Dataset.from_dict(raw_data)

    llm = get_llm()
    embeddings = get_embeddings()

    results = evaluate(
        dataset=dataset,
        metrics=[
            faithfulness,
            answer_relevancy,
            context_precision,
        ],
        llm=llm,
        embeddings=embeddings,
    )

    scores = results.to_pandas().mean(numeric_only=True).to_dict()

    return {
        "project_id": project_id,
        "questions_evaluated": len(questions),
        "scores": {
            "faithfulness": round(scores.get("faithfulness", 0), 3),
            "answer_relevancy": round(scores.get("answer_relevancy", 0), 3),
            "context_precision": round(scores.get("context_precision", 0), 3),
            "overall": round(
                sum([
                    scores.get("faithfulness", 0),
                    scores.get("answer_relevancy", 0),
                    scores.get("context_precision", 0),
                ]) / 3, 3
            ),
        },
        "interpretation": interpret_scores(scores),
    }


def interpret_scores(scores: dict) -> dict:
    """
    Human readable interpretation of each score.
    All scores are 0-1, higher is better.
    """
    def grade(score: float) -> str:
        if score >= 0.8:
            return "excellent"
        elif score >= 0.6:
            return "good"
        elif score >= 0.4:
            return "needs improvement"
        else:
            return "poor"

    return {
        "faithfulness": grade(scores.get("faithfulness", 0)),
        "answer_relevancy": grade(scores.get("answer_relevancy", 0)),
        "context_precision": grade(scores.get("context_precision", 0)),
    }