const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const TEST_RESULTS_DIR = path.join(ROOT_DIR, 'test-results');
const PLAYWRIGHT_REPORT_DIR = path.join(ROOT_DIR, 'playwright-report');
const REPORTS_DIR = path.join(ROOT_DIR, 'reports');
const ROOT_ARTIFACT_DIRS = ['screenshots', 'videos', 'traces', 'logs'].map((name) => path.join(ROOT_DIR, name));
const EXECUTION_METADATA_PATH = path.join(TEST_RESULTS_DIR, 'execution-metadata.json');

function timestampForPath(date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0');
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join('-') + '_' + [
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join('-');
}

function isHistoricalMode() {
  // Retain each execution by default. Set REPORT_HISTORY=false only when a
  // disposable, single-run workspace is explicitly required.
  return !['0', 'false', 'no', 'off'].includes(String(process.env.REPORT_HISTORY || '').toLowerCase());
}

function safeRm(target) {
  const resolved = path.resolve(target);
  if (!resolved.startsWith(ROOT_DIR)) {
    throw new Error(`Refusing to delete outside workspace: ${resolved}`);
  }
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      fs.rmSync(resolved, { recursive: true, force: true, maxRetries: 3, retryDelay: 150 });
      return;
    } catch (error) {
      if (!['EBUSY', 'ENOTEMPTY', 'EPERM'].includes(error.code)) {
        throw error;
      }
      if (attempt === 4) {
        // A lingering handle (e.g. an orphaned browser process) can hold a single
        // artifact file open. Cleanup is best-effort housekeeping, not
        // correctness-critical — the new run writes fresh, uniquely-named artifact
        // folders regardless, so don't let one stale locked file abort the entire
        // execution.
        console.warn(`Warning: could not remove locked path, leaving it in place: ${resolved}`);
        return;
      }
    }
  }
}

function copyIfExists(source, destination) {
  if (!fs.existsSync(source)) return;
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.cpSync(source, destination, {
    recursive: true,
    force: true,
    filter: (item) => !/[\\/]history([\\/]|$)/.test(item),
  });
}

function copyDirectoryContentsIfExists(source, destination) {
  if (!fs.existsSync(source)) return;
  fs.mkdirSync(destination, { recursive: true });
  for (const item of fs.readdirSync(source)) {
    if (item === 'history') continue;
    copyIfExists(path.join(source, item), path.join(destination, item));
  }
}

function archivePreviousArtifacts(executionId) {
  const historyRoot = path.join(TEST_RESULTS_DIR, 'history', executionId);
  copyDirectoryContentsIfExists(TEST_RESULTS_DIR, path.join(historyRoot, 'test-results'));
  copyDirectoryContentsIfExists(PLAYWRIGHT_REPORT_DIR, path.join(PLAYWRIGHT_REPORT_DIR, 'history', executionId));
  for (const artifactDir of ROOT_ARTIFACT_DIRS) {
    copyIfExists(artifactDir, path.join(historyRoot, path.basename(artifactDir)));
  }
}

function cleanDirectoryContents(directory, { preserveHistory }) {
  if (!fs.existsSync(directory)) return;
  for (const item of fs.readdirSync(directory)) {
    if (preserveHistory && item === 'history') continue;
    safeRm(path.join(directory, item));
  }
}

function cleanPreviousArtifacts({ preserveHistory }) {
  // REPORTS_DIR (reports/<STORY-ID>/...) holds upstream pipeline deliverables
  // (requirement analysis, manual test cases) — these belong to the QA workflow,
  // not to a single test execution, so they are intentionally never cleaned here.
  cleanDirectoryContents(TEST_RESULTS_DIR, { preserveHistory });
  cleanDirectoryContents(PLAYWRIGHT_REPORT_DIR, { preserveHistory });

  for (const artifactDir of ROOT_ARTIFACT_DIRS) {
    cleanDirectoryContents(artifactDir, { preserveHistory: false });
  }

  fs.mkdirSync(TEST_RESULTS_DIR, { recursive: true });
  fs.mkdirSync(path.join(TEST_RESULTS_DIR, 'screenshots'), { recursive: true });
  fs.mkdirSync(path.join(TEST_RESULTS_DIR, 'raw-results'), { recursive: true });
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

function startExecution() {
  const startDate = new Date();
  const executionId = timestampForPath(startDate);
  const historicalMode = isHistoricalMode();

  if (historicalMode) {
    archivePreviousArtifacts(executionId);
  }

  cleanPreviousArtifacts({ preserveHistory: historicalMode });

  const metadata = {
    executionId,
    historicalMode,
    startTime: startDate.toISOString(),
  };
  fs.writeFileSync(EXECUTION_METADATA_PATH, JSON.stringify(metadata, null, 2), 'utf8');
  return metadata;
}

function readExecutionMetadata() {
  if (!fs.existsSync(EXECUTION_METADATA_PATH)) return {};
  return JSON.parse(fs.readFileSync(EXECUTION_METADATA_PATH, 'utf8'));
}

module.exports = {
  EXECUTION_METADATA_PATH,
  ROOT_DIR,
  TEST_RESULTS_DIR,
  PLAYWRIGHT_REPORT_DIR,
  REPORTS_DIR,
  ROOT_ARTIFACT_DIRS,
  startExecution,
  readExecutionMetadata,
};
