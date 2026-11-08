package com.itgreenzone.fp.l13_advanced.exercise;

import java.math.BigDecimal;
import java.util.List;

/**
 * L13 EXERCISE (about 45 minutes).
 * Part A: running balance per account (SGD transactions only; the two USD transactions are settled separately).
 * Part B: batches of payments for a payment file, with a control total per batch.
 * You may reuse com.itgreenzone.fp.l13_advanced.theory.BatchesAndWindows.chunk. Then remove @Disabled in Exercise13Test.
 */
public final class Exercise13 {

    private Exercise13() {
    }

    /**
     * A1: opening balance of an account = its balance in SampleData (the CLOSING balance) minus the net of its SGD movements (CREDIT +, DEBIT -).
     * Expected for openingBalance("ACC-1001"): 13608.84
     */
    public static BigDecimal openingBalance(String accountNumber) {
        throw new UnsupportedOperationException("TODO 1");
    }

    /**
     * A2: the balance after each SGD transaction, in date then id order, starting from the opening balance. Hint: a loop is fine; a running total is a poor fit for a stream.
     * Expected for runningBalances("ACC-1001"): [13340.77, 13104.84, 12947.37, 12500.00]
     */
    public static List<BigDecimal> runningBalances(String accountNumber) {
        throw new UnsupportedOperationException("TODO 2");
    }

    /**
     * A3: statement lines: "OPENING x", then "date id signedAmount = balance" per transaction (zip with the running balances by index), then "CLOSING x".
     * Expected for statement("ACC-1014"): [OPENING 19235.05, 2026-08-02 T001 -150.39 = 19084.66, 2026-08-18 T006 174.30 = 19258.96, 2026-08-19 T007 206.07 = 19465.03, 2026-09-01 T016 136.04 = 19601.07, 2026-09-30 T037 -39.45 = 19561.62, 2026-10-12 T052 -661.62 = 18900.00, CLOSING 18900.00]
     */
    public static List<String> statement(String accountNumber) {
        throw new UnsupportedOperationException("TODO 3");
    }

    /**
     * A4: the lowest balance reached, including the opening balance.
     * Expected for lowestBalance("ACC-1013"): -4382.09
     */
    public static BigDecimal lowestBalance(String accountNumber) {
        throw new UnsupportedOperationException("TODO 4");
    }

    /**
     * A5: numbers of the accounts whose balance went below zero at least once (opening included), sorted.
     * Expected for accountsThatWentNegative(): [ACC-1003, ACC-1008, ACC-1010, ACC-1013]
     */
    public static List<String> accountsThatWentNegative() {
        throw new UnsupportedOperationException("TODO 5");
    }

    /**
     * B6: split the instruction numbers 1..items into batches of batchSize and return the batch sizes.
     * Expected for batchSizes(250, 100): [100, 100, 50]
     */
    public static List<Integer> batchSizes(int items, int batchSize) {
        throw new UnsupportedOperationException("TODO 6");
    }

    /**
     * B7: split SampleData.payments() into batches; one header per batch: "BATCH n: count payments firstId..lastId total x".
     * Expected for paymentFileBatches(5): [BATCH 1: 5 payments P001..P005 total 2065.65, BATCH 2: 5 payments P006..P010 total 1954.19, BATCH 3: 2 payments P011..P012 total 410.00]
     */
    public static List<String> paymentFileBatches(int batchSize) {
        throw new UnsupportedOperationException("TODO 7");
    }

    /**
     * B8: true when the sum of the batch totals equals the grand total of all payments (compare BigDecimal with compareTo).
     * Expected for controlTotalsMatch(5): true
     */
    public static boolean controlTotalsMatch(int batchSize) {
        throw new UnsupportedOperationException("TODO 8");
    }
}
