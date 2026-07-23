const base = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const rawResultsDir = path.resolve(__dirname, '..', 'test-results', 'raw-results');

function safeName(value) {
  return String(value || 'test')
    .replace(/[^a-z0-9-]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120);
}

function collectArtifacts(testInfo) {
  return testInfo.attachments
    .filter((attachment) => attachment.path)
    .map((attachment) => ({
      name: attachment.name,
      contentType: attachment.contentType,
      path: path.resolve(attachment.path),
    }));
}

const test = base.test.extend({});

test.beforeAll(() => {
  fs.mkdirSync(rawResultsDir, { recursive: true });
});

test.afterEach(async ({}, testInfo) => {
  fs.mkdirSync(rawResultsDir, { recursive: true });
  const record = {
    title: testInfo.title,
    titlePath: testInfo.titlePath,
    projectName: testInfo.project.name,
    file: testInfo.file,
    location: `${testInfo.file}:${testInfo.line}`,
    status: testInfo.status,
    expectedStatus: testInfo.expectedStatus,
    duration: testInfo.duration,
    retry: testInfo.retry,
    startTime: testInfo.startTime,
    error: testInfo.error ? testInfo.error.message || String(testInfo.error) : '',
    artifacts: collectArtifacts(testInfo),
  };
  const fileName = `${safeName(testInfo.project.name)}-${safeName(testInfo.title)}-${testInfo.retry}.json`;
  fs.writeFileSync(path.join(rawResultsDir, fileName), JSON.stringify(record, null, 2), 'utf8');
});

module.exports = {
  test,
  expect: base.expect,
};
