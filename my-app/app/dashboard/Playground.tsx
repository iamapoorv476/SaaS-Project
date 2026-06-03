'use client';
import ReactMarkdown from 'react-markdown';
import { useCallback, useEffect, useRef, useState } from "react";

type Messages = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    sources?: {id: string, content: string, similarity: number}[];
    tokens?: {input: number, output: number, total: number};
    steps?: string[];
    isAgent?: boolean;
};

type Document = {
    id: string;
    name: string;
    created_at: string;
};

function DocumentPanel({
    apiKey,
}: {
    apiKey: string;
    projectId: string;
    organizationId: string;
}) {
    const [docs, setDocs] = useState<Document[]>([]);
    const [uploading, setUploading] = useState(false);
    const [name, setName] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchDocs = useCallback(async () => {
        try {
            const res = await fetch('/api/v1/documents', {
                headers: { Authorization: `Bearer ${apiKey}` },
            });
            const data = await res.json();
            setDocs(data.documents ?? []);
        } catch {
            // silent fail
        }
    }, [apiKey]);

    useEffect(() => {
        void fetchDocs();
    }, [fetchDocs]);

    const handleUpload = useCallback(async () => {
        if (!name.trim() || !content.trim()) {
            setError('Both name and content are required');
            return;
        }
        setError('');
        setSuccess('');
        setUploading(true);

        try {
            const res = await fetch('/api/v1/documents', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, content }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error ?? 'Upload failed');
            } else {
                setSuccess(`✓ "${name}" ingested with ${data.chunks_created} chunks`);
                setName('');
                setContent('');
                void fetchDocs();
            }
        } catch {
            setError('Upload failed — check your connection');
        } finally {
            setUploading(false);
        }
    }, [apiKey, name, content, fetchDocs]);

    return (
        <div className="flex flex-col gap-4 w-full">
            <div>
                <h3 className="text-sm font-medium text-white mb-1">Upload Document</h3>
                <p className="text-xs text-slate-500 mb-3">
                    Documents you upload will be used as context when answering questions.
                </p>
                <input
                    type="text"
                    placeholder="Document name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 text-white text-sm rounded-lg px-3 py-2 mb-2 outline-none focus:border-blue-500/50 placeholder:text-slate-600"
                />
                <textarea
                    placeholder="Paste document content here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={6}
                    className="w-full bg-slate-900 border border-white/10 text-white text-sm rounded-lg px-3 py-2 mb-2 outline-none focus:border-blue-500/50 placeholder:text-slate-600 resize-none"
                />
                {error && <p className="text-red-400 text-xs mb-2">{error}</p>}
                {success && <p className="text-emerald-400 text-xs mb-2">{success}</p>}
                <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg py-2 transition-colors"
                >
                    {uploading ? 'Uploading...' : 'Upload & Embed'}
                </button>
            </div>

            {docs.length > 0 && (
                <div>
                    <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
                        Indexed Documents ({docs.length})
                    </h3>
                    <div className="space-y-1.5 overflow-y-auto max-h-48">
                        {docs.map((doc) => (
                            <div
                                key={doc.id}
                                className="flex items-center gap-2 bg-slate-900/60 border border-white/5 rounded-lg px-3 py-2"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                                <span className="text-sm text-slate-300 truncate">{doc.name}</span>
                                <span className="text-xs text-slate-600 ml-auto flex-shrink-0">
                                    {new Date(doc.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function AgentSteps({ steps }: { steps: string[] }) {
    if (!steps.length) return null;
    return (
        <div className="mt-2 ml-8 space-y-1">
            <p className="text-xs text-purple-400 font-medium">Agent reasoning:</p>
            {steps.map((step, i) => (
                <div
                    key={i}
                    className="flex items-center gap-2 text-xs text-slate-400 bg-purple-500/5 border border-purple-500/10 rounded-lg px-3 py-1.5"
                >
                    <span className="text-purple-400">✓</span>
                    {step}
                </div>
            ))}
        </div>
    );
}

function ChatMessage({ message }: { message: Messages }) {
    const isUser = message.role === 'user';

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
                <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div
                        className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-medium ${
                            isUser
                                ? 'bg-blue-600 text-white'
                                : message.isAgent
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-700 text-slate-300'
                        }`}
                    >
                        {isUser ? 'U' : message.isAgent ? '🤖' : 'AI'}
                    </div>

                    <div
                        className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                            isUser
                                ? 'bg-blue-600 text-white rounded-br-sm'
                                : message.isAgent
                                ? 'bg-purple-900/40 border border-purple-500/20 text-slate-200 rounded-bl-sm'
                                : 'bg-slate-800 text-slate-200 rounded-bl-sm'
                        }`}
                    >
                        {message.isAgent && (
                            <p className="text-purple-400 text-xs font-medium mb-1">
                                Agent Mode · LangGraph ReAct
                            </p>
                        )}
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                </div>

                {message.isAgent && message.steps && (
                    <AgentSteps steps={message.steps} />
                )}

                {!message.isAgent && message.sources && message.sources.length > 0 && (
                    <div className="mt-2 ml-8 space-y-1">
                        <p className="text-xs text-slate-500">Sources used:</p>
                        {message.sources.map((s, i) => (
                            <div
                                key={s.id}
                                className="bg-slate-900/60 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-slate-400"
                            >
                                <span className="text-slate-500 mr-1">[{i + 1}]</span>
                                {s.content}
                                <span className="text-slate-600 ml-1">
                                    ({Math.round(s.similarity * 100)}% match)
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {message.tokens && (
                    <p className="text-xs text-slate-600 mt-1 ml-8">
                        {message.tokens.total} tokens ({message.tokens.input} in / {message.tokens.output} out)
                    </p>
                )}
            </div>
        </div>
    );
}

function ChatPanel({
    apiKey,
    projectId,
    agentMode,
}: {
    apiKey: string;
    projectId: string;
    agentMode: boolean;
}) {
    const [messages, setMessages] = useState<Messages[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: `Hi! I'm ready to answer questions based on your uploaded documents. Upload a document on the left, then ask me anything about it.`,
        }
    ]);
    const [input, setInput] = useState('');
    const [streaming, setStreaming] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    async function sendMessage() {
        const text = input.trim();
        if (!text || streaming) return;

        const userMessage: Messages = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
        };

        const assistantId = (Date.now() + 1).toString();
        const assistantMessage: Messages = {
            id: assistantId,
            role: 'assistant',
            content: '',
            isAgent: agentMode,
        };

        setMessages((prev) => [...prev, userMessage, assistantMessage]);
        setInput('');
        setStreaming(true);

        try {
            if (agentMode) {
                // Agent mode — call Python FastAPI LangGraph agent
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_AGENT_SERVICE_URL}/api/v1/agent/chat`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            query: text,
                            project_id: projectId,
                        }),
                    }
                );

                const data = await res.json();

                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === assistantId
                            ? {
                                  ...m,
                                  content: data.answer ?? 'No response',
                                  steps: data.steps ?? [],
                                  isAgent: true,
                              }
                            : m
                    )
                );
            } else {
                // RAG mode — existing SSE streaming
                const history = [...messages, userMessage]
                    .filter((m) => m.id !== 'welcome')
                    .map((m) => ({ role: m.role, content: m.content }));

                const res = await fetch('/api/v1/chat', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ messages: history }),
                });

                if (!res.ok || !res.body) throw new Error('Request failed');

                const reader = res.body.getReader();
                const decoder = new TextDecoder();

                let fullText = '';
                let finalSources: Messages['sources'] = [];
                let finalTokens: Messages['tokens'];

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n');

                    for (const line of lines) {
                        if (!line.startsWith('data: ')) continue;
                        const raw = line.slice(6).trim();
                        if (raw === '[DONE]') break;

                        try {
                            const parsed = JSON.parse(raw);
                            if (parsed.text) {
                                fullText += parsed.text;
                                setMessages((prev) =>
                                    prev.map((m) =>
                                        m.id === assistantId ? { ...m, content: fullText } : m
                                    )
                                );
                            }
                            if (parsed.rag?.sources?.length > 0) {
                                finalSources = parsed.rag.sources;
                            }
                            if (parsed.usage) {
                                finalTokens = {
                                    input: parsed.usage.input_tokens,
                                    output: parsed.usage.output_tokens,
                                    total: parsed.usage.total_tokens,
                                };
                            }
                        } catch (e) {
                            console.error('Parse error:', e);
                        }
                    }
                }

                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === assistantId
                            ? { ...m, sources: finalSources, tokens: finalTokens }
                            : m
                    )
                );
            }
        } catch (err) {
            console.error('Error:', err);
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === assistantId && !m.content
                        ? { ...m, content: 'Something went wrong. Please try again.' }
                        : m
                )
            );
        } finally {
            setStreaming(false);
            inputRef.current?.focus();
        }
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            void sendMessage();
        }
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4">
                {messages.map((m) => (
                    <ChatMessage key={m.id} message={m} />
                ))}

                {streaming && messages[messages.length - 1]?.content === '' && (
                    <div className="flex justify-start mb-4">
                        <div className={`rounded-2xl rounded-bl-sm px-4 py-2.5 ${agentMode ? 'bg-purple-900/40 border border-purple-500/20' : 'bg-slate-800'}`}>
                            {agentMode && (
                                <p className="text-purple-400 text-xs mb-1">Agent reasoning...</p>
                            )}
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0ms]" />
                                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:150ms]" />
                                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:300ms]" />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            <div className="border-t border-white/10 p-4">
                <div className="flex gap-2">
                    <input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={
                            agentMode
                                ? 'Ask the agent — it will decide which tools to use...'
                                : 'Ask a question about your documents...'
                        }
                        disabled={streaming}
                        className="flex-1 bg-slate-900 border border-white/10 text-white text-sm rounded-lg px-4 py-2.5 outline-none focus:border-blue-500/50 placeholder:text-slate-600 disabled:opacity-50"
                    />
                    <button
                        onClick={() => void sendMessage()}
                        disabled={streaming || !input.trim()}
                        className={`disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg px-4 py-2.5 transition-colors flex-shrink-0 ${
                            agentMode
                                ? 'bg-purple-600 hover:bg-purple-500'
                                : 'bg-blue-600 hover:bg-blue-500'
                        }`}
                    >
                        {streaming ? '...' : 'Send'}
                    </button>
                </div>
                <p className="text-xs text-slate-600 mt-1.5">
                    {agentMode
                        ? 'Agent Mode · LangGraph ReAct · decides tools autonomously'
                        : 'Press Enter to send · Answers are grounded in your uploaded documents'}
                </p>
            </div>
        </div>
    );
}

export function Playground({
    projectId,
    organizationId,
}: {
    projectId: string;
    organizationId: string;
}) {
    const [apiKey, setApiKey] = useState('');
    const [keyConfirmed, setKeyConfirmed] = useState(false);
    const [agentMode, setAgentMode] = useState(false);

    if (!keyConfirmed) {
        return (
            <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-8 max-w-lg mx-auto mt-8">
                <h2 className="text-white font-semibold mb-2">Enter your API key</h2>
                <p className="text-slate-400 text-sm mb-4">
                    Paste an API key with{' '}
                    <code className="bg-slate-800 px-1 rounded text-xs">ai:chat</code> and{' '}
                    <code className="bg-slate-800 px-1 rounded text-xs">ai:embed</code> scopes to use the playground.
                </p>
                <input
                    type="text"
                    placeholder="sk_dev_..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 text-white text-sm rounded-lg px-3 py-2 mb-3 outline-none focus:border-blue-500/50"
                />
                <button
                    onClick={() => setKeyConfirmed(true)}
                    disabled={!apiKey.startsWith('sk')}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg py-2 transition"
                >
                    Launch Playground
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Mode toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-white/5">
                <div>
                    <p className="text-white text-sm font-medium">
                        {agentMode ? '🤖 Agent Mode' : '⚡ RAG Mode'}
                    </p>
                    <p className="text-slate-500 text-xs mt-0.5">
                        {agentMode
                            ? 'LangGraph ReAct agent — reasons about which tools to call'
                            : 'Direct RAG pipeline — always searches documents'}
                    </p>
                </div>
                <button
                    onClick={() => setAgentMode((prev) => !prev)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                        agentMode ? 'bg-purple-600' : 'bg-slate-700'
                    }`}
                >
                    <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                            agentMode ? 'left-7' : 'left-1'
                        }`}
                    />
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 h-[700px]">
                <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 overflow-y-auto">
                    <DocumentPanel
                        apiKey={apiKey}
                        projectId={projectId}
                        organizationId={organizationId}
                    />
                </div>

                <div className={`rounded-2xl border bg-slate-900/50 flex flex-col overflow-hidden ${
                    agentMode ? 'border-purple-500/30' : 'border-white/10'
                }`}>
                    <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/10">
                        <div className={`w-2 h-2 rounded-full ${agentMode ? 'bg-purple-400' : 'bg-emerald-400'}`} />
                        <span className="text-sm font-medium text-white">
                            {agentMode ? 'Agent Playground' : 'AI Playground'}
                        </span>
                        <span className="text-xs text-slate-500 ml-auto">
                            {agentMode ? 'LangGraph ReAct · Claude Haiku' : 'RAG-powered · Claude Haiku'}
                        </span>
                    </div>
                    <ChatPanel
                        apiKey={apiKey}
                        projectId={projectId}
                        agentMode={agentMode}
                    />
                </div>
            </div>
        </div>
    );
}