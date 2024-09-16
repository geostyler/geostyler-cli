# GeoStyler CLI

A command line interface for [GeoStyler](https://geostyler.org) to convert
between various formats for styling of geographic data.

## Download and usage

The recommended way to use the GeoStyler CLI is by downloading the binary for your OS.

- [Linux x64](https://github.com/geostyler/geostyler-cli/releases/latest/download/geostyler-cli-linux.zip)
- [Windows x64](https://github.com/geostyler/geostyler-cli/releases/latest/download/geostyler-cli-win.exe.zip)
- [MacOS x64](https://github.com/geostyler/geostyler-cli/releases/latest/download/geostyler-cli-macos-x64.zip)
- [MacOS arm64](https://github.com/geostyler/geostyler-cli/releases/latest/download/geostyler-cli-macos-arm64.zip)

You can also find the available versions in the assets section of the releases:

https://github.com/geostyler/geostyler-cli/releases/latest

Unzip the binary and simply run:

```sh
./geostyler-cli --help
```

Alternatively you can use the GeoStyler CLI with [bun.sh](https://bun.sh/):

```
bunx geostyler-cli --help
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
* `-s` / `--source` Source parser, either `mapbox` (`maplibre`), `lyrx`, `mapfile` or `map`,
`sld` or `se` for SLD - the parser will read the version from the file,
and `qgis` (`qml`) for QGIS QML files. If not given, it will be guessed from the extension of the input file.
Mandatory if the the target is a directory.
* `-t` / `--target` Target parser, either `mapbox` (`maplibre`), `sld` (for SLD 1.0), `se` (for SLD 1.1),
and `qgis` (`qml`) for QGIS QML files. If not given, it will be guessed from
the extension of the output file. Mapfiles are not currently supported as target.
Mandatory if the the target is a directory.
* `-v` / `--version` Display the version of the program.

## Developing

In your clone of the repo, in the root directory:

```bash
# install dependencies
bun install
# run the CLI
bun run start -- -s sld -t qgis -o output.qml testdata/point_simplepoint.sld
```

## <a name="funding"></a>Funding & financial sponsorship

Maintenance and further development of this code can be funded through the
[GeoStyler Open Collective](https://opencollective.com/geostyler). All contributions and
expenses can transparently be reviewed by anyone; you see what we use the donated money for.
Thank you for any financial support you give the GeoStyler project 💞
