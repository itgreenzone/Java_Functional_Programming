# L09 · Terminal Operations & Reduction

**Module 2 · Stream API** · Java 8 → Java 21 · ITGreenZone

| Deliverable | File |
|---|---|
| Slides (15, with speaker notes) | [L09_TerminalReduction_Slides.pptx](L09_TerminalReduction_Slides.pptx) |
| Interactive quiz (10 Qs, offline) | [L09_TerminalReduction_Quiz.html](L09_TerminalReduction_Quiz.html) |
| Cheat sheet (p.1) + sticky notes (p.2) | [L09_TerminalReduction_CheatSheet.pdf](L09_TerminalReduction_CheatSheet.pdf) |
| Handwritten sketch notes | [L09_TerminalReduction_SketchNotes.pdf](L09_TerminalReduction_SketchNotes.pdf) |
| Code | [`com.itgreenzone.fp.l09_terminal_ops`](../../src/main/java/com/itgreenzone/fp/l09_terminal_ops) |

## 1. Learning objectives
1. Pick the right terminal operation for the kind of answer you need.
2. Use `forEach` vs `forEachOrdered`, `toList()` `[16]` vs `collect(Collectors.toList())`, and `toArray(String[]::new)`.
3. Use the three forms of `reduce`, and respect the associativity and identity rules.
4. Sum and average `BigDecimal` money, with explicit scale, rounding and empty-list guards.
5. Know what `count`, `min`, `max`, the `*Match` operations and `findFirst`/`findAny` return, including on empty streams.

## 2. Why it matters
The terminal operation produces the answer, so it is where business numbers come from: totals, averages, the highest
transaction, "is any account overdrawn?". Three mistakes cause most production bugs here:
* reduction rules broken silently, which only fails once the stream runs in parallel;
* money divided without a rounding mode;
* `allMatch` returning true for an empty batch.

## 3. Theory
* **Hand back elements:**
  * `forEach` / `forEachOrdered` `[8]`: `forEachOrdered` keeps encounter order, even in parallel.
  * `collect(Collector)` `[8]`.
  * `toList()` `[16]`: unmodifiable, and allows nulls.
  * `toArray(IntFunction)` `[8]` gives a typed array.
* **`Collectors.toList()`** `[8]` returns an `ArrayList` today, but the spec does not guarantee it. **`Collectors.toUnmodifiableList()`** `[10]` rejects nulls.
* **The three forms of `reduce`** `[8]`:
  * `reduce(identity, op)` → `T`. An empty stream gives the identity.
  * `reduce(op)` → `Optional<T>`. An empty stream gives `Optional.empty`.
  * `reduce(identity, accumulator, combiner)` → `U`, when the result type differs from the element type.
* **Rules:** the operator must be **associative**, and the identity must be **neutral** (`x op id == x`). Breaking either works sequentially and fails in parallel.
* **Money:** `reduce(BigDecimal.ZERO, BigDecimal::add)`, then `divide(n, 2, RoundingMode.HALF_UP)` with an empty guard. Decide whether to round per line or at the end, and test it.
* **`count()`** returns `long`. **`min/max(Comparator)`** return `Optional`.
* **`anyMatch/allMatch/noneMatch`** short-circuit. On an empty stream they return false/true/true (vacuous truth).
* **`findFirst`** respects encounter order. **`findAny`** may return any match and is cheaper in parallel.

## 4. Visual explanation
* Slide 3: the terminal-operation family.
* Slide 5: the fold diagram (0 → +12500.00 → … → 300382.25).
* Slide 7: the two rules with real output.
* Slide 10: the empty-stream table.
* Sketch notes: the answer tree, the snowball, the empty classroom.

## 5. API reference

| Operation | Returns | Note | Since |
|---|---|---|---|
| `forEach` / `forEachOrdered` | `void` | side effects; ordered keeps order | Java 8 |
| `collect(Collector)` | `R` | L10, L11 | Java 8 |
| `toList()` | `List<T>` (unmodifiable) | nulls allowed | Java 16 |
| `toArray()` / `toArray(String[]::new)` | `Object[]` / `String[]` | | Java 8 |
| `reduce(T, BinaryOperator<T>)` | `T` | empty → identity | Java 8 |
| `reduce(BinaryOperator<T>)` | `Optional<T>` | empty → empty | Java 8 |
| `reduce(U, BiFunction<U,T,U>, BinaryOperator<U>)` | `U` | type change, combiner | Java 8 |
| `count()` | `long` | | Java 8 |
| `min(Comparator)` / `max(Comparator)` | `Optional<T>` | add a tie-breaker | Java 8 |
| `anyMatch` / `allMatch` / `noneMatch` | `boolean` | short-circuit | Java 8 |
| `findFirst` / `findAny` | `Optional<T>` | short-circuit | Java 8 |

## 6. Worked examples (real output)

| Example | Class | Output |
|---|---|---|
| forEachOrdered in parallel | `theory.CollectingResults` | `[SQ318, SQ12, TR808, MH602, SQ938, UL309, SQ21, GA827]` |
| toList vs Collectors.toList | `theory.CollectingResults` | `toList().add -> UnsupportedOperationException` · `ArrayList size 13` |
| Nulls | `theory.CollectingResults` | `toList()=[SQ12, null], toUnmodifiableList()=NullPointerException` |
| Practice: total balance | `theory.Reducing` | `300382.25` |
| Optional form / 3-arg form | `theory.Reducing` | `Optional[7721.99]` · `total seats 2078` |
| Practice: average premium | `theory.Reducing` | `1082.65` |
| Rules | `theory.Reducing` | `a - b : sequential=-55, parallel differs=true` · `identity 100 : sequential=155, parallel bigger=true` |
| Practice: highest transaction | `theory.MatchFindCount` | `T049 7721.99` (lowest `T046 18.35`) |
| Practice: any overdrawn | `theory.MatchFindCount` | `true` |
| Empty stream | `theory.MatchFindCount` | `anyMatch=false allMatch=true noneMatch=true` |
| Before: four loops | `before.LegacyDashboard` | `total balance : 300382.25` … `average premium : 1082.65` |
| After: one op per question | `after.StreamDashboard` | same 4 lines |
| Modern: record, Optional, empty-safe | `modern.ModernDashboard` | same 4 lines; empty data → `0`, `none`, `false`, `0.00` |
| Rounding per line vs at end | `solution.Solution09` | `per line=1947.75, at end=1947.74` |

## 7. Best practices
* Money: `reduce(BigDecimal.ZERO, BigDecimal::add)`, then `divide(n, 2, HALF_UP)`; guard the empty case.
* Plain numbers: `mapToInt(...).sum()` is clearer than a 3-argument reduce.
* Prefer `Optional` over `null` or placeholder strings such as `"none"`.
* Use `findFirst` unless any match is acceptable.
* Add a tie-breaker to `min`/`max` for deterministic results.
* Use `toList()` for read-only results and `toCollection(ArrayList::new)` when you will modify the list.

## 8. Pitfalls and anti-patterns
| Anti-pattern | Problem | Fix |
|---|---|---|
| `toList().add(...)` | `UnsupportedOperationException` | `collect(toCollection(ArrayList::new))` |
| `reduce(0, (a, b) -> a - b)` | not associative: wrong in parallel | an associative operator |
| `reduce(OPENING_BALANCE, add)` | not an identity: added once per chunk | `reduce(ZERO, add).add(OPENING_BALANCE)` |
| `divide(n)` on BigDecimal | `ArithmeticException` (non-terminating, or n = 0) | `divide(n, 2, HALF_UP)` + empty guard |
| `allMatch` as validation | true for an empty batch | check `isEmpty()` too |
| `forEach(list::add)` | side effects; unsafe in parallel | `toList()` / `collect` |

## 9. Java 8 → 21 evolution
* Java 8: `forEach`, `collect`, `reduce` (3 forms), `count`, `min`, `max`, `*Match`, `find*`, `toArray`.
* Java 10: `Collectors.toUnmodifiableList/Set/Map`.
* Java 16: `Stream.toList()`; records for result types (`Dashboard`).
* Java 21: nothing new for terminal operations. **Beyond Java 21:** Gatherers (Java 24) add custom *intermediate* operations.

## 10. Interview questions
1. **toList() vs collect(Collectors.toList())?** `toList()` is unmodifiable and allows nulls. `Collectors.toList()` gives no guarantees (an `ArrayList` today).
2. **The three forms of reduce?** identity + op → `T`; op only → `Optional<T>`; identity + accumulator + combiner → `U`.
3. **Why must reduce be associative?** Parallel streams reduce chunks separately and combine them in any grouping.
4. **What does allMatch return on an empty stream?** `true` (vacuous truth). `anyMatch` returns false; `noneMatch` returns true.
5. **findFirst vs findAny?** `findFirst` respects encounter order; `findAny` may return any element and is cheaper in parallel.

## 11. Hands-on exercise (~30 min)
`exercise.Exercise09` produces **month-end totals in SGD** for August, September and October 2026. USD lines are converted
at a fixed exercise rate of `USD_SGD = 1.3456`, and each line is rounded to 2 decimals HALF_UP by the given `toSgd`
helper. Implement five tasks; the expected values are in the Javadoc:
1. `debitTotal`: 4031.61 / 7328.44 / 5832.65.
2. `creditTotal`.
3. `net`.
4. `averageDebit`: returns 0.00 for an empty month.
5. `largestDebit`: an `Optional`.

Remove `@Disabled` in `Exercise09Test`. Reference solution: `solution.Solution09`.

## 12. Pros and cons
| Pros | Cons / limitations |
|---|---|
| One operation per question: intent is clear | reduce rules are easy to break silently |
| Short-circuiting match/find stop early | No BigDecimal sum/average built in |
| Optional makes "no result" explicit | Empty-stream results surprise people |
| reduce works for any type, including BigDecimal | toList vs Collectors.toList differences |
| toList() gives safe read-only results | forEach invites side effects |
| Can run in parallel if the rules hold | One pass per question (L10 teeing/summarizing helps) |

## 13. Summary
* `toList()` `[16]` is unmodifiable; `forEachOrdered` keeps order; use `toArray(String[]::new)`.
* `reduce`: identity → `T`; no identity → `Optional`; 3-arg → `U`.
* Use an associative operator and a true identity, or parallel breaks.
* Money: `reduce(ZERO, add)`, then `divide(n, 2, HALF_UP)`.
* Empty stream: `allMatch`/`noneMatch` true, `anyMatch` false.

**Next:** L10 Collectors I: Collecting Results.

---

## How to run
**IntelliJ IDEA:** open the repo as a Maven project (JDK 21) and click ▶ next to any `main()`.

**Maven:**
```bash
mvn test
mvn -q compile exec:java -Dexec.mainClass=com.itgreenzone.fp.l09_terminal_ops.theory.Reducing
```

## Concept → class

| Concept | Class | Test |
|---|---|---|
| forEach, toList, toArray | `theory.CollectingResults` | `TerminalOpsTest` |
| reduce forms, rules, BigDecimal | `theory.Reducing` | `TerminalOpsTest` |
| count, min/max, match, find | `theory.MatchFindCount` | `TerminalOpsTest` |
| Refactoring loops → terminal ops | `before.*`, `after.*`, `modern.*` | `DashboardRefactoringTest` |
| Month-end totals | `exercise.Exercise09`, `solution.Solution09` | `Exercise09Test` (disabled), `Solution09Test` |
| Every `main()` output | all of the above | `MainOutputTest` (golden files) |
| Quiz "predict the output" answers | n/a | `QuizAnswersTest` |
