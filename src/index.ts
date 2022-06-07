#!/usr/bin/env node

import SLDParser from 'geostyler-sld-parser';
import QGISParser from 'geostyler-qgis-parser';
// import OpenLayersParser from "geostyler-openlayers-parser";
import MapfileParser from 'geostyler-mapfile-parser';
import MapboxParser from 'geostyler-mapbox-parser';
import {
  existsSync,
  lstatSync,
  promises,
  readdir
} from 'fs';
import minimist from 'minimist';
import { StyleParser } from 'geostyler-style';
import ora, { Ora } from 'ora';
import {
  logHelp,
  logVersion
} from './logHelper.js';

const ensureTrailingSlash = (inputString: string): string => {
  if (!inputString) {
    return '';
  }
  return inputString[inputString.length - 1] === '/' ? inputString : `${inputString}/`;
};

const getParserFromFormat = (inputString: string): StyleParser | undefined => {
  if (!inputString) {
    throw new Error('No input');
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

const getParserFromFilename = (fileName: string): StyleParser | undefined => {
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

const getExtensionFromFormat = (format: string): string => {
  if (!format) {
    return '';
  }
  switch (format.toLowerCase()) {
    case 'openlayers':
    case 'ol':
      return 'ts';
    case 'mapfile':
      return 'map';
    case 'qgis':
      return 'qml';
    default:
      return format;
  }
};

const tryRemoveExtension = (fileName: string): string => {
  const possibleExtensions = ['js', 'ts', 'mapbox', 'map', 'sld', 'qml'];
  const splittedFileName = fileName.split('.');
  const sourceFileExtension = splittedFileName.pop();
  if (sourceFileExtension && possibleExtensions.includes(sourceFileExtension.toLowerCase())) {
    return splittedFileName.join('.');
  }
  return fileName;
};

const computeTargetPath = (
  sourcePathFile: string,
  outputPath: string,
  targetIsFile: boolean,
  targetFormat: string
): string => {
  if (targetIsFile) {
    // Case file -> file
    return outputPath;
  }
  
  // Change any Windows-style paths to Linux-style
  sourcePathFile = sourcePathFile.split('\\').join('/');
  outputPath = outputPath.split('\\').join('/');

  // Case file -> directory
  // Get output name from source and add extension.
  const pathElements = sourcePathFile.split('/');
  const lastElement = pathElements?.pop();
  if (typeof lastElement) {
    const targetFileName = tryRemoveExtension(lastElement as string);
    return `${ensureTrailingSlash(outputPath)}${targetFileName}.${getExtensionFromFormat(targetFormat)}`;
  } else {
    return '';
  }
};

async function collectPaths(basePath: string, isFile: boolean): Promise<string[]> {
  return new Promise((resolve, reject) => {
    if (isFile) {
      resolve([basePath]);
    } else {
      readdir(basePath, (error, files) => {
        if (error) {
          reject(error);
        }
        resolve(files.map((file) => `${ensureTrailingSlash(basePath)}${file}`));
      });
    }
  });
}

async function writeFile(
  sourceFile: string, sourceParser: StyleParser,
  targetFile: string, targetParser: StyleParser | undefined,
  oraIndicator: Ora
) {
  const inputFileData = await promises.readFile(sourceFile, 'utf-8');
  const indicator = oraIndicator; // for linter.

  try {
    indicator.text = `Reading from ${sourceFile}`;
    const geostylerStyle = await sourceParser.readStyle(inputFileData);
    indicator.text = `Writing to ${targetFile}`;
    const targetStyle = targetParser ? await targetParser.writeStyle(geostylerStyle) : JSON.stringify(geostylerStyle);
    if (targetFile) {
      await promises.writeFile(targetFile, targetStyle, 'utf-8');
      indicator.succeed(`File "${sourceFile}" translated successfully. Output written to ${targetFile}`);
    } else {
      indicator.succeed(`File "${sourceFile}" translated successfully. Output written to stdout:\n`);
      console.log(targetStyle);
    }
  } catch (error) {
    indicator.fail(`Error during translation of file "${sourceFile}": ${error}`);
  }
}

async function main() {
  // Parse args
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

  // Assign args
  const sourcePath: string = unnamedArgs[0];
  const sourceFormat: string = s || source || sourcePath;
  const targetFormat: string = t || target;
  const outputPath: string = o || output;

  // Instanciate progress indicator
  const indicator = ora('Starting Geostyler CLI').start();

  // Check source path arg.
  if (!sourcePath) {
    indicator.fail('No input file or folder specified.');
    return;
  }

  // Check source exists, is a dir or a file ?
  if (!existsSync(sourcePath)) {
    indicator.fail('Input file or folder does not exist.');
  }
  const sourceIsFile = lstatSync(sourcePath).isFile();

  // Try to define type of target (file or dir).
  let targetIsFile = true;
  const outputExists = existsSync(outputPath);
  if (outputExists) {
    targetIsFile = lstatSync(outputPath).isFile();
  }

  // Dir to file is not possible
  if (!sourceIsFile && (targetIsFile || !outputExists)) {
    indicator.fail('The source is a directory, then the target must be an existing directory');
    return;
  }

  // Get source and target parser.
  const sourceParser = getParserFromFormat(sourceFormat)
  || (sourceIsFile && getParserFromFilename(sourcePath));
  const targetParser = getParserFromFormat(targetFormat) || getParserFromFilename(outputPath);
  if (!sourceParser) {
    indicator.fail('No sourceparser was specified.');
    return;
  }
  if (!targetParser) {
    indicator.info('No targetparser was specified. Output will be a GeoStyler object.');
  }

  // Get source(s) path(s).
  const sourcePaths = await collectPaths(sourcePath, sourceIsFile);

  const writePromises: Promise<void>[] = [];
  sourcePaths.forEach((srcPath) => {
    indicator.text = `Transforming ${srcPath} from ${sourceFormat} to ${targetFormat}`;
    // Get correct output path
    const outputPathFile = computeTargetPath(srcPath, outputPath, targetIsFile, targetFormat);
    // Add the the translation promise.
    writePromises.push(writeFile(srcPath, sourceParser, outputPathFile, targetParser, indicator));
  });

  await Promise.all(writePromises);
}

main();
