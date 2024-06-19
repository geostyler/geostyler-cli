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
geostyler --output new-qgis-style.qml my-existing.sld
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

You can then use the new `geostyler` command, e.g.:

```
geostyler -s sld -t qgis -o output.qml input.sld
```

To process a folder of files:

```
geostyler -s sld -t qgis -o /outputdir /inputdir
```


### Update 🚀

```
npm update -g geostyler-cli
```

### Uninstalling 😔

```
npm uninstall -g geostyler-cli
```


## Syntax

On a single file:

```
geostyler [options] -o /path/to/output.ext /path/to/input.ext
```

On a directory:

```
geostyler [options] -t qgis -o /path/to/output /path/to/input/
```

## Options

* `-h` / `--help` Display the help and exit.
* `-o` / `--output` Output filename or directory. Required. [string]
* `-s` / `--source` Source parser, either `mapbox`, `mapfile` or `map`, `sld` (for SLD 1.0), `se` (for SLD 1.1),
`qgis` or `qml`. If not given, it will be guessed from
the extension of the input file. Mandatory if the the target
is a directory.
* `-t` / `--target` Target parser, either `mapbox`, `sld` (for SLD 1.0), `se` (for SLD 1.1),
and `qgis` or `qml` for QGIS QML files. If not given, it will be guessed from
the extension of the output file. Mandatory if the the target
is a directory.
Mapfiles are currently not supported as target.
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

