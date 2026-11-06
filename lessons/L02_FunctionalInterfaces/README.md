# L02 · Functional Interfaces: Rules and Standards

**Module 1 · Functional Foundations** · Java 8 → Java 21 · ITGreenZone

| Deliverable | File |
|---|---|
| Slides (15, with speaker notes) | [L02_FunctionalInterfaces_Slides.pptx](L02_FunctionalInterfaces_Slides.pptx) |
| Interactive quiz (10 Qs, offline) | [L02_FunctionalInterfaces_Quiz.html](L02_FunctionalInterfaces_Quiz.html) |
| Cheat sheet (p.1) + sticky notes (p.2) | [L02_FunctionalInterfaces_CheatSheet.pdf](L02_FunctionalInterfaces_CheatSheet.pdf) |
| Handwritten sketch notes | [L02_FunctionalInterfaces_SketchNotes.pdf](L02_FunctionalInterfaces_SketchNotes.pdf) |
| Code | [`com.itgreenzone.fp.l02_functional_interfaces`](../../src/main/java/com/itgreenzone/fp/l02_functional_interfaces) |

## 1. Learning objectives
1. State the SAM rule and list what does not count towards it.
2. Use `@FunctionalInterface` correctly and explain why it exists.
3. Pick the right `java.util.function` interface, including primitive specialisations.
4. Compose behaviour with `andThen`, `compose`, `identity`, `and`, `or`, `negate`, `not`.
5. Decide when to write a custom functional interface and when to reuse a built-in.

## 2. Why it matters
Before Java 8 every project invented its own one-method interfaces (`PaymentCheck`, `AmountTransformer`…)
and re-wrote combinators like `AndCheck` and `NotCheck`. One rule, "settle today = SUCCESS and amount ≥ 100.00
and not PayPal", needed five classes, and no library could accept those private types.

## 3. Theory
* **Functional interface** = an interface with **exactly one abstract method** (SAM). `[Java 8]`
* **Do not count:** `default` and `static` methods `[Java 8]`, `private` methods `[Java 9]`, and abstract re-declarations of public `Object` methods (`equals`, `hashCode`, `toString`). That is why `Comparator` (with `compare` and `equals`) is still functional.
* **Generic SAMs** are fine: `Converter<A, B> { B convert(A from); }`.
* **`@FunctionalInterface`** `[Java 8]` is optional. It makes the compiler check the rule at the interface and documents intent.
* **Older SAMs** became functional for free: `Runnable` `[1.0]`, `Comparator` `[1.2]`, `FileFilter` `[1.2]`, `Callable` `[5]`.

## 4. Visual explanation
Slide 3 (interface anatomy), slide 5 (four shapes), slide 8 (composition), and the sketch notes
(plug-and-socket SAM, guard-dog annotation, four shape doodles, composition train, boxing).

## 5. API reference

| Interface | Method | Signature | Typical use | Example (real output) | Since |
|---|---|---|---|---|---|
| `Supplier<T>` | `get` | `() → T` | lazy value, factory | `STATEMENT_DATE → 2026-10-31` | Java 8 |
| `Consumer<T>` | `accept` | `T → void` | print, send, log | `PRINT_ACCOUNT → ****1001 12500.00` | Java 8 |
| `BiConsumer<T,U>` | `accept` | `(T,U) → void` | `Map.forEach` | `PRINT_PAIR → interest = 312.50` | Java 8 |
| `Function<T,R>` | `apply` | `T → R` | map, convert | `LABEL → T003 TRANSFER 1221.40` | Java 8 |
| `BiFunction<T,U,R>` | `apply` | `(T,U) → R` | two inputs | `ADD_INTEREST(12500.00, 2.5) → 12812.50` | Java 8 |
| `UnaryOperator<T>` | `apply` | `T → T` | same-type transform | `MASK("ACC-1001") → ****1001` | Java 8 |
| `BinaryOperator<T>` | `apply` | `(T,T) → T` | reduce, merge | `ADD(120.00, 45.50) → 165.50` | Java 8 |
| `Predicate<T>` | `test` | `T → boolean` | filter | `OVERDRAWN → [ACC-1013]` | Java 8 |
| `BiPredicate<T,U>` | `test` | `(T,U) → boolean` | check a pair | `HAS_TIER(Alice, GOLD) → true` | Java 8 |
| `ToIntFunction<T>` | `applyAsInt` | `T → int` | `mapToInt` | `BOOKED` sum → `1808` | Java 8 |
| `IntPredicate` | `test` | `int → boolean` | no boxing | nearly full → `[TR808, SQ21]` | Java 8 |
| `IntUnaryOperator` | `applyAsInt` | `int → int` | int math | `471 → 518` | Java 8 |
| `Predicate.not` | static | `not(Predicate<? super T>)` | negate a method ref | not large → `49` | Java 11 |

## 6. Worked examples (real output)

| Example | Class | Output |
|---|---|---|
| Domain SAM with default/static/private | `theory.SamRules` | `T003:1221.40 -> card fee 1.72` |
| Reflection: what counts | `theory.SamInspector` | `Comparator functional=true counted=[compare]` |
| Catalogue | `theory.BuiltInCatalogue` | see table above |
| Primitives | `theory.PrimitiveSpecialisations` | `Total booked seats: 1808` |
| Composition | `theory.Composition` | `andThen 110.09 · compose 110.00 · pipeline 111.09` |
| Older SAMs | `theory.OlderSams` | `Callable -> settled total 2999.19` |
| Before: 5 classes | `before.LegacyPaymentChecks` | `[P001, P005, P010]` |
| After: Predicate composition | `after.PaymentRules` | `[P001, P005, P010]` |
| Modern (9–21) | `modern.ModernInterfaces` | `> 5000.00: [T025, T027, T038, T049, T055, T056] · cashback 123.43` |

## 7. Standards and best practices
* Write a **custom** functional interface when the name adds domain meaning (`FeeRule`, `FraudRule`), when the method must throw a checked exception, or when you need 3+ parameters (`TriFunction`).
* Otherwise **reuse** `java.util.function`: it works with streams, `Optional`, collections and every library.
* Naming: role noun for the interface, verb for the method (`FeeRule.feeFor`, `FraudRule.flags`).
* Always annotate your own SAMs with `@FunctionalInterface`.
* Use primitive specialisations for numeric values; keep `Function`s pure, put side effects in `Consumer`s at the edges.

## 8. Pitfalls and anti-patterns
| Wrong | Fix |
|---|---|
| Overloading `run(Supplier<String>)` and `run(Callable<String>)`, then `run(() -> "x")` → *reference to run is ambiguous* | Different names: `runSupplier`, `runCallable` |
| Adding a 2nd abstract method to a widely used SAM | `@FunctionalInterface` makes the build fail at the interface |
| `Function<Flight, Integer>` in a hot stream | `ToIntFunction<Flight>` + `mapToInt` |
| A `Function` that logs or mutates state | Pure `Function`; side effects in a `Consumer` |

Both compiler errors are proved by `FunctionalInterfaceRulesTest`, which compiles the snippets with the real JDK compiler.

## 9. Java 8 → 21 evolution
8 `java.util.function`, `@FunctionalInterface`, default and static interface methods · 9 private interface methods ·
11 `Predicate.not`, `var` in lambda parameters · 14 switch expressions (as lambda bodies) · 16 records implementing
functional interfaces · 21 pattern matching for switch (L16).

## 10. Interview questions
1. **What makes an interface functional?** Exactly one abstract method; default, static, private and public `Object` methods do not count.
2. **Is `@FunctionalInterface` required?** No. It adds a compile-time check and documents intent.
3. **Supplier vs Callable?** Same shape `() → T`, but `Callable.call()` can throw a checked exception.
4. **Why `IntPredicate` instead of `Predicate<Integer>`?** It avoids boxing ints into `Integer` objects.
5. **`andThen` vs `compose`?** `f.andThen(g)` runs f then g; `f.compose(g)` runs g then f.

## 11. Hands-on exercise (~25 min)
Build a small fraud rule engine in `exercise.Exercise02`:
* large debit = DEBIT and amount > 900.00 · foreign currency = not SGD
* suspicious = (large debit AND TRANSFER) OR foreign currency → expected `[T003, T010, T023, T036, T042, T050, T057]`
* finish the default `FraudRule.or` and `TriFunction.andThen`, and write `transferFee()` as a `TriFunction` (2500.00 at 0.5%, min 1.00 → 12.50).

Remove `@Disabled` from `Exercise02Test`. Reference solution: `solution.Solution02`.

## 12. Pros and cons
| Pros | Cons / limitations |
|---|---|
| One shared vocabulary across all libraries | 43 interfaces in `java.util.function` to learn |
| Free combinators: `and`, `or`, `andThen`, `compose` | No checked exceptions in built-in methods |
| Lambdas and method references just work | Stops at two parameters (`Bi…`) |
| Custom SAMs give domain names | Generic signatures can be hard to read |
| Primitive versions avoid boxing | Overloading by SAM type causes ambiguity |

## 13. Summary
* SAM: exactly one abstract method; default, static, private and `Object` methods do not count.
* `@FunctionalInterface`: optional, but always use it on your own.
* Four shapes: Supplier, Consumer, Function, Predicate (+ Bi, Operator, primitives).
* Compose with `andThen`/`compose`, `and`/`or`/`negate`/`not`.
* Custom SAM for domain names, checked exceptions, 3+ parameters.

**Next:** L03 Lambda Expressions in Depth.

---

## How to run
**IntelliJ IDEA:** open the repo as a Maven project (JDK 21) and click ▶ next to any `main()`.

**Maven:**
```bash
mvn test
mvn -q compile exec:java -Dexec.mainClass=com.itgreenzone.fp.l02_functional_interfaces.theory.Composition
```

## Concept → class

| Concept | Class | Test |
|---|---|---|
| SAM rule, default/static/private, generic SAM | `theory.SamRules` | `FunctionalInterfaceRulesTest` |
| What counts (reflection) | `theory.SamInspector` | `FunctionalInterfaceRulesTest` |
| `@FunctionalInterface` error, overload ambiguity | `theory.OverloadingStandards` | `FunctionalInterfaceRulesTest` (real compiler) |
| `java.util.function` catalogue | `theory.BuiltInCatalogue` | `CatalogueAndCompositionTest` |
| Primitive specialisations | `theory.PrimitiveSpecialisations` | `CatalogueAndCompositionTest` |
| Composition | `theory.Composition` | `CatalogueAndCompositionTest` |
| Runnable, Callable, Comparator, FileFilter | `theory.OlderSams` | `CatalogueAndCompositionTest` |
| Custom interface + combinator classes | `before.LegacyPaymentChecks` | `BeforeAfterModernTest` |
| Predicate composition | `after.PaymentRules` | `BeforeAfterModernTest` |
| Record implementing Predicate, switch in Function | `modern.ModernInterfaces` | `BeforeAfterModernTest` |
| Exercise / solution | `exercise.*`, `solution.*` | `Exercise02Test` (disabled), `Solution02Test` |
| Every `main()` output | all of the above | `MainOutputTest` (golden files) |
| Quiz "predict the output" answers | n/a | `QuizAnswersTest` |
