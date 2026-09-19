import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { challenges } from '../src/lib/challenges.ts';
import { savedTutorReply, savedSolutions } from '../src/lib/saved-tutor.ts';

test('saved solutions satisfy every example in all fourteen lessons', () => {
  for (const challenge of challenges) {
    assert.ok(savedSolutions[challenge.id], challenge.id);
    for (const check of challenge.checks) {
      const actual = vm.runInNewContext(`${savedSolutions[challenge.id]}\n${challenge.functionName}(...args)`, { args: check.args }, { timeout: 1000 });
      assert.deepEqual(actual, check.expected, challenge.id);
    }
    assert.ok(savedTutorReply(challenge, 'Give me a small hint').includes(challenge.hints[0]));
    assert.ok(savedTutorReply(challenge, 'Explain this lesson').includes(challenge.lesson));
    assert.ok(savedTutorReply(challenge, 'Show the correct solution').includes(savedSolutions[challenge.id]));
  }
});

test('custom questions are not misrepresented as analysed or solved', () => {
  for (const question of ['Explain each line of my code', 'Give me a solution for a banking app', 'Why is my code failing?', 'Do not show the solution']) {
    const answer = savedTutorReply(challenges[0], question);
    assert.match(answer, /can’t analyse your custom code/);
    assert.ok(!answer.includes(savedSolutions[challenges[0].id]));
  }
});
