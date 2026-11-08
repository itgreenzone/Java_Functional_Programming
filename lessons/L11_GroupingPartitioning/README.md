# L11 · Grouping & Partitioning

**Module 2 · Stream API** · Java 8 → Java 21 · ITGreenZone

| Deliverable | File |
|---|---|
| Slides (15, with speaker notes) | [L11_GroupingPartitioning_Slides.pptx](L11_GroupingPartitioning_Slides.pptx) |
| Interactive quiz (10 Qs, offline) | [L11_GroupingPartitioning_Quiz.html](L11_GroupingPartitioning_Quiz.html) |
| Cheat sheet (p.1) + sticky notes (p.2) | [L11_GroupingPartitioning_CheatSheet.pdf](L11_GroupingPartitioning_CheatSheet.pdf) |
| Handwritten sketch notes | [L11_GroupingPartitioning_SketchNotes.pdf](L11_GroupingPartitioning_SketchNotes.pdf) |
| Code | [`com.itgreenzone.fp.l11_grouping`](../../src/main/java/com/itgreenzone/fp/l11_grouping) |

## 1. Learning objectives
1. Group elements with the three `groupingBy` overloads and choose the result map (`TreeMap`, `EnumMap`).
2. Shape each group with a downstream collector: `counting`, `mapping`, `reducing`, `maxBy`, `joining`, `collectingAndThen`.
3. Explain why `filter` before grouping drops keys while `filtering` `[9]` keeps them, and use `flatMapping` `[9]` and `teeing` `[12]` per group.
4. Build multi-level groupings as nested maps or with a record key.
5. Use `partitioningBy` and explain how it differs from `groupingBy` with a boolean classifier.
6. Solve classic tasks: top-N per group, best element per group, grouping by month, top-N keys, inverting a map.

## 2. Why it matters
Almost every business report is "per something": spending per category, accounts per customer, seats per origin.
Hand-written versions repeat the same get-or-init dance (`if (map.get(k) == null) map.put(k, new …)`) and keep
parallel maps in sync. `groupingBy` turns that into one declarative expression whose downstream says exactly what
each group becomes.

## 3. Theory
* **groupingBy** `[8]`:
  * `groupingBy(classifier)` gives `Map<K, List<T>>` in a `HashMap` (no defined order).
  * `groupingBy(classifier, downstream)` gives `Map<K, D>`.
  * `groupingBy(classifier, mapFactory, downstream)` also chooses the map (`TreeMap::new`, `() -> new EnumMap<>(Tier.class)`).
  * A key exists only if at least one element was classified into it.
* **Downstream collectors** (from L10) run once per group: `counting`, `summingInt`, `averagingInt`,
  `reducing(ZERO, mapper, BigDecimal::add)`, `mapping(f, c)`, `joining`, `minBy`/`maxBy`, `collectingAndThen`.
* **filter vs filtering** `[9]`: a stream `filter` removes elements before they are classified, so empty groups never
  appear. `filtering(p, c)` classifies every element first and filters inside each group, so every key stays (with 0).
* **flatMapping** `[9]`: turns each element into many inside the group (customer → accounts).
* **teeing** `[12]` as a downstream: two answers per group in one pass (count and total per payment method).
* **Multi-level:** `groupingBy(city, groupingBy(tier, counting()))` gives nested maps, which suit drill-down views.
  A record key (`record CityTier(String city, Tier tier)`) gives one flat map, which is easier to sort and export.
* **partitioningBy** `[8]`: a predicate classifier. The result **always** has both `false` and `true` keys, even when
  one side is empty. `groupingBy(predicate)` only has the keys that occur.
* **Optional per group:** `maxBy` yields `Optional`, but a group is never empty, so
  `collectingAndThen(maxBy(…), Optional::orElseThrow)` is safe.

## 4. Visual explanation
* Slide 3: the bucket picture of `groupingBy` and its three overloads.
* Slide 5: filter-first vs `filtering`, side by side with the real output.
* Slide 7: nested maps vs a record key.
* Slide 8: `partitioningBy`, always two buckets.
* Sketch notes: buckets, the two-bucket scale, buckets inside buckets.

## 5. API reference

| API | Result | Since |
|---|---|---|
| `groupingBy(classifier)` | `Map<K, List<T>>` (HashMap) | Java 8 |
| `groupingBy(classifier, downstream)` | `Map<K, D>` | Java 8 |
| `groupingBy(classifier, mapFactory, downstream)` | your map type | Java 8 |
| `groupingByConcurrent(...)` | `ConcurrentMap` (parallel, unordered) | Java 8 |
| `partitioningBy(predicate[, downstream])` | `Map<Boolean, D>`, always both keys | Java 8 |
| `mapping`, `reducing`, `counting`, `maxBy`, `joining`, `collectingAndThen` | downstreams | Java 8 |
| `filtering(p, c)`, `flatMapping(f, c)` | downstreams | Java 9 |
| `Optional.orElseThrow()` (no-arg) | value or `NoSuchElementException` | Java 10 |
| `teeing(c1, c2, merger)` | downstream with two results | Java 12 |
| records as composite keys | value-based `equals`/`hashCode` | Java 16 |

## 6. Worked examples (real output)

| Example | Class | Output |
|---|---|---|
| Count per city, TreeMap | `theory.GroupingBasics` | `{Bangkok=1, Colombo=1, Jakarta=2, Kuala Lumpur=2, Singapore=4}` |
| Cities per tier, EnumMap + TreeSet | `theory.GroupingBasics` | `{SILVER=[Bangkok, Jakarta, Kuala Lumpur, Singapore], GOLD=[Colombo, Jakarta, Singapore], PLATINUM=[…]}` |
| Seats per origin | `theory.GroupingBasics` | `{CGK=162, SIN=1916}` |
| Largest id per account | `theory.GroupingBasics` | `{ACC-1001=T018, ACC-1002=T005, ACC-1003=T049, …}` |
| filter first vs filtering | `theory.DownstreamRecipes` | `{PAYNOW=1, PAYPAL=1}` vs `{CARD=0, PAYNOW=1, PAYPAL=1}` |
| teeing per method | `theory.DownstreamRecipes` | `{CARD=5/2070.29, PAYNOW=4/1824.30, PAYPAL=3/535.25}` |
| Nested vs record key | `theory.MultiLevelAndPartitioning` | `Singapore={SILVER=1, GOLD=2, PLATINUM=1}` · `Singapore/GOLD=2` |
| Partition totals | `theory.MultiLevelAndPartitioning` | `{false=1430.65, true=2999.19}` |
| partitioningBy vs groupingBy | `theory.MultiLevelAndPartitioning` | `partitioningBy={false=8, true=0} groupingBy={false=8}` |
| Policies by expiry month | `theory.ClassicTasks` | `{2026-11=[POL-502, POL-505, POL-509], 2026-12=[POL-503, POL-508], …}` |
| Top 3 categories | `theory.ClassicTasks` | `[TRANSFER=15, DINING=10, SALARY=8]` |
| Before: HashMaps + if-null | `before.LegacyCategoryReport` | `TRANSFER: 8 debits, total 7190.92, largest T042 1432.93` … `DINING: 10 debits, total 839.28, largest T020 170.53` |
| After: three groupingBy passes | `after.StreamCategoryReport` | same 7 lines |
| Modern: one groupingBy into an EnumMap of `CategoryStats` records | `modern.ModernCategoryReport` | same 7 lines |

## 7. Best practices
* Choose the map whenever the output is printed, tested or exported: `TreeMap` or `EnumMap`.
* Keep every key (with 0) by using `filtering`, not `filter`, when the report must list all categories.
* Unwrap `Optional` inside the collector with `collectingAndThen`.
* Total money per group with `reducing(BigDecimal.ZERO, mapper, BigDecimal::add)`.
* Prefer a record key over three levels of nested maps.
* Extract long collectors into named methods (`perCategoryStats()`), and test that the groups sum to the grand total.

## 8. Pitfalls and anti-patterns
| Anti-pattern | Problem | Fix |
|---|---|---|
| `filter(...)` then `groupingBy` when all keys must appear | empty groups vanish | `filtering(p, downstream)` `[9]` |
| `groupingBy(x)` printed or asserted | HashMap order is not defined | `TreeMap::new` / `EnumMap` |
| `maxBy(...)` then `.get()` on every value later | noisy, easy to forget | `collectingAndThen(maxBy, Optional::orElseThrow)` |
| `summingDouble` on money | floating-point errors | `reducing(ZERO, …, BigDecimal::add)` |
| `groupingBy(predicate)` to split in two | missing `true`/`false` key | `partitioningBy(predicate)` |
| three-level nested maps | unreadable, hard to sort | a record key |

## 9. Java 8 → 21 evolution
* Java 8: `groupingBy`, `partitioningBy`, `groupingByConcurrent`, and the core downstreams.
* Java 9: `filtering`, `flatMapping`.
* Java 10: `Optional.orElseThrow()` without arguments (clean unwrapping per group).
* Java 12: `teeing` as a downstream.
* Java 16: records as composite grouping keys and as per-group result types; `Stream.toList()`.
* Java 21: `SequencedMap` (`firstEntry()`, `lastEntry()`) on `TreeMap`/`LinkedHashMap` results, covered in L16.

## 10. Interview questions
1. **What map does groupingBy return by default?** A `HashMap` with `List` values; the order is not defined.
2. **Difference between partitioningBy and groupingBy with a boolean?** `partitioningBy` always contains both keys.
3. **Why use filtering instead of filter?** `filter` removes elements before classification, so empty groups disappear; `filtering` keeps the keys.
4. **How do you get the largest element per group without Optionals?** `collectingAndThen(maxBy(cmp), Optional::orElseThrow)`.
5. **Nested maps or a composite key?** Nested for drill-down; a record key for flat reports that you sort or export.

## 11. Hands-on exercise (~40 min)
`exercise.Exercise11` has **12 grouping problems** on the shared dataset, each with the expected value in the Javadoc:
1. Customers per city.
2. Names per tier.
3. Debit total per category.
4. Average premium per policy type (`{LIFE=2125.00, HEALTH=1032.88, MOTOR=1275.25, TRAVEL=197.50, HOME=782.63}`).
5. Largest transaction id per account.
6. Top 3 transaction ids per account.
7. City → tier → count.
8. FAILED payments per method, keeping zeros (`{CARD=0, PAYNOW=1, PAYPAL=1}`).
9. SUCCESS partition totals.
10. Policies by expiry month.
11. Top N categories by count.
12. Richest account per customer.

Remove `@Disabled` in `Exercise11Test`. Reference solution: `solution.Solution11`.

## 12. Pros and cons
| Pros | Cons / limitations |
|---|---|
| One expression replaces get-or-init loops | Nested collectors get hard to read |
| Downstream says exactly what each group becomes | Default HashMap order surprises people |
| Easy to switch map type and downstream | Empty groups need `filtering` or `partitioningBy` |
| Composes with records and EnumMap | Generic inference errors can be cryptic |
| Parallel-ready (`groupingByConcurrent`) | No built-in BigDecimal average per group |

## 13. Summary
* `groupingBy` = classifier + downstream (+ map factory).
* Choose the map: `TreeMap` or `EnumMap` for deterministic output.
* `filter` drops keys; `filtering` `[9]` keeps them. `flatMapping` `[9]` and `teeing` `[12]` work per group.
* `partitioningBy` always has two keys.
* Nested maps for drill-down, record keys for flat reports.

**Next:** L12 Primitive Streams & Numeric Work.

---

## How to run
**IntelliJ IDEA:** open the repo as a Maven project (JDK 21) and click ▶ next to any `main()`.

**Maven:**
```bash
mvn test
mvn -q compile exec:java -Dexec.mainClass=com.itgreenzone.fp.l11_grouping.theory.DownstreamRecipes
```

## Concept → class

| Concept | Class | Test |
|---|---|---|
| groupingBy overloads, map factories, basic downstreams | `theory.GroupingBasics` | `GroupingTest` |
| filtering, flatMapping, teeing, BigDecimal totals | `theory.DownstreamRecipes` | `GroupingTest` |
| Nested maps, record keys, partitioningBy | `theory.MultiLevelAndPartitioning` | `GroupingTest` |
| Top-N, best per group, by month, invert | `theory.ClassicTasks` | `GroupingTest` |
| Refactoring a category report | `before.*`, `after.*`, `modern.*` | `CategoryReportRefactoringTest` |
| 12 grouping problems | `exercise.Exercise11`, `solution.Solution11` | `Exercise11Test` (disabled), `Solution11Test` |
| Every `main()` output | all of the above | `MainOutputTest` (golden files) |
| Quiz "predict the output" answers | n/a | `QuizAnswersTest` |
