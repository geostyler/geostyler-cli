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
import { StyleParser } from 'geostyler-style';
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
    default:
      return undefined;
  }
};

const getParserFromFilename = (fileName: string): StyleParser | undefined => {
  if (!fileName) {
    return undefined;
  }
  const fileEnding = fileName.split('.')[1];
  if (!fileEnding) {
    return undefined;
  }
  switch (fileEnding.toLowerCase()) {
    case 'lyrx':
      return new LyrxParser();
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

async function writeFile(
  sourceFile: string, sourceParser: StyleParser,
  targetFile: string, targetParser: StyleParser | undefined,
  oraIndicator: Ora
) {
  let inputFileData = await promises.readFile(sourceFile, 'utf-8');
  const indicator = oraIndicator; // for linter.

  // LyrxParser expects a JSON object as input
  if (sourceParser instanceof LyrxParser) {
    inputFileData = JSON.parse(inputFileData);
  }

  try {
    indicator.text = `Reading from ${sourceFile}`;
    const {
      errors: readErrors,
      warnings: readWarnings,
      unsupportedProperties: readUnsupportedProperties,
      output: readOutput
    } = await sourceParser.readStyle(inputFileData);
    if (readErrors && readErrors.length > 0) {
      throw readErrors;
    }
    if (readWarnings) {
      readWarnings.map(console.warn);
    }
    if (readUnsupportedProperties) {
      console.log(`Source parser ${sourceParser.title} does not support the following properties:`);
      console.log(readUnsupportedProperties);
    }
    if (readOutput) {
      let output;
      indicator.text = `Writing to ${targetFile}`;
      if (targetParser) {
        const {
          output: writeOutput,
          errors: writeErrors,
          warnings: writeWarnings,
          unsupportedProperties: writeUnsupportedProperties
        } = await targetParser.writeStyle(readOutput);
        if (writeErrors) {
          throw writeErrors;
        }
        if (writeWarnings) {
          writeWarnings.map(console.warn);
        }
        if (writeUnsupportedProperties) {
          console.log(`Target parser ${targetParser.title} does not support the following properties:`);
          console.log(writeUnsupportedProperties);
        }
        output = typeof writeOutput === 'object' ? JSON.stringify(writeOutput, undefined, 2) : writeOutput;
      } else {
        output = JSON.stringify(readOutput, undefined, 2);
      }
      if (targetFile) {
        await promises.writeFile(targetFile, output, 'utf-8');
        indicator.succeed(`File "${sourceFile}" translated successfully. Output written to ${targetFile}`);
      } else {
        indicator.succeed(`File "${sourceFile}" translated successfully. Output written to stdout:\n`);
        console.log(output);
      }
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

  // Get source and target parser.
  const sourceParser = sourceFormat && getParserFromFormat(sourceFormat)
    || (sourceIsFile && getParserFromFilename(sourcePath));
  const targetParser = targetFormat && getParserFromFormat(targetFormat) || getParserFromFilename(outputPath);
  if (!sourceParser) {
    indicator.fail('No sourceparser was specified.');
    return;
  }
  if (!targetParser) {
    indicator.info('No targetparser was specified. Output will be a GeoStyler object.');
  }

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
