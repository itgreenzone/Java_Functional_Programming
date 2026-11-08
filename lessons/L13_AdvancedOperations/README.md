# L13 · Advanced Stream Operations

**Module 2 · Stream API** · Java 8 → Java 21 · ITGreenZone

| Deliverable | File |
|---|---|
| Slides (15, with speaker notes) | [L13_AdvancedOperations_Slides.pptx](L13_AdvancedOperations_Slides.pptx) |
| Interactive quiz (10 Qs, offline) | [L13_AdvancedOperations_Quiz.html](L13_AdvancedOperations_Quiz.html) |
| Cheat sheet (p.1) + sticky notes (p.2) | [L13_AdvancedOperations_CheatSheet.pdf](L13_AdvancedOperations_CheatSheet.pdf) |
| Handwritten sketch notes | [L13_AdvancedOperations_SketchNotes.pdf](L13_AdvancedOperations_SketchNotes.pdf) |
| Code | [`com.itgreenzone.fp.l13_advanced`](../../src/main/java/com/itgreenzone/fp/l13_advanced) |

## 1. Learning objectives
1. Write a custom `Collector` with `Collector.of` (supplier, accumulator, combiner, finisher, characteristics) and test it in parallel.
2. Create streams with `iterate` (with a predicate `[9]`), `generate`, `concat` and `ofNullable` `[9]`, and flatten deep structures.
3. Choose between `Map.merge`/`compute`/`computeIfAbsent` and entry-set streams for map transforms.
4. Implement batching, sliding windows, zip with index and running totals, and know when streams are a poor fit.
5. Stream a paged result set lazily with `StreamSupport`, and recognise Stream Gatherers as Beyond Java 21.

## 2. Why it matters
Real systems need aggregations that the JDK does not ship (BigDecimal statistics), batch files with control totals,
statements with running balances, and APIs that return data page by page. Knowing how to extend the Stream API,
and when to fall back to a loop, keeps this code correct and readable.

## 3. Theory
* **Collector.of** `[8]`:
  * The supplier creates a mutable container; the accumulator adds one element.
  * The combiner merges two containers; only parallel streams call it.
  * The finisher turns the container into the result, ideally an immutable record.
  * Characteristics: `UNORDERED`, `IDENTITY_FINISH`, `CONCURRENT`.
* **Sources:**
  * `Stream.iterate(seed, next)` `[8]` is infinite; `iterate(seed, hasNext, next)` `[9]` stops by itself.
  * `generate(supplier)` is infinite.
  * `concat(a, b)` keeps the order.
  * `ofNullable` `[9]` and `Optional.stream()` `[9]` give 0 or 1 element.
* **Deep flattening:** group the children by parent id first, then `flatMap` through the lookups, one level at a time.
* **Map transforms:**
  * `merge`, `compute`, `computeIfAbsent`, `replaceAll` `[8]` update a map in place, for values that arrive one by one.
  * `entrySet().stream()` + `toMap` builds a new map. Use `LinkedHashMap` to keep a sorted order.
* **Index-based tasks:**
  * Batches and windows stream over indexes with `IntStream` and `subList`.
  * Zip pairs two lists by index.
  * A running total depends on the previous result, so a loop is the right tool: the pure stream version is O(n²),
    and mutating an outside variable inside `map` breaks the stream contract.
* **Paging:** wrap a page-fetching `Iterator` with `Spliterators.spliteratorUnknownSize` and `StreamSupport.stream`.
  The stream is lazy, so short-circuiting operations stop fetching. Java 9 alternative: `iterate` + `takeWhile`.
* **Beyond Java 21:** Stream Gatherers (`Stream.gather`, `Gatherers.windowFixed`, `windowSliding`, `scan`) were
  previewed in Java 22–23 and became final in Java 24 (JEP 485). They are not used in this Java 21 codebase.

## 4. Visual explanation
* Slide 3: the five parts of `Collector.of`.
* Slide 8: batches and sliding windows over indexes.
* Slide 9: running total, loop vs quadratic stream.
* Slide 10: lazy paging and the fetch counts.
* Sketch notes: the collector assembly line, streams from nowhere, chunk and window drawings.

## 5. API reference

| API | Purpose | Since |
|---|---|---|
| `Collector.of(supplier, accumulator, combiner[, finisher], characteristics...)` | custom collector | Java 8 |
| `Stream.iterate(seed, next)` | infinite sequence | Java 8 |
| `Stream.iterate(seed, hasNext, next)` | finite sequence | Java 9 |
| `Stream.generate(supplier)` | infinite stream | Java 8 |
| `Stream.concat(a, b)` | concatenation | Java 8 |
| `Stream.ofNullable(t)` | 0 or 1 element | Java 9 |
| `Optional.stream()` | 0 or 1 element | Java 9 |
| `Map.merge / compute / computeIfAbsent / computeIfPresent / replaceAll` | in-place map updates | Java 8 |
| `Map.Entry.comparingByKey / comparingByValue` | sort entries | Java 8 |
| `StreamSupport.stream(spliterator, parallel)` | stream any source | Java 8 |
| `Spliterators.spliteratorUnknownSize(iterator, characteristics)` | Iterator → Spliterator | Java 8 |
| `takeWhile / dropWhile` | stop / skip at a condition | Java 9 |
| `Stream.gather`, `Gatherers.*` | custom intermediate operations | Java 24 (Beyond Java 21) |

## 6. Worked examples (real output)

| Example | Class | Output |
|---|---|---|
| BigDecimal statistics collector | `theory.CustomCollectors` | `count=12 sum=4429.84 min=18.80 max=1500.00 avg=369.15` · parallel equal `true` |
| Custom collector as downstream | `theory.CustomCollectors` | `CARD : count=5 sum=2070.29 min=89.90 max=999.99 avg=414.06` |
| iterate with a predicate | `theory.GeneratingAndFlattening` | `[2026-08, 2026-09, 2026-10, 2026-11]` |
| concat | `theory.GeneratingAndFlattening` | `[DEP SQ318, …, DEP SQ21, ARR GA827]` |
| Deep flattening | `theory.GeneratingAndFlattening` | `27` transactions for Singapore customers |
| merge vs toMap | `theory.MapTransforms` | `{C001=15700.50, …}` · same result `true` |
| compute | `theory.MapTransforms` | `{CURRENT=4, FIXED_DEPOSIT=2, SAVINGS=9}` |
| Sort a map by value | `theory.MapTransforms` | `{C003=163950.25, C010=68900.00, C006=36400.40}` |
| Batches | `theory.BatchesAndWindows` | `[100, 100, 50]` · `[P001..P005, P006..P010, P011..P012]` |
| Windows, zip | `theory.BatchesAndWindows` | `[[1, 2, 3], [2, 3, 4], [3, 4, 5]]` · `[SQ12=NRT, TR808=BKK, MH602=KUL]` |
| Running total | `theory.BatchesAndWindows` | `[3314.36, 9412.30, 15244.95]` (loop and O(n²) agree) |
| Lazy paging | `theory.PagingWithSpliterator` | `count: 60 rows, fetches=4` · `findFirst: T001, fetches=1` |
| Before: 4 hand-synced maps | `before.LegacyPaymentStats` | `CARD: count=5 sum=2070.29 min=89.90 max=999.99 avg=414.06` … |
| After: 4 groupingBy passes | `after.StreamPaymentStats` | same 3 lines |
| Modern: one pass, custom collector | `modern.ModernPaymentStats` | same 3 lines |

## 7. Best practices
* Test every custom collector sequentially and in parallel; handle an empty side in the combiner.
* Keep the container private and mutable, and return an immutable record from the finisher.
* Always bound `generate`/`iterate` with `limit` or a predicate.
* Use `merge`/`compute` for one-by-one updates and streams to build new maps; collect sorted entries into a `LinkedHashMap`.
* Use `IntStream` indexes for batches and windows; use a loop for running totals.
* Never add amounts in different currencies: filter or group by currency first.
* Page lazily and let short-circuiting operations stop the fetching.

## 8. Pitfalls and anti-patterns
| Anti-pattern | Problem | Fix |
|---|---|---|
| Combiner that ignores an empty side or forgets counts | wrong only in parallel | handle both sides; parallel test |
| `Stream.generate(..)` without `limit` | never ends | `limit(n)` or `iterate` with a predicate |
| `acc[0] = acc[0].add(x)` inside `map` | races in parallel, hidden state | a loop |
| Sorted entries collected into a `HashMap` | order lost | `LinkedHashMap::new` |
| Running total re-summing prefixes | O(n²) | a loop |
| Loading every page before filtering | wasted round trips | lazy stream + `findFirst`/`limit` |
| Summing SGD and USD amounts | wrong totals | filter or group by currency |

## 9. Java 8 → 21 evolution
* Java 8: `Collector.of`, `Stream.iterate/generate/concat`, `Map.merge/compute*`, `StreamSupport`.
* Java 9: `iterate` with a predicate, `ofNullable`, `Optional.stream()`, `takeWhile`/`dropWhile`.
* Java 12: `Collectors.teeing` (an alternative to a custom collector for two results).
* Java 16: `Stream.toList()`, `mapMulti`.
* Java 21: `SequencedMap` (`firstEntry`, `lastEntry`, `reversed`) for ordered maps, covered in L16.
* Beyond Java 21: Stream Gatherers, preview in Java 22–23 and final in Java 24.

## 10. Interview questions
1. **What are the parts of a Collector?** Supplier, accumulator, combiner, finisher and characteristics.
2. **When is the combiner called?** Only when partial results are merged, i.e. in parallel streams.
3. **Map.merge or toMap?** `merge` updates a map in place, one value at a time; `toMap` builds a new map from a stream.
4. **How do you batch a list in Java 21?** `IntStream` over chunk indexes plus `subList`; in Java 24+, `Gatherers.windowFixed`.
5. **How do you stream a paged API lazily?** An Iterator wrapped by `Spliterators.spliteratorUnknownSize` and `StreamSupport.stream`, or `iterate` + `takeWhile`.

## 11. Hands-on exercise (~45 min)
`exercise.Exercise13` has two parts. Each Javadoc gives the expected value.

**Part A: running balance per account.** Use SGD transactions only, in date then id order. The balance in SampleData
is the closing balance, so opening = closing − net movement.
1. Opening balance (`ACC-1001` → `13608.84`).
2. Running balances.
3. Statement lines (`ACC-1014`: `OPENING 19235.05` … `CLOSING 18900.00`).
4. Lowest balance (`ACC-1013` → `-4382.09`).
5. Accounts that went negative.

**Part B: payment-file batches.**
6. Batch sizes (250 items in batches of 100 → `[100, 100, 50]`).
7. Batch headers with control totals.
8. Control totals match the grand total.

Remove `@Disabled` in `Exercise13Test`. Reference solution: `solution.Solution13`.

## 12. Pros and cons
| Pros | Cons / limitations |
|---|---|
| Custom collectors are reusable and parallel-ready | More code than a one-off loop |
| Lazy sources: iterate, generate, paging | Infinite streams need care |
| merge/compute remove get-null-put code | Two ways to build maps can confuse a team |
| Index streams handle batches and windows | Only for random-access lists in Java 21 |
| Clear rule: loops for stateful steps | No built-in windows/scan before Gatherers |

## 13. Summary
* `Collector.of` builds reusable aggregations; test them in parallel.
* `iterate` `[9]`, `generate`, `concat`, `ofNullable` `[9]` and `flatMap` levels create and flatten streams.
* `merge`/`compute` update in place; entry-set streams build new maps.
* Batches and windows use index streams; running totals use a loop.
* `StreamSupport` turns paged sources into lazy streams. Gatherers are Beyond Java 21.

**Next:** L14 Parallel Streams & Performance.

---

## How to run
**IntelliJ IDEA:** open the repo as a Maven project (JDK 21) and click ▶ next to any `main()`.

**Maven:**
```bash
mvn test
mvn -q compile exec:java -Dexec.mainClass=com.itgreenzone.fp.l13_advanced.theory.CustomCollectors
```

## Concept → class

| Concept | Class | Test |
|---|---|---|
| Collector.of, MoneyStats | `theory.CustomCollectors` | `AdvancedOperationsTest` |
| iterate, generate, concat, ofNullable, deep flatMap | `theory.GeneratingAndFlattening` | `AdvancedOperationsTest` |
| merge, compute, computeIfAbsent, entrySet streams, replaceAll | `theory.MapTransforms` | `AdvancedOperationsTest` |
| chunk, windows, zip, moving average, running totals | `theory.BatchesAndWindows` | `AdvancedOperationsTest` |
| StreamSupport paging, iterate + takeWhile | `theory.PagingWithSpliterator` | `AdvancedOperationsTest` |
| Refactoring payment statistics | `before.*`, `after.*`, `modern.*` | `PaymentStatsRefactoringTest` |
| Running balance, payment-file batches | `exercise.Exercise13`, `solution.Solution13` | `Exercise13Test` (disabled), `Solution13Test` |
| Every `main()` output | all of the above | `MainOutputTest` (golden files) |
| Quiz "predict the output" answers | n/a | `QuizAnswersTest` |
