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
    npx geostyler-cli [options] [input_file | [input_directory]]
    npm start -- [options] [input_file | input_directory]

  Example:
    npx geostyler-cli -s sld -t qgis -o output.qml [YOUR_SLD.sld]
    npm start -- -s sld -t mapfile -o myStyle.map testdata/point_simplepoint.sld

  Options:
    -h / --help   : Display this help.
    -o / --output : Output filename or directory. Mandatory if the target
                    is a directory. If not provided for a single file then output
                    will be written to stdout. [string]
    -s / --source : SourceParser, either "mapbox", "mapfile" or "map", "sld",
                    "qgis" or "qml". If not given, it will be guessed from the
                    extension of the output file. Mandatory if the the target
                    is a directory.
    -t / --target : Target parser, either "mapbox", "mapfile" or "map", "sld",
                    "qgis" or "qml". If not given, it will be guessed from the
                    extension of the output file. Mandatory if the the target
                    is a directory. Mapfiles are currently not supported as target.
    -v / --version: Display the version of the program.
  `);
};

export const logVersion = () : void => {
  console.log(`v${version}`);
};
