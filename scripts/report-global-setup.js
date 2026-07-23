const { startExecution } = require('./report-lifecycle');

module.exports = async function reportGlobalSetup() {
  const metadata = startExecution();
  console.log(`Starting clean execution: ${metadata.executionId}`);
};
