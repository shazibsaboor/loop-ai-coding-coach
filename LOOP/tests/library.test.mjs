import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
import React from 'react';
import * as icons from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { renderToStaticMarkup } from 'react-dom/server';
import * as curriculum from '../src/lib/challenges.ts';
import * as savedTutor from '../src/lib/saved-tutor.ts';
import * as progress from '../src/lib/progress.ts';

const require = createRequire(import.meta.url);
const compiled = ts.transpileModule(readFileSync(new URL('../src/components/learning-app.tsx', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
}).outputText;
const exports = {};
vm.runInContext(compiled, vm.createContext({ exports, require: id => id === 'lucide-react' ? icons : id === 'react-markdown' ? ReactMarkdown : id === '@/lib/challenges' ? curriculum : id === '@/lib/progress' ? progress : id === '@/lib/saved-tutor' ? savedTutor : id === '@/lib/runner' ? {} : require(id) }));
const render = search => renderToStaticMarkup(React.createElement(exports.ChallengeLibrary, { search, setSearch() {}, progress: progress.emptyProgress, open() {} }));
test('the whole library renders every lesson, including lessons beyond the icon count', () => {
  const html = render('');
  assert.equal((html.match(/class="challenge-card /g) || []).length, curriculum.challenges.length);
  for (const c of curriculum.challenges) assert.ok(html.includes(c.title), c.title);
});
test('search can render the final lesson and the empty state', () => {
  assert.ok(render('sunny').includes('Choose a sunny message'));
  assert.ok(render('no-such-exercise').includes('No challenges here yet.'));
});
