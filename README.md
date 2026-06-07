# ProjectFlow — Multi-Tenant AI Platform

A production-grade, multi-tenant SaaS platform where organizations manage scoped API keys to access a RAG-powered AI backend. Documents are embedded into pgvector, a LangGraph ReAct agent reasons across tools, CrewAI runs multi-agent document analysis, and RAGAS evaluates response quality in real time.

**Live Demo:** [saa-s-project-k7ku.vercel.app](https://saa-s-project-k7ku.vercel.app)

```
Demo credentials
Email:    apoorvapratapsingh6@gmail.com
Password: 123456
```

---

## What It Does

Organizations sign up, create projects, and generate scoped API keys. Those keys authenticate against a RAG pipeline — users upload documents, the platform embeds them using OpenAI, stores vectors in pgvector inside Supabase, and serves semantically retrieved context to Claude for AI-powered responses.

Beyond basic RAG, a Python FastAPI microservice extends the platform with:
- A **LangGraph ReAct agent** that reasons about which tools to call instead of always searching blindly
- A **CrewAI multi-agent crew** (Researcher → Analyst → Writer) that produces structured analysis reports
- A **RAGAS evaluation dashboard** that scores faithfulness, answer relevancy, and context precision in real time

Every request is rate-limited, token usage is tracked per project, and monthly quotas are enforced based on the organization's Stripe subscription plan.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT                            │
│  Landing → Sign In → Dashboard → Project → Playground│
└─────────────────┬───────────────────────────────────┘
                  │ HTTPS
┌─────────────────▼───────────────────────────────────┐
│              VERCEL (Next.js 16)                      │
│  App Router · API Routes · Server Components         │
└──────┬──────────────┬──────────────┬────────────────┘
       │              │              │
┌──────▼──────┐ ┌─────▼─────┐ ┌────▼──────────────────┐
│  UPSTASH    │ │ SUPABASE  │ │  RAILWAY (FastAPI)     │
│  REDIS      │ │ POSTGRES  │ │                        │
│             │ │           │ │  LangGraph ReAct Agent │
│  API key    │ │  pgvector │ │  CrewAI Multi-Agent    │
│  cache      │ │  RLS      │ │  RAGAS Evaluation      │
│  Rate limit │ │  Auth     │ │                        │
│  Quotas     │ │  Billing  │ └────────────────────────┘
└─────────────┘ └───────────┘
```

### Request Flow — /api/v1/chat

```
1. Request arrives with Bearer token
2. withApiKeyAuth middleware:
   → Redis cache lookup (< 5ms)
   → Supabase DB fallback (bcrypt verify)
   → Scope check + Rate limit check
3. RAG Pipeline:
   → Embed query (OpenAI text-embedding-3-small)
   → pgvector cosine similarity search (top-5 chunks)
   → Inject context into Claude system prompt
4. anthropic.messages.stream() → SSE to client
5. Async token tracking (Redis + Supabase)
```

### Agent Flow — /api/v1/agent/chat

```
User query
    ↓
LangGraph ReAct Agent
    ├── Decides: search_project_documents?
    ├── Decides: get_project_info?
    └── Decides: summarize_all_documents?
    ↓
Synthesizes answer from tool results
    ↓
Returns answer + reasoning steps
```

### Multi-Agent Flow — /api/v1/analyze

```
Topic input
    ↓
Researcher Agent → searches pgvector, compiles findings
    ↓
Analyst Agent → identifies insights, gaps, patterns
    ↓
Writer Agent → produces structured report
    ↓
Returns executive summary + findings + recommendations
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS |
| Backend | Node.js, Next.js API Routes |
| Agent Service | Python, FastAPI, Uvicorn |
| Database | Supabase (PostgreSQL), pgvector |
| Cache / Rate Limiting | Upstash Redis |
| AI Responses | Anthropic Claude (Haiku) |
| Embeddings | OpenAI text-embedding-3-small |
| Agentic AI | LangGraph (ReAct), CrewAI (multi-agent) |
| RAG Evaluation | RAGAS (faithfulness, relevancy, precision) |
| Auth | Supabase Auth |
| Billing | Stripe |
| Deployment | Vercel (Next.js) + Railway (FastAPI) |
| CI/CD | GitHub Actions |

---

## Features

### Multi-Tenant Architecture
- Organizations with member roles (owner, admin, member)
- Row Level Security on all Supabase tables
- Complete data isolation between tenants

### API Key Management
- bcrypt-hashed keys with prefix-based lookup
- Redis caching for sub-5ms validation
- Granular scopes: `read`, `write`, `delete`, `ai:chat`, `ai:embed`
- Environment tagging: development, staging, production
- Key revocation and expiry

### RAG Pipeline
- Document upload and chunking (~1500 chars, 20% overlap)
- Batch embedding via OpenAI text-embedding-3-small (1536 dims)
- Vector storage in pgvector with IVFFlat index
- Cosine similarity search via Supabase RPC
- SSE streaming responses with source attribution

### LangGraph ReAct Agent
- Reasons about which tools to call based on the query
- Three tools: document search, project info, full summarization
- Reasoning trace returned to UI — every tool call visible
- Toggle between RAG mode and Agent mode in the playground

### CrewAI Multi-Agent Analysis
- Three specialized agents run sequentially
- Researcher finds relevant document chunks
- Analyst identifies insights, gaps, and patterns
- Writer produces executive summary with recommendations
- Triggered via single API call, results streamed to dashboard

### RAGAS Evaluation Dashboard
- Runs automated evaluation on any set of test questions
- Measures faithfulness, answer relevancy, and context precision
- Color-coded progress bars with human-readable grades
- Scores improve as knowledge base is optimized

### Rate Limiting & Quota
- Fixed window rate limiting (100 req/min) via Redis
- Per-project monthly token quota enforced in Redis
- Quota limits tied to Stripe subscription plan
- Graceful 429 responses with Retry-After headers

### Billing
- Stripe subscription plans (Free, Pro, Enterprise)
- Webhook handling for subscription lifecycle events
- Token limits per plan (100k / 1M / 10M monthly)

---

## Repository Structure

```
SaaS-Project/
├── my-app/                          ← Next.js (Vercel)
│   ├── app/
│   │   ├── api/v1/                  ← chat, documents endpoints
│   │   ├── dashboard/               ← org/project dashboard UI
│   │   ├── components/dashboard/    ← RagEvaluationCard, DocumentAnalysisCard
│   │   ├── lib/ai/                  ← embeddings, quota management
│   │   └── middleware/auth.ts       ← withApiKeyAuth middleware
│   └── .github/workflows/           ← GitHub Actions CI/CD
│
└── agent-service/                   ← Python FastAPI (Railway)
    └── app/
        ├── routes/
        │   ├── chat.py              ← Basic RAG endpoint
        │   ├── agent.py             ← LangGraph ReAct agent
        │   ├── evaluation.py        ← RAGAS evaluation
        │   └── crew.py              ← CrewAI multi-agent
        └── services/
            ├── agent.py             ← Agent + tools logic
            ├── crew.py              ← Crew definition
            ├── evaluation.py        ← RAGAS pipeline
            └── supabase.py          ← pgvector search
```

---

## Key Design Decisions

**Why prefix + hash for API keys?**
Storing only the bcrypt hash means lookup requires checking every key. The prefix (first 14 chars) narrows the DB lookup to one row, then bcrypt verifies the full key. Fast and secure.

**Why Upstash Redis over traditional Redis?**
Vercel serverless functions cannot maintain persistent TCP connections. Upstash uses HTTP REST so it works in any serverless environment with zero connection pooling issues.

**Why pgvector over Pinecone?**
Documents already live in Postgres. Keeping vectors there eliminates a network hop and simplifies operations. At 10M+ vectors, Pinecone makes sense — at current scale, pgvector is faster and simpler.

**Why Claude for responses and OpenAI for embeddings?**
Claude does not have an embeddings API. OpenAI's text-embedding-3-small is fast and cheap ($0.02/million tokens). Claude Haiku handles response generation at $1/million input tokens.

**Why async token tracking?**
Redis updates synchronously for quota enforcement. Postgres writes happen asynchronously for the audit trail. The user should not wait for an audit log write to complete.

**Why failing open on Redis errors?**
If Redis goes down, users should not lose access to the product. Rate limiting fails open — requests go through. Quota falls back to a Supabase SUM query. Availability over strictness.

**Why FastAPI as a Python sidecar?**
LangGraph and CrewAI are Python-native. Rather than rewrite them in TypeScript, a FastAPI microservice handles all agentic logic while Next.js handles auth, billing, and UI. Clean separation of concerns.

---

## Local Setup

### Prerequisites
- Node.js 20+, pnpm
- Python 3.11+
- Supabase account
- Upstash Redis account
- Anthropic API key
- OpenAI API key
- Stripe account

### Next.js App

```bash
cd my-app
pnpm install
cp .env.example .env.local
# Fill in environment variables
pnpm dev
```

### Python Agent Service

```bash
cd agent-service
python -m venv venv
source venv/Scripts/activate  # Windows
# source venv/bin/activate    # Mac/Linux
pip install -r requirements.txt
cp .env.example .env
# Fill in environment variables
python -m uvicorn app.main:app --reload --port 8000
```

### Environment Variables

**my-app/.env.local**
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_AGENT_SERVICE_URL=http://localhost:8000
```

**agent-service/.env**
```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
```

---

## API Reference

### POST /api/v1/chat
Stream a RAG-powered AI response grounded in uploaded documents.

```bash
curl -X POST https://your-domain/api/v1/chat \
  -H "Authorization: Bearer sk_dev_..." \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "What is in my documents?"}]}'
```

### POST /api/v1/documents
Upload and embed a document for RAG retrieval.

```bash
curl -X POST https://your-domain/api/v1/documents \
  -H "Authorization: Bearer sk_dev_..." \
  -H "Content-Type: application/json" \
  -d '{"name": "Company FAQ", "content": "Full document text..."}'
```

### POST /agent-service/api/v1/agent/chat
Query the LangGraph ReAct agent.

```bash
curl -X POST https://your-railway-url/api/v1/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "Summarize all documents", "project_id": "uuid"}'
```

### POST /agent-service/api/v1/analyze
Run CrewAI multi-agent document analysis.

```bash
curl -X POST https://your-railway-url/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{"project_id": "uuid", "topic": "key risks and recommendations"}'
```

### POST /agent-service/api/v1/evaluate
Run RAGAS evaluation on a set of test questions.

```bash
curl -X POST https://your-railway-url/api/v1/evaluate \
  -H "Content-Type: application/json" \
  -d '{"project_id": "uuid", "questions": ["What is X?", "How does Y work?"]}'
```

---

## Deployment

### Next.js → Vercel
1. Push to GitHub
2. Import repo in Vercel, set root directory to `my-app`
3. Add all environment variables
4. Deploy

### FastAPI → Railway
1. Connect GitHub repo in Railway
2. Set root directory to `agent-service`
3. Add environment variables
4. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Generate public domain under Networking

### CI/CD
GitHub Actions runs on every push to `main`:
- TypeScript type check
- ESLint
- Deploy to Vercel on success

---

## Built By

Apoorva Pratap Singh — 3rd year CS student

[LinkedIn](https://www.linkedin.com/in/apoorva-pratap-singh-010972289/) · [GitHub](https://github.com/iamapoorv476) · [Live Demo](https://saa-s-project-k7ku.vercel.app)

---

## License

MIT
