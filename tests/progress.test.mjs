import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyProgress, progressSchema } from '../src/lib/progress.ts';

test('older saved work stays readable when the guest welcome flag is absent', () => {
  const { welcomed, ...old } = { ...emptyProgress, name: 'Sara', completed: ['first-message'], drafts: { 'first-message': 'my saved code' } };
  const restored = progressSchema.parse(old);
  assert.equal(restored.welcomed, false);
  assert.equal(restored.name, 'Sara');
  assert.equal(restored.drafts['first-message'], 'my saved code');
  assert.deepEqual(restored.completed, ['first-message']);
});
test('an unnamed guest can save a completed welcome without requiring an account', () => {
  const restored = progressSchema.parse(JSON.parse(JSON.stringify({ ...emptyProgress, welcomed: true })));
  assert.equal(restored.name, '');
  assert.equal(restored.welcomed, true);
});
