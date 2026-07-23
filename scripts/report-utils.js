const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const puppeteer = require('puppeteer');
const { readExecutionMetadata } = require('./report-lifecycle');

const ROOT_DIR = path.resolve(__dirname, '..');
const RESULTS_DIR = path.join(ROOT_DIR, 'test-results');
const SCREENSHOT_DIR = path.join(RESULTS_DIR, 'screenshots');
const RAW_RESULTS_DIR = path.join(RESULTS_DIR, 'raw-results');
const PDF_OUTPUT = path.join(RESULTS_DIR, 'execution-report.pdf');
const HTML_OUTPUT = path.join(RESULTS_DIR, 'execution-report.html');
const EXCEL_OUTPUT = path.join(RESULTS_DIR, 'test-cases.xlsx');
const SNAPSHOT_OUTPUT = path.join(RESULTS_DIR, 'execution-report-data.json');
const MARKDOWN_OUTPUT = path.join(RESULTS_DIR, 'SCRUM-101-checkout-test-report.md');

const TEST_CASES = [
  ['TC-001', 'Login with valid credentials', 'Verify successful login lands on the inventory page.', 'Login page open', 'standard_user / secret_sauce', 'Inventory page opens', 'High', 'Smoke', 'AC2'],
  ['TC-002', 'Login fails with invalid credentials', 'Verify invalid login shows an error.', 'Login page open', 'bad_user / bad_pass', 'Login error displayed', 'High', 'Negative', 'AC5'],
  ['TC-003', 'Add item to cart increments badge', 'Verify cart count updates after adding a product.', 'Logged in on inventory', 'Sauce Labs Backpack', 'Cart badge shows 1', 'High', 'Functional', 'AC1'],
  ['TC-004', 'Open cart and verify item details', 'Validate cart item name, description, and price.', 'Item in cart', 'Sauce Labs Backpack', 'Item details visible', 'High', 'Functional', 'AC1'],
  ['TC-005', 'Begin checkout from cart', 'Verify clicking checkout opens the information page.', 'Item in cart', 'n/a', 'Checkout information visible', 'High', 'Functional', 'AC2'],
  ['TC-006', 'Complete checkout happy path', 'Validate full purchase flow to confirmation.', 'Valid checkout form', 'Ada / Lovelace / SW1A 1AA', 'Confirmation page displays', 'High', 'Smoke', 'AC1, AC2, AC3, AC4'],
  ['TC-007', 'Missing first name validation', 'Verify error when first name is blank.', 'Checkout information page', 'LastName + PostalCode', 'First name required error', 'High', 'Negative', 'AC2, AC5'],
  ['TC-008', 'Missing last name validation', 'Verify error when last name is blank.', 'Checkout information page', 'FirstName + PostalCode', 'Last name required error', 'High', 'Negative', 'AC2, AC5'],
  ['TC-009', 'Missing postal code validation', 'Verify error when postal code is blank.', 'Checkout information page', 'FirstName + LastName', 'Postal code required error', 'High', 'Negative', 'AC2, AC5'],
  ['TC-010', 'Invalid checkout data validation', 'Verify special characters are rejected or trigger validation.', 'Checkout information page', '@#! / %^& / **', 'Validation error displayed', 'Medium', 'Edge', 'AC5'],
  ['TC-011', 'Cancel checkout from information page', 'Verify cancel returns to cart.', 'Checkout information page', 'n/a', 'Cart page opens', 'Medium', 'Navigation', 'AC3'],
  ['TC-012', 'Continue shopping from cart', 'Verify continue shopping returns to inventory.', 'Cart page with item', 'n/a', 'Inventory page opens', 'Medium', 'Navigation', 'AC1'],
  ['TC-013', 'Checkout overview section validation', 'Verify overview page displays payment, shipping, and totals.', 'Valid checkout data submitted', 'n/a', 'Overview sections visible', 'High', 'UI', 'AC3'],
  ['TC-014', 'Empty cart state validation', 'Verify cart page behavior when no items are added.', 'Logged in user with no items', 'n/a', 'Empty cart or no items displayed', 'Medium', 'Functional', 'AC1'],
  ['TC-015', 'Cart badge resets after order completion', 'Verify cart count resets after order success.', 'Completed order', 'n/a', 'Cart badge resets', 'Medium', 'Edge', 'AC4'],
  ['TC-016', 'Reload checkout information page', 'Verify refreshing the page does not break the flow.', 'Checkout information page', 'n/a', 'Page reloads safely', 'Medium', 'Edge', 'AC2'],
  ['TC-017', 'Browser back navigation during checkout', 'Verify browser back returns to previous checkout step.', 'Checkout step two page', 'n/a', 'Returns to checkout info page', 'Medium', 'Navigation', 'AC3'],
  ['TC-018', 'Order complete page validation', 'Verify confirmation text and Back Home button.', 'Checkout complete page', 'n/a', 'Thank you message visible', 'High', 'UI', 'AC4'],
  ['TC-019', 'Order total value validation', 'Verify subtotal, tax, and total calculations.', 'Checkout overview page', 'n/a', 'Totals match item prices', 'High', 'Functional', 'AC3'],
  ['TC-020', 'UI labels and actionable buttons validation', 'Verify checkout page fields and buttons are labeled correctly.', 'Checkout information page', 'n/a', 'UI labels visible and accurate', 'Medium', 'UI', 'AC2'],
].map(([id, name, description, preconditions, testData, expectedResult, priority, type, coverage]) => ({
  id,
  name,
  description,
  preconditions,
  testData,
  expectedResult,
  priority,
  type,
  coverage,
}));

const COVERAGE_ITEMS = [
  ['AC1', 'Cart Review'],
  ['AC2', 'Checkout Information Entry'],
  ['AC3', 'Order Overview'],
  ['AC4', 'Order Completion'],
  ['AC5', 'Error Handling'],
];

function ensureResultsDir() {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

function sanitize(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getTestCaseId(title) {
  const match = String(title || '').match(/\bTC-\d{3}\b/i);
  return match ? match[0].toUpperCase() : '';
}

function statusRank(status) {
  return { failed: 5, timedOut: 4, interrupted: 3, skipped: 2, passed: 1 }[status] || 0;
}

function finalAttempt(results) {
  if (!results || !results.length) return {};
  return results[results.length - 1];
}

function collectArtifacts(result) {
  const artifacts = [];
  for (const attachment of result.attachments || []) {
    if (attachment.path) {
      artifacts.push({
        name: attachment.name,
        contentType: attachment.contentType,
        path: path.resolve(attachment.path),
      });
    }
  }
  return artifacts;
}

function suiteToRows(suite, startedAt, finishedAt) {
  return suite.allTests().map((testCase) => {
    const titlePath = testCase.titlePath().filter(Boolean);
    const result = finalAttempt(testCase.results);
    const browser = titlePath[0] || '';
    const file = titlePath.find((part) => /(\.spec\.)/.test(part)) || '';
    const title = testCase.title;
    const status = result.status || 'skipped';
    const duration = (testCase.results || []).reduce((sum, item) => sum + (item.duration || 0), 0);
    const errors = (testCase.results || []).flatMap((item) => item.errors || []);

    return {
      id: getTestCaseId(title),
      title,
      browser,
      file,
      status,
      expectedStatus: testCase.expectedStatus || 'passed',
      outcome: typeof testCase.outcome === 'function' ? testCase.outcome() : status,
      duration,
      retryCount: Math.max(0, (testCase.results || []).length - 1),
      startTime: result.startTime || startedAt,
      finishedAt,
      error: errors.map((error) => error.message || error.value || String(error)).join('\n\n'),
      artifacts: collectArtifacts(result),
      location: testCase.location ? `${testCase.location.file}:${testCase.location.line}` : file,
    };
  });
}

function jsonToRows(json) {
  const rows = [];
  function walkSuite(suite, inheritedProject = '') {
    const project = suite.projectName || inheritedProject;
    for (const spec of suite.specs || []) {
      for (const test of spec.tests || []) {
        for (const result of test.results || []) {
          rows.push({
            id: getTestCaseId(spec.title),
            title: spec.title,
            browser: test.projectName || project,
            file: spec.file || '',
            status: result.status || test.outcome || 'unknown',
            expectedStatus: test.expectedStatus || 'passed',
            outcome: test.outcome || result.status || 'unknown',
            duration: result.duration || 0,
            retryCount: result.retry || 0,
            startTime: result.startTime || '',
            error: (result.errors || []).map((error) => error.message || String(error)).join('\n\n'),
            artifacts: collectArtifacts(result),
            location: spec.file || '',
          });
        }
      }
    }
    for (const child of suite.suites || []) walkSuite(child, project);
  }
  for (const suite of json.suites || []) walkSuite(suite);
  return rows;
}

function rawFilesToRows(rawResultsDir = RAW_RESULTS_DIR) {
  if (!fs.existsSync(rawResultsDir)) return [];
  return fs.readdirSync(rawResultsDir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => {
      const raw = JSON.parse(fs.readFileSync(path.join(rawResultsDir, file), 'utf8'));
      return {
        id: getTestCaseId(raw.title),
        title: raw.title,
        browser: raw.projectName || '',
        file: raw.file || '',
        status: raw.status || 'unknown',
        expectedStatus: raw.expectedStatus || 'passed',
        outcome: raw.status || 'unknown',
        duration: raw.duration || 0,
        retryCount: raw.retry || 0,
        startTime: raw.startTime || '',
        error: raw.error || '',
        artifacts: raw.artifacts || [],
        location: raw.location || raw.file || '',
      };
    });
}

function buildSnapshotFromRows(rows, startedAt = new Date(), finishedAt = new Date(), metadata = {}) {
  const start = new Date(metadata.startTime || startedAt);
  const finish = new Date(finishedAt);
  const automatedScenarios = [...new Set(rows.map((row) => `${row.file}|${row.title}`))];
  const unmappedScenarios = [...new Map(rows
    .filter((row) => !row.id)
    .map((row) => [`${row.file}|${row.title}`, {
      title: row.title,
      file: row.file,
      browsers: [...new Set(rows.filter((item) => item.title === row.title && item.file === row.file).map((item) => item.browser))].join(', '),
    }])).values()];
  const summary = rows.reduce(
    (acc, row) => {
      acc.total += 1;
      acc[row.status] = (acc[row.status] || 0) + 1;
      acc.duration += row.duration || 0;
      return acc;
    },
    { total: 0, passed: 0, failed: 0, skipped: 0, timedOut: 0, interrupted: 0, duration: 0 }
  );

  const browserResults = Object.values(rows.reduce((acc, row) => {
    const key = row.browser || 'unknown';
    acc[key] = acc[key] || { browser: key, total: 0, passed: 0, failed: 0, skipped: 0, timedOut: 0, interrupted: 0 };
    acc[key].total += 1;
    acc[key][row.status] = (acc[key][row.status] || 0) + 1;
    return acc;
  }, {}));

  const byCase = new Map();
  for (const row of rows) {
    if (!row.id) continue;
    const current = byCase.get(row.id) || { id: row.id, browsers: [], status: 'passed', actualResult: 'Passed across executed browsers.' };
    current.browsers.push(row.browser);
    if (statusRank(row.status) > statusRank(current.status)) current.status = row.status;
    if (row.status !== 'passed') current.actualResult = row.error || row.status;
    byCase.set(row.id, current);
  }

  const documentedCases = TEST_CASES.map((testCase) => {
    const executed = byCase.get(testCase.id);
    return {
      ...testCase,
      executionStatus: executed ? executed.status : 'not executed',
      browserExecuted: executed ? [...new Set(executed.browsers)].join(', ') : '',
      actualResult: executed ? executed.actualResult : 'No matching Playwright test result was found.',
      remarks: executed ? 'Populated from Playwright execution results.' : 'Documented but not matched to an automated TC ID.',
    };
  });

  const defects = rows
    .filter((row) => !['passed', 'skipped'].includes(row.status))
    .map((row, index) => ({
      id: `DEF-${String(index + 1).padStart(3, '0')}`,
      testCaseId: row.id || 'Unmapped',
      title: row.title,
      browser: row.browser,
      status: row.status,
      severity: row.expectedStatus === 'passed' ? 'High' : 'Medium',
      error: row.error || 'No error message captured.',
      artifacts: row.artifacts,
    }));

  const coverage = COVERAGE_ITEMS.map(([id, name]) => {
    const coveredCases = documentedCases.filter((testCase) => testCase.coverage.includes(id));
    const executed = coveredCases.filter((testCase) => testCase.executionStatus !== 'not executed');
    const passed = executed.filter((testCase) => testCase.executionStatus === 'passed');
    return {
      id,
      name,
      testCases: coveredCases.map((testCase) => testCase.id).join(', '),
      documented: coveredCases.length,
      executed: executed.length,
      passed: passed.length,
      status: executed.length === 0 ? 'Not executed' : passed.length === executed.length ? 'Covered' : 'At risk',
    };
  });

  const screenshots = listScreenshots(rows);
  const recommendations = buildRecommendations(summary, defects, coverage, rows);

  return {
    executionId: metadata.executionId || `manual-${Date.now()}`,
    historicalMode: !!metadata.historicalMode,
    generatedAt: new Date().toISOString(),
    startedAt: start.toISOString(),
    finishedAt: finish.toISOString(),
    totalDuration: Math.max(0, finish.getTime() - start.getTime()),
    summary,
    documentedTestCaseCount: TEST_CASES.length,
    automatedScenarioCount: automatedScenarios.length,
    browserExecutionCount: rows.length,
    unmappedScenarios,
    browserResults,
    testResults: rows,
    testCases: documentedCases,
    defects,
    coverage,
    screenshots,
    recommendations,
  };
}

function listScreenshots(rows) {
  const files = [];
  if (fs.existsSync(SCREENSHOT_DIR)) {
    for (const file of fs.readdirSync(SCREENSHOT_DIR)) {
      if (/\.(png|jpg|jpeg)$/i.test(file)) files.push(path.join(SCREENSHOT_DIR, file));
    }
  }
  for (const row of rows) {
    for (const artifact of row.artifacts || []) {
      if (/image\/|screenshot/i.test(`${artifact.contentType} ${artifact.name}`) && fs.existsSync(artifact.path)) {
        files.push(artifact.path);
      }
    }
  }
  return [...new Set(files)].slice(0, 12).map((file) => ({
    name: path.basename(file),
    path: file,
    dataUri: fileToDataUri(file),
  })).filter((item) => item.dataUri);
}

function fileToDataUri(file) {
  if (!fs.existsSync(file)) return '';
  const ext = path.extname(file).toLowerCase().replace('.', '') || 'png';
  const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';
  return `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;
}

function buildRecommendations(summary, defects, coverage, rows) {
  const recommendations = [];
  if (defects.length) recommendations.push('Review failed scenarios first, using the linked screenshots, traces, and videos in test-results.');
  if ((summary.timedOut || 0) > 0) recommendations.push('Investigate timeout stability and consider explicit readiness checks around slow checkout transitions.');
  if (coverage.some((item) => item.status !== 'Covered')) recommendations.push('Close coverage gaps for acceptance criteria marked At risk or Not executed.');
  if (rows.some((row) => row.title.includes('Invalid checkout data') && row.status === 'passed')) {
    recommendations.push('Confirm the product requirement for special characters: current SauceDemo behavior accepts them, while AC5 expects validation.');
  }
  if (!recommendations.length) recommendations.push('Maintain the current browser coverage and keep screenshots/traces enabled for failures.');
  recommendations.push('Run the suite in CI on every checkout-related change and archive test-results as build artifacts.');
  return recommendations;
}

function pct(value, total) {
  return total ? Math.round((value / total) * 100) : 0;
}

function durationText(ms) {
  if (!ms) return '0s';
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

function htmlReport(snapshot) {
  const { summary } = snapshot;
  const passRate = pct(summary.passed || 0, summary.total || 0);
  const rowsHtml = snapshot.testResults.map((row) => `
    <tr>
      <td>${sanitize(row.id || 'Unmapped')}</td>
      <td>${sanitize(row.title)}</td>
      <td>${sanitize(row.browser)}</td>
      <td><span class="status ${sanitize(row.status)}">${sanitize(row.status)}</span></td>
      <td>${durationText(row.duration)}</td>
    </tr>`).join('');

  const defectsHtml = snapshot.defects.length ? snapshot.defects.map((defect) => `
    <tr>
      <td>${sanitize(defect.id)}</td>
      <td>${sanitize(defect.testCaseId)}</td>
      <td>${sanitize(defect.browser)}</td>
      <td>${sanitize(defect.status)}</td>
      <td>${sanitize(defect.error).slice(0, 260)}</td>
    </tr>`).join('') : '<tr><td colspan="5">No defects were detected in this execution.</td></tr>';

  const browserHtml = snapshot.browserResults.map((item) => `
    <tr>
      <td>${sanitize(item.browser)}</td>
      <td>${item.total}</td>
      <td>${item.passed || 0}</td>
      <td>${(item.failed || 0) + (item.timedOut || 0) + (item.interrupted || 0)}</td>
      <td>${item.skipped || 0}</td>
      <td>${pct(item.passed || 0, item.total)}%</td>
    </tr>`).join('');

  const coverageHtml = snapshot.coverage.map((item) => `
    <tr>
      <td>${sanitize(item.id)}</td>
      <td>${sanitize(item.name)}</td>
      <td>${sanitize(item.testCases)}</td>
      <td>${item.executed}/${item.documented}</td>
      <td>${sanitize(item.status)}</td>
    </tr>`).join('');

  const screenshotsHtml = snapshot.screenshots.length ? snapshot.screenshots.map((shot) => `
    <figure>
      <img src="${shot.dataUri}" alt="${sanitize(shot.name)}">
      <figcaption>${sanitize(shot.name)}</figcaption>
    </figure>`).join('') : '<p>No screenshots were available for embedding.</p>';

  const recommendationsHtml = snapshot.recommendations.map((item) => `<li>${sanitize(item)}</li>`).join('');

  return `<!doctype html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Playwright Execution Report</title>
    <style>
      body { margin: 0; color: #1f2937; font-family: Arial, Helvetica, sans-serif; background: #f8fafc; }
      main { padding: 34px; }
      h1 { margin: 0 0 8px; font-size: 30px; color: #111827; }
      h2 { margin: 30px 0 12px; font-size: 18px; color: #111827; border-bottom: 2px solid #d9e2ec; padding-bottom: 6px; }
      .subtitle { color: #52616b; margin-bottom: 24px; }
      .kpis { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; margin: 22px 0; }
      .kpi { background: #fff; border: 1px solid #d9e2ec; border-radius: 8px; padding: 12px; }
      .kpi strong { display: block; font-size: 24px; color: #111827; }
      .kpi span { color: #52616b; font-size: 11px; text-transform: uppercase; letter-spacing: .05em; }
      .chart { background: #fff; border: 1px solid #d9e2ec; border-radius: 8px; padding: 14px; }
      .bar { display: flex; height: 24px; overflow: hidden; border-radius: 5px; background: #e5e7eb; }
      .pass { background: #2f855a; width: ${passRate}%; }
      .fail { background: #c2410c; width: ${pct((summary.failed || 0) + (summary.timedOut || 0) + (summary.interrupted || 0), summary.total || 0)}%; }
      .skip { background: #64748b; width: ${pct(summary.skipped || 0, summary.total || 0)}%; }
      table { width: 100%; border-collapse: collapse; background: #fff; margin-bottom: 14px; font-size: 11px; }
      th { background: #0f172a; color: #fff; text-align: left; padding: 8px; }
      td { border: 1px solid #d9e2ec; padding: 7px; vertical-align: top; }
      .status { color: #fff; border-radius: 999px; padding: 3px 8px; text-transform: capitalize; font-size: 10px; }
      .passed { background: #2f855a; }
      .failed, .timedOut, .interrupted { background: #c2410c; }
      .skipped { background: #64748b; }
      .screenshots { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
      figure { margin: 0; background: #fff; border: 1px solid #d9e2ec; border-radius: 8px; padding: 8px; page-break-inside: avoid; }
      img { width: 100%; max-height: 260px; object-fit: contain; border: 1px solid #e5e7eb; }
      figcaption { font-size: 10px; color: #52616b; margin-top: 5px; }
      li { margin-bottom: 6px; }
      footer { color: #64748b; font-size: 10px; margin-top: 24px; }
      @page { margin: 18mm 12mm; }
    </style>
  </head>
  <body>
    <main>
      <h1>Playwright Execution Report</h1>
      <div class="subtitle">SauceDemo checkout automation - execution ${sanitize(snapshot.executionId)} - generated ${sanitize(new Date(snapshot.generatedAt).toLocaleString())}</div>
      <section class="kpis">
        <div class="kpi"><span>Documented Test Cases</span><strong>${snapshot.documentedTestCaseCount}</strong></div>
        <div class="kpi"><span>Automated Scenarios</span><strong>${snapshot.automatedScenarioCount}</strong></div>
        <div class="kpi"><span>Browser Executions</span><strong>${snapshot.browserExecutionCount}</strong></div>
        <div class="kpi"><span>Passed</span><strong>${summary.passed || 0}</strong></div>
        <div class="kpi"><span>Failed</span><strong>${(summary.failed || 0) + (summary.timedOut || 0) + (summary.interrupted || 0)}</strong></div>
        <div class="kpi"><span>Duration</span><strong>${durationText(summary.duration)}</strong></div>
      </section>
      <table>
        <tbody>
          <tr><td><strong>Execution Start Time</strong></td><td>${sanitize(snapshot.startedAt)}</td><td><strong>Execution End Time</strong></td><td>${sanitize(snapshot.finishedAt)}</td></tr>
          <tr><td><strong>Total Execution Duration</strong></td><td>${durationText(snapshot.totalDuration)}</td><td><strong>Execution Identifier</strong></td><td>${sanitize(snapshot.executionId)}</td></tr>
        </tbody>
      </table>
      <section class="chart">
        <h2>Execution Summary Chart</h2>
        <div class="bar"><div class="pass"></div><div class="fail"></div><div class="skip"></div></div>
        <p>Pass rate: ${passRate}%</p>
      </section>
      <h2>Browser-wise Results</h2>
      <table><thead><tr><th>Browser</th><th>Total</th><th>Passed</th><th>Failed</th><th>Skipped</th><th>Pass Rate</th></tr></thead><tbody>${browserHtml}</tbody></table>
      <h2>Defect Summary</h2>
      <table><thead><tr><th>Defect</th><th>Test Case</th><th>Browser</th><th>Status</th><th>Failure Detail</th></tr></thead><tbody>${defectsHtml}</tbody></table>
      <h2>Coverage Summary</h2>
      <table><thead><tr><th>AC</th><th>Area</th><th>Test Cases</th><th>Executed</th><th>Status</th></tr></thead><tbody>${coverageHtml}</tbody></table>
      <h2>Unmapped Automated Scenarios</h2>
      <table><thead><tr><th>Scenario</th><th>File</th><th>Browsers</th></tr></thead><tbody>${snapshot.unmappedScenarios.length ? snapshot.unmappedScenarios.map((item) => `<tr><td>${sanitize(item.title)}</td><td>${sanitize(item.file)}</td><td>${sanitize(item.browsers)}</td></tr>`).join('') : '<tr><td colspan="3">All automated scenarios are mapped to TC IDs.</td></tr>'}</tbody></table>
      <h2>Test Results</h2>
      <table><thead><tr><th>TC ID</th><th>Test</th><th>Browser</th><th>Status</th><th>Duration</th></tr></thead><tbody>${rowsHtml}</tbody></table>
      <h2>Embedded Screenshots</h2>
      <section class="screenshots">${screenshotsHtml}</section>
      <h2>Recommendations</h2>
      <ul>${recommendationsHtml}</ul>
      <footer>Artifacts source: ${sanitize(RESULTS_DIR)}</footer>
    </main>
  </body>
  </html>`;
}

async function writePdf(snapshot) {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setContent(fs.readFileSync(HTML_OUTPUT, 'utf8'), { waitUntil: 'networkidle0' });
    await page.pdf({
      path: PDF_OUTPUT,
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: '<div style="font-size:8px;color:#64748b;width:100%;padding:0 12mm;text-align:right;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
      margin: { top: '12mm', right: '10mm', bottom: '16mm', left: '10mm' },
    });
  } finally {
    await browser.close();
  }
}

function styleHeader(row) {
  row.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
  row.alignment = { vertical: 'middle', wrapText: true };
}

async function writeWorkbook(snapshot) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'PlaywrightDemo';
  workbook.created = new Date();

  const summary = workbook.addWorksheet('Summary');
  summary.columns = [{ width: 28 }, { width: 18 }, { width: 28 }, { width: 18 }];
  summary.addRow(['Metric', 'Value', 'Metric', 'Value']);
  styleHeader(summary.getRow(1));
  summary.addRows([
    ['Execution Identifier', snapshot.executionId, 'Historical Mode', snapshot.historicalMode ? 'Enabled' : 'Disabled'],
    ['Execution Start Time', snapshot.startedAt, 'Execution End Time', snapshot.finishedAt],
    ['Total Execution Duration', durationText(snapshot.totalDuration), 'Generated At', snapshot.generatedAt],
    ['Documented Test Cases', snapshot.documentedTestCaseCount, 'Automated Scenarios', snapshot.automatedScenarioCount],
    ['Browser Executions', snapshot.browserExecutionCount, 'Pass Rate', `${pct(snapshot.summary.passed || 0, snapshot.summary.total)}%`],
    ['Passed', snapshot.summary.passed || 0, 'Failed/Timed Out/Interrupted', (snapshot.summary.failed || 0) + (snapshot.summary.timedOut || 0) + (snapshot.summary.interrupted || 0)],
    ['Skipped', snapshot.summary.skipped || 0, 'Screenshots Embedded In PDF', snapshot.screenshots.length],
  ]);

  const testCases = workbook.addWorksheet('Test Cases');
  testCases.columns = [
    { header: 'Test Case ID', key: 'id', width: 14 },
    { header: 'Name', key: 'name', width: 32 },
    { header: 'Description', key: 'description', width: 48 },
    { header: 'Preconditions', key: 'preconditions', width: 30 },
    { header: 'Test Data', key: 'testData', width: 26 },
    { header: 'Expected Result', key: 'expectedResult', width: 34 },
    { header: 'Actual Result', key: 'actualResult', width: 42 },
    { header: 'Execution Status', key: 'executionStatus', width: 18 },
    { header: 'Priority', key: 'priority', width: 12 },
    { header: 'Type', key: 'type', width: 16 },
    { header: 'Browser Executed', key: 'browserExecuted', width: 30 },
    { header: 'Coverage', key: 'coverage', width: 20 },
    { header: 'Remarks', key: 'remarks', width: 32 },
  ];
  styleHeader(testCases.getRow(1));
  snapshot.testCases.forEach((testCase) => testCases.addRow(testCase));

  const browserSheet = workbook.addWorksheet('Browser Results');
  browserSheet.columns = [
    { header: 'Browser', key: 'browser', width: 18 },
    { header: 'Total', key: 'total', width: 10 },
    { header: 'Passed', key: 'passed', width: 10 },
    { header: 'Failed', key: 'failed', width: 10 },
    { header: 'Timed Out', key: 'timedOut', width: 10 },
    { header: 'Skipped', key: 'skipped', width: 10 },
    { header: 'Pass Rate', key: 'passRate', width: 12 },
  ];
  styleHeader(browserSheet.getRow(1));
  snapshot.browserResults.forEach((item) => browserSheet.addRow({ ...item, passRate: `${pct(item.passed || 0, item.total)}%` }));

  const defects = workbook.addWorksheet('Defects');
  defects.columns = [
    { header: 'Defect ID', key: 'id', width: 12 },
    { header: 'Test Case ID', key: 'testCaseId', width: 14 },
    { header: 'Title', key: 'title', width: 42 },
    { header: 'Browser', key: 'browser', width: 16 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Severity', key: 'severity', width: 14 },
    { header: 'Error', key: 'error', width: 70 },
    { header: 'Artifact Paths', key: 'artifactPaths', width: 56 },
  ];
  styleHeader(defects.getRow(1));
  snapshot.defects.forEach((defect) => defects.addRow({ ...defect, artifactPaths: (defect.artifacts || []).map((item) => item.path).join('\n') }));

  const coverage = workbook.addWorksheet('Coverage');
  coverage.columns = [
    { header: 'Acceptance Criteria', key: 'id', width: 20 },
    { header: 'Area', key: 'name', width: 34 },
    { header: 'Test Cases', key: 'testCases', width: 44 },
    { header: 'Documented', key: 'documented', width: 14 },
    { header: 'Executed', key: 'executed', width: 12 },
    { header: 'Passed', key: 'passed', width: 12 },
    { header: 'Status', key: 'status', width: 16 },
  ];
  styleHeader(coverage.getRow(1));
  snapshot.coverage.forEach((item) => coverage.addRow(item));

  const artifacts = workbook.addWorksheet('Artifacts');
  artifacts.columns = [{ header: 'Screenshot', width: 34 }, { header: 'Path', width: 86 }];
  styleHeader(artifacts.getRow(1));
  snapshot.screenshots.slice(0, 8).forEach((shot, index) => {
    const rowNumber = index * 12 + 2;
    artifacts.getCell(`B${rowNumber}`).value = shot.path;
    artifacts.getRow(rowNumber).height = 80;
    if (fs.existsSync(shot.path)) {
      const imageId = workbook.addImage({ filename: shot.path, extension: path.extname(shot.path).replace('.', '') || 'png' });
      artifacts.addImage(imageId, { tl: { col: 0, row: rowNumber - 1 }, ext: { width: 180, height: 90 } });
    }
  });

  for (const sheet of workbook.worksheets) {
    sheet.views = [{ state: 'frozen', ySplit: 1 }];
    sheet.eachRow((row) => {
      row.alignment = { vertical: 'top', wrapText: true };
    });
  }

  await workbook.xlsx.writeFile(EXCEL_OUTPUT);
}

function writeMarkdown(snapshot) {
  const failed = (snapshot.summary.failed || 0) + (snapshot.summary.timedOut || 0) + (snapshot.summary.interrupted || 0);
  const browserRows = snapshot.browserResults
    .map((item) => `| ${item.browser} | ${item.total} | ${item.passed || 0} | ${failed && ((item.failed || 0) + (item.timedOut || 0) + (item.interrupted || 0)) || 0} | ${item.skipped || 0} | ${pct(item.passed || 0, item.total)}% |`)
    .join('\n');
  const coverageRows = snapshot.coverage
    .map((item) => `| ${item.id} | ${item.name} | ${item.executed}/${item.documented} | ${item.status} |`)
    .join('\n');
  const unmappedRows = snapshot.unmappedScenarios.length
    ? snapshot.unmappedScenarios.map((item) => `| ${item.title} | ${item.file} | ${item.browsers} |`).join('\n')
    : '| n/a | n/a | All automated scenarios are mapped to TC IDs. |';
  const defectRows = snapshot.defects.length
    ? snapshot.defects.map((defect) => `| ${defect.id} | ${defect.testCaseId} | ${defect.browser} | ${defect.status} | ${String(defect.error || '').replace(/\r?\n/g, ' ').slice(0, 160)} |`).join('\n')
    : '| n/a | n/a | n/a | n/a | No defects detected in this execution. |';

  const markdown = `# SCRUM-101 Checkout Test Report

## Execution Metadata
- Execution Identifier: ${snapshot.executionId}
- Execution Start Time: ${snapshot.startedAt}
- Execution End Time: ${snapshot.finishedAt}
- Total Execution Duration: ${durationText(snapshot.totalDuration)}
- Historical Mode: ${snapshot.historicalMode ? 'Enabled' : 'Disabled'}

## Execution Summary
- Documented Test Cases: ${snapshot.documentedTestCaseCount}
- Automated Scenarios: ${snapshot.automatedScenarioCount}
- Browser Executions: ${snapshot.browserExecutionCount}
- Passed: ${snapshot.summary.passed || 0}
- Failed/Timed Out/Interrupted: ${failed}
- Skipped: ${snapshot.summary.skipped || 0}
- Pass Rate: ${pct(snapshot.summary.passed || 0, snapshot.summary.total)}%

## Browser-wise Results
| Browser | Total | Passed | Failed | Skipped | Pass Rate |
| --- | ---: | ---: | ---: | ---: | ---: |
${browserRows}

## Defect Summary
| Defect | Test Case | Browser | Status | Failure Detail |
| --- | --- | --- | --- | --- |
${defectRows}

## Coverage Summary
| AC | Area | Executed | Status |
| --- | --- | ---: | --- |
${coverageRows}

## Unmapped Automated Scenarios
| Scenario | File | Browsers |
| --- | --- | --- |
${unmappedRows}

## Generated Artifacts
- PDF: test-results/execution-report.pdf
- HTML: test-results/execution-report.html
- Excel: test-results/test-cases.xlsx
- JSON: test-results/execution-report-data.json
- JUnit: test-results/results.xml
`;

  fs.writeFileSync(MARKDOWN_OUTPUT, markdown, 'utf8');
}

async function generateReportsFromSnapshot(snapshot) {
  ensureResultsDir();
  fs.writeFileSync(SNAPSHOT_OUTPUT, JSON.stringify(snapshot, null, 2), 'utf8');
  // Create useful reports even if Puppeteer cannot launch a browser to render
  // the optional PDF (for example, on a locked-down CI worker).
  fs.writeFileSync(HTML_OUTPUT, htmlReport(snapshot), 'utf8');
  await writeWorkbook(snapshot);
  writeMarkdown(snapshot);
  let pdfPath = null;
  let pdfError = null;
  try {
    await writePdf(snapshot);
    pdfPath = PDF_OUTPUT;
  } catch (error) {
    pdfError = error && error.message ? error.message : String(error);
    console.warn(`PDF report was not created: ${pdfError}`);
  }
  return { pdfPath, htmlPath: HTML_OUTPUT, excelPath: EXCEL_OUTPUT, markdownPath: MARKDOWN_OUTPUT, snapshotPath: SNAPSHOT_OUTPUT, pdfError };
}

async function generateReportsFromSuite(suite, result, startedAt) {
  const finishedAt = new Date();
  const rows = suiteToRows(suite, startedAt || new Date(), finishedAt);
  return generateReportsFromSnapshot(buildSnapshotFromRows(rows, startedAt || new Date(), finishedAt, readExecutionMetadata()));
}

async function generateReportsFromJson(jsonPath = path.join(RESULTS_DIR, 'results.json')) {
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`Playwright JSON results not found at ${jsonPath}`);
  }
  const json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const rows = jsonToRows(json);
  return generateReportsFromSnapshot(buildSnapshotFromRows(rows, new Date(), new Date(), readExecutionMetadata()));
}

async function generateReportsFromRaw(rawResultsDir = RAW_RESULTS_DIR) {
  const rows = rawFilesToRows(rawResultsDir);
  if (!rows.length) {
    throw new Error(`No raw Playwright result records found at ${rawResultsDir}`);
  }
  return generateReportsFromSnapshot(buildSnapshotFromRows(rows, new Date(), new Date(), readExecutionMetadata()));
}

async function generateWorkbookOnlyFromJson(jsonPath = path.join(RESULTS_DIR, 'results.json')) {
  const snapshot = fs.existsSync(jsonPath)
    ? buildSnapshotFromRows(jsonToRows(JSON.parse(fs.readFileSync(jsonPath, 'utf8'))), new Date(), new Date())
    : buildSnapshotFromRows([], new Date(), new Date());
  ensureResultsDir();
  fs.writeFileSync(SNAPSHOT_OUTPUT, JSON.stringify(snapshot, null, 2), 'utf8');
  await writeWorkbook(snapshot);
  return { excelPath: EXCEL_OUTPUT, snapshotPath: SNAPSHOT_OUTPUT };
}

module.exports = {
  PDF_OUTPUT,
  HTML_OUTPUT,
  EXCEL_OUTPUT,
  SNAPSHOT_OUTPUT,
  MARKDOWN_OUTPUT,
  RAW_RESULTS_DIR,
  generateReportsFromSuite,
  generateReportsFromJson,
  generateReportsFromRaw,
  generateWorkbookOnlyFromJson,
};
