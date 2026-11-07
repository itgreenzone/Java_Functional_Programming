# L10 · Collectors I: Collecting Results

**Module 2 · Stream API** · Java 8 → Java 21 · ITGreenZone

| Deliverable | File |
|---|---|
| Slides (15, with speaker notes) | [L10_Collectors_Slides.pptx](L10_Collectors_Slides.pptx) |
| Interactive quiz (10 Qs, offline) | [L10_Collectors_Quiz.html](L10_Collectors_Quiz.html) |
| Cheat sheet (p.1) + sticky notes (p.2) | [L10_Collectors_CheatSheet.pdf](L10_Collectors_CheatSheet.pdf) |
| Handwritten sketch notes | [L10_Collectors_SketchNotes.pdf](L10_Collectors_SketchNotes.pdf) |
| Code | [`com.itgreenzone.fp.l10_collectors`](../../src/main/java/com/itgreenzone/fp/l10_collectors) |

## 1. Learning objectives
1. Explain what a `Collector` is made of: supplier, accumulator, combiner, finisher.
2. Choose the collection you get back: `toList`, `toSet`, `toCollection(...)`, `toUnmodifiable*` `[10]`.
3. Use `toMap` safely: unique keys, merge functions, map suppliers (`TreeMap`, `LinkedHashMap`, `EnumMap`).
4. Aggregate with `joining`, `counting`, `summing*`, `averaging*`, `summarizing*`, `minBy`/`maxBy`, and total `BigDecimal` with `reducing`.
5. Compose collectors with `collectingAndThen`, `mapping`, `filtering` `[9]`, `flatMapping` `[9]` and `teeing` `[12]`.

## 2. Why it matters
Most reports end in a map or a summary line. Hand-written versions keep several maps in sync with `containsKey`/`put`,
which breaks as soon as one update is forgotten. Collectors package those recipes. They are also the downstream
building blocks of `groupingBy` (L11), the most-used stream feature in real code.

## 3. Theory
* **Collector<T, A, R>** `[8]`:
  * The **supplier** creates a container `A`.
  * The **accumulator** adds one `T`.
  * The **combiner** merges two containers (needed by parallel streams).
  * The **finisher** turns `A` into the result `R`.
* **Collections:**
  * `toList()` and `toSet()` make no promises about type or order.
  * `toCollection(TreeSet::new)` gives exactly the type you choose.
  * `toUnmodifiableList/Set/Map` `[10]` are immutable and reject nulls.
* **toMap** `[8]`:
  * `toMap(k, v)` throws `IllegalStateException` on a duplicate key.
  * `toMap(k, v, merge)` resolves duplicates.
  * `toMap(k, v, merge, mapSupplier)` chooses the map.
  * A `null` value throws `NullPointerException`, because the implementation uses `Map.merge`.
* **Aggregating** `[8]`:
  * `joining(sep, prefix, suffix)`, `counting`, `summingInt`, `averagingInt`.
  * `summarizingInt` gives count, sum, min, max and average in one pass.
  * `minBy`/`maxBy` return `Optional`.
  * `reducing(identity, mapper, op)`, for example to total `BigDecimal`.
* **Composing:**
  * `collectingAndThen(c, finisher)` and `mapping(f, c)` `[8]`.
  * `filtering(p, c)` and `flatMapping(f, c)` `[9]`.
  * `teeing(c1, c2, merger)` `[12]` runs two collectors over one pass.
* **Top level vs downstream:** at the top level, prefer plain stream methods (`count()`, `mapToInt().sum()`). The collector versions exist so they can be nested inside `groupingBy`, `partitioningBy`, `teeing` and `mapping`.

## 4. Visual explanation
* Slide 3: the four parts of a collector.
* Slide 5: the duplicate-key trap.
* Slide 6: the map-supplier table.
* Slide 10: the teeing diagram.
* Sketch notes: the recipe, the key collision, the T-pipe.

## 5. API reference

| Collector | Result | Since |
|---|---|---|
| `toList()` / `toSet()` | List / Set (no guarantees) | Java 8 |
| `toCollection(Supplier<C>)` | the collection you choose | Java 8 |
| `toUnmodifiableList/Set/Map` | immutable, no nulls | Java 10 |
| `toMap(k, v)` / `(k, v, merge)` / `(k, v, merge, mapSupplier)` | Map | Java 8 |
| `joining()` / `(sep)` / `(sep, prefix, suffix)` | String | Java 8 |
| `counting()` | Long | Java 8 |
| `summingInt/Long/Double`, `averagingInt/Long/Double` | number / Double | Java 8 |
| `summarizingInt/Long/Double` | `Int/Long/DoubleSummaryStatistics` | Java 8 |
| `minBy(cmp)` / `maxBy(cmp)` | Optional | Java 8 |
| `reducing(id, op)` / `reducing(id, mapper, op)` | T / U | Java 8 |
| `collectingAndThen(c, f)`, `mapping(f, c)` | wrapped | Java 8 |
| `filtering(p, c)`, `flatMapping(f, c)` | wrapped | Java 9 |
| `teeing(c1, c2, merger)` | merger result | Java 12 |

## 6. Worked examples (real output)

| Example | Class | Output |
|---|---|---|
| toCollection / by hand | `theory.CollectionCollectors` | `[Bangkok, Colombo, Jakarta, Kuala Lumpur, Singapore]` |
| toUnmodifiableSet | `theory.CollectionCollectors` | `size 2, add -> UnsupportedOperationException` |
| Duplicate key | `theory.ToMapCollector` | `IllegalStateException: Duplicate key Singapore (attempted merging values Alice Tan and Chen Wei)` |
| Merge + TreeMap | `theory.ToMapCollector` | `Singapore=Alice Tan, Chen Wei, Ethan Lim, Jasmine Ong` |
| Merge money + LinkedHashMap | `theory.ToMapCollector` | `{C001=15700.50, C002=850.75, C003=163950.25, …}` |
| joining / summarizing | `theory.AggregatingCollectors` | `Flights: [SQ318, …]` · `count=8 sum=2078 min=160 max=471 average=259.75` |
| BigDecimal total | `theory.AggregatingCollectors` | `reducing total : 4429.84` |
| filtering / flatMapping | `theory.ComposingCollectors` | `8 SUCCESS` · `[ACC-1001, …, ACC-1015]` |
| teeing | `theory.ComposingCollectors` | `12 payments, total 4429.84` · `-150.25 .. 100000.00` |
| Before: 3 hand-synced maps | `before.LegacyPortfolioSummary` | `LIFE: 2 policies, 4250.00 [POL-501, POL-507]` … `TOTAL: 10 policies, 10826.50` |
| After: 3 toMap + reducing | `after.StreamPortfolioSummary` | same 6 lines |
| Modern: record merge, EnumMap, teeing | `modern.ModernPortfolioSummary` | same 6 lines (also with a parallel stream) |

## 7. Best practices
* Always pass a merge function to `toMap` unless the key is a true id.
* Choose the map explicitly when order matters: `TreeMap`, `LinkedHashMap` or `EnumMap`.
* Money: `reducing(BigDecimal.ZERO, mapper, BigDecimal::add)`, never the `double` collectors.
* Use immutable value records with an associative `merge` method as `toMap` values.
* Use `teeing` when you need two answers from one pass.
* Extract long nested collectors into well-named constants or methods.

## 8. Pitfalls and anti-patterns
| Anti-pattern | Problem | Fix |
|---|---|---|
| `toMap(Customer::city, Customer::name)` | `IllegalStateException: Duplicate key …` | add a merge function |
| value mapper that may return `null` | `NullPointerException` | filter first, or map to a default |
| relying on `toSet()` / `HashMap` order | flaky tests and reports | `TreeSet`/`TreeMap`/`LinkedHash*` |
| `summingDouble` / `averagingDouble` on money | floating-point errors | `reducing(ZERO, …, BigDecimal::add)` |
| printing `IntSummaryStatistics` | locale-dependent decimal separator | format fields with `Locale.ROOT` |
| several maps kept in sync | easy to forget one update | one record + merge, or `teeing` |

## 9. Java 8 → 21 evolution
* Java 8: `Collectors` with toList/Set/Map, joining, counting, summing, averaging, summarizing, minBy/maxBy, reducing, collectingAndThen, mapping, groupingBy, partitioningBy.
* Java 9: `filtering`, `flatMapping`.
* Java 10: `toUnmodifiableList/Set/Map`.
* Java 12: `teeing`.
* Java 16: `Stream.toList()`; records as value objects with `merge`.

## 10. Interview questions
1. **What happens on a duplicate key in toMap?** `IllegalStateException`, unless a merge function is given.
2. **How do you get a sorted map from toMap?** Pass a map supplier: `TreeMap::new` (or `LinkedHashMap::new` for insertion order).
3. **What is a Collector made of?** Supplier, accumulator, combiner and finisher, plus characteristics.
4. **What does teeing do?** Since Java 12, it sends each element to two collectors and merges both results in one pass.
5. **How do you sum BigDecimal with a collector?** `reducing(BigDecimal.ZERO, mapper, BigDecimal::add)`. Never `summingDouble`.

## 11. Hands-on exercise (~30 min)
`exercise.Exercise10` is a **payment gateway summary per method** (CARD, PAYNOW, PAYPAL). Use `toMap` with merge
functions; `groupingBy` comes in L11. Five tasks, with the expected values in the Javadoc:
1. Count per method: `{CARD=5, PAYNOW=4, PAYPAL=3}`.
2. Total per method: `{CARD=2070.29, PAYNOW=1824.30, PAYPAL=535.25}`.
3. Both together, using the `MethodSummary` record and its `merge` method.
4. The same for SUCCESS payments only.
5. One gateway line built with `teeing` and `joining`: `12 payments, 4429.84 total, failed: P003, P012`.

Remove `@Disabled` in `Exercise10Test`. Reference solution: `solution.Solution10`.

## 12. Pros and cons
| Pros | Cons / limitations |
|---|---|
| Ready-made recipes for collections, maps, strings | toMap duplicate-key and null traps |
| You choose the result type | Generic inference errors can be cryptic |
| Composable downstream collectors | Nested collectors get hard to read |
| Parallel-ready via the combiner | Many overlap with simpler stream methods |
| `teeing`: several answers in one pass | No built-in BigDecimal sum/average |
| Mutable containers: efficient for big results | Summary statistics `toString` is locale-dependent |

## 13. Summary
* A Collector is a supplier, an accumulator, a combiner and a finisher.
* Use `toCollection(...)` when type or order matters, and `toUnmodifiable*` `[10]` for immutable results.
* `toMap` needs a merge function unless the key is unique; choose the map type.
* Use `joining`, `summarizing` and `maxBy`; total money with `reducing(ZERO, …, add)`.
* Compose with `collectingAndThen`, `mapping`, `filtering`/`flatMapping` `[9]` and `teeing` `[12]`.

**Next:** L11 Grouping & Partitioning (the most important lesson of the module).

---

## How to run
**IntelliJ IDEA:** open the repo as a Maven project (JDK 21) and click ▶ next to any `main()`.

**Maven:**
```bash
mvn test
mvn -q compile exec:java -Dexec.mainClass=com.itgreenzone.fp.l10_collectors.theory.ToMapCollector
```

## Concept → class

| Concept | Class | Test |
|---|---|---|
| toSet, toCollection, toUnmodifiable* | `theory.CollectionCollectors` | `CollectorsTest` |
| toMap shapes, duplicates, merge, nulls | `theory.ToMapCollector` | `CollectorsTest` |
| joining, counting, summing, summarizing, reducing | `theory.AggregatingCollectors` | `CollectorsTest` |
| collectingAndThen, mapping, filtering, flatMapping, teeing | `theory.ComposingCollectors` | `CollectorsTest` |
| Refactoring hand-synced maps → collectors | `before.*`, `after.*`, `modern.*` | `PortfolioRefactoringTest` |
| Payment gateway summary | `exercise.Exercise10`, `solution.Solution10` | `Exercise10Test` (disabled), `Solution10Test` |
| Every `main()` output | all of the above | `MainOutputTest` (golden files) |
| Quiz "predict the output" answers | n/a | `QuizAnswersTest` |
