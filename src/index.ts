#!/usr/bin/env node

import SLDParser from 'geostyler-sld-parser';
import QGISParser from 'geostyler-qgis-parser';
// import OpenLayersParser from "geostyler-openlayers-parser";
import MapfileParser from 'geostyler-mapfile-parser';
import MapboxParser from 'geostyler-mapbox-parser';
import { promises as fs } from 'fs';
import minimist from 'minimist';
import { StyleParser } from 'geostyler-style';
import ora from 'ora';
import { logHelp, logVersion } from './logHelper';

const getParserFromFormat = (inputString: string): StyleParser => {
  if (!inputString) {
    return undefined;
  }
  switch (inputString.toLowerCase()) {
    // case 'openlayers':
    // case 'ol':
    //   return new OpenLayersParser();
    case 'mapbox':
      return new MapboxParser();
    case 'mapfile':
    case 'map':
      return new MapfileParser();
    case 'sld':
      return new SLDParser();
    case 'qgis':
    case 'qml':
      return new QGISParser();
    default:
      return undefined;
  }
};

const getParserFromFilename = (fileName: string): StyleParser => {
  if (!fileName) {
    return undefined;
  }
  const fileEnding = fileName.split('.')[1];
  switch (fileEnding.toLowerCase()) {
    // case 'ol':
    //   return new OpenLayersParser();
    case 'mapbox':
      return new MapboxParser();
    case 'map':
      return new MapfileParser();
    case 'sld':
      return new SLDParser();
    case 'qml':
      return new QGISParser();
    default:
      return undefined;
  }
};

async function main() {
  const args = minimist(process.argv.slice(2));
  const {
    s,
    source,
    t,
    target,
    o,
    output,
    h,
    help,
    v,
    version,
    _: unnamedArgs
  } = args;

  if (h || help) {
    logHelp();
    return;
  }

  if (v || version) {
    logVersion();
    return;
  }

  const sourceFile: string = unnamedArgs[0];
  const sourceFormat: string = s || source;
  const targetFormat: string = t || target;
  const targetFile: string = o || output;

  const indicator = ora('Starting Geostyler CLI').start();

  if (!sourceFile) {
    indicator.fail('No input file specified.');
    return;
  }

  const sourceParser = getParserFromFormat(sourceFormat) || getParserFromFilename(sourceFile);
  const targetParser = getParserFromFormat(targetFormat) || getParserFromFilename(targetFile);
  const inputFileData = await fs.readFile(sourceFile, 'utf-8');

  if (!sourceParser) {
    indicator.fail('No sourceparser was specified.');
    return;
  }
  if (!targetParser) {
    indicator.fail('No targetparser was specified.');
    return;
  }

  indicator.text = `Transforming file ${sourceFile} from ${sourceFormat} to ${targetFormat}`;

  try {
    indicator.text = `Reading from ${sourceFile}`;
    const geostylerStyle = await sourceParser.readStyle(inputFileData);
    indicator.text = `Writing to ${targetFile}`;
    const targetStyle = await targetParser.writeStyle(geostylerStyle);
    if (targetFile) {
      await fs.writeFile(targetFile, targetStyle, 'utf-8');
      indicator.succeed(`Output written to ${targetFile}`);
    } else {
      indicator.succeed('Output written to stdout:\n');
      console.log(targetStyle);
    }
  } catch (error) {
    indicator.fail(`Error during translation: ${error}`);
  }
}

main();
