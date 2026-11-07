# Java Functional Programming: Java 8 → Java 21

**Lambdas, Functional Interfaces, Method References and the Stream API**, an ITGreenZone course
([itgreenzone.com](https://itgreenzone.com)).

Every lesson has runnable Java 21 code with JUnit 5 tests, a slide deck with speaker notes, an offline
interactive quiz, a one-page cheat sheet with sticky notes, and handwritten-style sketch notes.

## Requirements
* JDK 21 (LTS)
* Maven 3.9+
* IntelliJ IDEA (recommended)

## Build and test
```bash
mvn test        # compiles with -Xlint:all -Werror (zero warnings) and runs all JUnit 5 tests
mvn -q compile exec:java -Dexec.mainClass=com.itgreenzone.fp.l01_why_fp.modern.ModernDemo
```

## Shared dataset
`com.itgreenzone.fp.data.SampleData` is used by every lesson, slide, quiz and test:
10 customers, 15 accounts, 60 transactions (Aug–Oct 2026), 10 policies, 8 flights, 12 payments.
All lists are immutable, all records are immutable, and money is always `BigDecimal` (scale 2, `HALF_UP`).

## Lessons

| # | Lesson | Module | Code package | Materials | Status |
|---|---|---|---|---|---|
| L01 | Why Functional Programming in Java | 1 · Foundations | `l01_why_fp` | [lessons/L01_WhyFP](lessons/L01_WhyFP) | ✅ Done |
| L02 | Functional Interfaces: Rules and Standards | 1 · Foundations | `l02_functional_interfaces` | [lessons/L02_FunctionalInterfaces](lessons/L02_FunctionalInterfaces) | ✅ Done |
| L03 | Lambda Expressions In Depth | 1 · Foundations | `l03_lambdas` | [lessons/L03_Lambdas](lessons/L03_Lambdas) | ✅ Done |
| L04 | Method References | 1 · Foundations | `l04_method_references` | [lessons/L04_MethodReferences](lessons/L04_MethodReferences) | ✅ Done |
| L05 | Optional Done Right | 1 · Foundations | `l05_optional` | [lessons/L05_Optional](lessons/L05_Optional) | ✅ Done |
| L06 | Stream Fundamentals | 2 · Streams | `l06_stream_fundamentals` | [lessons/L06_StreamFundamentals](lessons/L06_StreamFundamentals) | ✅ Done |
| L07 | Filtering, Mapping & Slicing | 2 · Streams | `l07_filter_map_slice` | [lessons/L07_FilterMapSlice](lessons/L07_FilterMapSlice) | ✅ Done |
| L08 | Sorting with Comparators | 2 · Streams | `l08_sorting` | [lessons/L08_SortingComparators](lessons/L08_SortingComparators) | ✅ Done |
| L09 | Terminal Operations & Reduction | 2 · Streams | `l09_terminal_ops` | [lessons/L09_TerminalReduction](lessons/L09_TerminalReduction) | ✅ Done |
| L10–L14 | Stream API | 2 · Streams | | | Planned |
| L15–L18 | Functional Design in Modern Java | 3 · Design | | | Planned |
| L19–L21 | Practice Lab, Capstone, Industry Case Studies | 4 · Practice | | | Planned |

## Repository layout
```
src/main/java/com/itgreenzone/fp/
  data/                 shared records, enums and SampleData
  l01_why_fp/           theory/ before/ after/ modern/ exercise/ solution/
  l02_functional_interfaces/   same layout
  l03_lambdas/                 same layout
  l04_method_references/       same layout
  l05_optional/                same layout
  l06_stream_fundamentals/     same layout
  l07_filter_map_slice/        same layout
  l08_sorting/                 same layout
  l09_terminal_ops/            same layout
src/test/java/...       JUnit 5 tests (golden-file tests for every main())
lessons/L<NN>_<Name>/   slides (.pptx), quiz (.html), cheat sheet + sticky notes (.pdf), sketch notes (.pdf)
tools/materials/        generators used to build the lesson materials
```

## Coding standards
Immutable data where possible · no shared mutable state in lambdas · no side effects in `map`/`filter` ·
one stream operation per line · method references when clearer · every API tagged with the Java version it arrived in.
