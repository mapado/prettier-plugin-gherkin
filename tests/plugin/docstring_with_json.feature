Feature: complex docstring with JSON in it

    Scenario:
    Given a docstring with 
        """
        1
        "
        2
        \"
        3
        \"\"\"
        4
        """

        Given I have a complex docstring
        """
        A docstring that is not JSON 
        =======================================

        but will include some somewhere
        -----------------------------------------------------

         [WARNING] Some warning

                   {"error":"NOT AUTHENTICATED","comment":"authentication refused"}

         [OK] Declarations complete.
        """