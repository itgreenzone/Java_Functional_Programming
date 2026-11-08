package com.itgreenzone.fp.l15_fp_principles.modern;

import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;
import com.itgreenzone.fp.data.TxnType;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.Set;
import java.util.function.BiFunction;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * MODERN: the rules are DATA. Each FeeRule is an immutable record (name + pure step); the pipeline is a List.
 * Folding the rules over an immutable Quote gives the fee AND an audit trail of every step, with no mutation.
 * Fees are in the transaction's currency, so totals are grouped by currency.
 */
public final class FeePipeline {

    /** One named, pure rule. [Java 16 record] */
    public record FeeRule(String name, BiFunction<Transaction, BigDecimal, BigDecimal> step) { }

    /** The value that flows through the pipeline: immutable; each rule returns a new Quote. */
    public record Quote(Transaction txn, BigDecimal fee, List<String> audit) {
        public Quote {
            audit = List.copyOf(audit);
        }

        Quote apply(FeeRule rule) {
            BigDecimal next = rule.step().apply(txn, fee);
            List<String> trail = new ArrayList<>(audit);
            trail.add(rule.name() + "=" + next);
            return new Quote(txn, next, trail);
        }
    }

    static BigDecimal pct(BigDecimal amount, String rate) {
        return amount.multiply(new BigDecimal(rate)).setScale(2, RoundingMode.HALF_UP);
    }

    public static final List<FeeRule> STANDARD_RULES = List.of(
            new FeeRule("base", (t, fee) -> pct(t.amount(), "0.0025")),
            new FeeRule("min", (t, fee) -> fee.max(new BigDecimal("0.50"))),
            new FeeRule("fx", (t, fee) -> "SGD".equals(t.currency()) ? fee : fee.add(pct(t.amount(), "0.01"))),
            new FeeRule("cap", (t, fee) -> fee.min(new BigDecimal("10.00"))));

    private FeePipeline() {
    }

    /** A left fold over the rules. Sequential by nature: each step depends on the previous fee. */
    public static Quote quote(Transaction t, List<FeeRule> rules) {
        Quote q = new Quote(t, BigDecimal.ZERO.setScale(2), List.of());
        for (FeeRule r : rules) {
            q = q.apply(r);
        }
        return q;
    }

    public static List<String> report() {
        List<Transaction> debits = SampleData.transactions().stream().filter(t -> t.type() == TxnType.DEBIT).toList();
        Set<String> shown = Set.of("T001", "T010", "T023", "T042");
        Map<String, BigDecimal> total = debits.stream().collect(Collectors.groupingBy(Transaction::currency, TreeMap::new,
                Collectors.reducing(BigDecimal.ZERO, t -> quote(t, STANDARD_RULES).fee(), BigDecimal::add)));
        return Stream.concat(
                debits.stream().filter(t -> shown.contains(t.id()))
                        .map(t -> t.id() + " " + t.amount() + " " + t.currency() + " -> fee " + quote(t, STANDARD_RULES).fee()),
                Stream.of("TOTAL FEES " + total + " on " + debits.size() + " debits")).toList();
    }

    public static void main(String[] args) {
        report().forEach(System.out::println);
        Transaction t023 = SampleData.transactions().stream().filter(t -> t.id().equals("T023")).findFirst().orElseThrow();
        System.out.println("audit T023: " + quote(t023, STANDARD_RULES).audit());
    }
}
