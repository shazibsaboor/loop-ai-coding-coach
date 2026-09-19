import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { challenges as allChallenges } from '../src/lib/challenges.ts';
import { workerSource } from '../src/lib/runner.ts';

import { readFileSync } from 'node:fs';
const easySolutions = JSON.parse(readFileSync(new URL('./easy-solutions.json', import.meta.url), 'utf8'));
const challenges = [
 {functionName:'greet', checks:[{label:'greeting',args:['Ada'],expected:'Hello, Ada!'}]},
 {functionName:'toFahrenheit', checks:[{label:'number',args:[0],expected:32}]},
 null,
 {functionName:'basketTotal', checks:[{label:'sum',args:[[1,2]],expected:3}]},
];

// Only trusted authored fixtures enter this Node test VM. Production code runs
// in the browser's opaque-origin iframe/worker and never in the app server.
function execute(challenge, code) {
  let result;
  const sandbox = { postMessage(value) { result = JSON.parse(JSON.stringify(value)); }, onmessage: null };
  sandbox.self = sandbox;
  const context = vm.createContext(sandbox);
  vm.runInContext(workerSource, context, { timeout: 500 });
  context.payload = { code, functionName: challenge.functionName, checks: challenge.checks };
  vm.runInContext('onmessage({data:payload})', context, { timeout: 500 });
  return result;
}

test('input mutation is rejected even with the correct returned value', () => {
  const result = execute(challenges[3], 'function basketTotal(prices) { let total=0; while(prices.length) total+=prices.pop(); return total; }');
  assert.equal(result.tests[0].passed, false);
  assert.match(result.tests[0].error, /input was changed/);
});
test('syntax errors and missing functions produce useful feedback', () => {
  assert.ok(execute(challenges[0], 'function greet( {').error);
  assert.match(execute(challenges[0], 'const other = 1;').error, /Define a function named greet/);
});
test('runtime errors remain attached to their test cases', () => {
  const result = execute(challenges[0], 'function greet(name) { throw new Error("Try again"); }');
  assert.ok(result.tests.every(t => !t.passed && t.error === 'Try again'));
});
test('asynchronous solutions are explicitly unsupported', () => {
  const result = execute(challenges[0], 'async function greet(name) { return name; }');
  assert.ok(result.tests.every(t=>!t.passed && t.error.includes('synchronous')));
});
test('console output is bounded', () => {
  const result = execute(challenges[0], 'function greet(name) { for(let i=0;i<100;i++) console.log("x".repeat(3000)); return name; }');
  assert.equal(result.logs.length, 30);
  assert.ok(result.logs.every(l=>l.length<=1600));
});
test('nonfinite results do not pass numeric checks', () => {
  const result = execute(challenges[1], 'function toFahrenheit() { return Infinity; }');
  assert.ok(result.tests.every(t=>!t.passed));
});

const guidedSolutions = [
  'function message() { return "Hello, friend!"; }',
  'function rememberName() { let name = "Sara"; return name; }',
  'function total() { return 2 + 4; }',
  'function sayHello(name) { return "Hello, " + name + "!"; }',
];
test('all fourteen lessons are guided, beginner-friendly and uniquely identified', () => {
  assert.equal(allChallenges.length, 14);
  assert.equal(new Set(allChallenges.map(c => c.id)).size, 14);
  assert.ok(allChallenges.every(c => c.guided && c.level === "Beginner" && c.hints.length === 3));
});
for (const [i, c] of allChallenges.entries()) {
  test(`${c.title}: the requested edit passes and the unchanged example needs a change`, () => {
    assert.ok(execute(c, c.starter).tests.some(t => !t.passed));
    const result = execute(c, i < 4 ? guidedSolutions[i] : easySolutions[c.id]);
    assert.equal(result.error, undefined);
    assert.ok(result.tests.every(t => t.passed));
  });
}
