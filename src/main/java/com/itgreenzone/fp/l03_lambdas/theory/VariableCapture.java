package com.itgreenzone.fp.l03_lambdas.theory;

import com.itgreenzone.fp.data.Flight;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;
import com.itgreenzone.fp.data.TxnType;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Function;
import java.util.function.Supplier;

/**
 * Capturing variables. A lambda may use local variables of the enclosing method only if they are
 * final or EFFECTIVELY FINAL (never re-assigned after initialisation). The lambda captures the VALUE.
 * Re-assigning a captured local does not compile:
 * "local variables referenced from a lambda expression must be final or effectively final".
 */
public final class VariableCapture {

    private VariableCapture() {
    }

    /** OK: rate is never re-assigned, so it is effectively final. No 'final' keyword needed. */
    public static Function<BigDecimal, BigDecimal> cashback(String percent) {
        BigDecimal rate = new BigDecimal(percent).movePointLeft(2);
        return amount -> amount.multiply(rate).setScale(2, RoundingMode.HALF_UP);
    }

    /** GOOD: let the stream count. No captured mutable state at all. */
    public static long countDebits(List<Transaction> txns) {
        return txns.stream()
                .filter(t -> t.type() == TxnType.DEBIT)
                .count();
    }

    /** SMELL: AtomicInteger compiles (the reference is effectively final) but hides shared mutable state. */
    public static int countDebitsWithAtomicSmell(List<Transaction> txns) {
        AtomicInteger counter = new AtomicInteger();
        txns.forEach(t -> {
            if (t.type() == TxnType.DEBIT) {
                counter.incrementAndGet();
            }
        });
        return counter.get();
    }

    /** SMELL: a one-element array is the same trick, and it is not even thread-safe. */
    public static int countDebitsWithArraySmell(List<Transaction> txns) {
        int[] counter = {0};
        txns.forEach(t -> {
            if (t.type() == TxnType.DEBIT) {
                counter[0]++;
            }
        });
        return counter[0];
    }

    /** Each iteration of an enhanced for loop has a NEW, effectively final variable f. */
    public static List<String> labelsFromForEach(List<Flight> flights) {
        List<Supplier<String>> labels = new ArrayList<>();
        for (Flight f : flights) {
            labels.add(() -> f.code());
        }
        return labels.stream().map(Supplier::get).toList();
    }

    /** A classic for loop's i is re-assigned (i++), so copy it into an effectively final local. */
    public static List<String> labelsFromIndexLoop(List<Flight> flights) {
        List<Supplier<String>> labels = new ArrayList<>();
        for (int i = 0; i < flights.size(); i++) {
            int position = i + 1;
            Flight f = flights.get(i);
            labels.add(() -> position + "." + f.code());
        }
        return labels.stream().map(Supplier::get).toList();
    }

    public static void main(String[] args) {
        List<Transaction> txns = SampleData.transactions();
        System.out.println("cashback 5% of 80.00   : " + cashback("5").apply(new BigDecimal("80.00")));
        System.out.println("count() (good)         : " + countDebits(txns));
        System.out.println("AtomicInteger (smell)  : " + countDebitsWithAtomicSmell(txns));
        System.out.println("int[] (smell)          : " + countDebitsWithArraySmell(txns));
        System.out.println("for-each capture       : " + labelsFromForEach(SampleData.flights().subList(0, 3)));
        System.out.println("index loop + copy      : " + labelsFromIndexLoop(SampleData.flights().subList(0, 3)));
    }
}
