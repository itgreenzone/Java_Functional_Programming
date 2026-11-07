package com.itgreenzone.fp.l07_filter_map_slice.theory;

import com.itgreenzone.fp.data.Account;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;
import com.itgreenzone.fp.data.TxnType;

import java.math.BigDecimal;
import java.util.List;
import java.util.function.Predicate;

/**
 * filter(Predicate) [Java 8]: keeps the elements for which the predicate is true.
 * Money is BigDecimal, so compare with compareTo, never with equals (scale matters to equals).
 */
public final class Filtering {

    public static final BigDecimal FIVE_HUNDRED = new BigDecimal("500.00");

    static final Predicate<Transaction> IS_DEBIT = t -> t.type() == TxnType.DEBIT;
    static final Predicate<Transaction> IS_SGD = t -> "SGD".equals(t.currency());

    private Filtering() {
    }

    /** Practice 1: debit transactions over 500.00. */
    public static List<String> debitsOver(List<Transaction> txns, BigDecimal threshold) {
        return txns.stream()
                .filter(IS_DEBIT)
                .filter(t -> t.amount().compareTo(threshold) > 0)
                .map(Transaction::id)
                .toList();
    }

    /** The same rule as one combined predicate: same result, one filter call per element. */
    public static List<String> debitsOverCombined(List<Transaction> txns, BigDecimal threshold) {
        Predicate<Transaction> large = t -> t.amount().compareTo(threshold) > 0;
        return txns.stream()
                .filter(IS_DEBIT.and(large))
                .map(Transaction::id)
                .toList();
    }

    /** Predicate.not [Java 11] reads better than a negated lambda. */
    public static List<String> foreignCurrency(List<Transaction> txns) {
        return txns.stream()
                .filter(Predicate.not(IS_SGD))
                .map(t -> t.id() + " " + t.currency())
                .toList();
    }

    /** Overdrawn accounts: negative balance (signum is scale-independent). */
    public static List<String> overdrawn(List<Account> accounts) {
        return accounts.stream()
                .filter(a -> a.balance().signum() < 0)
                .map(Account::number)
                .toList();
    }

    /** Why compareTo: equals also compares scale. */
    public static String equalsVsCompareTo() {
        BigDecimal a = new BigDecimal("500.0");
        return "equals=" + a.equals(FIVE_HUNDRED) + ", compareTo=" + a.compareTo(FIVE_HUNDRED);
    }

    public static void main(String[] args) {
        List<Transaction> txns = SampleData.transactions();
        System.out.println("debits > 500.00       : " + debitsOver(txns, FIVE_HUNDRED));
        System.out.println("same, combined filter : " + debitsOverCombined(txns, FIVE_HUNDRED));
        System.out.println("not SGD (Java 11 not) : " + foreignCurrency(txns));
        System.out.println("overdrawn accounts    : " + overdrawn(SampleData.accounts()));
        System.out.println("500.0 vs 500.00       : " + equalsVsCompareTo());
    }
}
