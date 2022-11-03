Feature: Escaped pipes
    The \-character will be considered as an escape in table cell
    iff it is followed by a |-character, a \-character or an n.

  Scenario: They are the future
    Given a huge table with escaped characters
     | \n | 
     | \\n |
     | \\\n | 
     | \\\\n |
      | \\\\\n |
      | \\\\\\n |
     | \| | 
     | \\\| |
     | \ |
     | a\b |
     | a\\b |
      | a\\\b |
      | a\\\\b |
      | a\ |
      | \a |
