BOOLIFY — Digital Logic Learning Studio=====================================================

HOW TO RUN
1. Extract Boolify_Project.zip.
2. Open Visual Studio Code.
3. Select File > Open Folder.
4. Select the extracted folder named Boolify_Project.
5. In VS Code Explorer, open index.html.
6. Right-click inside index.html and choose "Open with Live Server".
   If Live Server is not installed:
   - Open Extensions (Ctrl+Shift+X)
   - Search for "Live Server" by Ritwick Dey
   - Install it, then repeat step 6.
7. The app opens in your browser. Internet is only needed for the optional Google Fonts.

SUPPORTED EXPRESSION SYNTAX
+       OR
. or *  AND
'       postfix NOT
!       prefix NOT
( )     grouping
Implicit AND is also supported: AB means A.B.

EXAMPLES
A + A
A.A'
A + A.B
(A+B)'
A.B + A.B'

FEATURES
- Boolean expression parser and simplifier with law explanations
- Truth table generator (up to 5 variables)
- Original vs simplified truth-table verification
- Boolean laws reference library
- Interactive AND, OR, NOT, NAND, NOR, XOR, XNOR and combined gate simulator
- Reference truth table for the seven fundamental gates
- Five-question practice quiz

PROJECT LIMITATION / HONEST DEMONSTRATION NOTE
The simplifier applies a defined set of common Boolean algebra identities:
identity, null/domination, idempotent, complement, involution,
De Morgan, absorption, and two complement-reduction patterns.
It is an educational rule-based simplifier, not a complete symbolic
algebra engine. If an expression cannot be reduced by the supported
rules, it may remain unchanged. The truth table still evaluates the
expression exactly for up to five variables.

GROUP SUBMISSION
All four group members should understand at least one part:
1. UI and page structure (HTML)
2. Styling and responsive design (CSS)
3. Expression parsing, evaluation and simplification (JavaScript)
4. Truth table, gate simulator, quiz and testing (JavaScript)

Before submission, test:
- A + A => A
- A.A' => 0
- A + A.B => A
- (A+B)' => A'.B'
- A.B + A.B' => A.B + A.B' => A (factoring + complement law)

PROJECT OVERVIEW

BOOLIFY is an interactive educational web application designed
to help students understand Boolean algebra and digital logic.

It provides expression simplification, step-by-step explanations,
truth table generation, logic gate simulation and practice questions.

The application is developed using HTML, CSS and JavaScript.