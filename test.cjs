const fs = require('fs');
const { spawnSync } = require('child_process');
const { getParserOptions } = require('./build/src/utils.js');

function checkFileCreated(outputFile) {
  try {
    fs.accessSync(outputFile, fs.constants.F_OK);
    return true;
  } catch (err) {
    console.log(`The file: ${outputFile} was not found`);
    return false;
  }
}

function runTest(args, outputFile) {
  const cmd = 'npm';
  const result = spawnSync(cmd, args, { shell: true });
  console.log(`Status: ${result.status.toString()}`);
  console.log(`Output: ${result.stdout.toString()}`);
  console.log(`Error: ${result.stderr.toString()}`);
  return result;
}

function parseOptionsTest() {
  const result = getParserOptions('version:1.2.0,debug:true,silent:false,num:1.1');
  if (result.version !== '1.2.0') {
    return false;
  }
  if (result.debug !== true) {
    return false;
  }
  if (result.silent !== false) {
    return false;
  }
  return result.num === 1.1;
}

function parseEmptyOptionsTest() {
  const isEmptyObject = (obj) => {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
  };
  let result = getParserOptions(undefined);
  if (!isEmptyObject(result)) {
    return false;
  }
  result = getParserOptions(null);
  if (!isEmptyObject(result)) {
    return false;
  }
  result = getParserOptions('');
  if (!isEmptyObject(result)) {
    return false;
  }
  result = getParserOptions('true');
  return isEmptyObject(result);
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

  // test mapbox style to geostyler
  outputFile = 'output.json';
  args = ['start', '--', '-s', 'mapbox', '-o', outputFile, 'testdata/point_simple.mapbox'];
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

  const stdout = testResult.stdout.toString();
  // We have to remove the first 4 lines of the output
  // since we are running the tests via npm test which
  // adds the command itself to stdout.
  const cleanedStdout = stdout.split('\n').slice(4).join('\n');
  console.log(`stdout: ${cleanedStdout}`);
  if (!cleanedStdout.startsWith('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>')) {
    console.log('Expected SLD output not found in stdout');
    success = false;
  }

  // test writing everything else to stderr
  args = ['start', '--', '-s', 'sld', '-t', 'sld', 'testdata/sld/point_simplepoint.sld'];
  testResult = runTest(args, outputFile);

  if (!testResult.stderr.toString().includes('translated successfully')) {
    console.log('Expected translation success message not found in stderr');
    success = false;
  }

  // test not writing interactive messages in quiet mode
  args = ['start', '--', '-s', 'sld', '-t', 'sld', 'testdata/sld/point_simplepoint.sld', '--quiet'];
  testResult = runTest(args, outputFile);

  if (testResult.stderr.toString().includes('translated successfully')) {
    console.log('Expected no interactive messages in quiet mode');
    success = false;
  }

  // Test the parseOptions functions.
  if (!parseOptionsTest() || !parseEmptyOptionsTest()) {
    console.log('\n\n\nParser options tests failed');
    success = false;
  } else {
    console.log('\n\n\nParser options tests ok');
  }

  return success;
}

if (runAllTests() === false) {
  process.exit(1);
}
