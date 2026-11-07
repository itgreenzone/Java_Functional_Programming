# L05 · Optional, Done Right

**Module 1 · Functional Foundations** · Java 8 → Java 21 · ITGreenZone

| Deliverable | File |
|---|---|
| Slides (15, with speaker notes) | [L05_Optional_Slides.pptx](L05_Optional_Slides.pptx) |
| Interactive quiz (10 Qs, offline) | [L05_Optional_Quiz.html](L05_Optional_Quiz.html) |
| Cheat sheet (p.1) + sticky notes (p.2) | [L05_Optional_CheatSheet.pdf](L05_Optional_CheatSheet.pdf) |
| Handwritten sketch notes | [L05_Optional_SketchNotes.pdf](L05_Optional_SketchNotes.pdf) |
| Code | [`com.itgreenzone.fp.l05_optional`](../../src/main/java/com/itgreenzone/fp/l05_optional) |

## 1. Learning objectives
1. Explain what `Optional` is for, and what it is not for.
2. Explain `orElse` vs `orElseGet` (eager vs lazy) and choose correctly.
3. Chain `map`, `flatMap` and `filter` across lookups without null checks.
4. Use the Java 9–11 API: `or`, `ifPresentOrElse`, `stream`, `orElseThrow()`, `isEmpty`.
5. Spot and fix the common anti-patterns.

## 2. Why it matters
Legacy lookups return `null` for "not found", and nothing in a signature like `Customer findCustomer(String)`
warns the caller. The result is nested null checks, or a `NullPointerException` in production when one is forgotten.

## 3. Theory
* **`Optional<T>`** `[Java 8]` is a box with zero or one value, designed as a **method return type** for "maybe no result".
* **Not designed for** fields, parameters, collections, or replacing every `null`.
* **Create:** `of(x)` (x must not be null, else NPE), `ofNullable(x)` (null → empty), `empty()`.
* **Transform:** `map` (value → value), `filter` (keep if true), `flatMap` (when the function returns `Optional`; `map` would give `Optional<Optional<T>>`).
* **Defaults:** `orElse(x)` is **eager**: `x` is evaluated before the call, even when a value is present.
  `orElseGet(supplier)` is **lazy**: the supplier runs only when empty. Constants → `orElse`; computations → `orElseGet`.
* **Primitive versions:** `OptionalInt`, `OptionalLong`, `OptionalDouble` `[Java 8]`, returned by `IntStream.max()`, `average()`…

## 4. Visual explanation
Slide 3 (box: present vs empty), slide 4 (eager vs lazy table), slide 5 (map/filter/flatMap), slide 6 (the chain),
and the sketch notes (boxes, the "backup meal" analogy for `orElse`, the relay).

## 5. API reference

| Method | Returns | Use | Since |
|---|---|---|---|
| `of(T)` / `ofNullable(T)` / `empty()` | `Optional<T>` | create | Java 8 |
| `map(Function<T,R>)` | `Optional<R>` | transform the value | Java 8 |
| `flatMap(Function<T,Optional<R>>)` | `Optional<R>` | chain lookups | Java 8 |
| `filter(Predicate<T>)` | `Optional<T>` | keep if the test passes | Java 8 |
| `orElse(T)` / `orElseGet(Supplier<T>)` | `T` | default: eager / lazy | Java 8 |
| `orElseThrow(Supplier<X>)` | `T` | domain exception | Java 8 |
| `isPresent()` / `ifPresent(Consumer)` | `boolean` / `void` | check / act | Java 8 |
| `or(Supplier<Optional<T>>)` | `Optional<T>` | fallback source | Java 9 |
| `ifPresentOrElse(Consumer, Runnable)` | `void` | both branches | Java 9 |
| `stream()` | `Stream<T>` | 0 or 1 element | Java 9 |
| `orElseThrow()` | `T` | honest `get()` | Java 10 |
| `isEmpty()` | `boolean` | `!isPresent()` | Java 11 |
| `OptionalInt/Long/Double` | `getAsInt()`… | no boxing, no `map` | Java 8 |

## 6. Worked examples (real output)

| Example | Class | Output |
|---|---|---|
| Creating | `theory.CreatingOptionals` | `ofNullable(C002) : Optional.empty` |
| Eager vs lazy | `theory.OrElseVsOrElseGet` | `orElse(C001) : Alice Tan calls: default-called` |
| map / filter / flatMap, chain | `theory.TransformingOptionals` | `chain C001 SAVINGS : Optional[447.37]` |
| Consuming, Java 9–11 API | `theory.ConsumingOptionals` | `stream : [POL-502, POL-509]` |
| Primitive optionals | `theory.PrimitiveOptionals` | `max seats left : OptionalInt[63]` |
| Anti-patterns and fixes | `theory.AntiPatterns` | `2 get() no check : get() on empty -> No value present` |
| Before: null checks | `before.LegacyStatementService` | `C001 SAVINGS -> T018 447.37` … |
| After: Optional chain | `after.OptionalStatementService` | same four lines |
| Modern: `or`, `stream`, records | `modern.ModernStatementService` | `Activity[customerId=C009, transactionId=T039, amount=4231.84]` |

## 7. Best practices
* Return `Optional` from lookups where "no result" is normal; return an empty collection for "no items".
* Prefer `map`/`flatMap`/`filter` + `orElse`/`orElseGet`/`orElseThrow` over `isPresent()` + `get()`.
* Use `orElseGet` for anything that computes, calls a database or service, logs, or allocates.
* Throw a meaningful domain exception with `orElseThrow(() -> new ...)`.
* Keep fields nullable and expose them through `Optional`-returning getters.

## 8. Pitfalls and anti-patterns
| Anti-pattern | Problem | Fix |
|---|---|---|
| `isPresent()` + `get()` | a null check with extra steps | `map(...).orElse(...)` |
| `get()` without a check | `NoSuchElementException: No value present` | `orElseThrow(() -> new DomainException(...))` |
| `Optional` field / parameter | not `Serializable`; blurs intent; extra object | nullable field + `Optional` getter; overloads |
| `Optional<List<T>>` | two ways to say "none" | an empty `List` |
| `return null;` from an `Optional` method | callers will not check: NPE | `return Optional.empty();` |
| `Optional.of(maybeNull)` | `NullPointerException` | `Optional.ofNullable(...)` |
| `orElse(expensive())` | always evaluated | `orElseGet(() -> expensive())` |

## 9. Java 8 → 21 evolution
8 `Optional`, primitive optionals · 9 `or`, `ifPresentOrElse`, `stream` · 10 `orElseThrow()` ·
11 `isEmpty()` · 16 records as results (`ModernStatementService.Activity`) · 21 pattern matching (L16) works
well on values pulled out of an `Optional`.

## 10. Interview questions
1. **What is Optional for?** A return type for "maybe no result". Not for fields, parameters or collections.
2. **orElse vs orElseGet?** `orElse`'s argument is always evaluated (eager); `orElseGet`'s supplier only runs when empty (lazy).
3. **map vs flatMap on Optional?** `map` with an `Optional`-returning function gives `Optional<Optional<T>>`; `flatMap` keeps it flat.
4. **Why avoid `get()`?** It throws `NoSuchElementException` on empty. Use the `orElse` family, or `orElseThrow()` (Java 10) to be explicit.
5. **`Optional<List<T>>` or `List<T>`?** Return an empty `List`.

## 11. Hands-on exercise (~25 min)
`exercise.LegacyPolicyService` is a policy lookup service full of null checks. Rewrite it in `exercise.Exercise05`
with `Optional`: no null checks, no `isPresent()` + `get()`, no `Optional` fields or parameters.
`Exercise05Test` compares every method with the legacy version for all 10 policies plus `POL-999` on three dates,
and expects 4 renewal reminders (course date 2026-11-07): POL-502, POL-505, POL-508, POL-509.
Remove `@Disabled` from `Exercise05Test`. Reference solution: `solution.Solution05`.

## 12. Pros and cons
| Pros | Cons / limitations |
|---|---|
| The return type documents "maybe nothing" | An extra object per call (usually negligible) |
| Forces the caller to handle the empty case | Not `Serializable`: bad for fields and DTOs |
| Flat chains replace nested null checks | Easy to misuse: `get`, `isPresent`, fields |
| Lazy defaults with `orElseGet` and `or` | Does not remove `null` from the language |
| Bridges to streams with `stream()` | Primitive versions have no `map`/`filter` |
| Domain exceptions via `orElseThrow` | Over-chaining can hurt readability |

## 13. Summary
* `Optional` = a return type for "maybe no result".
* `orElse` is eager; `orElseGet` and `or` are lazy.
* `map`, `filter`, `flatMap`: flat chains, no null checks.
* Java 9–11: `or`, `ifPresentOrElse`, `stream`, `orElseThrow()`, `isEmpty`.
* No `get()`, no `isPresent()` + `get()`, no `Optional` fields or lists.

**Module 1 complete. Next:** Module 2 · L06 Stream Fundamentals.

---

## How to run
**IntelliJ IDEA:** open the repo as a Maven project (JDK 21) and click ▶ next to any `main()`.

**Maven:**
```bash
mvn test
mvn -q compile exec:java -Dexec.mainClass=com.itgreenzone.fp.l05_optional.theory.OrElseVsOrElseGet
```

## Concept → class

| Concept | Class | Test |
|---|---|---|
| Lookups returning Optional | `theory.BankRepository` | `OptionalApiTest` |
| Creating | `theory.CreatingOptionals` | `OptionalApiTest` |
| orElse vs orElseGet | `theory.OrElseVsOrElseGet` | `OptionalApiTest` (counts calls) |
| map / filter / flatMap, chain | `theory.TransformingOptionals` | `OptionalApiTest` |
| Consuming, Java 9–11 API | `theory.ConsumingOptionals` | `OptionalApiTest` |
| Primitive optionals | `theory.PrimitiveOptionals` | `OptionalApiTest` |
| Anti-patterns and fixes | `theory.AntiPatterns` | `OptionalApiTest` |
| Refactoring null checks → Optional | `before.*`, `after.*`, `modern.*` | `StatementRefactoringTest` |
| Exercise / solution | `exercise.*`, `solution.Solution05` | `Exercise05Test` (disabled), `Solution05Test` |
| Every `main()` output | all of the above | `MainOutputTest` (golden files) |
| Quiz "predict the output" answers | n/a | `QuizAnswersTest` |
