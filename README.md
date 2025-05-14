# GeoStyler CLI

A command line interface for [GeoStyler](https://geostyler.org) to convert
between various formats for styling of geographic data.

## tl;dr

```
npx geostyler-cli --output new-qgis-style.qml my-existing.sld
```

## Requirements

`geostyler-cli` can either be run as a standalone application or installed using [Node.js](https://nodejs.org/).

## Standalone application

Binaries are available for Linux, MacOS, and Windows on the 
[Releases](https://github.com/geostyler/geostyler-cli/releases) page.
Download the zip file for your operating system, unzip, navigate to the folder
and run the `geostyler` command:

```
geostyler-cli --output new-qgis-style.qml my-existing.sld
```

## Usage without installation ⚡

`Node.js` includes [npx](https://docs.npmjs.com/cli/v10/commands/npx), this
allows you to run commands from an npm package without having to install it.

```
npx geostyler-cli -s sld -t qgis -o output.qml input.sld
```

## Global installation

### Installation 💾

`Node.js` includes [npm](https://docs.npmjs.com/cli/v10/commands/npm) - the
JavaScript package manager. To install the `geostyler` command globally:

```
npm install -g geostyler-cli
```

You can then use the new `geostyler-cli` command, e.g.:

```
geostyler-cli -s sld -t qgis -o output.qml input.sld
```

To process a folder of files:

```
geostyler-cli -s sld -t qgis -o /outputdir /inputdir
```


### Update 🚀

```
npm update -g geostyler-cli
```

### Uninstalling 😔

```
npm uninstall -g geostyler-cli
```


## Syntax and examples

To convert a single file:

```bash
geostyler-cli [options] -o /path/to/output.ext /path/to/input.ext
# example, relying on file extensions to select the parsers
geostyler-cli -o point_simple.sld testdata/point_simple.qml
# example with explicit parsers
geostyler-cli -s qml -t sld -o point_simple.sld testdata/point_simple.qml
```

To convert all files in a directory:

```bash
geostyler-cli [options] -t qgis -o /path/to/output /path/to/input/
# example
geostyler-cli -s sld -t qgis -o ./output-sld testdata/sld
```

To output the GeoStyler format to `stdout` (only available for a single file), don't
set an output file or parser:

```bash
geostyler-cli [options] /path/to/input.ext
# print the GeoStyler format to stdout (relying on the file extension to select the parser)
geostyler-cli testdata/point_simple.qml
# print an SLD output to stdout
geostyler-cli -t sld testdata/point_simple.qml
```

## Options

* `-h` / `--help` Display the help and exit.
* `-o` / `--output` Output filename or directory. Required when the source is a directory.
For a file leave this empty to write to `stdout`. [string]
* `-s` / `--source` Source parser, either `mapbox`, `mapfile` or `map`, 
"sld" or "se" for SLD - the parser will read the version from the file,
"qgis" or "qml" for QGIS QML files, and "ol-flat" for OpenLayers FlatStyles.
If not given, it will be guessed from the extension of the input file.
Mandatory if the the target is a directory.
* `-t` / `--target` Target parser, either `mapbox`, `sld` (for SLD 1.0), `se` (for SLD 1.1),
"qgis" or "qml" for QGIS QML files, or "ol-flat" for OpenLayers FlatStyles.
If not given, it will be guessed from the extension of the output file.
Mapfiles are not currently supported as target.
Mandatory if the the target is a directory.
* `-v` / `--version` Display the version of the program.

## Developing

In your clone of the repo, in the root directory:

```bash
npm install   # get dependencies
npm run build # build from possibly changed source
# now you can call your build like this:
npm start -- -s sld -t qgis -o output.qml testdata/point_simplepoint.sld
```

## <a name="funding"></a>Funding & financial sponsorship

Maintenance and further development of this code can be funded through the
[GeoStyler Open Collective](https://opencollective.com/geostyler). All contributions and
expenses can transparently be reviewed by anyone; you see what we use the donated money for.
Thank you for any financial support you give the GeoStyler project 💞

