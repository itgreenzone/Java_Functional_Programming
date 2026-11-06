package com.itgreenzone.fp.l02_functional_interfaces.exercise;

import com.itgreenzone.fp.data.Transaction;

import java.util.function.Predicate;

/**
 * A domain functional interface: its name says what it means, unlike a bare Predicate.
 * EXERCISE: complete the default method.
 */
@FunctionalInterface
public interface FraudRule {

    boolean flags(Transaction txn);

    default FraudRule or(FraudRule other) {
        // TODO 6: return a FraudRule that flags when this rule OR the other rule flags
        throw new UnsupportedOperationException("TODO 6");
    }

    static FraudRule from(Predicate<Transaction> predicate) {
        return predicate::test;
    }
}
