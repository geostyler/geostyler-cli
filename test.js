const fs = require('fs');
const { spawnSync } = require('child_process');

function checkFileCreated(outputFile) {
  try {
    fs.accessSync(outputFile, fs.constants.F_OK);
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
  return result;
}

function runAllTests() {

  let success = true;
  let testResult;

  // test sld to qgis
  let outputFile = 'output.qml';
  let args = ['start', '--', '-s', 'sld', '-t', 'qgis', '-o', outputFile, 'testdata/sld/point_simplepoint.sld'];
  runTest(args, outputFile);

  if (checkFileCreated(outputFile) === false) {
    success = false;
  }

  // test qgis to sld
  outputFile = 'output.sld';
  args = ['start', '--', '-s', 'qgis', '-t', 'sld', '-o', outputFile, 'testdata/point_simple.qml'];
  runTest(args, outputFile);

  if (checkFileCreated(outputFile) === false) {
    success = false;
  }

  // test mapfile to geostyler
  outputFile = 'output.geostyler';
  args = ['start', '--', '-s', 'mapfile', '-o', outputFile, 'testdata/point_simplepoint.map'];
  runTest(args, outputFile);

  if (checkFileCreated(outputFile) === false) {
    success = false;
  }

  // test geostyler to mapbox
  outputFile = 'output.mapbox';
  args = ['start', '--', '-s', 'geostyler', '-o', outputFile, 'testdata/point_simplepoint.geostyler'];
  runTest(args, outputFile);

  if (checkFileCreated(outputFile) === false) {
    success = false;
  }

  // test openlayers flatstyle to geostyler
  outputFile = 'output.json';
  args = ['start', '--', '-s', 'ol-flat', '-o', outputFile, 'testdata/olFlatStyles/point_simple.json'];
  runTest(args, outputFile);

  if (checkFileCreated(outputFile) === false) {
    success = false;
  }

  // test folder output
  args = ['start', '--', '-s', 'sld', '-t', 'qgis', '-o', './output-bulk', 'testdata/sld'];
  runTest(args, outputFile);

  if (checkFileCreated('./output-bulk/sld/point_simplepoint.qml') === false) {
    success = false;
  }

  if (checkFileCreated('./output-bulk/sld/point_simpletriangle.qml') === false) {
    success = false;
  }

  // test writing only styles to stdout
  args = ['start', '--', '-s', 'sld', '-t', 'sld', 'testdata/sld/point_simplepoint.sld'];
  testResult = runTest(args, outputFile);

  if (!testResult.stdout.toString().startsWith('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>')) {
    success = false;
  }

  // test writing everything else to stderr
  args = ['start', '--', '-s', 'sld', '-t', 'sld', 'testdata/sld/point_simplepoint.sld'];
  testResult = runTest(args, outputFile);

  if (!testResult.stderr.toString().includes('translated successfully')) {
    success = false;
  }

  // test not writing interactive messages in quiet mode
  args = ['start', '--', '-s', 'sld', '-t', 'sld', 'testdata/sld/point_simplepoint.sld', '--quiet'];
  testResult = runTest(args, outputFile);

  if (testResult.stderr.toString().includes('translated successfully')) {
    success = false;
  }

  return success;
}

if (runAllTests() === false) {
  process.exit(1);
}
