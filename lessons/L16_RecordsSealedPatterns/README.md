# L16 · Records, Sealed Types & Pattern Matching (Java 16–21)

**Module 3 · Functional Design in Modern Java** · Java 8 → Java 21 · ITGreenZone

| Deliverable | File |
|---|---|
| Slides (15, with speaker notes) | [L16_RecordsSealedPatterns_Slides.pptx](L16_RecordsSealedPatterns_Slides.pptx) |
| Interactive quiz (10 Qs, offline) | [L16_RecordsSealedPatterns_Quiz.html](L16_RecordsSealedPatterns_Quiz.html) |
| Cheat sheet (p.1) + sticky notes (p.2) | [L16_RecordsSealedPatterns_CheatSheet.pdf](L16_RecordsSealedPatterns_CheatSheet.pdf) |
| Handwritten sketch notes | [L16_RecordsSealedPatterns_SketchNotes.pdf](L16_RecordsSealedPatterns_SketchNotes.pdf) |
| Code | [`com.itgreenzone.fp.l16_records_sealed`](../../src/main/java/com/itgreenzone/fp/l16_records_sealed) |

## 1. Learning objectives
1. Use records as immutable data carriers in pipelines, with compact constructors for validation and normalisation, and local records.
2. Model alternatives as algebraic data types with sealed interfaces and records.
3. Use pattern matching for `instanceof` `[16]` and switch expressions `[14]`.
4. Write exhaustive pattern-matching switches with record patterns, nested patterns, guards and `case null` `[21]`.
5. Use `SequencedCollection` / `SequencedMap` `[21]`: `getFirst`, `getLast`, `reversed`, `firstEntry`, `pollFirstEntry`.

## 2. Why it matters
Business data is full of alternatives: a payment is approved, declined, pending or refunded; a claim is approved,
partly approved, rejected or under review. Modelling them as a status flag plus nullable fields leads to if/else
chains with a silent final `else`. Sealed records with pattern switches make each alternative explicit, carry only
the data that alternative has, and let the compiler check that every case is handled.

## 3. Theory
* **Records** `[16]`:
  * They generate private final fields, the canonical constructor, accessors, `equals`, `hashCode` and `toString`.
  * The compact constructor validates and normalises (for example `amount.setScale(2, HALF_UP)`).
  * Records are shallowly immutable (L15).
  * `equals` uses each component's `equals`: two BigDecimals with different scales are not equal unless normalised.
  * Local records name intermediate pipeline results.
* **Sealed interfaces** `[17]`: `sealed interface PaymentResult permits Approved, Declined, Pending, Refunded`.
  The set is closed and known at compile time (and at runtime: `getPermittedSubclasses()`).
* **Algebraic data type:** a sealed interface plus records. Each record carries exactly its own data.
* **Switch expressions** `[14]`: arrow cases, no fall-through, several labels per case, `yield`, and exhaustiveness over enums.
* **Pattern matching for instanceof** `[16]`: `o instanceof Customer c && c.tier() == PLATINUM`. The variable is in
  scope only where the test is true.
* **Pattern matching for switch** `[21]`:
  * Cases can be type patterns, record patterns (also nested) and guards (`when`), plus `case null`.
  * Over a sealed type the switch is exhaustive without `default`; over `Object` a `default` is required.
  * Dominance: a general case before a more specific guarded case of the same type is a compile error.
* **Sequenced collections** `[21]` (JEP 431):
  * `List`, `Deque`, `LinkedHashSet` and `SortedSet` are `SequencedCollection`s; `LinkedHashMap` and `SortedMap`
    are `SequencedMap`s.
  * New methods: `getFirst/getLast`, `addFirst/addLast`, `removeFirst/removeLast`, `reversed()` (a view),
    `firstEntry/lastEntry/pollFirstEntry/putFirst`.
* **Beyond Java 21:** unnamed variables and patterns `_` (final in Java 22) and primitive types in patterns (preview)
  are not used in this course.

## 4. Visual explanation
* Slide 4: the sealed PaymentResult ADT.
* Slide 6: a Java 21 pattern switch with guards and nested record patterns.
* Slide 8: the sequenced collections table.
* Slide 14: the version map.
* Sketch notes: the closed box of four records, taking a record apart, first/last/reversed.

## 5. API reference

| Feature / API | Purpose | Since |
|---|---|---|
| switch expression (`->`, `yield`) | expression, no fall-through, exhaustive over enums | Java 14 |
| `record` (incl. local records, compact constructors) | immutable data carriers | Java 16 |
| `instanceof` pattern | test + bind in one step | Java 16 |
| `sealed` / `non-sealed` / `permits` | closed hierarchies | Java 17 |
| `Class.isSealed()`, `getPermittedSubclasses()` | reflection on sealed types | Java 17 |
| pattern matching for `switch`, `case null`, guards (`when`) | type-safe branching | Java 21 |
| record patterns (nested) | destructuring | Java 21 |
| `SequencedCollection.getFirst/getLast/reversed/addFirst/addLast` | ordered access | Java 21 |
| `SequencedMap.firstEntry/lastEntry/pollFirstEntry/putFirst/reversed` | ordered map access | Java 21 |
| unnamed patterns `_` | ignore components | Java 22 (Beyond Java 21) |

## 6. Worked examples (real output)

| Example | Class | Output |
|---|---|---|
| Money validation | `theory.RecordsInPipelines` | `SGD 10.01 \| currency must be 3 capital letters: sgd \| currency mismatch: SGD vs USD` |
| Totals per currency | `theory.RecordsInPipelines` | `{SGD=SGD 15244.95, USD=USD 1447.49}` |
| Local record | `theory.RecordsInPipelines` | `[ACC-1004=2915.69, ACC-1012=2372.16, ACC-1003=1798.71]` |
| Sealed results | `theory.PaymentResults` | `P005 APPROVED large PAYNOW 1500.00` · `{APPROVED=8, DECLINED=2, PENDING=1, REFUNDED=1}` · `2999.19` |
| instanceof pattern | `theory.PatternMatchingEvolution` | `PLATINUM customer Chen Wei` |
| switch expression | `theory.PatternMatchingEvolution` | `risk SUCCESS=0 PENDING=2 REFUNDED=5 FAILED=10` |
| Pattern switch over Object | `theory.PatternMatchingEvolution` | `OVERDRAWN account ACC-1013 -150.25` · `foreign money USD 533.03` · `null!` |
| Nested record pattern | `theory.PatternMatchingEvolution` | `T023: capped fee USD 10.00` |
| Sequenced collections | `theory.SequencedCollectionsDemo` | `first=P001 last=P012` · `reversed first 3=[P012, P011, P010]` · `polled P003=PAYPAL` |
| Before: if/else + catch-all else | `before.LegacyOutcomeReport` | 12 lines + `APPROVED=8 DECLINED=2 PENDING=1 REFUNDED=1 settled=2999.19` |
| After: Java 8 OO hierarchy | `after.PolymorphicOutcomeReport` | same 13 lines |
| Modern: sealed records + pattern switches | `modern.SealedOutcomeReport` | same 13 lines |

**Decision:** the brief names three payment outcomes (Approved | Declined | Pending). The shared dataset also has a
`REFUNDED` status, so `PaymentResult` has a fourth record, `Refunded`. It is a good illustration of exhaustiveness.

## 7. Best practices
* Validate and normalise in compact constructors; copy mutable components.
* Model each alternative as its own record and close the set with `sealed`.
* Write exhaustive switches over sealed types without `default`.
* Put guarded (more specific) cases before general ones; handle `null` explicitly with `case null` when it can occur.
* Use `instanceof` patterns for single checks inside streams.
* Prefer `getFirst/getLast/reversed` over index arithmetic; remember `reversed()` is a view.

## 8. Pitfalls and anti-patterns
| Anti-pattern | Problem | Fix |
|---|---|---|
| status flag + nullable fields | invalid combinations representable | one record per alternative |
| `default` in a switch over a sealed type | new cases are not flagged | list every case |
| final `else` catch-all | new statuses misreported silently | exhaustive switch expression |
| general case before a guarded case | compile error (dominated) | specific cases first |
| BigDecimal component not normalised | `5` and `5.00` records differ | `setScale` in the compact constructor |
| `list.get(list.size() - 1)` | noisy, error-prone | `list.getLast()` `[21]` |

## 9. Java 8 → 21 evolution
* Java 8: `instanceof` + cast; switch statements with `break`.
* Java 14: switch expressions.
* Java 15: text blocks.
* Java 16: records, pattern matching for `instanceof`.
* Java 17: sealed classes and interfaces (LTS).
* Java 21: pattern matching for `switch`, record patterns, sequenced collections (LTS).
* Beyond Java 21: unnamed variables and patterns (22), primitive patterns (preview).

## 10. Interview questions
1. **What does a record generate?** Private final fields, the canonical constructor, accessors, `equals`, `hashCode`, `toString`.
2. **Why sealed interfaces?** To close the set of implementations: exhaustive switches with no `default`, and safer evolution.
3. **What is a record pattern?** `case Approved(var id, var amt)` tests the type and destructures the components in one step.
4. **What is a guard, and what is dominance?** `case X x when cond`; a general case before a guarded one makes the latter unreachable, which is a compile error.
5. **What do sequenced collections add?** `getFirst/getLast`, `addFirst/addLast`, `removeFirst/removeLast`, `reversed()`, and `firstEntry/lastEntry` for maps.

## 11. Hands-on exercise (~45 min)
`exercise.Exercise16`: **insurance claim outcomes** modelled with sealed records and processed with streams.

The model is given so the tests compile: a `Claim` record that validates itself, a sealed `ClaimOutcome` with
`Approved | PartiallyApproved | Rejected | UnderReview`, and eight `CLAIMS` against SampleData policies. The dataset
has no claims, so these eight are the exercise input.

Rules (course rules, not real insurance terms):
* Unknown policy → `Rejected`.
* Incident after expiry → `Rejected`.
* Documents missing → `UnderReview`.
* Claimed over 10 × annual premium → `PartiallyApproved(10 × premium)`.
* Otherwise → `Approved(claimed)`.

Tasks:
1. `decide`.
2. `describe`: record patterns plus a guard for large approvals.
3. `outcomes`.
4. `countByKind` → `{APPROVED=3, PARTIAL=2, REJECTED=2, UNDER_REVIEW=1}`.
5. `paid`.
6. `totalPaid` → `35280.50`.
7. `rejected`, using `instanceof` patterns.
8. `paidPerPolicyType`.
9. `lastOutcome`, using `getLast()`.

Remove `@Disabled` in `Exercise16Test`. Reference solution: `solution.Solution16`.

## 12. Pros and cons
| Pros | Cons / limitations |
|---|---|
| Data is explicit and immutable | A new case touches every switch |
| The compiler checks every case | Needs Java 17 (sealed) / 21 (patterns) |
| A new operation is one new switch | Long record patterns can be noisy |
| No nullable "sometimes" fields | Records cannot inherit behaviour |
| Destructuring reads like the data | Dominance rules must be learned |
| Fits naturally into streams | Not for open plugin hierarchies |

## 13. Summary
* Records `[16]`: validate and normalise in compact constructors.
* Sealed `[17]` + records = algebraic data types.
* `instanceof` patterns `[16]`, switch expressions `[14]`.
* Pattern switch, record patterns, guards, `case null` `[21]`; exhaustive over sealed types, no `default`.
* Sequenced collections `[21]`: `getFirst`, `getLast`, `reversed`.

**Next:** L17 Functional Error Handling.

---

## How to run
**IntelliJ IDEA:** open the repo as a Maven project (JDK 21) and click ▶ next to any `main()`.

**Maven:**
```bash
mvn test
mvn -q compile exec:java -Dexec.mainClass=com.itgreenzone.fp.l16_records_sealed.theory.PatternMatchingEvolution
```

## Concept → class

| Concept | Class | Test |
|---|---|---|
| Records: validation, normalisation, map keys, local records | `theory.RecordsInPipelines` | `RecordsSealedPatternsTest` |
| Sealed PaymentResult, exhaustive switches, streams + switch | `theory.PaymentResults` | `RecordsSealedPatternsTest` |
| instanceof patterns, switch expressions, pattern switch, nested patterns | `theory.PatternMatchingEvolution` | `RecordsSealedPatternsTest` |
| SequencedCollection / SequencedMap | `theory.SequencedCollectionsDemo` | `RecordsSealedPatternsTest` |
| Payment outcome report three ways | `before.*`, `after.*`, `modern.*` | `OutcomeReportRefactoringTest` |
| Insurance claim outcomes | `exercise.Exercise16`, `solution.Solution16` | `Exercise16Test` (disabled), `Solution16Test` |
| Every `main()` output | all of the above | `MainOutputTest` (golden files) |
| Quiz "predict the output" answers | n/a | `QuizAnswersTest` |
