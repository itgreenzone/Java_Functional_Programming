package com.itgreenzone.fp.l01_why_fp.exercise;

import com.itgreenzone.fp.data.Account;
import com.itgreenzone.fp.data.Customer;

import java.util.Comparator;
import java.util.List;

/**
 * L01 EXERCISE (about 20 minutes).
 * Rewrite each anonymous class in {@link LegacyBatchJobs} as a LAMBDA.
 * Behaviour must be identical. Then remove @Disabled in Exercise01Test and run it.
 *
 * Bonus: for the Runnable, compute the total with a stream instead of a loop.
 */
public final class Exercise01 {

    private Exercise01() {
    }

    public static Comparator<Customer> byJoinedDateOldestFirst() {
        // TODO 1: return a lambda (a, b) -> ...
        throw new UnsupportedOperationException("TODO 1");
    }

    public static Comparator<Account> byBalanceHighestFirst() {
        // TODO 2: return a lambda - careful with the direction (highest first)
        throw new UnsupportedOperationException("TODO 2");
    }

    public static Runnable monthEndJob(List<Account> accounts) {
        // TODO 3: return a lambda () -> { ... } that prints exactly the same line
        throw new UnsupportedOperationException("TODO 3");
    }
}
