package com.itgreenzone.fp.l13_advanced.theory;

import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.SampleData;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collector;
import java.util.stream.Collectors;

/**
 * Collector.of(supplier, accumulator, combiner, finisher, characteristics...) [Java 8]:
 * a BigDecimal statistics collector, because summarizingDouble is not acceptable for money.
 */
public final class CustomCollectors {

    private CustomCollectors() {
    }

    /** The immutable result. [Java 16 record] */
    public record MoneyStats(long count, BigDecimal sum, BigDecimal min, BigDecimal max) {

        public static final MoneyStats EMPTY = new MoneyStats(0, BigDecimal.ZERO.setScale(2), null, null);

        /** Average with scale 2, HALF_UP; 0.00 for no elements. */
        public BigDecimal average() {
            return count == 0 ? BigDecimal.ZERO.setScale(2)
                    : sum.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP);
        }

        @Override
        public String toString() {
            return "count=" + count + " sum=" + sum + " min=" + min + " max=" + max + " avg=" + average();
        }
    }

    /** The mutable container the collector fills (never escapes the collector). */
    private static final class Acc {
        private long count;
        private BigDecimal sum = BigDecimal.ZERO.setScale(2);
        private BigDecimal min;
        private BigDecimal max;

        void add(BigDecimal value) {
            count++;
            sum = sum.add(value);
            min = min == null || value.compareTo(min) < 0 ? value : min;
            max = max == null || value.compareTo(max) > 0 ? value : max;
        }

        /** The combiner: needed when a parallel stream merges two partial results. */
        Acc merge(Acc other) {
            if (other.count == 0) {
                return this;
            }
            if (count == 0) {
                return other;
            }
            count += other.count;
            sum = sum.add(other.sum);
            min = min.min(other.min);
            max = max.max(other.max);
            return this;
        }

        MoneyStats finish() {
            return count == 0 ? MoneyStats.EMPTY : new MoneyStats(count, sum, min, max);
        }
    }

    /** The custom collector: supplier, accumulator, combiner, finisher, characteristics. */
    public static Collector<BigDecimal, ?, MoneyStats> moneyStats() {
        return Collector.of(
                Acc::new,                          // supplier: a new empty container
                Acc::add,                          // accumulator: add one element
                Acc::merge,                        // combiner: merge two containers (parallel)
                Acc::finish,                       // finisher: container -> result
                Collector.Characteristics.UNORDERED);  // the result does not depend on encounter order
    }

    public static MoneyStats paymentStats(List<Payment> payments) {
        return payments.stream().map(Payment::amount).collect(moneyStats());
    }

    public static MoneyStats paymentStatsParallel(List<Payment> payments) {
        return payments.parallelStream().map(Payment::amount).collect(moneyStats());
    }

    /** A custom collector is a normal downstream: Collectors.mapping adapts Payment -> BigDecimal. */
    public static Map<String, MoneyStats> statsPerMethod(List<Payment> payments) {
        return payments.stream().collect(Collectors.groupingBy(Payment::method, TreeMap::new,
                Collectors.mapping(Payment::amount, moneyStats())));
    }

    public static void main(String[] args) {
        List<Payment> payments = SampleData.payments();
        System.out.println("all payments      : " + paymentStats(payments));
        System.out.println("parallel, same    : " + paymentStats(payments).equals(paymentStatsParallel(payments)));
        System.out.println("no payments       : " + paymentStats(List.of()));
        statsPerMethod(payments).forEach((m, s) -> System.out.println("per method " + m + " : " + s));
    }
}
