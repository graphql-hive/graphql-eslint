---
'@graphql-eslint/eslint-plugin': patch
---

Fix the `description-style` suggestions corrupting descriptions: the inline and block forms are now
re-encoded instead of having their delimiters swapped, so escape sequences, quotes and backslashes
keep their meaning and the suggested SDL always parses.
