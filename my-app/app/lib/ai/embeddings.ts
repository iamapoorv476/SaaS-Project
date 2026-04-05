import  OpenAI from 'openai';

const openai = new OpenAI({
    apiKey:process.env.OPENAI_API_KEY!,
});

const EMBEDDING_MODEL = 'text-embedding-3-small';
const MAX_CHUNK_CHARS = 1500; 

export function chunkText(text: string): string[] {

    const cleaned = text.replace(/\s+/g, ' ').trim();

    if(cleaned.length <= MAX_CHUNK_CHARS){
        return[cleaned];
    }

    const chunks: string[] = [];
    const sentences= cleaned.split(/(?<=[.!?])\s+/);
    let current ='';
    for(const sentence of sentences){
        if((current + ' ' + sentence).trim().length > MAX_CHUNK_CHARS){
            if(current.trim()){
                chunks.push(current.trim());
            }

            const words = current.trim().split(' ');
            const overlap= words.slice(-Math.floor(words.length * 0.2)).join(' ');
            current = overlap + ' ' + sentence;
        } else{
            current= current ? current + ' ' + sentence : sentence;
        }
    }
    if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks.filter((c) => c.length > 20);

}

export async function embedText(text: string): Promise<number[]> {
    const response= await openai.embeddings.create({
        model:EMBEDDING_MODEL,
        input: text,
    });
    return response.data[0].embedding;
}

export async function embedBatch(texts:string[]): Promise<number[][]>{
    const response = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: texts,
    });
    return response.data
        .sort((a,b)=> a.index- b.index)
        .map((d) => d.embedding);
}