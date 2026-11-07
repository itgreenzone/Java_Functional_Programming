# L04 · Method References

**Module 1 · Functional Foundations** · Java 8 → Java 21 · ITGreenZone

| Deliverable | File |
|---|---|
| Slides (15, with speaker notes) | [L04_MethodReferences_Slides.pptx](L04_MethodReferences_Slides.pptx) |
| Interactive quiz (10 Qs, offline) | [L04_MethodReferences_Quiz.html](L04_MethodReferences_Quiz.html) |
| Cheat sheet (p.1) + sticky notes (p.2) | [L04_MethodReferences_CheatSheet.pdf](L04_MethodReferences_CheatSheet.pdf) |
| Handwritten sketch notes | [L04_MethodReferences_SketchNotes.pdf](L04_MethodReferences_SketchNotes.pdf) |
| Code | [`com.itgreenzone.fp.l04_method_references`](../../src/main/java/com/itgreenzone/fp/l04_method_references) |

## 1. Learning objectives
1. Name the four kinds of method reference, plus array constructor references.
2. Map each method reference to its target type and its equivalent lambda.
3. Explain when the receiver of a bound reference is evaluated, and what happens with `null`.
4. Use record accessors (`Transaction::amount`) and constructors (`Receipt::new`) as references.
5. Decide when a method reference is clearer and when a lambda must stay.

## 2. Why it matters
Many lambdas only forward their parameters to one method: `t -> t.amount()`, `r -> printer.print(r)`,
`s -> new BigDecimal(s)`. The parameter names add nothing. A method reference names the method instead,
so the pipeline reads like the requirement.

## 3. Theory
A method reference `[Java 8]` is a compact lambda that calls one existing method. The target type's single
abstract method decides how many parameters there are and where they go.

| Kind | Form | Parameters go… | Example |
|---|---|---|---|
| Static | `Class::staticMethod` | all → arguments | `Integer::parseInt` |
| Bound instance | `expression::method` | receiver fixed; all → arguments | `printer::print` |
| Unbound instance | `Class::instanceMethod` | 1st → receiver; rest → arguments | `String::toUpperCase`, `BigDecimal::add` |
| Constructor | `Class::new` | all → constructor arguments | `BigDecimal::new`, `Receipt::new` |
| Array constructor | `Type[]::new` | int → length | `String[]::new` |

* **Bound receivers are evaluated once, when the reference is created.** `factory()::m` calls `factory()` once;
  `x -> factory().m(x)` calls it on every call. A `null` receiver throws `NullPointerException` at creation.
* **Records** `[Java 16]` give free accessor references: `Transaction::amount`, `Account::balance`.
* **More than two constructor parameters** need a custom functional interface (`CustomerFactory` for `Customer::new`).

## 4. Visual explanation
Slide 3 (the five kinds), slide 6 (how `(a, b)` move in `BigDecimal::add`), slide 8 (mapping table), and the
sketch notes (kind doodles, parameter arrows, eager receiver, "shrink ray").

## 5. API / syntax reference

| Kind | Method reference | Target type | Equivalent lambda | Result (real output) |
|---|---|---|---|---|
| Static | `Integer::parseInt` | `Function<String,Integer>` | `s -> Integer.parseInt(s)` | `120` |
| Static | `Fees::fee` | `BiFunction<BigDecimal,BigDecimal,BigDecimal>` | `(a, r) -> Fees.fee(a, r)` | `3.75` |
| Bound | `printer::print` | `Consumer<Receipt>` | `r -> printer.print(r)` | `SETTLED \| P001 120.00` |
| Bound | `"SGD"::equals` | `Predicate<String>` | `s -> "SGD".equals(s)` | `false` for USD |
| Unbound | `Transaction::amount` | `Function<Transaction,BigDecimal>` | `t -> t.amount()` | `1221.40` (T003) |
| Unbound | `BigDecimal::add` | `BinaryOperator<BigDecimal>` | `(a, b) -> a.add(b)` | total balance `300382.25` |
| Constructor | `BigDecimal::new` | `Function<String,BigDecimal>` | `s -> new BigDecimal(s)` | `59.90` |
| Constructor | `Receipt::new` | `BiFunction<String,BigDecimal,Receipt>` | `(id, a) -> new Receipt(id, a)` | `Receipt[paymentId=P005, amount=1500.00]` |
| Constructor | `Customer::new` | `CustomerFactory` (5 params) | `(id, n, c, t, j) -> new Customer(...)` | `C011 Kumar Raj SILVER` |
| Array | `String[]::new` | `IntFunction<String[]>` | `n -> new String[n]` | `toArray → [P001, P002, P003, P004]` |

All forms since Java 8; record accessors since Java 16.

## 6. Worked examples (real output)

| Example | Class | Output |
|---|---|---|
| Static references | `theory.StaticReferences` | `Fees::transferFee(2500.00) : 12.50` |
| Bound references, eager receiver, null | `theory.BoundReferences` | `creating both: new \| 2 reference calls: \| 2 lambda calls: new new` |
| Unbound references | `theory.UnboundReferences` | `BigDecimal::add over all balances : 300382.25` |
| Constructor and array references | `theory.ConstructorReferences` | `toCollection(TreeSet::new): [CARD, PAYNOW, PAYPAL]` |
| Lambda or reference | `theory.LambdaOrReference` | `lambda vs named reference : 11 = 11` |
| Before: loops + anonymous Comparator | `before.LegacySettlementReport` | 8 lines, P009 18.80 … P005 1500.00 |
| After: lambdas | `after.LambdaSettlementReport` | same 8 lines |
| Modern: method references | `modern.MethodReferenceReport` | same 8 lines + `ids: [P001, P002, P004, P005, P007, P009, P010, P011]` |

## 7. Best practices
* Use a method reference when the lambda only forwards its parameters and the method name explains the intent.
* Extract long lambdas into small, well-named methods, then reference them (`Fees::isSuccessful`).
* Prefer record accessors and static factories (`Receipt::from`) as targets.
* Keep a lambda when it is clearer; consistency within the team matters more than style points.

## 8. Pitfalls and anti-patterns
| Wrong | Problem | Fix |
|---|---|---|
| `Function<Integer,String> f = Integer::toString;` | *reference to toString is ambiguous* (static `toString(int)` and instance `toString()`) | `i -> i.toString()` or `String::valueOf` |
| `factory()::print` expecting a new object per call | receiver evaluated once, at creation | use a lambda if you need a fresh receiver |
| `nullRef::method` | `NullPointerException` at creation, even if never called | check for null first |
| `Function<String,Customer> f = Customer::new;` | *invalid constructor reference* | a target type with matching parameters |
| `this::process` | legal but hides intent | descriptive method names |

The two compiler errors are proved by `MethodReferenceKindsTest`, which runs the real JDK compiler.

## 9. Java 8 → 21 evolution
8 all method-reference forms · 11 `Predicate.not(Class::method)` · 16 records (free accessor references),
`Stream.toList()` · 21 sequenced collections: `list.reversed().forEach(System.out::println)` (L16).
The syntax has not changed since Java 8; the number of good targets has.

## 10. Interview questions
1. **What are the kinds of method reference?** Static, bound instance, unbound instance, constructor; plus array constructor `Type[]::new`.
2. **Bound vs unbound?** Bound fixes the receiver (`printer::print`); unbound takes it from the first parameter (`String::toUpperCase`).
3. **When is a bound receiver evaluated?** Once, when the reference is created; a `null` receiver throws NPE at creation.
4. **Why does `Integer::toString` not compile as `Function<Integer,String>`?** Static `toString(int)` and instance `toString()` both match: ambiguous.
5. **How do you use a 5-parameter constructor as a reference?** Declare a custom functional interface with 5 parameters (e.g. `CustomerFactory`).

## 11. Hands-on exercise (~20 min)
`exercise.Exercise04` has 10 lambdas. Convert each to a method reference where possible. Two must stay lambdas;
write a one-line comment explaining why. `Exercise04Test` checks behaviour and must stay green after every change.
Answer: 8 convert (`Transaction::amount`, `BigDecimal::new`, `Objects::nonNull`, `BigDecimal::add`,
`ArrayList::new`, `String[]::new`, `String::toUpperCase`, `log::append`); the high-value check (chain + constant)
and `i -> i.toString()` (ambiguous) stay. Reference solution: `solution.Solution04`.

## 12. Pros and cons
| Pros | Cons / limitations |
|---|---|
| Shorter: no parameter names to read | Four kinds; unbound ones confuse beginners |
| Says WHAT is called, not how | Ambiguous overloads (`Integer::toString`) |
| Encourages small, named methods | Bound receiver evaluated eagerly |
| Records give free accessor references | No extra arguments or chains |
| Same runtime mechanism as a lambda | Vague names (`this::process`) hide intent |

## 13. Summary
* A method reference = a lambda that calls one existing method.
* Static, bound, unbound, constructor, array constructor.
* Unbound: the first parameter is the receiver.
* Bound receiver: evaluated once; `null` fails at creation.
* Keep a lambda for extra arguments, chains and ambiguity.

**Next:** L05 Optional Done Right.

---

## How to run
**IntelliJ IDEA:** open the repo as a Maven project (JDK 21) and click ▶ next to any `main()`.

**Maven:**
```bash
mvn test
mvn -q compile exec:java -Dexec.mainClass=com.itgreenzone.fp.l04_method_references.theory.BoundReferences
```

## Concept → class

| Concept | Class | Test |
|---|---|---|
| Static references | `theory.StaticReferences`, `theory.Fees` | `MethodReferenceKindsTest` |
| Bound references, eager receiver, null receiver | `theory.BoundReferences`, `theory.ReceiptPrinter` | `MethodReferenceKindsTest` |
| Unbound references, record accessors | `theory.UnboundReferences` | `MethodReferenceKindsTest` |
| Constructor and array references | `theory.ConstructorReferences`, `theory.Receipt` | `MethodReferenceKindsTest` (incl. compiler check) |
| Lambda or reference, ambiguity | `theory.LambdaOrReference` | `MethodReferenceKindsTest` (incl. compiler check) |
| Report refactoring | `before.*`, `after.*`, `modern.*` | `ReportRefactoringTest` |
| Exercise / solution | `exercise.Exercise04`, `solution.Solution04` | `Exercise04Test`, `Solution04Test` |
| Every `main()` output | all of the above | `MainOutputTest` (golden files) |
| Quiz "predict the output" answers | n/a | `QuizAnswersTest` |
