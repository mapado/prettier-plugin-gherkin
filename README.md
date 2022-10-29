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

## Documentation

[Prettier plugin documentation](https://prettier.io/docs/en/plugins.html#developing-plugins)

Gherkin AST schema

![Gherkin AST schema](https://raw.githubusercontent.com/cucumber/common/main/gherkin/docs/ast.png)

## Test datas

Test datas can be found here : https://github.com/cucumber/common/tree/main/gherkin/testdata
