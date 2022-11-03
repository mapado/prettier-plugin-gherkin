Feature: A data table with PHP Fully Qualified Classnames

    Scenario:
        When I have a data table
            | entityClassName | id |
            | App\Entity\Cart | 4 |
            | App\\Entity\\Cart | 5 |