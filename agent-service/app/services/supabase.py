from supabase import create_client, Client
from openai import OpenAI
from app.config import config

supabase: Client = create_client(
    config.NEXT_PUBLIC_SUPABASE_URL,
    config.SUPABASE_SERVICE_ROLE_KEY
)

openai_client = OpenAI(api_key=config.OPENAI_API_KEY)


def embed_text(text:str) -> list[float]:
    response = openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )
    return response.data[0].embedding


def search_documents(
        query:str,
        project_id:str,
        match_count: int = 5
) -> list[dict]:
    embedding = embed_text(query)

    result = supabase.rpc(
        "match_document_chunks",
        {
            "query_embedding": embedding,
            "match_project_id": project_id,
            "match_count": match_count
        }
    ).execute()

    return result.data or []