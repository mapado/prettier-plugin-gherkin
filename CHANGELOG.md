# CHANGELOG

## [2.0.0] - 2023-08-31

### Changed

- [Breaking] Handle prettier 3. Prettier 2 is not compatible with this version as the plugin API did change totally.
- [Breaking] (maybe) drop support for node 14: prettier 3 does still support node 14, but it is unmaintained, and [the tests does not pass on node 14 only](https://github.com/mapado/prettier-plugin-gherkin/actions/runs/6030258360/job/16361678638?pr=9). If you are willing to spend some time on this, feel free to open a PR, but I suggest you to migrate to a more recent version of node. [#9](https://github.com/mapado/prettier-plugin-gherkin/pull/9) by [@jdeniau](https://github.com/jdeniau)

## [1.1.1]

### Fixes

handle comments before "Given" and "When" [#6](https://github.com/mapado/prettier-plugin-gherkin/pull/6)

## [1.1.0]

- handle "language" comment
- fix missing mediaType in json / xml embedded docstring
- fix missing example description

## [1.0.0]

Version 1.0.0 is a complete rewrite of the [first version](https://github.com/armandabric/prettier-plugin-gherkin) by [@armandabric](https://github.com/armandabric).
