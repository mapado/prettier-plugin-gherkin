Feature: Test different embed

    Scenario: XML
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

    Scenario: JSON
        When I receive the following feed from the bank:
        """json
        { "account": 
          "1234",
          "amount": 1000}
        """

    Scenario: JSON if no language is specified (default fallback)
        When I receive the following feed from the bank:
        """
        { "account": 
          "1234",
          "amount": 1000}
        """

    Scenario: GraphQL
        When I make the following query to the API:
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

    Scenario: Unknown
        When I make the following query to the API:
        """unknown-language
        this language is not known from prettier
        """
