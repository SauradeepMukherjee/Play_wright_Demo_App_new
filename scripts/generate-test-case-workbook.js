const { generateWorkbookOnlyFromJson } = require('./report-utils');

generateWorkbookOnlyFromJson()
  .then((outputs) => {
    console.log(`Excel workbook generated at ${outputs.excelPath}`);
  })
  .catch((error) => {
    console.error(error && error.stack ? error.stack : error);
    process.exit(1);
  });
