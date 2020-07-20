import gradient from 'gradient-string';
import { version } from '../package.json';

export const logTitle = () :void => {
  console.log(gradient('#611E82', '#272C82', '#00943D', '#FFED00', '#F48E00', '#E7000E').multiline(`
  ██████╗  ███████╗ ██████╗ ███████╗████████╗██╗   ██╗██╗     ███████╗██████╗
  ██╔════╝ ██╔════╝██╔═══██╗██╔════╝╚══██╔══╝╚██╗ ██╔╝██║     ██╔════╝██╔══██╗
  ██║  ███╗█████╗  ██║   ██║███████╗   ██║    ╚████╔╝ ██║     █████╗  ██████╔╝
  ██║   ██║██╔══╝  ██║   ██║╚════██║   ██║     ╚██╔╝  ██║     ██╔══╝  ██╔══██╗
  ╚██████╔╝███████╗╚██████╔╝███████║   ██║      ██║   ███████╗███████╗██║  ██║
   ╚═════╝ ╚══════╝ ╚═════╝ ╚══════╝   ╚═╝      ╚═╝   ╚══════╝╚══════╝╚═╝  ╚═╝
  `));
};

export const logHelp = () :void => {
  logTitle();
  console.log(`
  Basic syntax:
    npx geostyler-cli [options] inputfile
    npm start -- [options] inputfile

  Example:
    npx geostyler-cli -s sld -t qgis -o output.qml [YOUR_SLD.sld]
    npm start -- -s sld -t mapfile -o myStyle.map testdata/point_simplepoint.sld

  Options:
    -s / --source : SourceParser. ["mapbox" | "mapfile" | "sld" | "qgis"]
    -t / --target : TargetParser. ["mapbox" | "mapfile" | "sld" | "qgis"]
    -o / --output : Output filename. [string]
    -h / --help: Display this help.
    -v / --version: Display the version of the program.
  `);
};

export const logVersion = () : void => {
  console.log(`v${version}`);
};
