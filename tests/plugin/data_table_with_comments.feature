Feature: accountability
    Scenario: Scenario Outline name
        Given context
        Then table node with a comment:
            | amountForPro       | 0  |
            # a comment in between
            | collectedFeeAmount | 95 |
        Then result
