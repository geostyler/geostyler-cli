#!/usr/bin/env node

import SLDParser from "geostyler-sld-parser";
import QGISParser from "geostyler-qgis-parser";
import { promises as fs } from 'fs';
import minimist from 'minimist';
import { StyleParser } from "geostyler-style";

const getParserFromString = (inputString: string): StyleParser =>{
  switch (inputString.toLowerCase()) {
    case 'sld':
      return new SLDParser();
    case 'qgis':
      return new QGISParser();
    default:
      return new SLDParser();
  }
}

async function main() {
  const args = minimist(process.argv.slice(2));
  const {
    s,
    source,
    t,
    target,
    o,
    output,
    _: unnamedArgs
  } = args;

  const inputFile:string = unnamedArgs[0];
  const sourceFormat: string = s || source;
  const targetFormat: string = t || target;
  const outPutFile: string = o || output;

  console.log(`Transforming file ${inputFile} from ${sourceFormat} to ${targetFormat}`);
  if (outPutFile) {
    console.log(`… output will be written to ${outPutFile}`);
  }

  let sourceParser = getParserFromString(sourceFormat);
  let targetParser = getParserFromString(targetFormat)
  const inputFileData = await fs.readFile(inputFile, 'utf-8');

  try {
    const geostylerStyle = await sourceParser.readStyle(inputFileData);
    const targetStyle = await targetParser.writeStyle(geostylerStyle);
    if (outPutFile) {
      fs.writeFile(outPutFile, targetStyle, 'utf-8');
    } else {
      console.log(targetStyle);
    }
  } catch (error) {
    console.log(error);
  }
}

main();
