package com.itgreenzone.fp.l13_advanced.theory;

import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;
import com.itgreenzone.fp.data.TxnType;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

/**
 * Index-based operations: chunking, sliding windows, zip with index, running totals.
 * Java 21 has no built-in operation for these; IntStream over indexes works, but a plain loop is often clearer.
 * (Beyond Java 21: Stream Gatherers windowFixed / windowSliding / scan, final in Java 24.)
 */
public final class BatchesAndWindows {

    private BatchesAndWindows() {
    }

    /** Fixed-size chunks: one index per chunk, subList views. The last chunk may be smaller. */
    public static <T> List<List<T>> chunk(List<T> list, int size) {
        if (size <= 0) {
            throw new IllegalArgumentException("size must be > 0");
        }
        int chunks = (list.size() + size - 1) / size;
        return IntStream.range(0, chunks)
                .mapToObj(i -> list.subList(i * size, Math.min(list.size(), (i + 1) * size)))
                .toList();
    }

    /** Sliding windows of size n: list.size() - n + 1 windows (none if the list is shorter than n). */
    public static <T> List<List<T>> windows(List<T> list, int n) {
        return IntStream.rangeClosed(0, list.size() - n)
                .mapToObj(i -> list.subList(i, i + n))
                .toList();
    }

    /** Zip two lists by index (stops at the shorter one). */
    public static List<String> zip(List<String> left, List<String> right) {
        return IntStream.range(0, Math.min(left.size(), right.size()))
                .mapToObj(i -> left.get(i) + "=" + right.get(i))
                .toList();
    }

    /** Monthly SGD DEBIT totals, months in order (the two USD debits are left out: never add currencies). */
    public static Map<YearMonth, BigDecimal> monthlyDebits(List<Transaction> txns) {
        return txns.stream().filter(t -> t.type() == TxnType.DEBIT && t.currency().equals("SGD"))
                .collect(Collectors.groupingBy(t -> YearMonth.from(t.date()), TreeMap::new,
                        Collectors.reducing(BigDecimal.ZERO, Transaction::amount, BigDecimal::add)));
    }

    /** Moving average over sliding windows (scale 2, HALF_UP). */
    public static List<BigDecimal> movingAverage(List<BigDecimal> values, int n) {
        return windows(values, n).stream()
                .map(w -> w.stream().reduce(BigDecimal.ZERO, BigDecimal::add)
                        .divide(BigDecimal.valueOf(n), 2, RoundingMode.HALF_UP))
                .toList();
    }

    /** Running total with a loop: O(n), obvious, correct. Recommended. */
    public static List<BigDecimal> runningTotalLoop(List<BigDecimal> values) {
        List<BigDecimal> out = new ArrayList<>();
        BigDecimal acc = BigDecimal.ZERO;
        for (BigDecimal v : values) {
            acc = acc.add(v);
            out.add(acc);
        }
        return out;
    }

    /** Running total as a "pure" stream: re-sums every prefix, so O(n^2). Correct but a poor fit. */
    public static List<BigDecimal> runningTotalQuadratic(List<BigDecimal> values) {
        return IntStream.rangeClosed(1, values.size())
                .mapToObj(i -> values.subList(0, i).stream().reduce(BigDecimal.ZERO, BigDecimal::add))
                .toList();
    }

    public static void main(String[] args) {
        List<Integer> instructions = IntStream.rangeClosed(1, 250).boxed().toList();
        System.out.println("250 items, chunks of 100 : "
                + chunk(instructions, 100).stream().map(List::size).toList());
        System.out.println("payments in chunks of 5  : " + chunk(SampleData.payments(), 5).stream()
                .map(c -> c.get(0).id() + ".." + c.get(c.size() - 1).id()).toList());
        System.out.println("windows of 3 over 1..5   : " + windows(List.of(1, 2, 3, 4, 5), 3));
        System.out.println("zip                      : " + zip(List.of("SQ12", "TR808", "MH602"), List.of("NRT", "BKK", "KUL")));
        Map<YearMonth, BigDecimal> monthly = monthlyDebits(SampleData.transactions());
        List<BigDecimal> values = List.copyOf(monthly.values());
        System.out.println("monthly SGD debits       : " + monthly);
        System.out.println("2-month moving average   : " + movingAverage(values, 2));
        System.out.println("running total (loop)     : " + runningTotalLoop(values));
        System.out.println("running total (O(n^2))   : " + runningTotalQuadratic(values));
    }
}
