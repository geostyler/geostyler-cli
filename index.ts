#!/usr/bin/env node

import SLDParser from "geostyler-sld-parser";
import QGISParser from "geostyler-qgis-parser";
// import OpenLayersParser from "geostyler-openlayers-parser";
import MapfileParser from "geostyler-mapfile-parser";
import MapboxParser from "geostyler-mapbox-parser";
import { promises as fs } from 'fs';
import minimist from 'minimist';
import { StyleParser } from "geostyler-style";

const getParserFromFormat = (inputString: string): StyleParser =>{
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
}

const getParserFromFilename = (fileName: string): StyleParser =>{
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
}

const printHelp = () => {
  console.log(`
  ###################################
  # GeoStyler Commandline Interface #
  ###################################

  Basic syntax:
    npm start -- [options] inputfile
  Example:
    npm start -s sld -t mapfile -o myStyle.map testdata/point_simplepoint.sld

  Options:
    -s / --source : SourceParser. ["mapbox" | "mapfile" | "sld" | "qgis"]
    -t / --target : TargetParser. ["mapbox" | "mapfile" | "sld" | "qgis"]
    -o / --output : Outpuft filename. [string]
    -h / --help: Display this help.
  `);
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
    _: unnamedArgs
  } = args;

  if (h || help) {
    printHelp();
    return;
  }

  const sourceFile:string = unnamedArgs[0];
  const sourceFormat: string = s || source;
  const targetFormat: string = t || target;
  const targetFile: string = o || output;

  if (!sourceFile) {
    console.log('No input file specified.');
    console.log('USE: `npm start -- [options] inputfile`');
    return;
  }

  let sourceParser = getParserFromFormat(sourceFormat) || getParserFromFilename(sourceFile);
  let targetParser = getParserFromFormat(targetFormat) || getParserFromFilename(targetFile)
  const inputFileData = await fs.readFile(sourceFile, 'utf-8');

  if (!sourceParser) {
    console.log('No sourceparser was specified.');
    return;
  }
  if (!targetParser) {
    console.log('No targetparser was specified.');
    return;
  }

  console.log(`Transforming file ${sourceFile} from ${sourceFormat} to ${targetFormat}`);
  if (targetFile) {
    console.log(`… output will be written to ${targetFile}`);
  }

  try {
    const geostylerStyle = await sourceParser.readStyle(inputFileData);
    const targetStyle = await targetParser.writeStyle(geostylerStyle);
    if (targetFile) {
        fs.writeFile(targetFile, targetStyle, 'utf-8');
    } else {
      console.log(targetStyle);
    }
  } catch (error) {
    console.log(error);
  }
}

main();
