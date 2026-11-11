import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { generateWithFallback, isTransientAiError, normalizeAiError } from '../lib/ai.js';
import { embeddingConfig } from '../lib/rag-embedding.js';

// The deployment is Gemini-only. Guard against any route re-introducing a
// second AI provider or an OpenAI key requirement.
const apiDirectory = new URL('../api/', import.meta.url);
const libDirectory = new URL('../lib/', import.meta.url);
const sources = [];
for (const directory of [apiDirectory, libDirectory]) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith('.js')) {
      sources.push([entry.name, await readFile(new URL(entry.name, directory), 'utf8')]);
    }
  }
}
const legacyProvider = /openai/i;
for (const [name, source] of sources) {
  assert.doesNotMatch(source, legacyProvider, `${name} must not reference the removed OpenAI provider`);
}
await assert.rejects(readFile(new URL('lib/openai.js', new URL('../', import.meta.url))), /ENOENT/);

const guide = await readFile(new URL('../api/ai-guide.js', import.meta.url), 'utf8');
const evaluation = await readFile(new URL('../api/ai-evaluate-solution.js', import.meta.url), 'utf8');
const prediction = await readFile(new URL('../api/ai-predict-exam.js', import.meta.url), 'utf8');
const translation = await readFile(new URL('../api/translate-content.js', import.meta.url), 'utf8');
const examOcr = await readFile(new URL('../api/ai-ocr-exam.js', import.meta.url), 'utf8');
const mathOcr = await readFile(new URL('../api/ai-ocr-math.js', import.meta.url), 'utf8');
for (const [name, source] of [['ai-guide', guide], ['ai-evaluate-solution', evaluation],
  ['ai-predict-exam', prediction], ['translate-content', translation]]) {
  assert.match(source, /generateWithFallback/, `${name} must retry with a Gemini model`);
  assert.match(source, /generateVerifierJson/, `${name} must use the Gemini verifier adapter`);
}
assert.match(examOcr, /source = 'gemini-fallback'/, 'Exam OCR must fall back to a second Gemini model');
assert.match(mathOcr, /source = 'gemini-fallback'/, 'Math OCR must fall back to a second Gemini model');

// A busy verifier model (Gemini 503 UNAVAILABLE) must not fail the pipeline:
// the adapter keeps a second Gemini model in the same request, and HTTP status
// errors are normalized so callers can classify them as transient.
const verifierSource = await readFile(new URL('../lib/ai-verifier.js', import.meta.url), 'utf8');
assert.match(verifierSource, /GEMINI_VERIFY_FALLBACK_MODEL/, 'Verifier must expose a configurable fallback model');
assert.match(verifierSource, /new Set\(\[primaryModel, alternateModel, backupModel\]\)/, 'Verifier must try alternate Gemini models');
const aiSource = await readFile(new URL('../lib/ai.js', import.meta.url), 'utf8');
assert.match(aiSource, /AI_HTTP_\$\{Number\(error\.status\)\}/, 'Gemini ApiError statuses must become retryable error codes');

// HTTP 429/5xx must be classified as transient so the next Gemini model and
// the one short same-model retry both run; request/config errors must not.
const capacityError = normalizeAiError(Object.assign(new Error('unavailable'), { status: 503 }));
assert.equal(capacityError.code, 'AI_HTTP_503');
assert.equal(isTransientAiError(capacityError), true);
assert.equal(isTransientAiError(Object.assign(new Error('rate limited'), { code: 'AI_HTTP_429' })), true);
assert.equal(isTransientAiError(Object.assign(new Error('bad request'), { code: 'AI_HTTP_400', status: 400 })), false);

// Transient Gemini failures retry once; permanent request errors do not.
const primaryUnavailable = Object.assign(new Error('provider unavailable'), { status: 503 });
let fallbackCalled = false;
const recovered = await generateWithFallback(
  async () => { throw primaryUnavailable; },
  async () => { fallbackCalled = true; return { data: { recovered: true }, model: 'gemini-mock' }; },
  { stage: 'solver' }
);
assert.equal(fallbackCalled, true);
assert.equal(recovered.provider, 'google');
assert.equal(recovered.data.recovered, true);

const primaryResult = await generateWithFallback(
  async () => ({ data: { primary: true }, model: 'gemini-mock' }),
  async () => assert.fail('Fallback must not run when the primary succeeds')
);
assert.equal(primaryResult.provider, 'google');

const invalidRequest = Object.assign(new Error('invalid request'), { status: 400 });
await assert.rejects(
  generateWithFallback(async () => { throw invalidRequest; }, async () => assert.fail('Do not retry non-transient errors')),
  error => error === invalidRequest
);

const fallbackFailure = Object.assign(new Error('verification rejected'), { code: 'AI_INVALID_JSON' });
await assert.rejects(
  generateWithFallback(async () => { throw primaryUnavailable; }, async () => { throw fallbackFailure; }, { stage: 'grader' }),
  error => error === fallbackFailure && error.aiStage === 'grader' && error.cause === primaryUnavailable
);

// A legacy OpenAI embedding model name in an existing environment is mapped to
// Gemini so an old Vercel variable cannot call the removed provider.
const previousModel = process.env.RAG_EMBEDDING_MODEL;
process.env.RAG_EMBEDDING_MODEL = 'text-embedding-3-small';
try {
  assert.equal(embeddingConfig().model, 'gemini-embedding-001');
  process.env.RAG_EMBEDDING_MODEL = 'gemini-embedding-001';
  assert.equal(embeddingConfig().model, 'gemini-embedding-001');
} finally {
  if (previousModel === undefined) delete process.env.RAG_EMBEDDING_MODEL;
  else process.env.RAG_EMBEDDING_MODEL = previousModel;
}

console.log('Gemini-only provider routing, verifier adapter and embedding mapping: OK');
