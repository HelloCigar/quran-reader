# AdonisJS work follows the Flow harness

This app uses Flow. The harness docs in `.flow/docs/` (indexed in `CLAUDE.md` or `AGENTS.md`) are the primary source for the AdonisJS facts of this app, and the `flow-*` skills settle the AdonisJS design choices. We chose Flow over general defaults because generic advice, such as "extract duplicated code", "test at any module seam" or "add an adapter", conflicts with how AdonisJS settles these choices.

## Consequences

Each skill below must use the Flow part of its row before it works on the app.

| Flow part                                              | Its job                                              | Skills that must use it                                                                                                                                                                                   |
| ------------------------------------------------------ | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Harness docs in `.flow/docs/`                          | Facts and APIs of the framework and its packages     | `research`, `grill-me`, `grill-with-docs`, `to-spec`, `to-tickets`, `prototype`, `diagnosing-bugs`, `tdd`, `implement`, `implement-spec`, `wayfinder`, `teach`, `wizard`, `improve-codebase-architecture` |
| `flow-schema-design`                                   | Migrations and models                                | `grill-me`, `grill-with-docs`, `to-spec`, `to-tickets`, `implement`, `tdd`                                                                                                                                |
| `flow-cruddy-controllers`                              | Routes and controllers                               | `grill-me`, `grill-with-docs`, `to-spec`, `to-tickets`, `implement`, `tdd`                                                                                                                                |
| `flow-response-design`                                 | Pages, page props and transformers                   | `grill-me`, `grill-with-docs`, `to-spec`, `to-tickets`, `prototype`, `implement`, `tdd`                                                                                                                   |
| `flow-validation-layers`                               | Validators and checks on incoming data               | `grill-me`, `grill-with-docs`, `to-spec`, `to-tickets`, `implement`, `tdd`                                                                                                                                |
| `flow-access-control`                                  | The scope of each read and write                     | `grill-me`, `grill-with-docs`, `to-spec`, `to-tickets`, `diagnosing-bugs`, `implement`, `tdd`                                                                                                             |
| `flow-design-tests`                                    | Which tests to write, through which surface          | `tdd` (its seams are the surfaces of this skill), `to-spec` (Testing Decisions), `to-tickets`, `diagnosing-bugs` (the regression test), `implement`                                                       |
| `flow-code-placement` and `flow-pattern-object-design` | Where code goes, and when an abstraction is allowed  | `codebase-design`, `improve-codebase-architecture`, `to-tickets` (prefactoring), `implement`, `tdd`                                                                                                       |
| `flow-apply`                                           | Feature packs, such as auth, passkeys and two-factor | `to-spec`, `to-tickets`, `implement`                                                                                                                                                                      |

In a grilling session, a decision that a Flow skill settles is not a question for the user. State the answer of the Flow skill instead.
