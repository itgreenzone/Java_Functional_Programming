# L01 · Why Functional Programming in Java

**Module 1 · Functional Foundations** · Java 8 → Java 21 · ITGreenZone

| Deliverable | File |
|---|---|
| Slides (15, with speaker notes) | [L01_WhyFP_Slides.pptx](L01_WhyFP_Slides.pptx) |
| Interactive quiz (10 Qs, offline) | [L01_WhyFP_Quiz.html](L01_WhyFP_Quiz.html) |
| Cheat sheet (p.1) + sticky notes (p.2) | [L01_WhyFP_CheatSheet.pdf](L01_WhyFP_CheatSheet.pdf) |
| Handwritten sketch notes | [L01_WhyFP_SketchNotes.pdf](L01_WhyFP_SketchNotes.pdf) |
| Code | [`com.itgreenzone.fp.l01_why_fp`](../../src/main/java/com/itgreenzone/fp/l01_why_fp) |

## 1. Learning objectives
1. Explain the difference between imperative (HOW) and declarative (WHAT) code.
2. Say what "functional" means in Java, and what it does not.
3. Refactor a strategy class → anonymous class → lambda → stream (behaviour parameterisation).
4. Name the core ideas: functions as values, immutability, pure functions, laziness.
5. Place each functional feature on the Java 8 → 21 timeline.

## 2. Why it matters
Before Java 8, the business rule "amount > 1,000.00" was buried in loops, `if`s and mutable
accumulators, and passing a rule around meant writing a whole class. Every new rule copied the loop.
Functional style puts the rule in front and lets the library run the loop.

## 3. Theory
* **Imperative** code says *how*: loop, condition, mutable state. **Declarative** code says *what*: filter, map, reduce. `[Java 8]`
* **Java is object-oriented with functional features.** It is not a pure FP language: data is mutable by default, side effects are allowed, there is no tail-call optimisation. Functional style is a discipline you choose.
* **Behaviour parameterisation:** write the algorithm once and pass the behaviour (the rule) as an argument.
* **Functional interface:** any interface with exactly one abstract method. A lambda can implement it, even if it was written before Java 8, because of **target typing**. `[Java 8]`
* **Core ideas:** functions as values `[Java 8]`, immutability (`List.of` `[Java 9]`, records `[Java 16]`), pure functions, laziness of streams `[Java 8]`.

## 4. Visual explanation
See slide 5 (code shrink: ~13 → 6 → 1 lines), slide 11 (conveyor belt) and both sketch-note pages.

## 5. API reference

| API | Signature | Returns | Since | Use in L01 |
|---|---|---|---|---|
| `Predicate<T>` | `boolean test(T t)` | boolean | Java 8 | the high-value rule |
| `Function<T,R>` | `R apply(T t)` | R | Java 8 | `ADD_GST`, `discountOf` |
| `Function.andThen` | `andThen(Function<? super R,? extends V>)` | `Function<T,V>` | Java 8 | discount, then GST |
| `Stream.filter` | `filter(Predicate<? super T>)` | `Stream<T>` | Java 8 | keep matches |
| `Stream.map` | `map(Function<? super T,? extends R>)` | `Stream<R>` | Java 8 | Transaction → id |
| `Stream.reduce` | `reduce(T identity, BinaryOperator<T>)` | T | Java 8 | sum `BigDecimal` |
| `Collectors.toList` | `toList()` | Collector → List | Java 8 | no mutability guarantee |
| `List.of` | `of(E... elements)` | immutable `List<E>` | Java 9 | sample data |
| `Predicate.not` | `not(Predicate<? super T>)` | `Predicate<T>` | Java 11 | count the rest |
| `Stream.toList` | `toList()` | unmodifiable `List<T>` | Java 16 | results |
| `record` | `record Transaction(...)` | data carrier | Java 16 | immutable data |

## 6. Worked examples (real output)

| Step | Class | Output |
|---|---|---|
| Imperative vs declarative | `theory.ImperativeVsDeclarative` | `Total debits: 16692.44` (both) |
| 1 Strategy class | `before.StrategyClassDemo` | `11 over 1000.00 [T003, T019, T025, T026, T027, T038, T039, T042, T049, T055, T056]` |
| 2 Anonymous class | `before.AnonymousClassDemo` | same 11 |
| 3 Lambda | `after.LambdaDemo` | same 11 |
| 4 Stream (Java 8) | `after.StreamDemo` | same 11 |
| 5 Modern (Java 11/16) | `modern.ModernDemo` | same 11 · `Not high value (Predicate.not): 49` |

## 7. Best practices
* Keep lambdas short; extract rules into named methods (`HighValueRule::isHighValue`).
* Prefer immutable data: records, `List.of`, `Stream.toList()`.
* One stream operation per line; no side effects in `filter`/`map`.
* Money is always `BigDecimal`, scale 2, `RoundingMode.HALF_UP`.

## 8. Pitfalls and anti-patterns
| Wrong | Fix |
|---|---|
| `stream().forEach(t -> ids.add(t.id()))` fills an outside list | `.map(Transaction::id).toList()` |
| Expecting `peek`/`map` to run without a terminal op | Add a terminal op; nothing runs otherwise |
| `double` for money | `BigDecimal` + `setScale(2, HALF_UP)` |
| Calling `add` on a `Stream.toList()` result | It is unmodifiable: `UnsupportedOperationException` |

## 9. Java 8 → 21 evolution
8 lambdas, streams, Optional · 9 `List.of`, `takeWhile` · 10 `var`, `orElseThrow()` · 11 `Predicate.not`, `var` in lambdas ·
12 `teeing` · 14 switch expressions · 16 records, `toList()`, `mapMulti` · 17 sealed classes · 21 pattern-matching switch,
record patterns, sequenced collections, virtual threads. *Beyond Java 21:* unnamed variables `_` (22), Stream Gatherers (24).

## 10. Interview questions
1. **Is Java a functional language?** No. It is OO with functional features since Java 8; data is mutable by default and side effects are allowed.
2. **What is behaviour parameterisation?** Passing behaviour as an argument so one method serves many rules: strategy → anonymous class → lambda.
3. **Imperative vs declarative?** Imperative says how (loops, state); declarative says what, and the library controls iteration, so it can be lazy or parallel.
4. **What is a pure function, and why care?** Same input → same output, no side effects. Easy to test, cache and run on many threads.
5. **Why does a lambda fit a pre-Java-8 interface?** Any interface with one abstract method is a functional interface; the lambda's target type decides which one.

## 11. Hands-on exercise (~20 min)
`exercise.LegacyBatchJobs` contains a `Comparator<Customer>` (joined date, oldest first), a
`Comparator<Account>` (balance, highest first) and a month-end `Runnable`, all as anonymous classes.
Rewrite each as a lambda in `exercise.Exercise01`, remove `@Disabled` from `Exercise01Test`, and run it.
Expected banner: `Month-end job: 15 accounts, total balance 300382.25`. Reference solution: `solution.Solution01`.

## 12. Pros and cons
| Pros | Cons / limitations |
|---|---|
| Less boilerplate: the rule is the code | Learning curve for teams new to it |
| Intent is readable: filter, map, reduce | Stack traces and debugging are harder |
| Composable: `andThen`, `and`, `or` | Small overhead (lambdas, boxing) in hot loops |
| Pure functions are easy to test | Checked exceptions fit badly in lambdas |
| Laziness and short-circuiting for free | Clever one-liners can hurt readability |
| Parallelism is opt-in, not a rewrite | Poor fit for complex, stateful control flow |

## 13. Summary
* Declarative code states WHAT; the library handles HOW.
* Java = OO + functional features since Java 8; not pure FP.
* Behaviour parameterisation: strategy → anonymous class → lambda.
* Core ideas: functions as values, immutability, purity, laziness.
* Any one-abstract-method interface accepts a lambda.

**Next:** L02 Functional Interfaces: rules and standards.

---

## How to run

**IntelliJ IDEA:** open the repo root as a Maven project (JDK 21). Every class in `theory`, `before`,
`after`, `modern` and `solution` has a `main()`; click the green ▶ next to it. Run tests with right-click
`src/test/java` → *Run 'All Tests'*.

**Maven:**
```bash
mvn test                                    # compile with -Xlint:all -Werror, run all tests
mvn -q compile exec:java -Dexec.mainClass=com.itgreenzone.fp.l01_why_fp.theory.LazinessDemo
```

## Concept → class

| Concept | Class | Test |
|---|---|---|
| Imperative vs declarative | `theory.ImperativeVsDeclarative` | `ImperativeVsDeclarativeTest` |
| Functions as values, `andThen` | `theory.FunctionsAsValues` | `CoreIdeasTest` |
| Pure vs impure | `theory.PureFunctions` | `CoreIdeasTest` |
| Immutability | `theory.ImmutabilityDemo` | `CoreIdeasTest` |
| Laziness, loop fusion, short-circuit | `theory.LazinessDemo` | `CoreIdeasTest` |
| Java 8 → 21 timeline | `theory.FeatureTimeline` | `CoreIdeasTest` |
| Shared rule | `HighValueRule` | `HighValueFilterTest` |
| Strategy class / anonymous class | `before.*` | `HighValueFilterTest` |
| Lambda / Stream | `after.*` | `HighValueFilterTest` |
| `toList()`, `Predicate.not`, `var` in lambdas | `modern.ModernDemo` | `HighValueFilterTest`, `CoreIdeasTest` |
| Exercise / solution | `exercise.*`, `solution.Solution01` | `Exercise01Test` (disabled), `Solution01Test` |
| Every `main()` output | all of the above | `MainOutputTest` (golden files) |
| Quiz "predict the output" answers | n/a | `QuizAnswersTest` |
