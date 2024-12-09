#!/usr/bin/env node

import SLDParser from 'geostyler-sld-parser';
import QGISParser from 'geostyler-qgis-parser';
import MapfileParser from 'geostyler-mapfile-parser';
import MapboxParser from 'geostyler-mapbox-parser';
import LyrxParser from 'geostyler-lyrx-parser';

import {
  existsSync,
  lstatSync,
  mkdirSync,
  promises,
  readdirSync
} from 'fs';
import minimist from 'minimist';
import { StyleParser, ReadStyleResult, WriteStyleResult } from 'geostyler-style';
import ora, { Ora } from 'ora';
import {
  logHelp,
  logVersion
} from './logHelper.js';
import path from 'path';

const ensureTrailingSlash = (inputString: string): string => {
  if (!inputString) {
    return '';
  }
  return inputString.at(- 1) === path.sep ? inputString : `${inputString}` + path.sep;
};

const getParserFromFormat = (inputString: string): StyleParser | undefined => {
  if (!inputString) {
    throw new Error('No input');
  }
  switch (inputString.toLowerCase()) {
    case 'lyrx':
      return new LyrxParser();
    case 'mapbox':
      return new MapboxParser();
    case 'mapfile':
    case 'map':
      return new MapfileParser();
    case 'sld':
      return new SLDParser();
    case 'se':
      return new SLDParser({sldVersion:'1.1.0'});
    case 'qgis':
    case 'qml':
      return new QGISParser();
    case 'geostyler':
      return undefined;
    default:
      throw new Error(`Unrecognized format: ${inputString}`)
  }
};

const getFormatFromFilename = (fileName: string): string | undefined => {
  if (!fileName) {
    return undefined;
  }
  let fileEnding = fileName.split('.').pop();
  if (!fileEnding) {
    return undefined;
  }
  fileEnding = fileEnding.toLowerCase();
  if (['lyrx', 'mapbox', 'map', 'sld', 'qml', 'geostyler'].includes(fileEnding)) {
    return fileEnding;
  }
  return undefined;
};

const getExtensionFromFormat = (format: string): string => {
  if (!format) {
    return '';
  }
  switch (format.toLowerCase()) {
    case 'lyrx':
      return 'lyrx';
    case 'mapfile':
      return 'map';
    case 'qgis':
      return 'qml';
    default:
      return format;
  }
};

const tryRemoveExtension = (fileName: string): string => {
  const possibleExtensions = ['js', 'ts', 'mapbox', 'map', 'sld', 'qml', 'lyrx'];
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

  // ensure all path separators are correct for the platform
  sourcePathFile = path.normalize(sourcePathFile);
  outputPath = path.normalize(outputPath);

  // Case file -> directory
  // Get output name from source and add extension.
  const pathElements = sourcePathFile.split(path.sep);
  const lastElement = pathElements?.pop();
  pathElements.shift();

  const finalPathElements = [outputPath, pathElements].flat();
  const finalPath = finalPathElements.join(path.sep);

  if (typeof lastElement) {
    const targetFileName = tryRemoveExtension(lastElement as string);
    if (!existsSync(finalPath)){
      mkdirSync(finalPath, { recursive: true });
    }
    return `${ensureTrailingSlash(finalPath)}${targetFileName}.${getExtensionFromFormat(targetFormat)}`;
  } else {
    return '';
  }
};

function collectPaths(basePath: string, isFile: boolean): string[] {
  if (isFile) {
    return [basePath];
  } else {
    const files = readdirSync(basePath);
    const parts: string [] = [];
    files.forEach((file) => {
      const fileIsFile = lstatSync(`${ensureTrailingSlash(basePath)}${file}`).isFile();
      if (fileIsFile) {
        parts.push(`${ensureTrailingSlash(basePath)}${file}`);
      } else {
        parts.push(...collectPaths(`${ensureTrailingSlash(basePath)}${file}`, false));
      }
    });
    return parts;
  }
}

function handleResult(result: ReadStyleResult | WriteStyleResult, parser: StyleParser, stage: 'Source' | 'Target') {
    const { output, errors, warnings, unsupportedProperties } = result;
    if (errors && errors.length > 0) {
      throw errors;
    }
    if (warnings) {
      warnings.map(console.warn);
    }
    if (unsupportedProperties) {
      console.log(`${stage} parser ${parser.title} does not support the following properties:`);
      console.log(unsupportedProperties);
    }
    return output;
}

async function writeFile(
  sourceFile: string, sourceParser: StyleParser | undefined,
  targetFile: string, targetParser: StyleParser | undefined,
  oraIndicator: Ora
) {
  if (targetParser instanceof LyrxParser) {
    throw new Error('LyrxParser is not supported as target parser.');
  }
  if (targetParser instanceof MapfileParser) {
    throw new Error('MapfileParser is not supported as target parser.');
  }

  let inputFileData = await promises.readFile(sourceFile, 'utf-8');
  const indicator = oraIndicator; // for linter.

  // If no sourceParser is set, just parse it as JSON - it should already be in geostyler format.
  // LyrxParser expects a JSON object as input, so we need to parse it as an extra step.
  if (!sourceParser || sourceParser instanceof LyrxParser) {
    inputFileData = JSON.parse(inputFileData);
  }

  try {
    indicator.text = `Reading from ${sourceFile}`;
    const readOutput = sourceParser
        ? handleResult(await sourceParser.readStyle(inputFileData as any), sourceParser, 'Source')
        : inputFileData;

    indicator.text = `Writing to ${targetFile}`;
    const writeOutput = targetParser
        ? handleResult(await targetParser.writeStyle(readOutput), targetParser, 'Target')
        : readOutput;

    const finalOutput = typeof writeOutput === 'object' ? JSON.stringify(writeOutput, undefined, 2) : writeOutput;

    if (targetFile) {
      await promises.writeFile(targetFile, finalOutput, 'utf-8');
      indicator.succeed(`File "${sourceFile}" translated successfully. Output written to ${targetFile}`);
    } else {
      indicator.succeed(`File "${sourceFile}" translated successfully. Output written to stdout:\n`);
      console.log(finalOutput);
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
  let sourceFormat: string | undefined = s || source;
  let targetFormat: string | undefined = t || target;
  const outputPath: string = o || output;

  // Instantiate progress indicator
  const indicator = ora({text: 'Starting Geostyler CLI', stream: process.stdout}).start();

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
  // Assume the target is the same as the source
  let targetIsFile = sourceIsFile;
  const outputExists = existsSync(outputPath);

  // Dir to file is not possible
  if (!sourceIsFile && targetIsFile) {
    indicator.fail('The source is a directory, so the target must be directory, too.');
    return;
  }

  // Get source parser.
  if (!sourceFormat && sourceIsFile) {
    sourceFormat = getFormatFromFilename(sourcePath)
  }
  if (!sourceFormat) {
    indicator.info('No sourceparser was specified. Input will be parsed as a GeoStyler object.');
    sourceFormat = 'geostyler';
  }
  const sourceParser = getParserFromFormat(sourceFormat)

  // Get target parser.
  if (!targetFormat && targetIsFile) {
    targetFormat = getFormatFromFilename(outputPath)
  }
  if (!targetFormat) {
    indicator.info('No targetparser was specified. Output will be a GeoStyler object.');
    targetFormat = 'geostyler';
  }
  const targetParser = getParserFromFormat(targetFormat);

  // Get source(s) path(s).
  const sourcePaths = collectPaths(sourcePath, sourceIsFile);

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
