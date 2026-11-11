const EMBEDDING_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODEL = 'gemini-embedding-001';

// Any legacy embedding model name left in an existing environment is mapped to
// Gemini so a forgotten variable cannot call a provider that is not configured.
function normalizeModel(value) {
  const model = String(value || '').trim();
  return model.startsWith('gemini-embedding') ? model : DEFAULT_MODEL;
}

export function embeddingConfig() {
  const model = normalizeModel(process.env.RAG_EMBEDDING_MODEL);
  const maximum = model.startsWith('text-embedding-004') ? 768 : 3072;
  return { model, dimensions: Math.floor(Math.max(256, Math.min(maximum, Number(process.env.RAG_EMBEDDING_DIMENSIONS) || 1536))) };
}

export async function embedText(input, fetcher = fetch, taskType = 'RETRIEVAL_DOCUMENT') {
  const config = embeddingConfig();
  if (!process.env.GEMINI_API_KEY) throw new Error('RAG_EMBEDDING_NOT_CONFIGURED');
  const response = await fetcher(`${EMBEDDING_ENDPOINT}/${encodeURIComponent(config.model)}:embedContent`, {
    method: 'POST',
    headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: `models/${config.model}`,
      content: { parts: [{ text: String(input).slice(0, 12000) }] },
      taskType,
      outputDimensionality: config.dimensions
    }),
    signal: AbortSignal.timeout(8000)
  });
  const data = await response.json().catch(() => ({}));
  const vector = data.embedding?.values;
  if (!response.ok || !Array.isArray(vector) || vector.length !== config.dimensions || vector.some(value => !Number.isFinite(value))) {
    throw new Error(`RAG_EMBEDDING_HTTP_${response.status}`);
  }
  const tokens = Number(data.usageMetadata?.promptTokenCount || data.usageMetadata?.totalTokenCount) || 0;
  const rawPrice = process.env.RAG_EMBEDDING_USD_PER_MILLION;
  const price = rawPrice?.trim() ? Number(rawPrice) : NaN;
  // Gemini embeddings have a free tier; an explicit override is required for
  // any paid/contracted price, so the default estimate is zero rather than a guess.
  return { ...config, vector, tokens, estimatedUsd: Number.isFinite(price) && price >= 0 ? tokens * price / 1e6 : 0,
    priceSource: rawPrice?.trim() ? 'environment' : 'gemini-free-tier' };
}

export function embedQuery(input, fetcher = fetch) {
  return embedText(input, fetcher, 'RETRIEVAL_QUERY');
}
