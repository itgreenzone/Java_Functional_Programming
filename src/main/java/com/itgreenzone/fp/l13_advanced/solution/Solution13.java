package com.itgreenzone.fp.l13_advanced.solution;

import com.itgreenzone.fp.data.Account;
import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;
import com.itgreenzone.fp.data.TxnType;
import com.itgreenzone.fp.l13_advanced.theory.BatchesAndWindows;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.IntStream;

/**
 * L13 reference solution: (A) running balance per account, (B) batches of payments for a payment file.
 * Running balance: SGD transactions only, in date then id order. The account's balance in SampleData is the
 * CLOSING balance, so opening = closing - net movement.
 */
public final class Solution13 {

    private Solution13() {
    }

    // ---------- A: running balance ----------

    static Account account(String number) {
        return SampleData.accounts().stream().filter(a -> a.number().equals(number)).findFirst().orElseThrow();
    }

    static List<Transaction> sgdTransactions(String number) {
        return SampleData.transactions().stream()
                .filter(t -> t.accountNumber().equals(number) && t.currency().equals("SGD"))
                .sorted(Comparator.comparing(Transaction::date).thenComparing(Transaction::id))
                .toList();
    }

    static BigDecimal signed(Transaction t) {
        return t.type() == TxnType.CREDIT ? t.amount() : t.amount().negate();
    }

    /** 1: opening balance = closing balance - sum of signed SGD movements. */
    public static BigDecimal openingBalance(String number) {
        BigDecimal net = sgdTransactions(number).stream().map(Solution13::signed).reduce(BigDecimal.ZERO, BigDecimal::add);
        return account(number).balance().subtract(net);
    }

    /** 2: the balance after each transaction. A loop: a running total is a poor fit for a stream. */
    public static List<BigDecimal> runningBalances(String number) {
        List<BigDecimal> out = new ArrayList<>();
        BigDecimal balance = openingBalance(number);
        for (Transaction t : sgdTransactions(number)) {
            balance = balance.add(signed(t));
            out.add(balance);
        }
        return out;
    }

    /** 3: statement lines: OPENING, one line per transaction, CLOSING. zip transactions with balances by index. */
    public static List<String> statement(String number) {
        List<Transaction> txns = sgdTransactions(number);
        List<BigDecimal> balances = runningBalances(number);
        List<String> lines = new ArrayList<>();
        lines.add("OPENING " + openingBalance(number));
        IntStream.range(0, txns.size()).mapToObj(i -> txns.get(i).date() + " " + txns.get(i).id() + " "
                + signed(txns.get(i)) + " = " + balances.get(i)).forEachOrdered(lines::add);
        lines.add("CLOSING " + (balances.isEmpty() ? openingBalance(number) : balances.get(balances.size() - 1)));
        return lines;
    }

    /** 4: lowest balance reached (including the opening balance). */
    public static BigDecimal lowestBalance(String number) {
        BigDecimal opening = openingBalance(number);
        return runningBalances(number).stream().reduce(opening, BigDecimal::min);
    }

    /** 5: accounts whose running balance went below zero at least once, sorted. */
    public static List<String> accountsThatWentNegative() {
        return SampleData.accounts().stream()
                .map(Account::number)
                .filter(n -> lowestBalance(n).signum() < 0)
                .sorted()
                .toList();
    }

    // ---------- B: payment file batches ----------

    /** 6: sizes of the batches when 250 payment instructions are split into batches of 100. */
    public static List<Integer> batchSizes(int items, int batchSize) {
        List<Integer> numbers = IntStream.rangeClosed(1, items).boxed().toList();
        return BatchesAndWindows.chunk(numbers, batchSize).stream().map(List::size).toList();
    }

    /** 7: one header line per batch: number, count, first..last id, control total. */
    public static List<String> paymentFileBatches(int batchSize) {
        List<List<Payment>> batches = BatchesAndWindows.chunk(SampleData.payments(), batchSize);
        return IntStream.range(0, batches.size())
                .mapToObj(i -> {
                    List<Payment> b = batches.get(i);
                    BigDecimal total = b.stream().map(Payment::amount).reduce(BigDecimal.ZERO, BigDecimal::add);
                    return "BATCH " + (i + 1) + ": " + b.size() + " payments " + b.get(0).id() + ".."
                            + b.get(b.size() - 1).id() + " total " + total;
                })
                .toList();
    }

    /** 8: the sum of the batch control totals equals the grand total (a reconciliation check). */
    public static boolean controlTotalsMatch(int batchSize) {
        BigDecimal grand = SampleData.payments().stream().map(Payment::amount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal ofBatches = BatchesAndWindows.chunk(SampleData.payments(), batchSize).stream()
                .map(b -> b.stream().map(Payment::amount).reduce(BigDecimal.ZERO, BigDecimal::add))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return grand.compareTo(ofBatches) == 0;
    }

    public static void main(String[] args) {
        System.out.println("1 opening ACC-1001      : " + openingBalance("ACC-1001"));
        System.out.println("2 running ACC-1001      : " + runningBalances("ACC-1001"));
        System.out.println("3 statement ACC-1014    :");
        statement("ACC-1014").forEach(l -> System.out.println("    " + l));
        System.out.println("4 lowest ACC-1013       : " + lowestBalance("ACC-1013"));
        System.out.println("5 went negative         : " + accountsThatWentNegative());
        System.out.println("6 250 in batches of 100 : " + batchSizes(250, 100));
        System.out.println("7 batches of 100        : " + paymentFileBatches(100));
        System.out.println("7 batches of 5          : " + paymentFileBatches(5));
        System.out.println("8 control totals match  : " + controlTotalsMatch(5));
    }
}
