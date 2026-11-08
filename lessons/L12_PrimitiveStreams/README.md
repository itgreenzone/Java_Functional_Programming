# L12 · Primitive Streams & Numeric Work

**Module 2 · Stream API** · Java 8 → Java 21 · ITGreenZone

| Deliverable | File |
|---|---|
| Slides (15, with speaker notes) | [L12_PrimitiveStreams_Slides.pptx](L12_PrimitiveStreams_Slides.pptx) |
| Interactive quiz (10 Qs, offline) | [L12_PrimitiveStreams_Quiz.html](L12_PrimitiveStreams_Quiz.html) |
| Cheat sheet (p.1) + sticky notes (p.2) | [L12_PrimitiveStreams_CheatSheet.pdf](L12_PrimitiveStreams_CheatSheet.pdf) |
| Handwritten sketch notes | [L12_PrimitiveStreams_SketchNotes.pdf](L12_PrimitiveStreams_SketchNotes.pdf) |
| Code | [`com.itgreenzone.fp.l12_primitive_streams`](../../src/main/java/com/itgreenzone/fp/l12_primitive_streams) |

## 1. Learning objectives
1. Create `IntStream`, `LongStream` and `DoubleStream` with `range`, `rangeClosed`, `iterate` and `mapToInt/Long/Double`.
2. Use the numeric terminals `sum`, `average`, `min`, `max` and `summaryStatistics`, including their empty-stream behaviour.
3. Convert between object and primitive streams with `boxed`, `mapToObj` and `asDoubleStream`, and explain the cost of boxing.
4. Explain why `double` is wrong for money and apply the BigDecimal and long-cents patterns.
5. Analyse text with `chars()` and `codePoints()`, and generate repeatable random streams.

## 2. Why it matters
Statistics, totals, load factors and counters are everywhere in banking and airline systems. Boxed `Integer` lists
waste memory and invite the `==` bug, hand-written min/max loops hide off-by-one errors, and `double` money causes
rounding differences that auditors find. Primitive streams make numeric code short and correct, and knowing their
limits tells you when to stay with BigDecimal.

## 3. Theory
* **Three primitive streams** `[8]`: `IntStream`, `LongStream`, `DoubleStream`. There is no `CharStream`; characters
  arrive as an `IntStream`.
* **Creating:**
  * `range(a, b)` is half-open (b excluded); `rangeClosed(a, b)` includes b.
  * `iterate(seed, next)` `[8]` is infinite, so `limit` it; `iterate(seed, hasNext, next)` `[9]` stops by itself.
  * `mapToInt`, `mapToLong`, `mapToDouble` from an object stream; `IntStream.of(...)`; `String.chars()`; `Random.ints(...)`.
* **Terminals:**
  * `sum()` of an empty stream is 0.
  * `average()`, `min()`, `max()` return `OptionalDouble`/`OptionalInt`; empty when there are no elements.
  * `summaryStatistics()` gives count, sum, min, max and average in one pass; its `toString` is locale-dependent.
* **Converting:**
  * `boxed()` and `mapToObj(f)` go back to objects. They are required before any `Collector`, because primitive
    streams only offer `collect(supplier, accumulator, combiner)`.
  * `asLongStream()`, `asDoubleStream()` widen without casts.
* **Boxing:** each `Integer` is an object. `Integer.valueOf` caches -128..127 by default, so `==` on boxed values
  works for small numbers only. Use `equals`, or stay primitive.
* **double vs money:** binary floating point cannot represent 0.1 exactly. Results depend on the order of addition,
  and `DoubleStream.sum()` (compensated summation) can differ from `reduce(0, Double::sum)`. Use `BigDecimal` with
  `reduce(ZERO, add)` and `divide(n, 2, HALF_UP)`, or `long` cents in a `LongStream`.
* **Text:** `chars()` returns UTF-16 code units; `codePoints()` returns Unicode characters (an emoji outside the BMP is
  2 chars but 1 code point).
* **Random:** `new Random(seed)` gives a repeatable sequence (the algorithm is specified). `ThreadLocalRandom` for
  multi-threaded code, `SplittableRandom` for parallel streams, `RandomGenerator` `[17]`, and `SecureRandom` for secrets.

## 4. Visual explanation
* Slide 3: the three stream types and the creation table.
* Slide 5: the conversion diagram (mapToInt, boxed, mapToObj, asDoubleStream).
* Slide 7: the double vs BigDecimal table with real output.
* Sketch notes: boxes vs a belt of ints, in-and-out arrows, double ✗ vs BigDecimal ✓.

## 5. API reference

| API | Result | Since |
|---|---|---|
| `IntStream.range / rangeClosed` | IntStream | Java 8 |
| `IntStream.iterate(seed, next)` | infinite IntStream | Java 8 |
| `IntStream.iterate(seed, hasNext, next)` | finite IntStream | Java 9 |
| `mapToInt / mapToLong / mapToDouble` | primitive stream | Java 8 |
| `flatMapToInt` | IntStream | Java 8 |
| `boxed()`, `mapToObj(f)` | `Stream<T>` | Java 8 |
| `asLongStream()`, `asDoubleStream()` | wider primitive stream | Java 8 |
| `sum()` | int / long / double | Java 8 |
| `average()` | OptionalDouble | Java 8 |
| `min()`, `max()` | OptionalInt / OptionalLong / OptionalDouble | Java 8 |
| `summaryStatistics()` | Int/Long/DoubleSummaryStatistics | Java 8 |
| `CharSequence.chars()`, `codePoints()` | IntStream | Java 8 |
| `Random.ints / longs / doubles` | primitive stream | Java 8 |
| `RandomGenerator.of(name)` | RandomGenerator | Java 17 |
| `Stream.toList()` | unmodifiable List | Java 16 |

## 6. Worked examples (real output)

| Example | Class | Output |
|---|---|---|
| range vs rangeClosed | `theory.PrimitiveBasics` | `10` · `15` |
| average of no flights | `theory.PrimitiveBasics` | `OptionalDouble.empty` |
| seat statistics | `theory.PrimitiveBasics` | `count=8 sum=2078 min=160 max=471 avg=259.75` |
| iterate with a predicate | `theory.PrimitiveBasics` | `[1, 11, 21, 31, 41]` |
| boxed reduce vs mapToInt | `theory.BoxingAndConversions` | `1808` both |
| seat labels with mapToObj | `theory.BoxingAndConversions` | `[1A, 1B, 1C, 1D, 1E, 1F]` |
| Integer cache trap | `theory.BoxingAndConversions` | `100: ==true` · `1000: ==false equals=true` |
| double money | `theory.MoneyAndDoubles` | `0.30000000000000004` · `0.9999999999999999` vs `1.0` · `0.6000000000000001 vs 0.6` |
| BigDecimal patterns | `theory.MoneyAndDoubles` | `4429.84` · average `369.15` · `442984 -> 4429.84` |
| chars() | `theory.CharsAndRandom` | `[83, 73, 78]` · `[S, I, N]` · `22 digits, 16 letters` |
| first non-repeated | `theory.CharsAndRandom` | `G` (in SINGAPORE AIRLINES) |
| chars vs codePoints | `theory.CharsAndRandom` | `chars=6 codePoints=5` |
| seeded dice | `theory.CharsAndRandom` | `[3, 4, 1, 3, 1, 2]` twice |
| Before: boxed lists + min/max loop | `before.LegacyLoadReport` | `SQ21   SIN-EWR 159/161  98.76%` … `TOTAL  1808/2078 booked, load 87.01%` · `EMPTY SEATS min=2 max=63 avg=33.75` |
| After: mapToInt + summaryStatistics | `after.StreamLoadReport` | same 10 lines |
| Modern: record, exact BigDecimal %, no double | `modern.ModernLoadReport` | same 10 lines |

## 7. Best practices
* Use `mapToInt/Long/Double` for numeric work; avoid `map(..).reduce(0, Integer::sum)`.
* Use `summaryStatistics()` when you need several statistics; format them with `Locale.ROOT`.
* Handle empty streams: `average().orElse(..)` or check `isPresent()`.
* Money: `BigDecimal` with an explicit scale and `HALF_UP`, or `long` cents with `longValueExact()`.
* Compare ratios exactly by cross-multiplying as `long` instead of dividing as `double`.
* Seed `Random` in tests; use `SecureRandom` for anything security-related.

## 8. Pitfalls and anti-patterns
| Anti-pattern | Problem | Fix |
|---|---|---|
| `double` / `averagingDouble` for money | inexact, order-dependent | `BigDecimal` or long cents |
| `average().getAsDouble()` | `NoSuchElementException` on empty | `orElse`, `isPresent` |
| `==` on boxed `Integer` | true for 100, false for 1000 | `equals` |
| `map(..).reduce(0, Integer::sum)` | needless boxing | `mapToInt(..).sum()` |
| printing `chars()` | numbers, not letters | `mapToObj(c -> (char) c)` |
| `divide(n)` on BigDecimal | `ArithmeticException` for 1/3 | `divide(n, 2, HALF_UP)` |
| `chars()` to count user-visible characters | emoji count as 2 | `codePoints()` |

## 9. Java 8 → 21 evolution
* Java 8: `IntStream`, `LongStream`, `DoubleStream`, `summaryStatistics`, `String.chars()`, `Random.ints()`, `SplittableRandom`.
* Java 9: `iterate(seed, hasNext, next)`, `takeWhile`/`dropWhile` on primitive streams.
* Java 16: `Stream.toList()`; `mapMulti` / `IntStream.mapMulti`.
* Java 17: `RandomGenerator` and new random algorithms (JEP 356).
* Java 21: no new primitive-stream API; Stream Gatherers are Beyond Java 21 (preview in 22, final in 24), see L13.

## 10. Interview questions
1. **Why do primitive streams exist?** To avoid boxing and to offer numeric terminals such as `sum` and `summaryStatistics`.
2. **What is the average of an empty IntStream?** `OptionalDouble.empty`; the sum is 0.
3. **Why not double for money?** 0.1 has no exact binary form; 0.1 + 0.2 = 0.30000000000000004, and results depend on the order of addition.
4. **How do you collect an IntStream into a Map?** `boxed()` or `mapToObj(...)` first, then any Collector.
5. **chars() vs codePoints()?** UTF-16 units vs Unicode code points; they differ for characters outside the BMP.

## 11. Hands-on exercise (~40 min)
`exercise.Exercise12` has **12 problems**: seat occupancy statistics per flight and character frequency of a PNR list.
Each Javadoc gives the expected value:
1. Total seats (`2078`).
2. Total booked (`1808`).
3. Seat statistics with `Locale.ROOT`.
4. Occupancy % per flight (BigDecimal).
5. Empty seats per flight.
6. Fullest flight, compared exactly (`SQ21`).
7. Flights at least 90% booked (`[SQ21, SQ318, SQ938, TR808]`).
8. Overall load % (`87.01`).
9. Character frequency of the PNRs.
10. Most frequent PNR character (`Q=5`).
11. Digits in the PNRs (`16`).
12. Digit sum per PNR.

The shared dataset has no booking references, so `Exercise12.PNRS` defines a fixed list of eight 6-character PNRs
as the exercise input. Remove `@Disabled` in `Exercise12Test`. Reference solution: `solution.Solution12`.

## 12. Pros and cons
| Pros | Cons / limitations |
|---|---|
| No boxing: less memory and garbage | Only int, long and double |
| `sum`, `average`, statistics built in | No `collect(Collector)`: box first |
| Empty-safe Optional results | No BigDecimal stream for money |
| `range`/`iterate` replace counting loops | double results are inexact |
| `chars()`/`codePoints()` for text | `chars()` counts UTF-16 units |
| Seeded random streams for tests | Switching types adds noise |

## 13. Summary
* Three primitive streams; `range` is half-open; `iterate` with a predicate `[9]`.
* `sum`, `average` (Optional), `summaryStatistics`.
* `mapToInt` in, `boxed`/`mapToObj` out; box before a Collector.
* Money: BigDecimal or long cents, never double.
* `chars()` gives ints; `codePoints()` gives real characters; seed `Random` for repeatable tests.

**Next:** L13 Advanced Stream Operations.

---

## How to run
**IntelliJ IDEA:** open the repo as a Maven project (JDK 21) and click ▶ next to any `main()`.

**Maven:**
```bash
mvn test
mvn -q compile exec:java -Dexec.mainClass=com.itgreenzone.fp.l12_primitive_streams.theory.MoneyAndDoubles
```

## Concept → class

| Concept | Class | Test |
|---|---|---|
| range, iterate, sum, average, summaryStatistics | `theory.PrimitiveBasics` | `PrimitiveStreamsTest` |
| boxed, mapToObj, asDoubleStream, Integer cache | `theory.BoxingAndConversions` | `PrimitiveStreamsTest` |
| double vs BigDecimal, long cents | `theory.MoneyAndDoubles` | `PrimitiveStreamsTest` |
| chars, codePoints, seeded Random | `theory.CharsAndRandom` | `PrimitiveStreamsTest` |
| Refactoring a flight load report | `before.*`, `after.*`, `modern.*` | `LoadReportRefactoringTest` |
| Seat occupancy and PNR characters | `exercise.Exercise12`, `solution.Solution12` | `Exercise12Test` (disabled), `Solution12Test` |
| Every `main()` output | all of the above | `MainOutputTest` (golden files) |
| Quiz "predict the output" answers | n/a | `QuizAnswersTest` |
