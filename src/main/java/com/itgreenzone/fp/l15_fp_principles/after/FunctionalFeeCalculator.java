package com.itgreenzone.fp.l15_fp_principles.after;

import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;
import com.itgreenzone.fp.data.TxnType;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.Set;
import java.util.function.BiFunction;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * AFTER (Java 8 style): small pure functions, each testable on its own, composed with andThen.
 * A step is a BiFunction&lt;Transaction, BigDecimal, BigDecimal&gt;: it sees the transaction and the fee so far.
 */
public final class FunctionalFeeCalculator {

    private FunctionalFeeCalculator() {
    }

    static BigDecimal pct(BigDecimal amount, String rate) {
        return amount.multiply(new BigDecimal(rate)).setScale(2, RoundingMode.HALF_UP);
    }

    public static final Function<Transaction, BigDecimal> BASE = t -> pct(t.amount(), "0.0025");
    public static final BiFunction<Transaction, BigDecimal, BigDecimal> MINIMUM = (t, fee) -> fee.max(new BigDecimal("0.50"));
    public static final BiFunction<Transaction, BigDecimal, BigDecimal> FX_SURCHARGE =
            (t, fee) -> "SGD".equals(t.currency()) ? fee : fee.add(pct(t.amount(), "0.01"));
    public static final BiFunction<Transaction, BigDecimal, BigDecimal> CAP = (t, fee) -> fee.min(new BigDecimal("10.00"));

    /** Turn a step into a Function on the fee for one transaction (partial application). */
    static Function<BigDecimal, BigDecimal> forTxn(Transaction t, BiFunction<Transaction, BigDecimal, BigDecimal> step) {
        return fee -> step.apply(t, fee);
    }

    public static BigDecimal fee(Transaction t) {
        return BASE.andThen(forTxn(t, MINIMUM)).andThen(forTxn(t, FX_SURCHARGE)).andThen(forTxn(t, CAP)).apply(t);
    }

    public static List<String> report() {
        List<Transaction> debits = SampleData.transactions().stream().filter(t -> t.type() == TxnType.DEBIT).toList();
        Set<String> shown = Set.of("T001", "T010", "T023", "T042");
        Map<String, BigDecimal> total = debits.stream().collect(Collectors.groupingBy(Transaction::currency, TreeMap::new,
                Collectors.reducing(BigDecimal.ZERO, FunctionalFeeCalculator::fee, BigDecimal::add)));
        return Stream.concat(
                debits.stream().filter(t -> shown.contains(t.id()))
                        .map(t -> t.id() + " " + t.amount() + " " + t.currency() + " -> fee " + fee(t)),
                Stream.of("TOTAL FEES " + total + " on " + debits.size() + " debits")).toList();
    }

    public static void main(String[] args) {
        report().forEach(System.out::println);
    }
}
