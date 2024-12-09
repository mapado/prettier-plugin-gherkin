# CHANGELOG

## Unreleased

## [3.1.1] - 2024-12-09

- Stable formatting for node description [#33](https://github.com/mapado/prettier-plugin-gherkin/pull/33) by [@jdeniau](https://github.com/jdeniau)

## [3.1.0] - 2024-09-02

- Escaping multiple pipes should keep pipes escaped [#30](https://github.com/mapado/prettier-plugin-gherkin/pull/30) by [@jdeniau](https://github.com/jdeniau)

## [3.0.0] - 2024-07-30

### Changed

[BREAKING] Set default `tabWidth` to 2, as documented in [Gherkin Reference](https://cucumber.io/docs/gherkin/reference/).

If you want to keep v2 version and use four space, you can override this values in your prettier configuration file:

```json
{
  // …
  "overrides": [
    {
      "files": "*.feature",
      "options": {
        "tabWidth": 4
      }
    }
  ]
}
```

## [2.4.1] - 2024-07-26

- Re-set hardline for Background [#27](https://github.com/mapado/prettier-plugin-gherkin/pull/27) by [@jdeniau](https://github.com/jdeniau)

## [2.4.0] - 2024-07-05

- Handle printWidth for node description [#24](https://github.com/mapado/prettier-plugin-gherkin/pull/24) by [@jdeniau](https://github.com/jdeniau)

## [2.3.0] - 2024-06-14

- feat: docstring now supports all language [#21](https://github.com/mapado/prettier-plugin-gherkin/pull/21) by [@bdo](https://github.com/bdo)

## [2.2.1] - 2023-12-28

- Fix new lines between two comments line [#17](https://github.com/mapado/prettier-plugin-gherkin/pull/17) by [@jdeniau](https://github.com/jdeniau)
- Fix new line for comments in data tables [#18](https://github.com/mapado/prettier-plugin-gherkin/pull/18) by [@jdeniau](https://github.com/jdeniau)

## [2.2.0] - 2023-12-28

- Add `forceNewlineBetweenStepBlocks` option [#16](https://github.com/mapado/prettier-plugin-gherkin/pull/16) by [@jdeniau](https://github.com/jdeniau)

## [2.1.1] - 2023-11-21

- Add repository, homepage and bugs field to package.json [#14](https://github.com/mapado/prettier-plugin-gherkin/pull/14) by [@sonallux](https://github.com/sonallux)

## [2.1.0] - 2023-11-14

- Upgrade cucumber packages [#13](https://github.com/mapado/prettier-plugin-gherkin/pull/13) by [@jdeniau](https://github.com/jdeniau)

## [2.0.0] - 2023-08-31

### Prettier 3

Handle prettier 3. Prettier 2 is not compatible with this version as the plugin API did change totally.

Prettier 3 remove plugin auto-detection, so you now need to active the plugin explicitly:

> package.json

```diff
-     "prettier": "^2.0.0",
-     "prettier-plugin-gherkin": "^1.0.0",
+     "prettier": "^3.0.0",
+     "prettier-plugin-gherkin": "^2.0.0",
```

> .prettierrc

```diff
  {
+     "plugins": ["prettier-plugin-gherkin"]
  }
```

### (maybe) remove support for Node 14

(maybe) drop support for node 14: prettier 3 does still support node 14, but it is unmaintained, and [the tests does not pass on node 14 only](https://github.com/mapado/prettier-plugin-gherkin/actions/runs/6030258360/job/16361678638?pr=9). If you are willing to spend some time on this, feel free to open a PR, but I suggest you to migrate to a more recent version of node. [#9](https://github.com/mapado/prettier-plugin-gherkin/pull/9) by [@jdeniau](https://github.com/jdeniau)

## [1.1.1]

### Fixes

handle comments before "Given" and "When" [#6](https://github.com/mapado/prettier-plugin-gherkin/pull/6)

## [1.1.0]

- handle "language" comment
- fix missing mediaType in json / xml embedded docstring
- fix missing example description

## [1.0.0]

Version 1.0.0 is a complete rewrite of the [first version](https://github.com/armandabric/prettier-plugin-gherkin) by [@armandabric](https://github.com/armandabric).
