# L03 · Lambda Expressions in Depth

**Module 1 · Functional Foundations** · Java 8 → Java 21 · ITGreenZone

| Deliverable | File |
|---|---|
| Slides (15, with speaker notes) | [L03_Lambdas_Slides.pptx](L03_Lambdas_Slides.pptx) |
| Interactive quiz (10 Qs, offline) | [L03_Lambdas_Quiz.html](L03_Lambdas_Quiz.html) |
| Cheat sheet (p.1) + sticky notes (p.2) | [L03_Lambdas_CheatSheet.pdf](L03_Lambdas_CheatSheet.pdf) |
| Handwritten sketch notes | [L03_Lambdas_SketchNotes.pdf](L03_Lambdas_SketchNotes.pdf) |
| Code | [`com.itgreenzone.fp.l03_lambdas`](../../src/main/java/com/itgreenzone/fp/l03_lambdas) |

## 1. Learning objectives
1. Write every lambda syntax form and apply the return rules.
2. Explain target typing: the same lambda text can become different interfaces.
3. Capture variables correctly (effectively final) and avoid counter hacks.
4. Predict `this` and scope in a lambda versus an anonymous class.
5. Use `var` in lambda parameters and handle checked exceptions in lambdas.

## 2. Why it matters
Anonymous classes bury one line of logic in about eight lines of ceremony. Lambdas remove that, but they are
**not** just shorter anonymous classes: `this`, scope, variable capture and exceptions follow different rules.
You need those rules to refactor safely.

## 3. Theory
* **Shape** `[Java 8]`: `(params) -> expression` or `(params) -> { statements; return value; }`.
* **Parentheses** are optional only for a single parameter with an inferred type.
* **Expression body** returns its value automatically. A **block body** needs `return` when a value is expected.
  An expression statement such as `list.add(x)` is both void-compatible (as a `Consumer`) and value-compatible (as a `Function`).
* **Target typing:** a lambda has no type of its own. Assignment, method argument, return statement, conditional `?:`
  and cast all supply the target type. `Object o = () -> "x";` does not compile.
* **Capture:** a lambda may use a local variable only if it is final or **effectively final** (never re-assigned).
  It captures a copy of the value. Fields are not copied; they are read live.
* **Scope:** a lambda adds no new scope. `this` is the enclosing instance, and a lambda parameter cannot reuse the
  name of a local variable. An anonymous class is a new scope: `this` is the anonymous object.
* **`var` in lambda parameters** `[Java 11]`: all parameters or none; useful for `final` or annotations.
  *Beyond Java 21:* the unnamed variable `_` (preview in 21, final in Java 22).
* **Checked exceptions:** the `java.util.function` methods declare no `throws`, so a checked exception cannot escape a `Function`.
* **Implementation (high level):** an anonymous class compiles to `Outer$1.class`; a lambda uses `invokedynamic` and a hidden class `[Java 15]` created at run time.

## 4. Visual explanation
Slide 3 (syntax table), slide 4 (target typing), slide 5 (capture as a backpack), slide 7 (this: window vs mirror),
slide 10 (under the hood), and the sketch notes.

## 5. Syntax and API reference

| Form / API | Example | Result | Since |
|---|---|---|---|
| No parameters | `() -> "statement ready"` | `statement ready` | Java 8 |
| One, inferred | `t -> t.id()` | `T003` | Java 8 |
| Explicit type | `(Transaction t) -> t.id()` | `T003` | Java 8 |
| Two parameters | `(a, b) -> a.add(b)` | `165.50` | Java 8 |
| Block body | `amount -> { ...; return amount.add(fee); }` | `2512.50` | Java 8 |
| `var` parameters | `(final var t) -> t.id() + "/" + t.currency()` | `T010/USD` | Java 11 |
| `Class.isHidden()` | `lambda.getClass().isHidden()` | `true` | Java 15 |
| Unnamed variable | `(a, _) -> a` | preview in 21 | Java 22 |

## 6. Worked examples (real output)

| Example | Class | Output |
|---|---|---|
| Syntax forms, void/value-compatible | `theory.SyntaxForms` | `value-compatible : true [audited, audited]` |
| Target typing and contexts | `theory.TargetTyping` | `argument context : 11` · `return context : [T010, T023]` |
| Capture and loops | `theory.VariableCapture` | `for-each capture : [SQ318, SQ12, TR808]` |
| this and scope | `theory.ThisAndScope` | `lambda this.name : payment-service` |
| var in lambdas | `theory.VarInLambdas` | `(@Audited var t): 533.03` |
| Checked exceptions, 4 patterns | `theory.CheckedExceptions` | `4 skip invalid : [120.00, 75.00]` |
| Lambda vs anonymous class | `theory.LambdaVsAnonymous` | `lambda: anonymousClass=false, hidden=true` |
| Before: anonymous classes | `before.LegacyPaymentValidator` | 4 errors (P003 ×2, P005, P012) |
| After: lambdas | `after.LambdaPaymentValidator` | same 4 errors |
| Modern: records, no null | `modern.ModernPaymentValidator` | same 4 errors |

## 7. Best practices
* Keep lambdas to one expression; more than about 3 lines → a named method (and a method reference, L04).
* No side effects in `map`/`filter`; side effects belong at the edges.
* Wrap checked exceptions once, at the boundary, and keep the original as the cause.
* Prefer method references when they read better (`Objects::nonNull`).

## 8. Pitfalls and anti-patterns (real `javac` messages)
| Wrong | javac says / problem | Fix |
|---|---|---|
| `ids.forEach(id -> count++)` | local variables referenced from a lambda expression must be final or effectively final | `filter(...).count()` |
| `AtomicInteger` / `int[]` counter in `forEach` | compiles, but hides shared mutable state; the array races in parallel | a terminal operation |
| `String id = "x"; ... id -> id.trim()` | variable id is already defined in method | rename the parameter |
| `(var a, b) -> a + b` | invalid lambda parameter declaration (cannot mix 'var' and implicitly-typed parameters) | all `var` or none |
| `Object o = () -> "x";` | incompatible types: Object is not a functional interface | cast or use a functional type |
| `map(s -> Amounts.parse(s))` | unreported exception InvalidAmountException | custom SAM, wrapper, or Optional/Result |
| Empty `catch` just to compile | errors disappear silently | wrap and keep the cause |

All of these compiler messages are proved by tests that run the real JDK compiler.

## 9. Java 8 → 21 evolution
8 lambdas, target typing, effectively final · 10 `var` for locals · 11 `var` in lambda parameters ·
15 hidden classes back lambdas at run time · 16 records as rule/error types · 21 unnamed variables `_` as preview
(final in 22).

## 10. Interview questions
1. **What does "effectively final" mean?** Never re-assigned after initialisation; the compiler treats it as final.
2. **Why must captured locals be effectively final?** The lambda captures a copy of the value; a changing local would make the copy stale and unsafe across threads.
3. **What is `this` inside a lambda?** The enclosing instance; a lambda adds no new scope, unlike an anonymous class.
4. **How do you call a method that throws a checked exception in `map()`?** A custom SAM with `throws`, a wrapper that keeps the cause, or return `Optional`/a Result.
5. **Is a lambda an anonymous class?** No: no extra `.class` file; `invokedynamic` and a hidden class; different `this` and scope rules.

## 11. Hands-on exercise (~20 min)
`exercise.LegacyPaymentScreening` has three validation rules as anonymous classes, an anonymous `Comparator`,
and a `flaggedCount` that uses an `AtomicInteger` captured by an anonymous `Consumer`. Rewrite everything in
`exercise.Exercise03` as lambdas; extract the two-condition PayNow rule into a named method; use `filter + count`.
Expected: `P005: PayNow over 1000.00: confirm with customer`, `P006: refunded: exclude from settlement`,
`P008: pending: re-check with gateway`; flagged count `3`; largest three `P005, P010, P008`.
Remove `@Disabled` from `Exercise03Test`. Reference solution: `solution.Solution03`.

## 12. Pros and cons
| Pros | Cons / limitations |
|---|---|
| Short: the code is the business rule | No checked exceptions in `java.util.function` |
| No extra class files; JVM can optimise | Effectively-final rule surprises beginners |
| Natural `this`: no `Outer.this` | Stack traces show `lambda$main$0` names |
| Captures values, not variables: safe to pass | No own state, no second method |
| Works with any functional interface | Long block lambdas hurt readability |

## 13. Summary
* `(params) -> expression` or `{ block with return }`.
* Target typing: the context decides the interface.
* Captured locals must be effectively final; no counter hacks.
* `this` = enclosing instance; no new scope, no shadowing.
* Checked exceptions: custom SAM, wrap with cause, or return a value.

**Next:** L04 Method References.

---

## How to run
**IntelliJ IDEA:** open the repo as a Maven project (JDK 21) and click ▶ next to any `main()`.

**Maven:**
```bash
mvn test
mvn -q compile exec:java -Dexec.mainClass=com.itgreenzone.fp.l03_lambdas.theory.CheckedExceptions
```

## Concept → class

| Concept | Class | Test |
|---|---|---|
| Syntax forms, return rules | `theory.SyntaxForms` | `SyntaxAndTargetTypingTest` |
| Target typing, contexts | `theory.TargetTyping` | `SyntaxAndTargetTypingTest` (incl. compiler check) |
| `var` in lambdas, `_` preview | `theory.VarInLambdas` | `SyntaxAndTargetTypingTest` (compiler checks) |
| Capture, loops, counter smells | `theory.VariableCapture` | `CaptureScopeAndExceptionsTest` (compiler check) |
| `this` and scope | `theory.ThisAndScope` | `CaptureScopeAndExceptionsTest` (compiler check) |
| Checked exceptions | `theory.CheckedExceptions`, `Amounts`, `ThrowingFunction` | `CaptureScopeAndExceptionsTest` (compiler check) |
| Under the hood | `theory.LambdaVsAnonymous` | `CaptureScopeAndExceptionsTest` |
| Refactoring legacy → lambda → modern | `before.*`, `after.*`, `modern.*` | `ValidatorRefactoringTest` |
| Exercise / solution | `exercise.*`, `solution.Solution03` | `Exercise03Test` (disabled), `Solution03Test` |
| Every `main()` output | all of the above | `MainOutputTest` (golden files) |
| Quiz "predict the output" answers | n/a | `QuizAnswersTest` |
