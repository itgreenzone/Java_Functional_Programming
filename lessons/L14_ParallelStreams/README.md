# L14 · Parallel Streams & Performance

**Module 2 · Stream API** · Java 8 → Java 21 · ITGreenZone

| Deliverable | File |
|---|---|
| Slides (15, with speaker notes) | [L14_ParallelStreams_Slides.pptx](L14_ParallelStreams_Slides.pptx) |
| Interactive quiz (10 Qs, offline) | [L14_ParallelStreams_Quiz.html](L14_ParallelStreams_Quiz.html) |
| Cheat sheet (p.1) + sticky notes (p.2) | [L14_ParallelStreams_CheatSheet.pdf](L14_ParallelStreams_CheatSheet.pdf) |
| Handwritten sketch notes | [L14_ParallelStreams_SketchNotes.pdf](L14_ParallelStreams_SketchNotes.pdf) |
| Code | [`com.itgreenzone.fp.l14_parallel`](../../src/main/java/com/itgreenzone/fp/l14_parallel) |

## 1. Learning objectives
1. Explain how a parallel stream works: Spliterator splitting, `ForkJoinPool.commonPool()`, combining.
2. Decide when parallel can help (large N × Q, CPU-bound, good source) and when it hurts.
3. Recognise and fix thread-safety bugs: shared mutable state, non-associative reduce, wrong identity.
4. Use `findFirst` vs `findAny`, `forEach` vs `forEachOrdered`, and `unordered()` correctly.
5. Measure with JMH instead of guessing, and place virtual threads `[21]` correctly next to parallel streams.

## 2. Why it matters
"Just add `parallel()`" is one of the most common performance myths in Java. For typical business data it is often
slower, it shares one thread pool with the whole application, and it turns innocent-looking code (a shared list,
a starting value in `reduce`, `findAny`) into code that is wrong only sometimes. Knowing the rules prevents
production incidents that tests do not catch.

## 3. Theory
* **Split, run, combine** `[8]`:
  * The source's `Spliterator` is split recursively with `trySplit`.
  * Chunks run as fork/join tasks on `ForkJoinPool.commonPool()`, and the caller thread helps.
  * Partial results are combined by a collector's combiner or a reduce operator.
* **Splitting quality:**
  * Arrays, `ArrayList` and ranges split in half (`SIZED`, `SUBSIZED`).
  * A `LinkedList` copies a batch instead of splitting (16 elements → `16 + 0`).
  * `Stream.iterate` and I/O sources have an unknown size.
* **One pool:** the common pool's parallelism defaults to cores − 1. It is shared by every parallel stream and by
  `CompletableFuture` async methods without an executor. `parallel()`/`sequential()` set one flag for the whole pipeline; the last call wins.
* **When it can help:** large N × Q (elements × cost per element), a well-splitting source, pure functions,
  CPU-bound work, cheap combining, primitive streams.
* **When it hurts:** small data, LinkedList/iterate/I/O sources, shared state, blocking I/O, order-sensitive
  operations (`limit`, `findFirst`, `sorted`, `forEachOrdered`) on big data, boxing.
* **Thread safety:**
  * Never mutate shared state from lambdas; `collect`/`toList`/`groupingBy` are safe and keep encounter order.
  * `reduce` needs an associative operator and a neutral identity.
  * BigDecimal addition is stable in parallel; double sums can change in the last digits.
* **Ordering:** `toList`/`collect` and `findFirst` respect encounter order; `forEach` and `findAny` do not;
  `forEachOrdered` restores order but serialises the action; `unordered()` lets `limit`/`distinct` take any elements.
* **Measuring:** use JMH (warm-up, forks, returned results, realistic data, target hardware), never one `nanoTime`.
* **Virtual threads** `[21]` make blocking cheap; use them for many I/O-bound tasks. Parallel streams are for
  CPU-bound work on in-memory data. Blocking inside a parallel stream starves the common pool.

## 4. Visual explanation
* Slide 3: split, run, combine, with real split results.
* Slide 7: the shared-list race with three real runs.
* Slide 8: the reduce rules table.
* Slide 10: parallel streams vs virtual threads.
* Sketch notes: the split diagram, two threads hitting one slot, CPU vs waiting.

## 5. API reference

| API | Purpose | Since |
|---|---|---|
| `Collection.parallelStream()`, `BaseStream.parallel()/sequential()/isParallel()` | parallel execution flag | Java 8 |
| `ForkJoinPool.commonPool()` | the shared pool | Java 8 (ForkJoinPool: Java 7) |
| `Spliterator.trySplit / estimateSize / characteristics` | splitting | Java 8 |
| `BaseStream.unordered()` | drop the encounter-order constraint | Java 8 |
| `findFirst()` / `findAny()` | ordered / any match | Java 8 |
| `forEach()` / `forEachOrdered()` | unordered / ordered action | Java 8 |
| `Collectors.groupingByConcurrent / toConcurrentMap` | one shared concurrent map | Java 8 |
| `Executors.newVirtualThreadPerTaskExecutor()` | a virtual thread per task | Java 21 |
| `Thread.isVirtual()` | virtual or platform thread | Java 21 |
| `ExecutorService` as `AutoCloseable` | try-with-resources waits for tasks | Java 19 |

## 6. Worked examples (real output)

| Example | Class | Output |
|---|---|---|
| Splitting | `theory.HowParallelWorks` | `ArrayList(16): 8 + 8` · `LinkedList(16): 16 + 0` |
| Last call wins | `theory.HowParallelWorks` | `parallel()..sequential() isParallel : false` |
| Order | `theory.OrderingAndFindAny` | `toList() keeps order : true` · `findFirst : P005` · `findAny is one of the matches : true` |
| Non-associative reduce | `theory.ThreadSafetyPitfalls` | `-55` sequential · `parallel gives a different value : true` |
| Wrong identity | `theory.ThreadSafetyPitfalls` | `65` sequential · `parallel adds 10 more than once : true` · fixed `65 / 65` |
| Safe collection | `theory.ThreadSafetyPitfalls` | `100000 in order=true` |
| Race (non-deterministic) | `theory.RaceDemo` | e.g. `95301`, `94292`, `100000` of 100000 |
| Decision checklist | `theory.ParallelDecision` | `12 payments … NOT parallel(): [N x Q = 12 is too small]` |
| Virtual threads | `theory.VirtualThreadsContext` | `12 results, in order=true, all virtual=true` |
| Before: loop | `before.LegacyFeeReport` | `TRANSFER: 8 debits, fees 17.97` … `TOTAL FEES 42.95` |
| After: parallel collect, pure fee() | `after.StreamFeeReport` | same 8 lines, every run |
| Modern: unordered + groupingByConcurrent + teeing | `modern.ModernFeeReport` | same 8 lines, every run |

## 7. Best practices
* Sequential by default; switch to parallel only for measured CPU-bound hot spots.
* Keep lambdas pure; never mutate shared state. Let `collect`/`toList`/`groupingBy` build results.
* Use an associative operator and a neutral identity in `reduce`; add starting values once, outside.
* Use `findFirst` when the business means "the first"; `findAny`/`unordered()` only when any result is acceptable.
* Never block inside a parallel stream; use virtual threads or a dedicated executor for I/O.
* Measure with JMH on realistic data and the target hardware.
* Repeat parallel tests many times: a race can pass once by luck.

## 8. Pitfalls and anti-patterns
| Anti-pattern | Problem | Fix |
|---|---|---|
| `parallel()` everywhere | slower for small data; loads the shared pool | sequential by default |
| `forEach(list::add)` on a shared `ArrayList` | lost elements, exceptions | `toList()` / `collect` |
| `synchronizedList` + `forEach` | correct but contended and unordered | `collect` |
| `reduce(start, op)` | start added once per chunk | `start op reduce(identity, op)` |
| `reduce(0, (a, b) -> a - b)` | not associative | restructure the computation |
| `findAny` for "the first" | different result per run | `findFirst` |
| HTTP/JDBC inside `parallelStream` | starves the common pool | virtual threads `[21]` |
| One `nanoTime` measurement | measures warm-up and noise | JMH |

## 9. Java 8 → 21 evolution
* Java 7: Fork/Join framework (`ForkJoinPool`).
* Java 8: parallel streams, `ForkJoinPool.commonPool()`, `Spliterator`, `groupingByConcurrent`.
* Java 9: `Flow` (reactive streams interfaces), `CompletableFuture` improvements.
* Java 16: `Stream.toList()` (order-preserving in parallel).
* Java 19: `ExecutorService` implements `AutoCloseable`; virtual threads in preview.
* Java 21: virtual threads final (JEP 444); structured concurrency and scoped values still in preview.

## 10. Interview questions
1. **Which pool runs parallel streams?** `ForkJoinPool.commonPool()`, plus the calling thread.
2. **Why can parallel be slower?** Split/merge overhead, poor splitting, boxing, ordering constraints, small N × Q.
3. **What must a reduce operator satisfy?** Associative, stateless, non-interfering, with a neutral identity.
4. **findFirst vs findAny?** `findFirst` respects encounter order; `findAny` may return any match and is cheaper in parallel.
5. **Parallel streams or virtual threads?** CPU-bound in-memory work → parallel streams; many blocking I/O tasks → virtual threads.

## 11. Hands-on exercise (~30 min)
`exercise.Exercise14` contains **three broken parallel pipelines**. They compile and look plausible. Fix each one
while keeping `parallelStream()`:
1. `settlementTotal(100.00)` should be `4529.84`; a real broken run printed `4829.84`.
2. `firstPaymentOver(500.00)` should be `P005`; a real broken run printed `P008`.
3. `successfulIds()` should be `[P001, P002, P004, P005, P007, P009, P010, P011]` in order; the broken version
   uses a shared `ArrayList`.

`Exercise14Test` repeats each check 50 times, because a parallel bug can pass once by luck. Remove `@Disabled`
when you are done. Reference solution: `solution.Solution14`.

## 12. Pros and cons
| Pros | Cons / limitations |
|---|---|
| One word to use all cores | Overhead dominates small data |
| Same pipeline code as sequential | One shared pool for the whole JVM |
| Real gains for large CPU-bound work | Shared state gives wrong results |
| collect/reduce merge results safely | Order-sensitive operations cost extra |
| Arrays and ranges split well | Blocking I/O starves the pool |
| No manual thread management | Needs real measurement (JMH) |

## 13. Summary
* Split (Spliterator), run (common pool + caller), combine.
* Parallel can help only for large N × Q, CPU-bound work on a well-splitting source: measure with JMH.
* No shared mutable state; let `collect`/`toList` build results.
* `reduce`: associative operator, neutral identity.
* `findFirst`/`forEachOrdered` keep order; `findAny`/`forEach` do not.
* Virtual threads `[21]` are for blocking I/O, not a replacement for parallel streams.

**Next:** L15 Functional Programming Principles in Java (Module 3).

---

## How to run
**IntelliJ IDEA:** open the repo as a Maven project (JDK 21) and click ▶ next to any `main()`.
Run `theory.RaceDemo` several times to see the race; its output changes on purpose.

**Maven:**
```bash
mvn test
mvn -q compile exec:java -Dexec.mainClass=com.itgreenzone.fp.l14_parallel.theory.ThreadSafetyPitfalls
```

## Concept → class

| Concept | Class | Test |
|---|---|---|
| Splitting, common pool, parallel flag | `theory.HowParallelWorks` | `ParallelTest` |
| toList/forEach/forEachOrdered, findFirst/findAny, unordered | `theory.OrderingAndFindAny` | `ParallelTest` |
| Associativity, identity, safe collection, counters | `theory.ThreadSafetyPitfalls` | `ParallelTest` |
| Shared-list race (non-deterministic) | `theory.RaceDemo` | `ParallelTest` (bounds only) |
| When parallel can help: checklist | `theory.ParallelDecision` | `ParallelTest` |
| Virtual threads for blocking I/O | `theory.VirtualThreadsContext` | `ParallelTest` |
| Fee report correct in parallel | `before.*`, `after.*`, `modern.*` | `FeeReportRefactoringTest` |
| Three broken pipelines | `exercise.Exercise14`, `solution.Solution14` | `Exercise14Test` (disabled), `Solution14Test` |
| Every deterministic `main()` output | all of the above except RaceDemo | `MainOutputTest` (golden files) |
| Quiz "predict the output" answers | n/a | `QuizAnswersTest` |
