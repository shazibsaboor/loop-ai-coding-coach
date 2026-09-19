import type { Challenge } from "./challenges";

export type TestResult = { label: string; passed: boolean; actual: string; expected: string; error?: string };
export type RunResult = { tests: TestResult[]; logs: string[]; error?: string };

// Opaque-origin iframe + inherited CSP keep exercise code away from the app's
// origin, storage and network. A disposable worker keeps loops off the UI thread.
// Results are local practice feedback, never trusted certification or billing.
export const workerSource = String.raw`
"use strict";
const send = self.postMessage.bind(self);
const stringify = JSON.stringify.bind(JSON);
const parse = JSON.parse.bind(JSON);
const safeText = (v) => { try { return (stringify(v) ?? String(v)).slice(0, 1600); } catch { return '[unserializable value]'; } };
const canonical = (v) => Array.isArray(v) ? v.map(canonical) : v !== null && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map(k => [k, canonical(v[k])])) : v;
const same = (a, b) => {
  if (typeof a === 'number' && typeof b === 'number') return Number.isFinite(a) && Math.abs(a - b) <= 1e-9;
  return stringify(canonical(a)) === stringify(canonical(b));
};
onmessage = (event) => {
  const { code, functionName, checks } = event.data;
  const logs = [];
  const capture = (...args) => { if (logs.length < 30) logs.push(args.map(safeText).join(' ').slice(0, 1600)); };
  self.console = { log: capture, info: capture, warn: capture, error: capture, debug: capture };
  try {
    const fn = new Function('"use strict";\n' + code + '\n;return typeof ' + functionName + ' === "function" ? ' + functionName + ' : null;')();
    if (!fn) throw new Error('Define a function named ' + functionName + '.');
    const tests = checks.map(check => {
      const args = parse(stringify(check.args));
      const before = stringify(args);
      try {
        const actual = fn(...args);
        if (actual && typeof actual.then === 'function') throw new Error('Return a value directly. These challenges use synchronous functions.');
        const unchanged = stringify(args) === before;
        const fresh = functionName !== 'updateCart' || actual !== args[0];
        return { label: check.label, passed: same(actual, check.expected) && unchanged && fresh, actual: safeText(actual), expected: safeText(check.expected), ...(!unchanged ? { error: 'The input was changed. Return a new value without mutating the input.' } : !fresh ? { error: 'Return a new array, even when its contents stay the same.' } : {}) };
      } catch (e) {
        return { label: check.label, passed: false, actual: 'Error', expected: safeText(check.expected), error: String(e && e.message || e).slice(0, 500) };
      }
    });
    send({ tests, logs });
  } catch (e) { send({ tests: [], logs, error: String(e && e.message || e).slice(0, 500) }); }
};
`;

const frameScript = `
let worker;
addEventListener('message', event => {
  if (event.source !== parent) return;
  if (event.data?.type === 'stop') { worker?.terminate(); return; }
  if (event.data?.type !== 'run' || worker) return;
  try {
    const url = URL.createObjectURL(new Blob([${JSON.stringify(workerSource)}], {type:'text/javascript'}));
    worker = new Worker(url);
    URL.revokeObjectURL(url);
    worker.onmessage = e => { parent.postMessage({type:'result', id:event.data.id, result:e.data}, '*'); worker.terminate(); };
    worker.onerror = () => { parent.postMessage({type:'result', id:event.data.id, result:{tests:[],logs:[],error:'The code runner could not start. Check browser support and try again.'}}, '*'); worker.terminate(); };
    worker.postMessage(event.data.payload);
  } catch { parent.postMessage({type:'result',id:event.data.id,result:{tests:[],logs:[],error:'Your browser could not start the isolated runner.'}}, '*'); }
});
`;

const frameHtml = `<!doctype html><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' blob:; worker-src blob:; connect-src 'none'; img-src 'none'; style-src 'none'; base-uri 'none'; form-action 'none'"><script>${frameScript}<\/script>`;

export function runCode(challenge: Challenge, code: string, signal?: AbortSignal): Promise<RunResult> {
  if (code.length > 16000) return Promise.resolve({ tests: [], logs: [], error: "Keep your solution under 16,000 characters." });
  if (signal?.aborted) return Promise.resolve({ tests: [], logs: [], error: "Run stopped." });
  return new Promise(resolve => {
    const frame = document.createElement("iframe");
    frame.hidden = true;
    frame.title = "Isolated JavaScript practice runner";
    frame.setAttribute("sandbox", "allow-scripts");
    frame.setAttribute("referrerpolicy", "no-referrer");
    const id = crypto.randomUUID();
    let settled = false;
    const finish = (result: RunResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      window.removeEventListener("message", receive);
      signal?.removeEventListener("abort", cancel);
      frame.contentWindow?.postMessage({ type: "stop" }, "*");
      frame.remove();
      resolve(result);
    };
    const cancel = () => finish({ tests: [], logs: [], error: "Run stopped. Your code is still saved." });
    const timeout = window.setTimeout(() => finish({ tests: [], logs: [], error: "Stopped after 3 seconds. Check for a loop that never ends." }), 3000);
    const receive = (event: MessageEvent) => {
      if (event.source !== frame.contentWindow || event.data?.type !== "result" || event.data?.id !== id) return;
      const r = event.data.result;
      if (!r || !Array.isArray(r.tests) || !Array.isArray(r.logs)) return finish({ tests: [], logs: [], error: "The runner returned an invalid result." });
      const tests: TestResult[] = r.tests.slice(0, challenge.checks.length).map((t: TestResult, i: number) => ({
        label: challenge.checks[i].label, passed: t?.passed === true,
        actual: String(t?.actual ?? "undefined").slice(0, 1600), expected: JSON.stringify(challenge.checks[i].expected),
        ...(t?.error ? { error: String(t.error).slice(0, 500) } : {}),
      }));
      finish({ tests, logs: r.logs.slice(0, 30).map((l: unknown) => String(l).slice(0, 1600)), ...(r.error ? { error: String(r.error).slice(0, 500) } : {}) });
    };
    window.addEventListener("message", receive);
    signal?.addEventListener("abort", cancel, { once: true });
    frame.onload = () => frame.contentWindow?.postMessage({ type: "run", id, payload: { code, functionName: challenge.functionName, checks: challenge.checks } }, "*");
    frame.srcdoc = frameHtml;
    document.body.appendChild(frame);
  });
}
