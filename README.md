# GeoStyler CLI

A command line interface for [GeoStyler](https://geostyler.org) to convert
between various formats for styling of geographic data.

## tl;dr

```
npx geostyler-cli --output new-qgis-style.qml my-existing.sld
```

## Requirements

Requires [Node.js](https://nodejs.org/) and
[npx](https://www.npmjs.com/package/npx) or [npm](https://www.npmjs.com/), both usually come with Node.js.

## Usage without installation ⚡

```
npx geostyler-cli -s sld -t qgis -o output.qml input.sld
```


## Global installation

### Installation 💾

Once:

```
npm install -g geostyler-cli
```

You can then use the new `geostyler` command, e.g.:

```
geostyler -s sld -t qgis -o output.qml input.sld
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

```
geostyler [options] -o /path/to/output.ext /path/to/input.ext
```

## Options

* `-o` / `--output` Output filename. Required.
* `-s` / `--source` Source parser, either `mapbox`, `mapfile`, `sld` or `qgis`.
If not given, it will be guessed from the extension of the input file.
* `-t` / `--target` Target parser, either `mapbox`, `mapfile`, `sld` or `qgis`.
If not given, it will be guessed from the extension of the output file.
* `-h` / `--help` Display the help and exit.

## Developing

In your clone of the repo, in the root directory:

```bash
npm install   # get dependencies
npm run build # build from possibly changed source
# now you can call your build like this:
npm start -- -s sld -t qgis -o output.qml testdata/point_simplepoint.sld
```
