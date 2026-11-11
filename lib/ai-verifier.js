import { generateJson, text } from './ai.js';

// Gemini-backed adapter for the verifier/reviewer calls. It keeps the standard
// verifier call shape (prompt + optional images + JSON schema) so every route
// shares a single AI provider.
function imagePart(url) {
  const match = String(url || '').match(/^data:(image\/[a-z0-9.+-]+);base64,(.+)$/is);
  return match ? { inlineData: { mimeType: match[1], data: match[2] } } : null;
}

function withImages(input, images) {
  const prompt = text(input, 180_000);
  const parts = images.map(imagePart).filter(Boolean);
  return parts.length ? { parts: [{ text: prompt }, ...parts] } : prompt;
}

function thinkingLevelFor(effort) {
  return { minimal: 'MINIMAL', low: 'LOW', medium: 'MEDIUM', high: 'HIGH' }[String(effort || '').toLowerCase()] || '';
}

export async function generateVerifierJson({
  input,
  contents,
  imageDataUrl,
  imageDataUrls,
  schema,
  systemInstruction,
  model,
  models,
  timeoutMs = 160_000,
  totalTimeoutMs,
  maxOutputTokens = 12_000,
  reasoningEffort,
  thinkingLevel,
  temperature = 0.15
}) {
  const images = [...(Array.isArray(imageDataUrls) ? imageDataUrls : []), ...(imageDataUrl ? [imageDataUrl] : [])].slice(0, 8);
  const primaryModel = model || process.env.GEMINI_VERIFY_MODEL || 'gemini-3.8-flash';
  // Gemini can briefly return 503 UNAVAILABLE for one model while another is
  // healthy. Keep a second Gemini model in the same request so a busy verifier
  // model does not fail the whole guide pipeline.
  const alternateModel = process.env.GEMINI_VERIFY_FALLBACK_MODEL
    || (primaryModel === 'gemini-3.8-flash' ? 'gemini-3.5-flash' : 'gemini-3.8-flash');
  const requestedModels = Array.isArray(models) && models.length
    ? models
    : [...new Set([primaryModel, alternateModel])];
  const outputTokenLimit = Number.isFinite(Number(maxOutputTokens))
    ? Math.max(2_000, Math.min(64_000, Number(maxOutputTokens)))
    : null;
  return generateJson({
    contents: withImages(input ?? contents, images),
    schema,
    systemInstruction,
    models: requestedModels,
    timeoutMs,
    ...(Number.isFinite(Number(totalTimeoutMs)) ? { totalTimeoutMs: Number(totalTimeoutMs) } : {}),
    ...(outputTokenLimit ? { maxOutputTokens: outputTokenLimit } : {}),
    thinkingLevel: thinkingLevel || thinkingLevelFor(reasoningEffort),
    temperature
  });
}
