# prettier-plugin-gherkin

This prettier plugin format your gherkin (`.feature` files) documents.

Example of changes:

```gherkin
@accountability @accountability-json
Feature: accountability
    accounts should always be good
    @truncateTables
    Scenario: Check accountability
        # Insert fixtures
        Given the following fixtures files are loaded:
            | 10.contracts.yml            |
            | 20.wallet.yml               |
            | 30.tax.yml |

        Given I inject the header "authorization" with value 'Bearer some-token'

        And I inject the header "accept" with value "application/json"

# I will create an order here
        Given I create an order
            Then the response status code should be 200
            When I pay the latest order
        And I refund the last payment and transaction list with transactions:
                """
            [{"name": "card",
                    "credit": 5000
                }
            ]
            """
```

Will be formatted to:

```gherkin
@accountability
@accountability-json
Feature: accountability
    accounts should always be good

    @truncateTables
    Scenario: Check accountability
        # Insert fixtures
        Given the following fixtures files are loaded:
            | 10.contracts.yml |
            | 20.wallet.yml    |
            | 30.tax.yml       |

        Given I inject the header "authorization" with value 'Bearer some-token'
        And I inject the header "accept" with value "application/json"

        # I will create an order here
        Given I create an order
        Then the response status code should be 200

        When I pay the latest order
        And I refund the last payment and transaction list with transactions:
            """
            [{ "name": "card", "credit": 5000 }]
            """

```

### Versions

This version is compatible with prettier 3. If you still use prettier 2, you should use the [1.1.1](https://github.com/mapado/prettier-plugin-gherkin/blob/main/CHANGELOG.md#111) version of this plugin.

## Installation

Install [prettier](https://prettier.io/docs/en/install.html) if you don't have already.

```sh
npm install --save prettier-plugin-gherkin

// or with yarn
yarn add prettier-plugin-gherkin
```

Activate the plugin in your prettier configuration file:

> .prettierrc

```diff
  {
+     "plugins": ["prettier-plugin-gherkin"]
  }
```

You can then configure your git precommit, IDE, etc. to format the `.features` file with prettier.

### Example with VSCode

https://user-images.githubusercontent.com/1398469/201128147-ad2ecba8-253d-4c70-9133-ae28d178ed2b.mp4

## Options

This plugin has the following options:

### `forceNewlineBetweenStepBlocks` (default: `false`)

Do force a blank linesbetween steps block:

Given the following block:

```gherkin
Given some context
And some other context
When I do something
Then I should have a result
```

The default output will be the same as the input (no blank lines).

If you set this option to `true`, it will force a blank line between the context block and the action block:

```gherkin
Given some context
And some other context

When I do something
Then I should have a result
```

If you already have a blank line in your input, it will be kept as-is (event with this option set to `false`).
If you have more than one blank line, it will be reduced to a single blank line.

### `escapeBackslashes`

default to `false`

If false, all escaped backslash will be transformed to simple backslash : `\\` → `\`
If true, all backslash will be espaced : `\` → `\\`

This option may be due to the parser ([see issue](https://github.com/cucumber/common/issues/2115)) and is here because of an inconsistence between the [gherkin reference](https://cucumber.io/docs/gherkin/reference/#table-cell-escaping), that said that:

> if you need a `\`, you can escape that with `\\`.

and the tooling that accept unescaped `\`, including the cucumber parser used under the hood.

You may want to check your code base and be consistent : if you use simple backslash, keep the default option, if you escape all backslash, then set this option to `true`.

## Documentation

[Prettier plugin documentation](https://prettier.io/docs/en/plugins.html#developing-plugins)

Gherkin AST schema

![Gherkin AST schema](https://github.com/cucumber/gherkin?tab=readme-ov-file#abstract-syntax-tree-ast)

### Useful resources on Gherkin language

- [Learn Gherkin on specflow.org](https://specflow.org/learn/gherkin/)
- [Cucumber Gherkin reference](https://cucumber.io/docs/gherkin/reference/)
- [Cucumber Gherkin JavaScript parser](https://github.com/cucumber/gherkin-javascript/)
- [Prettier command reference](https://github.com/prettier/prettier/blob/main/commands.md)

## Contributing to this plugin

Clone the repository and install dependencies:

```sh
git clone git@github.com:mapado/prettier-plugin-gherkin.git
cd prettier-plugin-gherkin
yarn install
```

Several commands are available:

```sh
yarn example # print the example file with the plugin. You can change de content of the example file as you need
yarn test # run the tests suites : all features are tested
yarn lint # the plugin is writter in TypeScript, this command will help you detect typescript issue
```

### Test datas

Test datas can be found here : https://github.com/cucumber/gherkin-utils/tree/c35857189c2da3a9b84796ad585d25e70f7bf3b8/testdata

