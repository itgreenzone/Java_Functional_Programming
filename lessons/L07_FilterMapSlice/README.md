# L07 · Filtering, Mapping & Slicing

**Module 2 · Stream API** · Java 8 → Java 21 · ITGreenZone

| Deliverable | File |
|---|---|
| Slides (15, with speaker notes) | [L07_FilterMapSlice_Slides.pptx](L07_FilterMapSlice_Slides.pptx) |
| Interactive quiz (10 Qs, offline) | [L07_FilterMapSlice_Quiz.html](L07_FilterMapSlice_Quiz.html) |
| Cheat sheet (p.1) + sticky notes (p.2) | [L07_FilterMapSlice_CheatSheet.pdf](L07_FilterMapSlice_CheatSheet.pdf) |
| Handwritten sketch notes | [L07_FilterMapSlice_SketchNotes.pdf](L07_FilterMapSlice_SketchNotes.pdf) |
| Code | [`com.itgreenzone.fp.l07_filter_map_slice`](../../src/main/java/com/itgreenzone/fp/l07_filter_map_slice) |

## 1. Learning objectives
1. Filter safely, including `BigDecimal` money (`compareTo`, not `equals`).
2. Map to new types and to primitive streams (`mapToInt/Long/Double`, `mapToObj`, `boxed`).
3. Flatten one-to-many data with `flatMap`, and know when `mapMulti` `[Java 16]` is the better choice.
4. Remove duplicates with `distinct` (equals/hashCode, records) and use `peek` only to debug.
5. Slice by position (`limit`, `skip`, pagination) and by condition (`takeWhile`, `dropWhile` `[Java 9]`) on sorted input.

## 2. Why it matters
These ten operations are the vocabulary of almost every stream you will write. Most production stream bugs are
not about syntax but about choosing the wrong one: `map` where `flatMap` was needed, `takeWhile` on unsorted data,
`equals` on money, `distinct` on a class without `equals`, or business logic hidden in `peek`.

## 3. Theory
* **`filter(Predicate)`** `[8]` keeps the elements for which the predicate is true. Chained filters and one filter with `and` give the same result. `Predicate.not` `[11]` negates a method reference.
* **`map(Function)`** `[8]`: one in, one out. The count and order never change; the type may.
* **`mapToInt/Long/Double`** `[8]` switch to primitive streams (no boxing; `sum`, `average` built in). **`mapToObj`** and **`boxed`** go back to objects.
* **`flatMap(T → Stream<R>)`** `[8]`: each element becomes 0..n elements, all merged into one stream. `map` with the same function gives `Stream<List<R>>`.
* **`mapMulti(BiConsumer<T, Consumer<R>>)`** `[16]`: the same as `flatMap`, but you push results with `down.accept(r)`. There is no Stream per element, so it suits 0 or 1 results. It often needs a type witness: `.<String>mapMulti(...)`.
* **`distinct()`** `[8]` uses `equals`/`hashCode` and keeps the first occurrence. It is stateful. Records get `equals` for free. `BigDecimal` 1.0 and 1.00 are not equal.
* **`peek(Consumer)`** `[8]` is for debugging. Since Java 9, `count()` may skip the pipeline on a sized source, so `peek` may never run.
* **`limit(n)` / `skip(n)`** `[8]` slice by position; `limit` short-circuits. Pagination is `skip((page - 1) * size).limit(size)`.
* **`takeWhile` / `dropWhile`** `[9]` slice by condition and stop at the first element that fails. They equal `filter` only on input sorted by that condition.

## 4. Visual explanation
* Slide 5: customer → account → transaction with `flatMap`.
* Slide 7: what `distinct` removes.
* Slide 8: `peek` skipped by `count()`.
* Slide 10: the takeWhile "STOP at P003" boxes.
* Sketch notes: the sieve, the stamping machine, opening boxes onto one belt, the bouncer, and the page strip.

## 5. API reference

| Operation | Shape | Notes | Since |
|---|---|---|---|
| `filter(Predicate<T>)` | n → ≤ n | stateless | Java 8 |
| `Predicate.not(p)` | helper | negate a method reference | Java 11 |
| `map(Function<T,R>)` | 1 → 1 | type may change | Java 8 |
| `mapToInt` / `mapToLong` / `mapToDouble` | 1 → 1 | primitive stream | Java 8 |
| `mapToObj` / `boxed` | 1 → 1 | back to objects | Java 8 |
| `flatMap(Function<T, Stream<R>>)` | 1 → 0..n | flattens | Java 8 |
| `mapMulti(BiConsumer<T, Consumer<R>>)` | 1 → 0..n | no Stream per element | Java 16 |
| `distinct()` | n → ≤ n | stateful; equals/hashCode | Java 8 |
| `peek(Consumer<T>)` | 1 → 1 | debug only | Java 8 |
| `limit(long)` / `skip(long)` | by position | `limit` short-circuits | Java 8 |
| `takeWhile` / `dropWhile` | by condition | sorted input; `takeWhile` short-circuits | Java 9 |

## 6. Worked examples (real output)

| Example | Class | Output |
|---|---|---|
| Practice 1: debits > 500.00 | `theory.Filtering` | `[T003, T005, T010, T023, T026, T028, T036, T042, T050, T052, T057]` |
| BigDecimal equals vs compareTo | `theory.Filtering` | `500.0 vs 500.00 : equals=false, compareTo=0` |
| Practice 2: names uppercase | `theory.Mapping` | `[ALICE TAN, BALA KUMAR, CHEN WEI, …]` |
| Primitive maps | `theory.Mapping` | `1808 seats booked` · `84.1% load factor` · `boxed : [16, 63, 6, 62, 27, 52, 2, 42]` |
| Practice 3: GOLD transactions | `theory.FlatMapping` | 19 ids, `[T009, T012, T017, T018, T005, …]`, the same with `mapMulti` |
| mapMulti, 0 or 1 result | `theory.FlatMapping` | `>= 95% full : [SQ318, TR808, SQ21]` |
| Practice 4: distinct cities | `theory.DistinctAndPeek` | `[Singapore, Kuala Lumpur, Jakarta, Colombo, Bangkok]` |
| distinct and equals | `theory.DistinctAndPeek` | `records 9 of 10` · `no equals 10 of 10` · `1.0, 1.00 → 2` |
| peek skipped by count | `theory.DistinctAndPeek` | `count=12 peeked=0 \| with filter: count=2 peeked=12` |
| Practice 5 and 6: first 5, pages | `theory.Slicing` | `page 2 : [T006 … T010]` · `page 13 : []` |
| takeWhile gotcha | `theory.Slicing` | `takeWhile [P001, P002]` vs `filter` 8 payments |
| Before: nested loops | `before.LegacyGoldStatement` | `page 1: [2026-10-30 T060 ACC-1011 INSURANCE 194.28, …]` |
| After: flatMap pipeline | `after.StreamGoldStatement` | same pages |
| Modern: lookup maps, `mapMulti`, record | `modern.ModernGoldStatement` | same pages, as `StatementLine` records |

## 7. Best practices
* Filter early, so `map` and `sorted` have less work.
* Name predicates and combine them with `and`, `or` and `Predicate.not`.
* Use primitive streams for counts and ratios; keep money in `BigDecimal`.
* Use `flatMap` when you already have a collection or stream; use `mapMulti` for 0..1 results computed with `if`s.
* Sort with a tie-breaker before `limit`/`skip`. For large data, page in the database (`OFFSET`/`FETCH`).
* Use `takeWhile`/`dropWhile` only on input sorted by the same condition.
* Use `Locale.ROOT` in `toUpperCase` for machine-independent results.

## 8. Pitfalls and anti-patterns
| Anti-pattern | Problem | Fix |
|---|---|---|
| `amount.equals(new BigDecimal("500.00"))` | misses `500.0` (scale) | `compareTo(...) == 0` |
| `map(c -> accountsOf(c))` | `Stream<List<Account>>` | `flatMap(c -> accountsOf(c).stream())` |
| `takeWhile` on unsorted input | stops at the first failure: 2 instead of 8 | `filter`, or sort first |
| `distinct` on a class without `equals` | nothing removed | a record, or `equals`/`hashCode` |
| `peek(audit::save).count()` | may never run (Java 9+) | `forEach` or a loop |
| `mapToDouble(Transaction::amount)` | rounding errors on money | stay with `BigDecimal` (L09, L12) |
| `flatMap` that scans a list per element | hidden O(n×m) | build a lookup map first (see `modern`) |

## 9. Java 8 → 21 evolution
* Java 8: `filter`, `map`, `flatMap`, primitive maps, `distinct`, `peek`, `limit`, `skip`.
* Java 9: `takeWhile`, `dropWhile`; `count()` may skip the pipeline on sized sources.
* Java 11: `Predicate.not`.
* Java 16: `mapMulti`, `toList()`, and records (free `equals` for `distinct`).
* **Beyond Java 21:** Stream Gatherers (`gather`, final in Java 24) for custom intermediate operations, previewed in L13.

## 10. Interview questions
1. **map vs flatMap?** `map` turns T into R; `flatMap` turns T into a `Stream<R>` and merges all of them.
2. **flatMap vs mapMulti?** Same result. `mapMulti` pushes into a consumer, so no Stream is created per element; it is best for 0..1 results.
3. **How does distinct decide duplicates?** With `equals`/`hashCode`, keeping the first in encounter order.
4. **filter vs takeWhile?** `filter` tests every element; `takeWhile` stops at the first failure. They are the same only on sorted input.
5. **Why is peek risky?** It is for debugging; since Java 9 `count()` may not run the pipeline at all.

## 11. Hands-on exercise (~30 min)
`exercise.Exercise07` has **10 graded mini-tasks**, each with its expected result in the Javadoc:
* 1–4: `filter`, `map`, `mapToInt`.
* 5–8: `distinct`, `flatMap`, `sorted` + `limit`, pagination.
* 9–10: `takeWhile` on sorted input, and `mapMulti`.

Remove `@Disabled` from `Exercise07Test` to check your work. The expected values live in `Expected07` and are shared with
`Solution07Test`. Reference solution: `solution.Solution07`.

## 12. Pros and cons
| Pros | Cons / limitations |
|---|---|
| Each operation has one clear job | `flatMap` with lookups can hide O(n×m) scans |
| `flatMap` removes nested loops | `distinct` and `sorted` buffer elements |
| Paging without index arithmetic or exceptions | `takeWhile` is wrong on unsorted input |
| Primitive maps: no boxing, built-in sum/average | `mapMulti` often needs a type witness |
| `mapMulti`: no Stream per element | `peek` is unreliable for side effects |
| `takeWhile` stops early on sorted or infinite input | In-memory paging loads everything first |

## 13. Summary
* `filter` keeps; compare money with `compareTo`.
* `map` is 1 → 1; use primitive maps for numbers and `boxed` to go back.
* `flatMap` and `mapMulti` `[16]` are 1 → 0..n, flattened.
* `distinct` uses `equals`/`hashCode`; `peek` is only for debugging.
* `limit`/`skip` slice by position; `takeWhile`/`dropWhile` `[9]` slice by condition, on sorted input.

**Next:** L08 Sorting with Comparators.

---

## How to run
**IntelliJ IDEA:** open the repo as a Maven project (JDK 21) and click ▶ next to any `main()`.

**Maven:**
```bash
mvn test
mvn -q compile exec:java -Dexec.mainClass=com.itgreenzone.fp.l07_filter_map_slice.theory.FlatMapping
```

## Concept → class

| Concept | Class | Test |
|---|---|---|
| filter, Predicate.not, compareTo | `theory.Filtering` | `FilterMapSliceTest` |
| map, primitive maps, boxed | `theory.Mapping` | `FilterMapSliceTest` |
| flatMap, mapMulti, nested lists | `theory.FlatMapping` | `FilterMapSliceTest` |
| distinct, peek | `theory.DistinctAndPeek` | `FilterMapSliceTest` |
| limit, skip, takeWhile, dropWhile | `theory.Slicing` | `FilterMapSliceTest` |
| Refactoring nested loops → pipeline | `before.*`, `after.*`, `modern.*` | `GoldStatementRefactoringTest` |
| 10 graded mini-tasks | `exercise.Exercise07`, `solution.Solution07` | `Exercise07Test` (disabled), `Solution07Test` |
| Every `main()` output | all of the above | `MainOutputTest` (golden files) |
| Quiz "predict the output" answers | n/a | `QuizAnswersTest` |
