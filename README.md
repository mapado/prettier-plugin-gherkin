# prettier-plugin-gherkin

This prettier plugin format your gherkin (`.feature` files) documents.

Example of changes:

```gherkin
@accountability
@accountability-json
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

        Given I create an order
        Then the response status code should be 200

        When I pay the latest order
        And I refund the last payment and transaction list with transactions:
            """
            [
                {"name": "card",
                    "credit": 5000
                }
            ]
            """
```

## Options

This plugin has a single options:

### `escapeBackslashes`

default to `false`

If false, all escaped backslash will be transformed to simple backslash : `\\` → `\`
If true, all backslash will be espaced : `\` → `\\`

This option may due to the parser([see issue](https://github.com/cucumber/common/issues/2115)) and is here because of an inconsistence between the [gherkin reference](https://cucumber.io/docs/gherkin/reference/#table-cell-escaping), that said that:

> if you need a `\`, you can escape that with `\\`.

and the tooling that accept unescaped `\`, including the cucumber parser used under the hood.

You may want to check your code base and be consistent : if you use simple backslash, keep the default option, if you escape all backslash, then set this option to `true`.

## Documentation

[Prettier plugin documentation](https://prettier.io/docs/en/plugins.html#developing-plugins)

Gherkin AST schema

![Gherkin AST schema](https://raw.githubusercontent.com/cucumber/common/main/gherkin/docs/ast.png)

### Useful resources on Gherkin language

- [Learn Gherkin on specflow.org](https://specflow.org/learn/gherkin/)
- [Cucumber Gherkin reference](https://cucumber.io/docs/gherkin/reference/)
- [Cucumber Gherkin JavaScript parser](https://github.com/cucumber/gherkin-javascript/)
- [Prettier command reference](https://github.com/prettier/prettier/blob/main/commands.md)

## Test datas

Test datas can be found here : https://github.com/cucumber/common/tree/main/gherkin/testdata
