const fs = require('fs');
const { spawn } = require('child_process');

function checkFileCreated(outputFile) {
  try {
    fs.accessSync(path, fs.constants.F_OK);
    return true;
  } catch (err) {
    return false;
  }
}

function runTest(args, outputFile) {
  const cmd = 'npm';
  const child = spawn(cmd, args, { shell: true });

  child.on('error', (err) => {
    /* eslint-disable no-console */
    console.error(`Child process error: ${err}`);
  });

  child.on('exit', (code) => {
    console.log(`Child process exited with code ${code}`);
  });

  child.stderr.on('data', (data) => {
    console.log(`Error: ${data}`);
  });

  child.stdout.on('data', (data) => {
    console.log(`Output: ${data}`);
  });

  return checkFileCreated(outputFile);
}

function runAllTests() {

  let passed = true;

  // test sld to qgis
  let outputFile = 'output.qml';
  let args = ['start', '--', '-s', 'sld', '-t', 'qgis', '-o', outputFile, 'testdata/point_simplepoint.sld'];

  if (runTest(args, outputFile) === false) {
    passed = false;
  }

  // test qgis to sld
  outputFile = 'output.sld';
  args = ['start', '--', '-s', 'qgis', '-t', 'sld', '-o', outputFile, 'testdata/point_simple.qml'];

  if (runTest(args, outputFile) === false) {
    passed = false;
  }

  // test mapfile to geostyler
  outputFile = 'output.map';
  args = ['start', '--', '-s', 'mapfile', '-o', outputFile, 'testdata/point_simplepoint.map'];

  if (runTest(args, outputFile) === false) {
    passed = false;
  }

  return passed;
}

return runAllTests();
