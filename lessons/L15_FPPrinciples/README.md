# L15 · Functional Programming Principles in Java

**Module 3 · Functional Design in Modern Java** · Java 8 → Java 21 · ITGreenZone

| Deliverable | File |
|---|---|
| Slides (15, with speaker notes) | [L15_FPPrinciples_Slides.pptx](L15_FPPrinciples_Slides.pptx) |
| Interactive quiz (10 Qs, offline) | [L15_FPPrinciples_Quiz.html](L15_FPPrinciples_Quiz.html) |
| Cheat sheet (p.1) + sticky notes (p.2) | [L15_FPPrinciples_CheatSheet.pdf](L15_FPPrinciples_CheatSheet.pdf) |
| Handwritten sketch notes | [L15_FPPrinciples_SketchNotes.pdf](L15_FPPrinciples_SketchNotes.pdf) |
| Code | [`com.itgreenzone.fp.l15_fp_principles`](../../src/main/java/com/itgreenzone/fp/l15_fp_principles) |

## 1. Learning objectives
1. Write pure functions, explain referential transparency, and keep side effects (clock, I/O) at the edges.
2. Make records truly immutable with compact constructors, `List.copyOf` and withers; tell a view from a copy.
3. Write higher-order functions: factories that return functions, and functions that take functions.
4. Use currying and partial application to specialise general functions.
5. Compose pipelines with `andThen`, `compose` and `reduce(identity(), andThen)`; use Supplier laziness and memoize safely.

## 2. Why it matters
Business rules change constantly: fees, discounts, eligibility. When they are fused into one stateful method, every
change is risky and nothing can be tested alone. Small pure functions that compose, immutable values, and
side effects pushed to the edges give code that is easy to test, reorder, audit and run concurrently. L01 introduced
these ideas; this lesson turns them into design tools.

## 3. Theory
* **Purity:** a pure function depends only on its arguments and has no side effects.
  * Reading `LocalDate.now()` makes a function impure. Pass the date in, or inject a `Clock` at the edge
    (`Clock.fixed` in tests).
  * **Referential transparency:** a pure call can be replaced by its value.
  * **Functional core, imperative shell:** pure calculations in the middle, I/O at the edges.
* **Immutability:**
  * Records `[16]` make fields final but are only shallowly immutable. Copy mutable components with
    `List.copyOf` `[10]` in the compact constructor; it also rejects nulls.
  * `Collections.unmodifiableList` is a read-only view: changes to the source show through.
  * Use withers (`withClosing`) instead of setters.
* **Higher-order functions:** factories such as `percentOff(10)` and `debitAbove(limit)` return functions;
  `applyTimes(f, n, x)` takes one.
* **Currying:** `BiFunction<A, B, R>` becomes `Function<A, Function<B, R>>`. **Partial application** fixes some
  arguments now and returns a function of the rest. Java has no syntax for either, so use them where they remove repetition.
* **Composition:** `f.andThen(g)` = g(f(x)); `f.compose(g)` = f(g(x)). `Function.identity()` is the neutral
  element, so `steps.stream().reduce(identity(), Function::andThen)` folds any list of steps into one function.
* **Laziness:** a `Supplier` is a computation not yet run. `orElse(x)` evaluates `x` always; `orElseGet(supplier)`
  only when needed. Supplier-based log messages are built only when the level is on.
* **Memoization:** cache the results of a pure function, for example with `ConcurrentHashMap.computeIfAbsent`.
  Only for pure functions, with a bounded key set, and never with a mapping function that modifies the same map:
  recursive `computeIfAbsent` throws `ConcurrentModificationException` on `HashMap`, and the `ConcurrentHashMap`
  Javadoc forbids it.

## 4. Visual explanation
* Slide 3: functional core, imperative shell.
* Slide 7: andThen vs compose and the pipeline fold.
* Slide 9: memoization and the computeIfAbsent trap.
* Slide 10: rules as data with an audit trail.
* Sketch notes: the egg diagram (core and shell), shallow records, the fee pipeline.

## 5. API reference

| API | Purpose | Since |
|---|---|---|
| `Function.andThen / compose / identity` | composition | Java 8 |
| `UnaryOperator`, `BiFunction`, `Supplier`, `Predicate` | functional interfaces | Java 8 |
| `Predicate.and / or / negate` | combine conditions | Java 8 |
| `Predicate.not` | negate a method reference | Java 11 |
| `Optional.orElseGet` | lazy default | Java 8 |
| `Clock.fixed`, `LocalDate.now(Clock)` | testable time | Java 8 |
| `List.of` / `List.copyOf` | immutable lists | Java 9 / 10 |
| `Collections.unmodifiableList` | read-only view | Java 1.2 |
| `record` + compact constructor | validated immutable values | Java 16 |
| `Map.computeIfAbsent` | memoization (non-recursive) | Java 8 |

## 6. Worked examples (real output)

| Example | Class | Output |
|---|---|---|
| Pure, date as a parameter | `theory.PurityAndEdges` | `[POL-509 in 5 days, POL-505 in 13 days, POL-502 in 23 days, POL-508 in 28 days]` |
| Clock at the edge | `theory.PurityAndEdges` | same list via `Clock.fixed` |
| Naive vs safe record | `theory.ImmutabilityInDepth` | `[T009, T012, T999]` vs `[T009, T012]` |
| View vs copy | `theory.ImmutabilityInDepth` | `view=[A, B] copy=[A]` |
| Factory, applied 3 times | `theory.HigherOrderFunctions` | `1116.45` · `904.33` |
| Curried and partial fee | `theory.HigherOrderFunctions` | `3.58` · standard / premium `3.58 / 1.43` |
| andThen vs compose | `theory.HigherOrderFunctions` | `andThen=30 compose=12` |
| Pipeline fold | `theory.HigherOrderFunctions` | `1189.68` · empty pipeline `1240.50` |
| orElse vs orElseGet | `theory.LazinessAndMemoization` | `orElse evaluated=1, orElseGet evaluated=0` |
| Memoized FX rate | `theory.LazinessAndMemoization` | `12 calls, 2 real lookups` |
| Recursive computeIfAbsent | `theory.LazinessAndMemoization` | `HashMap.computeIfAbsent -> ConcurrentModificationException` · fixed `fib(90) = 2880067194370816120` |
| Before: one stateful class | `before.LegacyFeeCalculator` | `T023 914.46 USD -> fee 10.00` … `TOTAL FEES {SGD=42.95, USD=16.66} on 45 debits` |
| After: small composed functions | `after.FunctionalFeeCalculator` | same 5 lines |
| Modern: rules as data + audit trail | `modern.FeePipeline` | same 5 lines · `audit T023: [base=2.29, min=2.29, fx=11.43, cap=10.00]` |

Fee rules for this lesson: 0.25% base, minimum 0.50, +1.00% FX surcharge for non-SGD, cap 10.00. A fee is charged
in the transaction's currency, so totals are kept per currency.

## 7. Best practices
* Pass dates, clocks and other environment values in; keep I/O at the edges.
* Copy mutable components in compact constructors; prefer `List.copyOf` over `unmodifiableList`.
* Return new values with withers; avoid setters.
* Write small named functions and compose them; turn rule lists into data when they change often.
* Use `orElseGet` and Supplier overloads for expensive or optional work.
* Memoize only pure functions with a bounded key set; never modify a map inside its own `computeIfAbsent`.

## 8. Pitfalls and anti-patterns
| Anti-pattern | Problem | Fix |
|---|---|---|
| `LocalDate.now()` inside business logic | untestable, changes daily | date or `Clock` parameter |
| record with a mutable `List` component | caller can change it | `List.copyOf` in the compact constructor |
| `unmodifiableList` treated as immutable | it is a view | `List.copyOf` |
| one method with fused rules and fields | no reuse, no isolated tests, hidden state | small pure functions, composed |
| `orElse(expensive())` | always evaluated | `orElseGet(...)` |
| memoizing an impure function | stale or wrong results | memoize pure functions only |
| recursive `computeIfAbsent` | CME / ISE / hang | get, compute outside, put |

## 9. Java 8 → 21 evolution
* Java 8: `java.util.function`, `andThen`/`compose`/`identity`, `Optional.orElseGet`, `Clock`, `computeIfAbsent`.
* Java 9: `List.of`/`Set.of`/`Map.of`; `HashMap.computeIfAbsent` detects concurrent modification by the mapping function.
* Java 10: `List.copyOf`/`Set.copyOf`/`Map.copyOf`; `var`.
* Java 11: `Predicate.not`.
* Java 16: records (compact constructors for validation and defensive copies).
* Java 21: record patterns and pattern matching for `switch` (L16) make immutable data easy to take apart.

## 10. Interview questions
1. **What is referential transparency?** A call can be replaced by its value without changing behaviour; it requires purity.
2. **Are records immutable?** Shallowly: fields are final, but mutable components must be copied in the compact constructor.
3. **Currying vs partial application?** Currying turns f(a, b) into a → b → r; partial application fixes some arguments now.
4. **andThen vs compose?** `f.andThen(g)` = g(f(x)); `f.compose(g)` = f(g(x)).
5. **When is memoization unsafe?** For impure functions, with unbounded caches, or with recursive `computeIfAbsent`.

## 11. Hands-on exercise (~40 min)
`exercise.Exercise15` builds a **composable renewal-quote pipeline** for insurance premiums from small pure functions.
The quote is premium → tier discount (SILVER 0%, GOLD 5%, PLATINUM 10%) → 25.00 off only if the price is still over
500.00 → +9% GST. You write:
* `percentOff`, `flatOff` (never below 0.00), `capAt`, `addGst`.
* `pipeline` (identity for an empty list).
* A curried `RISK_LOADING`.
* `TIER_DISCOUNT` as a BiFunction, partially applied in `tierDiscount`.
* A conditional `when`.
* `renewalQuote` and `renewalQuotes`: POL-502 → `1257.29`; all ten → `{POL-501=1888.43, …, POL-510=848.01}`.

Remove `@Disabled` in `Exercise15Test`. Reference solution: `solution.Solution15`.

## 12. Pros and cons
| Pros | Cons / limitations |
|---|---|
| Pure functions are trivial to test | Java has no currying syntax |
| Immutable values are thread-safe | Generic signatures get long |
| Small rules compose and reorder | More small objects (withers) |
| Rules as data: change config, not code | Teams need shared conventions |
| Clock at the edge: stable tests | Debugging lambda chains is harder |
| Audit trails come for free | Not everything should be curried |

## 13. Summary
* Pure core, side effects at the edges; inject the clock.
* Records are shallow: copy collections, use withers.
* Factories, currying and partial application specialise functions.
* Compose with `andThen`/`compose` and `reduce(identity(), andThen)`.
* Supplier for laziness; memoize pure functions only, never recursively with `computeIfAbsent`.

**Next:** L16 Records, Sealed Types & Pattern Matching (Java 16–21).

---

## How to run
**IntelliJ IDEA:** open the repo as a Maven project (JDK 21) and click ▶ next to any `main()`.

**Maven:**
```bash
mvn test
mvn -q compile exec:java -Dexec.mainClass=com.itgreenzone.fp.l15_fp_principles.modern.FeePipeline
```

## Concept → class

| Concept | Class | Test |
|---|---|---|
| Purity, Clock injection, referential transparency | `theory.PurityAndEdges` | `FPPrinciplesTest` |
| Shallow records, views vs copies, withers | `theory.ImmutabilityInDepth` | `FPPrinciplesTest` |
| Factories, currying, partial application, composition | `theory.HigherOrderFunctions` | `FPPrinciplesTest` |
| Supplier laziness, memoization, computeIfAbsent trap | `theory.LazinessAndMemoization` | `FPPrinciplesTest` |
| Fee module: fused class → functions → rules as data | `before.*`, `after.*`, `modern.*` | `FeeModuleRefactoringTest` |
| Renewal-quote pipeline | `exercise.Exercise15`, `solution.Solution15` | `Exercise15Test` (disabled), `Solution15Test` |
| Every `main()` output | all of the above | `MainOutputTest` (golden files) |
| Quiz "predict the output" answers | n/a | `QuizAnswersTest` |
