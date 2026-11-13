let client;
const calls = new Map();

function parseJson(text) {
  const cleaned = String(text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try { return JSON.parse(cleaned.slice(start, end + 1)); } catch { return null; }
}

function normalizeMathOutput(value) {
  if (typeof value === 'string') {
    return value
      .replace(/\\begin\{(?:itemize|enumerate)\}/g, '\n')
      .replace(/\\end\{(?:itemize|enumerate)\}/g, '\n')
      .replace(/\\item\s*/g, '\n- ')
      .replace(/\\textbf\{([^{}]*)\}/g, '**$1**');
  }
  if (Array.isArray(value)) return value.map(normalizeMathOutput);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalizeMathOutput(item)]));
  }
  return value;
}

export function checkRateLimit(username, limit = 12, windowMs = 60_000) {
  const key = String(username || 'anonymous');
  const now = Date.now();
  const recent = (calls.get(key) || []).filter(time => now - time < windowMs);
  if (recent.length >= limit) return false;
  recent.push(now);
  calls.set(key, recent);
  return true;
}

export function text(value, max = 50_000) {
  return String(value ?? '').trim().slice(0, max);
}

export function parseBody(req) {
  if (typeof req.body !== 'string') return req.body || {};
  try { return JSON.parse(req.body); } catch { return null; }
}

// The Google SDK throws ApiError with an HTTP status but no code. Give it a
// stable code so every route can classify transient capacity errors.
export function normalizeAiError(error) {
  if (error && !error.code && Number(error.status) >= 400) {
    error.code = Number(error.status) === 429 ? 'AI_HTTP_429' : `AI_HTTP_${Number(error.status)}`;
  }
  return error;
}

export function isTransientAiError(error) {
  const code = text(error?.code, 80);
  const status = Number(error?.status);
  return ['AI_TIMEOUT', 'AI_INVALID_JSON', 'AI_RECITATION'].includes(code)
    || status === 429 || status >= 500 || error?.name === 'TypeError'
    || /^AI_HTTP_(?:429|5\d\d)$/.test(code);
}

export async function generateJson({
  contents,
  schema,
  systemInstruction,
  temperature = 0.15,
  models = ['gemini-3.5-flash-lite'],
  timeoutMs = 22_000,
  totalTimeoutMs,
  maxOutputTokens,
  thinkingLevel
}) {
  if (!process.env.GEMINI_API_KEY && typeof process.loadEnvFile === 'function') {
    try {
      const fs = await import('node:fs');
      if (fs.existsSync('.env')) process.loadEnvFile('.env');
      else if (fs.existsSync('.env.local')) process.loadEnvFile('.env.local');
    } catch {}
  }
  if (!process.env.GEMINI_API_KEY) {
    const error = new Error('GEMINI_API_KEY chưa được cấu hình trên Vercel');
    error.code = 'AI_NOT_CONFIGURED';
    throw error;
  }
  if (!client) {
    const { GoogleGenAI } = await import('@google/genai');
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  // Dùng model hiện hành hỗ trợ ảnh và structured JSON. Có thể ghi đè model
  // qua tham số `models` ở từng chức năng khi cần.
  const requestedModels = Array.isArray(models) && models.length
    ? models.map(value => text(value, 80)).filter(Boolean)
    : ['gemini-3.5-flash-lite'];
  const modelList = [...new Set(requestedModels)].slice(0, 3);
  // Vercel caps one function invocation at 300s. Keep a small safety margin so
  // the route can still serialize a JSON response instead of being killed.
  const requestTimeout = Math.max(5_000, Math.min(210_000, Number(timeoutMs) || 22_000));
  const totalTimeout = Number.isFinite(Number(totalTimeoutMs))
    ? Math.max(5_000, Math.min(295_000, Number(totalTimeoutMs)))
    : null;
  const startedAt = Date.now();
  const outputTokenLimit = Number.isFinite(Number(maxOutputTokens))
    ? Math.max(2_000, Math.min(64_000, Number(maxOutputTokens)))
    : null;
  const normalizedThinkingLevel = ['MINIMAL', 'LOW', 'MEDIUM', 'HIGH'].includes(String(thinkingLevel || '').toUpperCase())
    ? String(thinkingLevel).toUpperCase()
    : '';
  let lastError;
  for (const model of modelList) {
    // A 429/5xx from Gemini is often a short-lived capacity spike for one
    // model. Retry the same model once after a brief pause before moving on.
    for (let attempt = 0; attempt < 2; attempt += 1) {
      let timer;
      try {
        const remainingMs = totalTimeout ? totalTimeout - (Date.now() - startedAt) : requestTimeout;
        if (remainingMs <= 0) {
          const error = new Error('AI_TIMEOUT');
          error.code = 'AI_TIMEOUT';
          throw error;
        }
        const attemptTimeout = Math.min(requestTimeout, remainingMs);
        const response = await Promise.race([
          client.models.generateContent({
            model,
            contents,
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
              responseJsonSchema: schema,
              temperature,
              ...(outputTokenLimit ? { maxOutputTokens: outputTokenLimit } : {}),
              ...(normalizedThinkingLevel
                ? { thinkingConfig: { thinkingLevel: normalizedThinkingLevel } }
                : {})
            }
          }),
          new Promise((_, reject) => { timer = setTimeout(() => {
            const error = new Error('AI_TIMEOUT');
            error.code = 'AI_TIMEOUT';
            reject(error);
          }, attemptTimeout); })
        ]);
        const data = parseJson(response?.text);
        if (data) return { data: normalizeMathOutput(data), model };
        const finishReason = String(response?.candidates?.[0]?.finishReason || 'UNKNOWN');
        lastError = new Error(`AI_INVALID_JSON:${finishReason}`);
        lastError.code = finishReason === 'RECITATION' ? 'AI_RECITATION' : 'AI_INVALID_JSON';
        lastError.finishReason = finishReason;
        console.error('[Gemini JSON]', { model, finishReason,
          outputTokens: response?.usageMetadata?.candidatesTokenCount,
          thinkingTokens: response?.usageMetadata?.thoughtsTokenCount });
      } catch (error) {
        // RECITATION là quyết định chặn đầu ra, thử lại cùng nhà cung cấp/model
        // khác thường chỉ lặp lại kết quả và làm cạn ngân sách Vercel.
        if (error?.code === 'AI_RECITATION') throw error;
        // The SDK throws ApiError with an HTTP status but no code. Normalize it
        // so callers can classify 429/5xx and fall back to another Gemini model.
        normalizeAiError(error);
        lastError = error;
        const status = Number(error?.status);
        const remainingMs = totalTimeout ? totalTimeout - (Date.now() - startedAt) : null;
        const canRetrySameModel = attempt === 0 && (status === 429 || status >= 500)
          && (remainingMs === null || remainingMs > 12_000);
        if (canRetrySameModel) {
          await new Promise(resolve => setTimeout(resolve, 1_500));
          continue;
        }
      } finally {
        clearTimeout(timer);
      }
      break;
    }
  }
  throw lastError || new Error('Không nhận được phản hồi AI');
}

// Runs a Gemini request and, on a transient failure, one model-level retry with
// a stronger Gemini model. Both branches report provider 'google' because the
// deployment no longer depends on a second AI provider.
export async function generateWithFallback(primary, fallback, { stage, onFallback } = {}) {
  try {
    return { ...await primary(), provider: 'google' };
  } catch (primaryError) {
    normalizeAiError(primaryError);
    if (!isTransientAiError(primaryError)) throw primaryError;
    onFallback?.(primaryError);
    try {
      return { ...await fallback(primaryError), provider: 'google' };
    } catch (fallbackError) {
      if (fallbackError && typeof fallbackError === 'object' && stage) {
        fallbackError.aiStage = stage;
        if (!fallbackError.cause) fallbackError.cause = primaryError;
      }
      throw fallbackError;
    }
  }
}

export function prepare(res) {
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
}

export function handleAiError(res, error) {
  console.error('[AI API]', error);
  normalizeAiError(error);
  const code = text(error?.code, 80);
  const unavailable = /^AI_HTTP_(?:429|5\d\d)$/.test(code);
  const status = code.endsWith('_NOT_CONFIGURED') ? 503
    : code.endsWith('_TIMEOUT') ? 504
      : unavailable ? 503 : 502;
  const messages = {
    AI_NOT_CONFIGURED: 'Chưa cấu hình GEMINI_API_KEY cho dịch vụ AI trên Vercel.',
    AI_TIMEOUT: 'Gemini xử lý ảnh quá thời gian cho phép. Vui lòng thử ảnh rõ, gọn hơn hoặc thử lại.',
    AI_RECITATION: 'Gemini không thể đọc ảnh này. Hãy thử ảnh rõ hơn hoặc chụp lại riêng phần đề.',
    AI_INVALID_JSON: 'Gemini trả kết quả không hợp lệ. Vui lòng thử lại.',
    ...(unavailable ? { [code]: 'Gemini đang quá tải hoặc tạm thời không khả dụng. Vui lòng thử lại sau ít phút.' } : {})
  };
  const errorMessage = messages[code] || `Dịch vụ AI gặp lỗi${code ? ` (${code})` : ''}. Vui lòng thử lại; nếu tiếp tục, gửi mã lỗi cho quản trị viên.`;
  return res.status(status).json({ success: false, error: errorMessage, ...(code ? { code } : {}) });
}
