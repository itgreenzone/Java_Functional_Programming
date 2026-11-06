package com.itgreenzone.fp.l02_functional_interfaces.exercise;

import com.itgreenzone.fp.data.Transaction;

import java.math.BigDecimal;
import java.util.List;
import java.util.function.Predicate;

/**
 * L02 EXERCISE (about 25 minutes): a small fraud rule engine.
 * Complete every TODO, then remove @Disabled in Exercise02Test and run it.
 *
 * Rules:
 *   large debit      = DEBIT and amount > 900.00
 *   foreign currency = currency is not "SGD"
 *   suspicious       = (large debit AND category TRANSFER) OR foreign currency
 */
public final class Exercise02 {

    private Exercise02() {
    }

    public static Predicate<Transaction> largeDebit() {
        // TODO 1: a lambda; compare BigDecimal with compareTo, never equals
        throw new UnsupportedOperationException("TODO 1");
    }

    public static Predicate<Transaction> foreignCurrency() {
        // TODO 2: true when the currency is not SGD
        throw new UnsupportedOperationException("TODO 2");
    }

    public static Predicate<Transaction> suspicious() {
        // TODO 3: compose largeDebit(), a TRANSFER check and foreignCurrency() with and / or
        throw new UnsupportedOperationException("TODO 3");
    }

    public static List<String> flaggedIds(List<Transaction> txns) {
        // TODO 4: ids of suspicious transactions, in dataset order
        throw new UnsupportedOperationException("TODO 4");
    }

    /** (amount, ratePercent, minimumFee) -> fee, scale 2 HALF_UP, never below the minimum. */
    public static TriFunction<BigDecimal, BigDecimal, BigDecimal, BigDecimal> transferFee() {
        // TODO 5b: implement with a lambda (a, b, c) -> ... (TODO 5 is in TriFunction.andThen)
        throw new UnsupportedOperationException("TODO 5b");
    }
}
