package com.itgreenzone.fp.l10_collectors.exercise;

import java.math.BigDecimal;
import java.util.Map;

/**
 * L10 EXERCISE (about 30 minutes): the payment gateway summary, per payment method (CARD, PAYNOW, PAYPAL).
 * Use collectors only (toMap with a merge function and a TreeMap, joining, teeing, reducing). No loops.
 * groupingBy is L11: solve these with toMap so you practise merge functions.
 */
public final class Exercise10 {

    /** Totals and counts for one method. Immutable; merge must be associative. */
    public record MethodSummary(long count, BigDecimal total) {
        public MethodSummary merge(MethodSummary other) {
            return new MethodSummary(count + other.count, total.add(other.total));
        }

        @Override
        public String toString() {
            return count + " / " + total;
        }
    }

    private Exercise10() {
    }

    /** TODO 1: number of payments per method, sorted by method. Expected {CARD=5, PAYNOW=4, PAYPAL=3}. */
    public static Map<String, Long> countByMethod() {
        throw new UnsupportedOperationException("TODO 1");
    }

    /** TODO 2: total amount per method. Expected {CARD=2070.29, PAYNOW=1824.30, PAYPAL=535.25}. */
    public static Map<String, BigDecimal> totalByMethod() {
        throw new UnsupportedOperationException("TODO 2");
    }

    /**
     * TODO 3: count AND total per method in one toMap, using MethodSummary::merge.
     * Expected {CARD=5 / 2070.29, PAYNOW=4 / 1824.30, PAYPAL=3 / 535.25}.
     */
    public static Map<String, MethodSummary> summaryByMethod() {
        throw new UnsupportedOperationException("TODO 3");
    }

    /**
     * TODO 4: SUCCESS-only totals per method; methods with no SUCCESS payment must not appear.
     * Expected {CARD=3 / 1209.89, PAYNOW=3 / 1564.30, PAYPAL=2 / 225.00}.
     */
    public static Map<String, MethodSummary> successSummaryByMethod() {
        throw new UnsupportedOperationException("TODO 4");
    }

    /**
     * TODO 5: one line for the whole gateway with teeing: count and total in one pass, plus the ids of FAILED
     * payments with joining. Expected "12 payments, 4429.84 total, failed: P003, P012".
     */
    public static String gatewayLine() {
        throw new UnsupportedOperationException("TODO 5");
    }
}
