# L08 · Sorting with Comparators

**Module 2 · Stream API** · Java 8 → Java 21 · ITGreenZone

| Deliverable | File |
|---|---|
| Slides (15, with speaker notes) | [L08_SortingComparators_Slides.pptx](L08_SortingComparators_Slides.pptx) |
| Interactive quiz (10 Qs, offline) | [L08_SortingComparators_Quiz.html](L08_SortingComparators_Quiz.html) |
| Cheat sheet (p.1) + sticky notes (p.2) | [L08_SortingComparators_CheatSheet.pdf](L08_SortingComparators_CheatSheet.pdf) |
| Handwritten sketch notes | [L08_SortingComparators_SketchNotes.pdf](L08_SortingComparators_SketchNotes.pdf) |
| Code | [`com.itgreenzone.fp.l08_sorting`](../../src/main/java/com/itgreenzone/fp/l08_sorting) |

## 1. Learning objectives
1. Choose between natural order (`sorted()`) and an explicit `Comparator` (`sorted(cmp)`).
2. Build comparators with the factory methods: `comparing`, `comparingInt/Long/Double`, `naturalOrder`, `reverseOrder`.
3. Write multi-key sorts with `thenComparing` and avoid the `reversed()` gotcha.
4. Handle nulls (`nullsFirst`/`nullsLast`), case (`CASE_INSENSITIVE_ORDER`) and rely on stable sorting.
5. Sort a map by value; choose between `List.sort`, `stream().sorted()` and `List.reversed()` `[Java 21]`.

## 2. Why it matters
Every report is sorted: statements by date, customers by tier, a departures board by time. Hand-written
`compare` methods hide the direction of each key in the order of `x` and `y`, so one swapped pair silently produces
a wrong report. The Comparator API puts each key and its direction on its own line.

## 3. Theory
* **`sorted()`** `[8]` uses natural order. The elements must implement `Comparable`; otherwise the call compiles and then throws `ClassCastException`.
* **`sorted(Comparator)`** `[8]` works for any type.
* **`Comparator.comparing(keyExtractor)`** `[8]` sorts by a `Comparable` key. **`comparing(key, keyComparator)`** gives that key its own order, for example `reverseOrder()` or `CASE_INSENSITIVE_ORDER`.
* **`comparingInt/Long/Double`** `[8]` avoid boxing primitive keys. Use them for ratios, never for money: `BigDecimal` is already `Comparable`.
* **`thenComparing`** `[8]` adds a tie-breaker, used only when all earlier keys are equal.
* **`reversed()`** `[8]` reverses **everything before it** in the chain, including `nullsFirst`/`nullsLast`. For one descending key, pass `reverseOrder()` as that key's comparator.
* **`nullsFirst` / `nullsLast`** `[8]` wrap a comparator so null keys or elements are ordered instead of throwing NPE.
* **Natural orders:** enums sort by declaration order (`SILVER < GOLD < PLATINUM`). `BigDecimal` sorts by value (`10.0` = `10.00`). Strings sort by Unicode, so uppercase comes before lowercase.
* **Stability:** `List.sort` and `sorted()` on an ordered stream keep equal elements in input order.
* **Maps:** stream `entrySet()` and sort with `Map.Entry.comparingByKey/Value` `[8]`.
* **Lists:** `List.sort` sorts in place and needs a mutable list. `stream().sorted()` returns a new list. `List.reversed()` `[21]` returns a reverse-ordered view.

## 4. Visual explanation
* Slide 5: ranking cards.
* Slide 6: the three-row `reversed()` comparison.
* Slide 10: the List.sort / sorted / reversed table.
* Sketch notes: the podium, the flipped ladder, the queue for stability, and the map-by-value arrow.

## 5. API reference

| Method | Use | Since |
|---|---|---|
| `Stream.sorted()` / `sorted(Comparator)` | natural / explicit order | Java 8 |
| `Comparator.comparing(key)` / `comparing(key, cmp)` | sort by a key | Java 8 |
| `comparingInt` / `comparingLong` / `comparingDouble` | primitive keys | Java 8 |
| `thenComparing(...)` (+ `Int/Long/Double`) | tie-breakers | Java 8 |
| `reversed()` | reverse the whole comparator | Java 8 |
| `Comparator.naturalOrder()` / `reverseOrder()` | Comparable types | Java 8 |
| `Comparator.nullsFirst(cmp)` / `nullsLast(cmp)` | null-safe | Java 8 |
| `Map.Entry.comparingByKey()` / `comparingByValue()` | map entries | Java 8 |
| `String.CASE_INSENSITIVE_ORDER` | ignore case | Java 1.2 |
| `List.sort(Comparator)` | in place | Java 8 |
| `List.reversed()`, `getFirst()`, `getLast()` | SequencedCollection | Java 21 |

## 6. Worked examples (real output)

| Example | Class | Output |
|---|---|---|
| Natural order | `theory.NaturalVsComparator` | `[Bangkok, Colombo, Jakarta, Kuala Lumpur, Singapore]` |
| sorted() on a record | `theory.NaturalVsComparator` | `ClassCastException: class …Customer cannot be cast to class java.lang.Comparable` |
| Enum / BigDecimal order | `theory.NaturalVsComparator` | `[SILVER, GOLD, GOLD, PLATINUM]` · `[-1, 9.5, 10.00, 10.0]` |
| Factory methods | `theory.ComparatorFactories` | `premium : [POL-505 185.00, POL-509 210.00, POL-504 720.00]` |
| Case | `theory.ComparatorFactories` | `natural [CARD, PayPal, card, paynow] \| case-insensitive [CARD, card, paynow, PayPal]` |
| reversed() gotcha | `theory.ChainingAndReversed` | `(tier, name).reversed(): [C006, C003, C010, …]` |
| Nulls | `theory.NullsAndStability` | `comparing(null key) : NullPointerException` · `… ACC-1006=null, ACC-1015=null` |
| Stability | `theory.NullsAndStability` | `… 26:T012, 26:T013, … 22:T009, 22:T010 …` |
| Map by value | `theory.SortingMapsAndLists` | `busiest 3 : [ACC-1003=7, ACC-1004=6, ACC-1008=6]` |
| List.sort / reversed | `theory.SortingMapsAndLists` | `List.sort (List.of) : UnsupportedOperationException` |
| Before: anonymous Comparator | `before.LegacyCustomerRanking` | `1. C003 Chen Wei PLATINUM 163950.25` … `10. C009 Irfan Hakim SILVER -150.25` |
| After: comparator chain | `after.StreamCustomerRanking` | same 10 lines |
| Modern: record + constant + `reversed()` [21] | `modern.ModernCustomerRanking` | same 10 lines, `bottom 3 : [C009, C002, C005]` |

## 7. Best practices
* Use one key per line, with its direction next to it.
* End with a unique tie-breaker (an id) so the order is deterministic.
* Keep shared comparators as named constants, for example `Ranked.ORDER`.
* Precompute expensive keys into a record. The key extractor runs on every comparison.
* Use `CASE_INSENSITIVE_ORDER` (or a `Collator`) for user-entered text.
* Test with ties and nulls in the data.
* Use `List.reversed()` `[21]` instead of sorting again in the opposite direction.

## 8. Pitfalls and anti-patterns
| Anti-pattern | Problem | Fix |
|---|---|---|
| `.thenComparing(b).reversed()` for "a DESC, b ASC" | reverses `b` too, and the nulls | `comparing(a, reverseOrder()).thenComparing(b)` |
| `sorted()` on a non-Comparable type | `ClassCastException` at run time | `sorted(comparing(...))` |
| `comparing(key)` with a nullable key | `NullPointerException` | `comparing(key, nullsLast(naturalOrder()))` |
| `(a, b) -> a - b` | int overflow | `Integer.compare`, `comparingInt` |
| `list.sort(...)` on `List.of(...)` | `UnsupportedOperationException` | copy first, or `stream().sorted()` |
| sorting money as `double` | rounding | the `BigDecimal` key |
| side-effect rank counter in `map` | breaks in parallel | index with `IntStream.range` (see `modern`) |

## 9. Java 8 → 21 evolution
* Java 1.2: `Comparator`, `CASE_INSENSITIVE_ORDER`.
* Java 8: `comparing`, `thenComparing`, `reversed`, `nullsFirst/Last`, `naturalOrder`, `reverseOrder`, `Map.Entry.comparingByKey/Value`, `List.sort`, `Stream.sorted`.
* Java 16: records as precomputed sort keys.
* Java 21: `SequencedCollection.reversed()`, `getFirst()`, `getLast()`.

## 10. Interview questions
1. **Comparable vs Comparator?** `Comparable` is the type's one natural order (`compareTo`). A `Comparator` defines any number of external orders (`compare`).
2. **How do you sort by A descending, then B ascending?** `comparing(A, reverseOrder()).thenComparing(B)`. Not `reversed()` at the end.
3. **How do you sort a map by value?** Stream `entrySet()`, sort with `comparingByValue()`, and collect to a `LinkedHashMap` if you need a map.
4. **Is Java's sort stable?** Yes, for `List.sort` and `sorted()` on an ordered stream.
5. **Why avoid `a - b` in `compare`?** Integer overflow for large or negative values.

## 11. Hands-on exercise (~25 min)
`exercise.Exercise08` builds an **airport departures board** from the 8 flights. Scenario: SQ318 and UL309 have been
rescheduled and their new time is not announced yet (`time == null`, shown as TBA). Implement four tasks:
1. The board: date, then time with TBA last, then code.
2. TBA first.
3. Latest first, with TBA still last. This is where `reversed()` fails.
4. Destinations, sorted case-insensitively.

Remove `@Disabled` in `Exercise08Test`. Reference solution: `solution.Solution08`. It also prints the wrong
`BOARD.reversed()` result for comparison.

## 12. Pros and cons
| Pros | Cons / limitations |
|---|---|
| Declarative: each key and direction on one line | `reversed()` semantics surprise people |
| Composable: `thenComparing`, `reversed`, `nulls*` | Generic inference needs type witnesses |
| No sign errors from x/y swaps | Lambdas in long chains are harder to debug |
| Reusable named constants | Key extractors run on every comparison |
| Primitive keys without boxing | Sorting is O(n log n) and buffers everything |
| `reversed()` view in Java 21 | Nulls still need explicit handling |

## 13. Summary
* `sorted()` needs `Comparable`; `sorted(cmp)` works for anything.
* `comparing`, `comparingInt/Double`, `naturalOrder`, `reverseOrder`.
* `thenComparing` breaks ties; use `reverseOrder()` on each descending key.
* `reversed()` reverses the whole chain, and the nulls.
* `nullsLast`, `CASE_INSENSITIVE_ORDER`, stable sorts, `comparingByValue`, `reversed()` `[21]`.

**Next:** L09 Terminal Operations & Reduction.

---

## How to run
**IntelliJ IDEA:** open the repo as a Maven project (JDK 21) and click ▶ next to any `main()`.

**Maven:**
```bash
mvn test
mvn -q compile exec:java -Dexec.mainClass=com.itgreenzone.fp.l08_sorting.theory.ChainingAndReversed
```

## Concept → class

| Concept | Class | Test |
|---|---|---|
| Natural order vs Comparator | `theory.NaturalVsComparator` | `SortingTest` |
| Factory methods, case | `theory.ComparatorFactories` | `SortingTest` |
| thenComparing, reversed gotcha, ranking | `theory.ChainingAndReversed` | `SortingTest` |
| nullsFirst/Last, stability | `theory.NullsAndStability` | `SortingTest` |
| Map by value, List.sort, reversed() [21] | `theory.SortingMapsAndLists` | `SortingTest` |
| Refactoring compare() → chain | `before.*`, `after.*`, `modern.*` | `RankingRefactoringTest` |
| Departures board | `exercise.Exercise08`, `solution.Solution08` | `Exercise08Test` (disabled), `Solution08Test` |
| Every `main()` output | all of the above | `MainOutputTest` (golden files) |
| Quiz "predict the output" answers | n/a | `QuizAnswersTest` |
