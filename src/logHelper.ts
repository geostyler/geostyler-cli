import gradient from 'gradient-string';
import { version } from '../package.json';

export const logTitle = (): void => {
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
    geostyler-cli [options] [input_file | input_directory]

  Example:
    npx geostyler-cli -s sld -t qgis -o output.qml [YOUR_SLD.sld]
    geostyler-cli -s qml -t mapfile -o myStyle.map testdata/point_simple.qml
    geostyler-cli -s sld -t qgis -o ./output-sld testdata/sld

  Options:
    -h / --help   : Display this help and exit.
    -o / --output : Output filename or directory. Required when the source is a directory.
                    For a file leave this empty to write to stdout. [string]
    -s / --source : Source parser, either "mapbox", "mapfile" or "map",
                    "sld" or "se" for SLD - the parser will read the version from the file,
                    and "qgis" or "qml" for QGIS QML files. If not given, it will be guessed
                    from the extension of the input file.
                    Mandatory if the the target is a directory.
    -t / --target : Target parser, either "mapbox", "sld" (for SLD 1.0), "se" (for SLD 1.1),
                    and "qgis" or "qml" for QGIS QML files.
                    If not given, it will be guessed from the extension of the output file.
                    Mapfiles are not currently supported as target.
                    Mandatory if the the target is a directory.
    -v / --version: Display the version of the program.
  `);
};

export const logVersion = () : void => {
  console.log(`v${version}`);
};
