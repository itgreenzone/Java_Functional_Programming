package com.itgreenzone.fp.l02_functional_interfaces.solution;

import com.itgreenzone.fp.data.Transaction;

import java.util.Objects;
import java.util.function.Predicate;

/**
 * A domain functional interface: its name says what it means, unlike a bare Predicate.
 * Reference solution.
 */
@FunctionalInterface
public interface FraudRule {

    boolean flags(Transaction txn);

    default FraudRule or(FraudRule other) {
        Objects.requireNonNull(other);
        return txn -> flags(txn) || other.flags(txn);
    }

    static FraudRule from(Predicate<Transaction> predicate) {
        return predicate::test;
    }
}
