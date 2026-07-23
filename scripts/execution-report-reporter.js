const { generateReportsFromSuite } = require('./report-utils');

class ExecutionReportReporter {
  constructor() {
    this.startedAt = new Date();
    this.suite = null;
  }

  onBegin(config, suite) {
    this.startedAt = new Date();
    this.suite = suite;
  }

  async onEnd(result) {
    if (!this.suite) return;
    try {
      const outputs = await generateReportsFromSuite(this.suite, result, this.startedAt);
      console.log(`\nExecution PDF report generated: ${outputs.pdfPath}`);
      console.log(`Test case Excel workbook generated: ${outputs.excelPath}`);
    } catch (error) {
      console.error('\nFailed to generate execution reports.');
      console.error(error && error.stack ? error.stack : error);
    }
  }
}

module.exports = ExecutionReportReporter;
