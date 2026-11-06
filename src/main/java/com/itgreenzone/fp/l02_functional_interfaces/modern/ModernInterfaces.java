package com.itgreenzone.fp.l02_functional_interfaces.modern;

import com.itgreenzone.fp.data.Category;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;
import com.itgreenzone.fp.data.TxnType;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.function.Function;
import java.util.function.Predicate;

/**
 * Functional interfaces in Java 9-21:
 * - private interface methods [Java 9]  (see SamRules.FeeRule.round)
 * - Predicate.not [Java 11], var in lambda parameters [Java 11]
 * - switch expressions inside a lambda [Java 14]
 * - a record that implements a functional interface [Java 16]
 */
public final class ModernInterfaces {

    /** [Java 16] A record can implement a functional interface: a named, configurable rule. */
    public record AboveThreshold(BigDecimal limit) implements Predicate<Transaction> {
        @Override
        public boolean test(Transaction txn) {
            return txn.amount().compareTo(limit) > 0;
        }
    }

    /** [Java 14] switch expression as the body of a Function: cashback percentage per category. */
    public static final Function<Category, BigDecimal> CASHBACK_RATE = category -> switch (category) {
        case DINING -> new BigDecimal("0.05");
        case GROCERIES -> new BigDecimal("0.03");
        case TRAVEL, SHOPPING -> new BigDecimal("0.01");
        default -> BigDecimal.ZERO;
    };

    private ModernInterfaces() {
    }

    public static List<String> aboveFiveThousand(List<Transaction> txns) {
        return txns.stream()
                .filter(new AboveThreshold(new BigDecimal("5000.00")))
                .map(Transaction::id)
                .toList();
    }

    public static long notAboveFiveHundred(List<Transaction> txns) {
        return txns.stream()
                .filter(Predicate.not(new AboveThreshold(new BigDecimal("500.00"))))
                .count();
    }

    public static BigDecimal totalCashback(List<Transaction> txns) {
        return txns.stream()
                .filter((final var t) -> t.type() == TxnType.DEBIT)
                .map(t -> t.amount().multiply(CASHBACK_RATE.apply(t.category())))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
    }

    public static void main(String[] args) {
        List<Transaction> txns = SampleData.transactions();
        System.out.println("record AboveThreshold(5000.00): " + aboveFiveThousand(txns));
        System.out.println("Predicate.not(above 500.00): " + notAboveFiveHundred(txns));
        System.out.println("Cashback rate DINING: " + CASHBACK_RATE.apply(Category.DINING));
        System.out.println("Total cashback on debits: " + totalCashback(txns));
    }
}
