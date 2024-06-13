@accountability
@accountability-json
Feature: accountability
    accounts should always be good

    Scenario Outline: Scenario Outline name
        Given I have <number> cukes in my belly
        When I wait <hour> hour
        Then my belly should growl

        Examples:
            | number | hour |
            | 1      |   the first hour of the day    |
            | 2      | 2    |

    @truncateTables
    Scenario: Check accountability
        The scenario definition for "Check accountability"
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
                {
                    "name": "card",
                    "credit": 5000
                }
            ]
            """
      
        When I receive the following feed from the bank:
        """xml
        <feed>
        <account number="123456789">
        <entry>
        <type>credit</type>
        <amount>1000</amount>
        <label>My company salary</label>
        </entry>
        </account>
        </feed>
        """

        And I make the following query to the API:
        """graphql
        union Transaction =  CreditTransaction|DebitTransaction

        query AccountBalance($accountNumber:String!) {
            account(accountNumber:$accountNumber) {
                balance
                transactions { amount
                }
            }
        }
        """

        Then the response status code should be 200
