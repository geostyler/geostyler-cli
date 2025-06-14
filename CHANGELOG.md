## [5.0.0](https://github.com/geostyler/geostyler-cli/compare/v4.4.1...v5.0.0) (2025-06-05)


### ⚠ BREAKING CHANGES

* The target parser "se" is removed. Now you must use
"--target sld --targetOptions 'sldVersion:1.1.0'"

### Features

* allow parser constructor options and remove se ([d9f7c84](https://github.com/geostyler/geostyler-cli/commit/d9f7c840719d3be1a7f72ec470b37cf612593c05))
* only write style to stdout and add quiet mode ([62bc1dd](https://github.com/geostyler/geostyler-cli/commit/62bc1ddf16fa6622ff3e0f47282148082331c44e))


### Bug Fixes

* add options info to the helper ([5a7ff8b](https://github.com/geostyler/geostyler-cli/commit/5a7ff8bf007e76e518d46635221e899ef1531f28))
* typos ([d75575d](https://github.com/geostyler/geostyler-cli/commit/d75575d4e0e60cdca5dbf784a6a63f54a2283db4))

## [4.4.1](https://github.com/geostyler/geostyler-cli/compare/v4.4.0...v4.4.1) (2025-05-16)


### Bug Fixes

* bump geostyler-openlayers-parser ([48cb2d6](https://github.com/geostyler/geostyler-cli/commit/48cb2d62df16e915f97d3161bb7c23dec2d36f3e))

## [4.4.0](https://github.com/geostyler/geostyler-cli/compare/v4.3.1...v4.4.0) (2025-05-14)


### Features

* add support for openlayers flat-styles ([057ff14](https://github.com/geostyler/geostyler-cli/commit/057ff146bfc0158aba29c90ffcf9eb5bd4aacfdf))

## [4.3.1](https://github.com/geostyler/geostyler-cli/compare/v4.3.0...v4.3.1) (2025-01-13)


### Bug Fixes

* update geostyler packages ([6ef08af](https://github.com/geostyler/geostyler-cli/commit/6ef08aff6156614ab786fa2ffee237b389c5aeae))

## [4.3.0](https://github.com/geostyler/geostyler-cli/compare/v4.2.0...v4.3.0) (2025-01-07)


### Features

* improve CLI conventions ([afa64a0](https://github.com/geostyler/geostyler-cli/commit/afa64a094c18a03a4a1fe814126826c2f7daf649))

## [4.2.0](https://github.com/geostyler/geostyler-cli/compare/v4.1.2...v4.2.0) (2024-12-11)


### Features

* add geostyler style as a format ([bc0cc03](https://github.com/geostyler/geostyler-cli/commit/bc0cc039201909edfba5e91c8210a16d724dd5f9))

## [4.1.2](https://github.com/geostyler/geostyler-cli/compare/v4.1.1...v4.1.2) (2024-11-07)


### Bug Fixes

* readd binaries to gitignore ([54758ad](https://github.com/geostyler/geostyler-cli/commit/54758ad43343a3d3f86a3d53bc66607dab1fe3fd))
* update the binary names and assets ([f84d295](https://github.com/geostyler/geostyler-cli/commit/f84d295453b3eb4bb89fc59df1236eddf37b9cc8))

## [4.1.1](https://github.com/geostyler/geostyler-cli/compare/v4.1.0...v4.1.1) (2024-11-06)


### Bug Fixes

* remove binaries from .gitignore ([8bf1afa](https://github.com/geostyler/geostyler-cli/commit/8bf1afa8d54cfce8a320a739be12c1d7108a18cd))

## [4.1.0](https://github.com/geostyler/geostyler-cli/compare/v4.0.1...v4.1.0) (2024-10-31)


### Features

*  throw error for unsupported targetParsers ([14bb940](https://github.com/geostyler/geostyler-cli/commit/14bb940d6aee65547d2a4e87125fb5bfa4e3b1d1))
* adds geostyler-lyrx-parser ([cd4b625](https://github.com/geostyler/geostyler-cli/commit/cd4b625f01988c98bf8f5b02d9a46a36c0d2ec4e))


### Bug Fixes

* adapt outputfile name ([700518e](https://github.com/geostyler/geostyler-cli/commit/700518e00860bc9e19369fc24d6f6c5282beb7ed))

## [4.0.1](https://github.com/geostyler/geostyler-cli/compare/v4.0.0...v4.0.1) (2024-10-07)


### Bug Fixes

* make cli and standalone binaries build work ([6e790f6](https://github.com/geostyler/geostyler-cli/commit/6e790f6d2dd73d18ab106c1e92df270a81db10e7))
* stringify objects before writing file ([1d6c52f](https://github.com/geostyler/geostyler-cli/commit/1d6c52f438f8fa8573197dfc782419b45559accd))
* update branch name in CI configs ([756fcea](https://github.com/geostyler/geostyler-cli/commit/756fceafd4f41e7e402456f640a937d0840b1ead))

## [4.0.0](https://github.com/geostyler/geostyler-cli/compare/v3.1.5...v4.0.0) (2024-06-20)


### ⚠ BREAKING CHANGES

* Remove the geostyler command. Use geostyler-cli instead.

### Features

* consolidate geostyler commands ([4addec8](https://github.com/geostyler/geostyler-cli/commit/4addec81e459bf5a0cdd4f1df838f884193235df))

## [3.1.5](https://github.com/geostyler/geostyler-cli/compare/v3.1.4...v3.1.5) (2024-06-20)


### Bug Fixes

* add missing dependency ([44f0f59](https://github.com/geostyler/geostyler-cli/commit/44f0f59b50e0c91b1e257d85a39d551125d620f0))
* create a version.ts file and use this for CLI version numbers ([#390](https://github.com/geostyler/geostyler-cli/issues/390)) ([5b4f47e](https://github.com/geostyler/geostyler-cli/commit/5b4f47e1449cd0e908746700e90431f80c703f2d))

## [3.1.4](https://github.com/geostyler/geostyler-cli/compare/v3.1.3...v3.1.4) (2024-06-19)


### Bug Fixes

* re-add build step ([1607cf4](https://github.com/geostyler/geostyler-cli/commit/1607cf4601926bb3fb87db66917103c5bfeb9017))

## [3.1.3](https://github.com/geostyler/geostyler-cli/compare/v3.1.2...v3.1.3) (2024-06-19)


### Bug Fixes

* ensure published assets have correct version ([#386](https://github.com/geostyler/geostyler-cli/issues/386)) ([91e4019](https://github.com/geostyler/geostyler-cli/commit/91e4019c1ccf2d466fd01c0ad32c0e18e4c3fa83))

## [3.1.2](https://github.com/geostyler/geostyler-cli/compare/v3.1.1...v3.1.2) (2024-06-19)


### Bug Fixes

* **deps:** update dependency ol to v9 ([ee3609c](https://github.com/geostyler/geostyler-cli/commit/ee3609c07522b547c72ffbc63c3690c57fcfbf7d))

## [3.1.1](https://github.com/geostyler/geostyler-cli/compare/v3.1.0...v3.1.1) (2023-05-31)


### Bug Fixes

* move binaries from repo to release assets ([#357](https://github.com/geostyler/geostyler-cli/issues/357)) ([2a794dd](https://github.com/geostyler/geostyler-cli/commit/2a794dd37518617c2f065a330709e72cd9c4e218))
