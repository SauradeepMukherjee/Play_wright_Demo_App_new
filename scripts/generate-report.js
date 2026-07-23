const { generateReportsFromJson } = require('./report-utils');

generateReportsFromJson()
  .then((outputs) => {
    console.log(`PDF report generated at ${outputs.pdfPath}`);
    console.log(`Excel workbook generated at ${outputs.excelPath}`);
  })
  .catch((error) => {
    console.error(error && error.stack ? error.stack : error);
    process.exit(1);
  });
