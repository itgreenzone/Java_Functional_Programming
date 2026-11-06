package com.itgreenzone.fp.l02_functional_interfaces.solution;

import com.itgreenzone.fp.data.Category;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;
import com.itgreenzone.fp.data.TxnType;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.function.Predicate;

/** Reference solution for the L02 exercise. */
public final class Solution02 {

    private static final BigDecimal LARGE = new BigDecimal("900.00");

    private Solution02() {
    }

    public static Predicate<Transaction> largeDebit() {
        return t -> t.type() == TxnType.DEBIT && t.amount().compareTo(LARGE) > 0;
    }

    public static Predicate<Transaction> foreignCurrency() {
        return t -> !"SGD".equals(t.currency());
    }

    public static Predicate<Transaction> suspicious() {
        Predicate<Transaction> isTransfer = t -> t.category() == Category.TRANSFER;
        return largeDebit()
                .and(isTransfer)
                .or(foreignCurrency());
    }

    public static List<String> flaggedIds(List<Transaction> txns) {
        return txns.stream()
                .filter(suspicious())
                .map(Transaction::id)
                .toList();
    }

    public static TriFunction<BigDecimal, BigDecimal, BigDecimal, BigDecimal> transferFee() {
        return (amount, ratePercent, minimumFee) -> amount.multiply(ratePercent)
                .movePointLeft(2)
                .setScale(2, RoundingMode.HALF_UP)
                .max(minimumFee);
    }

    public static void main(String[] args) {
        List<Transaction> txns = SampleData.transactions();
        System.out.println("Suspicious: " + flaggedIds(txns));

        FraudRule large = FraudRule.from(largeDebit());
        FraudRule foreign = FraudRule.from(foreignCurrency());
        long viaFraudRule = txns.stream().filter(large.or(foreign)::flags).count();
        System.out.println("Large debit OR foreign (FraudRule.or): " + viaFraudRule);

        BigDecimal fee = transferFee().apply(new BigDecimal("2500.00"), new BigDecimal("0.5"), new BigDecimal("1.00"));
        String label = transferFee().andThen(f -> "fee=" + f)
                .apply(new BigDecimal("100.00"), new BigDecimal("0.5"), new BigDecimal("1.00"));
        System.out.println("Transfer fee on 2500.00: " + fee + " | " + label);
    }
}
