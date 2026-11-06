package com.itgreenzone.fp.l02_functional_interfaces.theory;

import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * The rules of a functional interface (SAM = Single Abstract Method), shown on a domain interface.
 */
public final class SamRules {

    private SamRules() {
    }

    /**
     * A domain functional interface: "the fee charged for a transaction".
     * Exactly ONE abstract method. Everything else is allowed and does not count.
     */
    @FunctionalInterface                                     // optional, but standard [Java 8]
    public interface FeeRule {

        BigDecimal feeFor(Transaction txn);                  // the single abstract method

        default FeeRule plus(FeeRule other) {                // default method [Java 8]: allowed
            return txn -> round(feeFor(txn).add(other.feeFor(txn)));
        }

        static FeeRule flat(String amount) {                 // static method [Java 8]: allowed
            BigDecimal fee = new BigDecimal(amount);
            return txn -> fee;
        }

        static FeeRule percent(String ratePercent) {
            BigDecimal rate = new BigDecimal(ratePercent).movePointLeft(2);
            return txn -> round(txn.amount().multiply(rate));
        }

        private static BigDecimal round(BigDecimal value) {  // private method [Java 9]: allowed
            return value.setScale(2, RoundingMode.HALF_UP);
        }

        @Override
        boolean equals(Object other);                        // public Object method: does NOT count

        @Override
        String toString();                                   // public Object method: does NOT count
    }

    /** A generic functional interface: the type parameters are chosen at the use site. */
    @FunctionalInterface
    public interface Converter<A, B> {
        B convert(A from);
    }

    /** Standard card fee: 0.50 flat plus 0.1% of the amount. */
    public static final FeeRule CARD_FEE = FeeRule.flat("0.50").plus(FeeRule.percent("0.1"));

    /** One lambda, used as a Converter from Transaction to a short label. */
    public static final Converter<Transaction, String> LABEL = txn -> txn.id() + ":" + txn.amount();

    public static void main(String[] args) {
        for (Transaction txn : SampleData.transactions().subList(2, 5)) {
            System.out.println(LABEL.convert(txn) + " -> card fee " + CARD_FEE.feeFor(txn));
        }
    }
}
