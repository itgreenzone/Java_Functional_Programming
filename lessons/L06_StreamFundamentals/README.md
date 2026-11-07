# L06 · Stream Fundamentals

**Module 2 · Stream API** · Java 8 → Java 21 · ITGreenZone

| Deliverable | File |
|---|---|
| Slides (15, with speaker notes) | [L06_StreamFundamentals_Slides.pptx](L06_StreamFundamentals_Slides.pptx) |
| Interactive quiz (10 Qs, offline) | [L06_StreamFundamentals_Quiz.html](L06_StreamFundamentals_Quiz.html) |
| Cheat sheet (p.1) + sticky notes (p.2) | [L06_StreamFundamentals_CheatSheet.pdf](L06_StreamFundamentals_CheatSheet.pdf) |
| Handwritten sketch notes | [L06_StreamFundamentals_SketchNotes.pdf](L06_StreamFundamentals_SketchNotes.pdf) |
| Code | [`com.itgreenzone.fp.l06_stream_fundamentals`](../../src/main/java/com/itgreenzone/fp/l06_stream_fundamentals) |

## 1. Learning objectives
1. Explain how a stream differs from a collection: it stores nothing, does not modify its source, and can be used once.
2. Describe the pipeline: source → zero or more intermediate operations → one terminal operation.
3. Predict execution order: laziness, loop fusion (vertical order), stateful barriers and short-circuiting.
4. Create streams from collections, values, arrays, ranges, `iterate`, `generate`, `ofNullable`, strings and files.
5. Place every core operation on the method map: intermediate or terminal, stateless or stateful, short-circuiting or not, and the Java version it arrived in.

## 2. Why it matters
"Top 3 debits in October" in pre-Java 8 code means a temporary list, a hand-written `Comparator`, and an index loop
that must guard against both the list size and `n`. Streams state the requirement directly. But you only use them
well if you can predict *what runs when*: misplacing `limit`, forgetting a terminal operation, or reusing a
stream are among the most common stream bugs in production code.

## 3. Theory
* **A stream** `[Java 8]` is a pipeline over a source. It stores nothing and never modifies the source (`failedPaymentIds` leaves all 12 payments in place).
* **Lazy:** intermediate operations only describe work. Nothing runs until the terminal operation (`withoutTerminal` records an empty trace).
* **Loop fusion / vertical order:** each element passes through all stateless steps before the next element starts: `filter P001, map P001, filter P002, filter P003, map P003`.
* **Stateful barrier:** `sorted` must receive every element before it can emit the first. With `sorted()` in the middle, all five `filter` calls run before any `map`.
* **Short-circuiting:** `limit`, `takeWhile`, `anyMatch`, `findFirst`… stop early. That makes infinite sources (`iterate`, `generate`) usable, and `anyMatch(FAILED)` inspects only 3 of 12 payments.
* **One-shot:** a second terminal operation throws `IllegalStateException: stream has already been operated upon or closed`.
* **Encounter order:** a `List` source is `ORDERED`; a `HashSet` is not.
* **Parallel flag:** `parallel()` and `sequential()` set one flag for the whole pipeline; the last call wins (details in L14).

## 4. Visual explanation
* Slide 3: the pipeline diagram.
* Slides 4–5: the laziness trace and the `sorted` barrier.
* Slides 9–10: the method map.
* Sketch notes: the conveyor belt with its GO button, `sorted` as a dam, the stream as a one-time train ticket, and short-circuit boxes.

## 5. API reference

| Operation | Kind | Stateful | Short-circuit | Since |
|---|---|---|---|---|
| `filter`, `map`, `flatMap`, `peek`, `mapToInt/Long/Double` | intermediate | no | no | Java 8 |
| `mapMulti` | intermediate | no | no | Java 16 |
| `distinct`, `sorted` | intermediate | yes (barrier) | no | Java 8 |
| `skip` / `limit` | intermediate | yes | `limit` yes | Java 8 |
| `takeWhile` / `dropWhile` | intermediate | yes | `takeWhile` yes | Java 9 |
| `forEach`, `toArray`, `reduce`, `collect`, `count`, `min`, `max` | terminal | n/a | no | Java 8 |
| `toList()` (unmodifiable) | terminal | n/a | no | Java 16 |
| `anyMatch` / `allMatch` / `noneMatch`, `findFirst` / `findAny` | terminal | n/a | yes | Java 8 |
| `Stream.of`, `Arrays.stream`, `IntStream.range/rangeClosed`, `iterate(seed, f)`, `generate` | source | | | Java 8 |
| `Stream.iterate(seed, hasNext, next)`, `Stream.ofNullable` | source | | | Java 9 |
| `Files.lines`, `String.chars` | source | | | Java 8 |
| `Stream.gather(Gatherer)` | intermediate | custom | custom | **Beyond Java 21** (final in Java 24) |

The full list of 24 entries is in `theory.MethodMap`, checked by `StreamBasicsTest`.

## 6. Worked examples (real output)

| Example | Class | Output |
|---|---|---|
| Stream vs collection | `theory.StreamVsCollection` | `failed payments : [P003, P012]` · `source size after : 12 (unchanged)` |
| Laziness and fusion | `theory.LazinessAndFusion` | `filter P001, map P001, filter P002, filter P003, map P003 -> [P001, P003]` |
| Sources | `theory.StreamSources` | `iterate 3-arg [9] : [2026-11-02, 2026-11-09, 2026-11-16, 2026-11-23, 2026-11-30]` |
| Properties | `theory.StreamProperties` | `anyMatch inspected : 3 of 12` · `infinite + limit : [1024, 2048, 4096]` |
| Method map | `theory.MethodMap` | `after Java 8 : [mapMulti [16], takeWhile [9], dropWhile [9], toList [16]]` |
| Before: loops + temp lists | `before.LegacyTopDebits` | `T042 TRANSFER 1432.93` / `T057 TRANSFER 962.80` / `T050 TRANSFER 903.91` |
| After: stream pipeline | `after.StreamTopDebits` | same three lines |
| Modern: records, named predicates, 3-arg `iterate` | `modern.ModernTopDebits` | `debits per week: [2026-10-01: 5, 2026-10-08: 8, 2026-10-15: 0, 2026-10-22: 1, 2026-10-29: 2]` |

## 7. Best practices
* Filter early, so stateful operations such as `sorted` buffer as little as possible.
* Put `sorted` before `limit` when you want "top n".
* Give every infinite source a stop: `limit`, `takeWhile`, a short-circuiting terminal, or the 3-argument `iterate`.
* Close I/O-backed streams: `try (var lines = Files.lines(path)) { … }`.
* Need the data twice? Keep the collection, or pass a `Supplier<Stream<T>>`.
* Use `peek` only for debugging and teaching, never for business logic.
* Prefer `toList()` `[Java 16]` when an unmodifiable result is fine.

## 8. Pitfalls and anti-patterns
| Anti-pattern | Problem | Fix |
|---|---|---|
| Two terminal operations on one stream | `IllegalStateException` | keep the list / `Supplier<Stream<T>>` |
| `limit(3).sorted(...)` for "top 3" | takes the first 3 by position, then sorts them | `sorted(...).limit(3)` |
| `Stream.iterate(1, n -> n * 2).forEach(...)` | never ends | `limit`, `takeWhile`, 3-arg `iterate` |
| Pipeline with no terminal op | nothing runs, silently | end with a terminal operation |
| `forEach(list::add)` into an outer list | side effects; unsafe in parallel | `toList()` / `collect` |
| `Files.lines(p)` not closed | leaks a file handle | try-with-resources |
| Relying on `HashMap`/`HashSet` order | order is undefined | `TreeMap`, `LinkedHashMap`, or `sorted` |

## 9. Java 8 → 21 evolution
* Java 8: `Stream`, `IntStream`, `LongStream`, `DoubleStream`, `Collectors`, 2-argument `iterate`, `generate`.
* Java 9: 3-argument `iterate`, `takeWhile`, `dropWhile`, `ofNullable`.
* Java 16: `mapMulti`, `toList()`.
* Java 21: sequenced collections, e.g. `list.reversed().stream()` as a source.
* **Beyond Java 21:** `Stream.gather(Gatherer)`, preview in 22 and final in Java 24.

## 10. Interview questions
1. **Collection vs stream?** A collection stores data; a stream describes a computation over a source, is lazy, and can be consumed once.
2. **Intermediate vs terminal?** Intermediate operations return a stream and are lazy; the terminal operation triggers execution and produces a result or side effect.
3. **What is loop fusion?** Stateless steps are applied element by element in a single pass, not one loop per step.
4. **Why is `sorted` called stateful?** It must buffer every element before emitting the first one.
5. **How can a stream over an infinite source finish?** Through a short-circuiting operation (`limit`, `takeWhile`, `findFirst`, `anyMatch`…).

## 11. Hands-on exercise (~20 min)
`exercise.Exercise06` contains four pipelines over payments P001–P005, each with `peek` calls that print `f:`/`m:` labels.
**Without running them**, write what each prints into `EXPECTED_1` … `EXPECTED_4`. Then remove `@Disabled` from
`Exercise06Test` and check your predictions. Pipeline 4 has no terminal operation. Reference solution: `solution.Solution06`.

## 12. Pros and cons
| Pros | Cons / limitations |
|---|---|
| Declarative: the pipeline reads like the requirement | One-shot: cannot be reused |
| Lazy: no work until a result is needed | Stateful ops (`sorted`, `distinct`) buffer data |
| Loop fusion: one pass for stateless steps | Harder to debug than a loop |
| Short-circuiting stops early | Easy to misuse (`limit` vs `sorted`, side effects) |
| Works on files and infinite sources | Small overhead for tiny collections in hot paths |
| Parallelism is one call away (measure first, L14) | Index-heavy or early-exit logic is often clearer as a loop (L18) |

## 13. Summary
* A stream stores nothing: source → intermediate* → terminal.
* Lazy until the terminal operation; elements flow one at a time.
* `sorted` is a barrier; `limit`, `takeWhile`, `anyMatch`, `findFirst` short-circuit.
* Use a stream once; infinite sources need a stop; the source stays untouched.
* Java 9 added `takeWhile`, `dropWhile`, 3-arg `iterate`, `ofNullable`; Java 16 added `mapMulti` and `toList()`.

**Next:** L07 Filtering, Mapping & Slicing.

---

## How to run
**IntelliJ IDEA:** open the repo as a Maven project (JDK 21) and click ▶ next to any `main()`.

**Maven:**
```bash
mvn test
mvn -q compile exec:java -Dexec.mainClass=com.itgreenzone.fp.l06_stream_fundamentals.theory.LazinessAndFusion
```

## Concept → class

| Concept | Class | Test |
|---|---|---|
| Stream vs collection, one-shot | `theory.StreamVsCollection` | `StreamBasicsTest` |
| Laziness, fusion, sorted barrier | `theory.LazinessAndFusion` | `StreamBasicsTest` (exact traces) |
| Sources | `theory.StreamSources` | `StreamBasicsTest` |
| Short-circuit, order, parallel flag | `theory.StreamProperties` | `StreamBasicsTest` |
| Method map (24 ops) | `theory.MethodMap` | `StreamBasicsTest` |
| Refactoring loops → streams | `before.*`, `after.*`, `modern.*` | `TopDebitsRefactoringTest` |
| Exercise / solution | `exercise.*`, `solution.Solution06` | `Exercise06Test` (disabled), `Solution06Test` |
| Every `main()` output | all of the above | `MainOutputTest` (golden files) |
| Quiz "predict the output" answers | n/a | `QuizAnswersTest` |
