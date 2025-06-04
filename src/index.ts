#!/usr/bin/env node

import SLDParser from 'geostyler-sld-parser';
import QGISParser from 'geostyler-qgis-parser';
import MapfileParser from 'geostyler-mapfile-parser';
import MapboxParser from 'geostyler-mapbox-parser';
import LyrxParser from 'geostyler-lyrx-parser';
import OlFlatStyleParser from 'geostyler-openlayers-parser/dist/OlFlatStyleParser';

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
import { Readable } from 'stream';
import {
  logHelp,
  logVersion
} from './logHelper.js';
import path from 'path';
import {getParserOptions} from './utils.js';

const ensureTrailingSlash = (inputString: string): string => {
  if (!inputString) {
    return '';
  }
  return inputString.at(- 1) === path.sep ? inputString : `${inputString}` + path.sep;
};

const getParserFromFormat = (inputString: string, parserOptions: Record<string, unknown>): StyleParser | undefined => {
  if (!inputString) {
    throw new Error('No input');
  }
  switch (inputString.toLowerCase()) {
    case 'lyrx':
      return new LyrxParser();
    case 'mapbox':
      return new MapboxParser(parserOptions);
    case 'mapfile':
    case 'map':
      return new MapfileParser(parserOptions);
    case 'sld':
      return new SLDParser(parserOptions);
    case 'qgis':
    case 'qml':
      return new QGISParser(parserOptions);
    case 'ol-flat':
      return new OlFlatStyleParser();
    case 'geostyler':
      return undefined;
    default:
      throw new Error(`Unrecognized format: ${inputString}`);
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
  if (sourcePathFile === '-') {
    return outputPath;
  }
  if (targetIsFile) {
    // Case file -> file
    return outputPath;
  }

  // ensure all path separators are correct for the platform
  sourcePathFile = path.normalize(sourcePathFile);
  outputPath = path.normalize(outputPath);

  // Case file -> directory
  // Gets output name from source and add extension.
  const pathElements = sourcePathFile.split(path.sep);
  const lastElement = pathElements?.pop();
  pathElements.shift();

  const finalPathElements = [outputPath, pathElements].flat();
  const finalPath = finalPathElements.join(path.sep);

  if (typeof lastElement) {
    const targetFileName = tryRemoveExtension(lastElement as string);
    if (!existsSync(finalPath)) {
      mkdirSync(finalPath, { recursive: true });
    }
    return `${ensureTrailingSlash(finalPath)}${targetFileName}.${getExtensionFromFormat(targetFormat)}`;
  } else {
    return '';
  }
};

function collectPaths(basePath: string, isFile: boolean): string[] {
  if (isFile || basePath === '-') {
    return [basePath];
  } else {
    const files = readdirSync(basePath);
    const parts: string[] = [];
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
    warnings.map((warning) => process.stderr.write(warning));
  }
  if (unsupportedProperties) {
    process.stderr.write(`${stage} parser ${parser.title} does not support the following properties:\n`);
    process.stderr.write(JSON.stringify(unsupportedProperties));
  }
  return output;
}

async function readStream(stream: Readable, encoding: BufferEncoding) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString(encoding);
}

async function writeFile(
  sourceFile: string, sourceParser: StyleParser | undefined,
  targetFile: string, targetParser: StyleParser | undefined,
  oraIndicator: Ora
): Promise<number> {
  if (targetParser instanceof LyrxParser) {
    throw new Error('LyrxParser is not supported as target parser.');
  }
  if (targetParser instanceof MapfileParser) {
    throw new Error('MapfileParser is not supported as target parser.');
  }
  const indicator = oraIndicator; // for linter.

  try {
    indicator.text = `Reading from ${sourceFile}`;

    let inputFileData = (sourceFile === '-')
      ? await readStream(process.stdin, 'utf-8')
      : await promises.readFile(sourceFile, 'utf-8');

    // If no sourceParser is set, just parse it as JSON - it should already be in geostyler format.
    // LyrxParser expects a JSON object as input, so we need to parse it as an extra step.
    if (!sourceParser || sourceParser instanceof LyrxParser || sourceParser instanceof OlFlatStyleParser) {
      inputFileData = JSON.parse(inputFileData);
    }

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
      process.stdout.write(finalOutput);
    }
    return 0;
  } catch (error) {
    indicator.fail(`Error during translation of file "${sourceFile}": ${error}`);
    return 1;
  }
}

async function main() {
  // Parse args
  const args = minimist(process.argv.slice(2));
  const {
    s,
    source,
    sourceOptions,
    t,
    target,
    targetOptions,
    o,
    output,
    h,
    help,
    v,
    version,
    quiet,
    _: unnamedArgs,
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
  const indicator = ora({
    text: 'Starting Geostyler CLI',
    isSilent: !!quiet || false,
  }).start();

  // Check the source path arg.
  if (!sourcePath) {
    indicator.fail('No input file or folder specified.');
    process.exit(1);
  }

  // Check a source exists, is a dir or a file?
  if (sourcePath !== '-' && !existsSync(sourcePath)) {
    indicator.fail('Input file or folder does not exist.');
    process.exit(1);
  }
  const sourceIsFile = (sourcePath !== '-') && lstatSync(sourcePath).isFile();

  // Try to define the type of target (file or dir).
  // Assume the target is the same as the source
  let targetIsFile = sourceIsFile;

  // Dir to file is not possible
  if (!sourceIsFile && targetIsFile) {
    indicator.fail('The source is a directory, so the target must be directory, too.');
    process.exit(1);
  }

  // Get source parser.
  if (!sourceFormat && sourceIsFile) {
    sourceFormat = getFormatFromFilename(sourcePath);
  }
  if (!sourceFormat) {
    indicator.info('No sourceparser was specified. Input will be parsed as a GeoStyler object.');
    sourceFormat = 'geostyler';
  }
  const sourceParserOptions = getParserOptions(sourceOptions);
  const sourceParser = getParserFromFormat(sourceFormat, sourceParserOptions);

  // Get the target parser.
  if (!targetFormat && targetIsFile) {
    targetFormat = getFormatFromFilename(outputPath);
  }
  if (!targetFormat) {
    indicator.info('No targetparser was specified. Output will be a GeoStyler object.');
    targetFormat = 'geostyler';
  }
  const targetParserOptions = getParserOptions(targetOptions);
  const targetParser = getParserFromFormat(targetFormat, targetParserOptions);

  // Get the source(s) path(s).
  const sourcePaths = collectPaths(sourcePath, sourceIsFile);

  const writePromises: Promise<number>[] = [];
  sourcePaths.forEach((srcPath) => {
    indicator.text = `Transforming ${srcPath} from ${sourceFormat} to ${targetFormat}`;
    // Get a correct output path
    const outputPathFile = computeTargetPath(srcPath, outputPath, targetIsFile, targetFormat);

    // Add the translation promise.
    writePromises.push(writeFile(srcPath, sourceParser, outputPathFile, targetParser, indicator));
  });

  const returnCodes = await Promise.all(writePromises);
  const returnCode = returnCodes.reduce((acc, value) => acc || value, 0);
  process.exit(returnCode);
}

main();
