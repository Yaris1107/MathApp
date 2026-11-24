import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const dataScript = fs.readFileSync(new URL('../topic_problems_data.js', import.meta.url), 'utf8');
const topicsScript = fs.readFileSync(new URL('../topics.js', import.meta.url), 'utf8');
const appScript = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');

const dom = new JSDOM(html, { url: 'https://math.test/', runScripts: 'outside-only' });
const { window } = dom;
window.matchMedia = () => ({ matches: false, addEventListener() {} });
window.scrollTo = () => {};

window.eval(dataScript);
assert.ok(Array.isArray(window.SYSTEM_TOPIC_PROBLEMS));
assert.ok(window.SYSTEM_TOPIC_PROBLEMS.length >= 150, 'Must have at least 150 system problems');

// Check representation of all 7 canonical topics
const topics = new Set(window.SYSTEM_TOPIC_PROBLEMS.map(p => p.topic));
for (const expected of ['Dãy số', 'Hàm số', 'Số học', 'Hình học', 'Đa thức', 'Tổ hợp', 'Bất đẳng thức']) {
  assert.ok(topics.has(expected), `Canonical topic ${expected} must be represented in system problems`);
}

window.eval(appScript);
window.eval(topicsScript);

const doc = window.document;
assert.ok(doc.getElementById('tab-btn-topics'), 'Tab button tab-btn-topics must exist');
assert.ok(doc.getElementById('tab-topics'), 'Tab pane tab-topics must exist');
assert.ok(doc.getElementById('sidebar-topics'), 'Sidebar sidebar-topics must exist');
assert.ok(doc.getElementById('topicsFilterPills'), 'Filter pills topicsFilterPills must exist');

// Test switching to tab-topics
await window.switchTab('tab-topics', doc.getElementById('tab-btn-topics'));
assert.equal(doc.querySelector('.tab-pane.active').id, 'tab-topics');
assert.equal(doc.getElementById('sidebar-topics').style.display, 'block');
assert.equal(doc.getElementById('sidebar-danang').style.display, 'none');
assert.equal(doc.getElementById('topicsFilterPills').style.display, 'flex');

// Initialize view and test problem rendering
window.initTopicsView();
const cards = doc.querySelectorAll('#topicsProblemsList .topic-problem-card');
assert.ok(cards.length > 0, 'Must render topic problem cards');

// Test filtering by Dãy số
window.filterTopicsByTopic('Dãy số');
const daySoCards = doc.querySelectorAll('#topicsProblemsList .topic-problem-card');
assert.ok(daySoCards.length > 0);
assert.ok(doc.getElementById('sidebar-topics').querySelector('.toc-topic-link.active[data-topic="Dãy số"]'));

// Test filtering by source: tst
window.filterTopicsBySource('tst');
const tstCards = doc.querySelectorAll('#topicsProblemsList .topic-problem-card');
assert.ok(tstCards.length > 0);

// Test Problem Decomposer hook
let decomposed = false;
window.decomposeProblem = (content, title, topic) => {
  decomposed = true;
  assert.ok(content);
  assert.ok(title);
};
const firstProbId = window.SYSTEM_TOPIC_PROBLEMS[0].id;
window.decomposeFromTopicCard(firstProbId);
assert.equal(decomposed, true, 'decomposeFromTopicCard must trigger decomposeProblem');

window.close();
console.log('Topics module: 7 canonical topics, system + database aggregation, sidebar, pills, and decomposer: OK');
