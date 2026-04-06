import { withApiKeyAuth } from "@/app/middleware/auth";
import { getSupabaseAdmin } from "@/app/lib/billing/supabase/server";
import { chunkText, embedBatch } from "@/app/lib/ai/embeddings";

export async function POST(req: Request){

    const auth = await withApiKeyAuth(req, 'ai:embed');
    if(auth instanceof Response) return auth;
    const {keyData, track} = auth;

    let name: string;
    let content: string;
    let metadata: Record<string, unknown> = {};

    try{
        const body = await req.json();
        name= body.name;
        content=body.content;
        metadata=body.metadata ?? {};
        if (!content || typeof content !== 'string') {
      track(400, '/api/v1/documents');
      return Response.json({ error: 'content is required' }, { status: 400 });
    }
    if (!name || typeof name !== 'string') {
      track(400, '/api/v1/documents');
      return Response.json({ error: 'name is required' }, { status: 400 });
    }
    } catch {
      track(400, '/api/v1/documents');
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    try{
        const admin = await getSupabaseAdmin();
        const {data: doc, error: docError} = await admin
              .from('documents')
              .insert({
                project_id:keyData.project_id,
                organization_id:keyData.organization_id,
                name,
                content,
                metadata,
              })
              .select()
              .single();

              if (docError || !doc) {
                 console.error('Failed to insert document:', docError);
                 track(500, '/api/v1/documents');
                 return Response.json({ error: 'Failed to store document' }, { status: 500 });
           }

           const chunks = chunkText(content);

           if (chunks.length === 0) {
             track(400, '/api/v1/documents');
             return Response.json({ error: 'Content too short to process' }, { status: 400 });
           }

    const embeddings = await embedBatch(chunks);

    const chunkRows = chunks.map((chunk, i) => ({
      document_id: doc.id,
      project_id: keyData.project_id,
      content: chunk,
      embedding: JSON.stringify(embeddings[i]), // pgvector accepts JSON array
      chunk_index: i,
    }));
    const { error: chunkError } = await admin
      .from('document_chunks')
      .insert(chunkRows);
 
    if (chunkError) {
      console.error('Failed to insert chunks:', chunkError);
      // Clean up the document if chunks failed
      await admin.from('documents').delete().eq('id', doc.id);
      track(500, '/api/v1/documents');
      return Response.json({ error: 'Failed to store document chunks' }, { status: 500 });
    }
 
    track(201, '/api/v1/documents');
    return Response.json(
      {
        success: true,
        document_id: doc.id,
        chunks_created: chunks.length,
        message: `Document "${name}" ingested with ${chunks.length} chunks`,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Document ingestion error:', err);
    track(500, '/api/v1/documents');
    return Response.json({ error: 'Document ingestion failed' }, { status: 500 });
  

    }

}
export async function GET(req: Request) {
  const auth = await withApiKeyAuth(req, 'ai:embed');
  if (auth instanceof Response) return auth;
  const { keyData, track } = auth;
 
  try {
    const admin = await getSupabaseAdmin();
 
    const { data: documents, error } = await admin
      .from('documents')
      .select('id, name, metadata, created_at')
      .eq('project_id', keyData.project_id)
      .order('created_at', { ascending: false });
 
    if (error) {
      track(500, '/api/v1/documents');
      return Response.json({ error: 'Failed to fetch documents' }, { status: 500 });
    }
 
    track(200, '/api/v1/documents');
    return Response.json({ documents: documents ?? [] });
  } catch (err) {
    console.error('Failed to list documents:', err);
    track(500, '/api/v1/documents');
    return Response.json({ error: 'Failed to list documents' }, { status: 500 });
  }
}
 