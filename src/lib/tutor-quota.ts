import { createHmac } from "node:crypto";
import { isIP } from "node:net";

// One atomic reservation across all Vercel instances. Names are never identifiers.
export const quotaScript = `
for i = 1, 3 do
  if tonumber(redis.call('GET', KEYS[i]) or '0') >= tonumber(ARGV[i]) then
    return i
  end
end
for i = 1, 3 do
  local count = redis.call('INCR', KEYS[i])
  if count == 1 then redis.call('EXPIRE', KEYS[i], tonumber(ARGV[i + 3])) end
end
return 0
`;

export function needsSharedQuota() {
  return process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
}

export function sharedQuotaConfigured() {
  try {
    const url = new URL(process.env.UPSTASH_REDIS_REST_URL || "");
    return url.protocol === "https:" && !!process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  } catch { return false; }
}

export async function reserveTutorRequest(req: Request): Promise<{ status: number; error: string } | null> {
  if (!needsSharedQuota()) return null;
  if (!sharedQuotaConfigured()) return { status: 503, error: "The AI tutor is temporarily unavailable. You can still use every lesson and written hint." };
  // Vercel overwrites this header at its edge. Do not trust arbitrary proxies.
  const ip = process.env.VERCEL === "1" ? req.headers.get("x-forwarded-for")?.trim() : null;
  if (!ip || !isIP(ip)) return { status: 503, error: "The tutor could not check its usage allowance. Please try again later." };
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;
  const identity = createHmac("sha256", token).update(ip).digest("hex");
  const now = Date.now();
  const minute = Math.floor(now / 60000);
  const day = Math.floor(now / 86400000);
  const scope = process.env.VERCEL_ENV === "production" ? "production" : "preview";
  const prefix = `loop:${scope}`;
  try {
    const response = await fetch(process.env.UPSTASH_REDIS_REST_URL!, {
      method: "POST", cache: "no-store", signal: AbortSignal.timeout(5000),
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(["EVAL", quotaScript, "3", `${prefix}:minute:${minute}:${identity}`, `${prefix}:day:${day}:${identity}`, `${prefix}:day:${day}:all`, "5", "20", "100", "120", "172800", "172800"]),
    });
    if (!response.ok) throw new Error("Quota unavailable");
    const data = await response.json();
    if (data.error || !Number.isInteger(data.result) || data.result < 0 || data.result > 3) throw new Error("Invalid quota response");
    if (data.result === 0) return null;
    return { status: 429, error: data.result === 1 ? "Please wait a minute before asking again. Written hints are always available." : data.result === 2 ? "This network has used today's AI questions. Come back tomorrow; lessons and hints still work." : "Today's shared AI allowance has been used. Please come back tomorrow. Lessons and hints still work." };
  } catch {
    // Fail closed: a broken counter must never enable unmetered Groq requests.
    return { status: 503, error: "The AI tutor is temporarily unavailable. Please use the written hints and try again later." };
  }
}
