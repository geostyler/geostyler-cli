const fs = require('fs');
const { spawnSync } = require('child_process');

function checkFileCreated(outputFile) {
  try {
    fs.accessSync(path, fs.constants.F_OK);
    return true;
  } catch (err) {
    /* eslint-disable no-console */
    console.log(`The file: ${outputFile} was not found`);
    return false;
  }
}

function runTest(args, outputFile) {
  const cmd = 'npm';
  const result = spawnSync(cmd, args, { shell: true });
  /* eslint-disable no-console */
  console.log(`Status: ${result.status.toString()}`);
  console.log(`Output: ${result.stdout.toString()}`);
  console.log(`Error: ${result.stderr.toString()}`);

  return checkFileCreated(outputFile);
}

function runAllTests() {

  let success = true;

  // test sld to qgis
  let outputFile = 'output.qml';
  let args = ['start', '--', '-s', 'sld', '-t', 'qgis', '-o', outputFile, 'testdata/point_simplepoint.sld'];

  if (runTest(args, outputFile) === false) {
    success = false;
  }

  // test qgis to sld
  outputFile = 'output.sld';
  args = ['start', '--', '-s', 'qgis', '-t', 'sld', '-o', outputFile, 'testdata/point_simple.qml'];

  if (runTest(args, outputFile) === false) {
    success = false;
  }

  // test mapfile to geostyler
  outputFile = 'output.map';
  args = ['start', '--', '-s', 'mapfile', '-o', outputFile, 'testdata/point_simplepoint.map'];

  if (runTest(args, outputFile) === false) {
    success = false;
  }

  return success;
}

if (runAllTests() === false) {
  process.exit(1);
}
