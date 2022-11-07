Feature: A comment before a "Given" should stay before the "Given".
    The blankline should be before the comment and not between the comment and the "Given".

    Scenario:
        Given I have a feature file
        When I run the feature file
        Then I should see the output

        # this comment should stay just before the second given
        Given I have another feature file
        When I run the feature file
        Then I should see the output