package com.itgreenzone.fp.l01_why_fp.theory;

import com.itgreenzone.fp.data.Account;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;

import java.math.BigDecimal;
import java.util.List;

/**
 * Immutability: records [Java 16] and List.of [Java 9] cannot be changed.
 * To "change" data we create a new value.
 */
public final class ImmutabilityDemo {

    private ImmutabilityDemo() {
    }

    /** Returns a NEW account with the reduced balance; the original is untouched. */
    public static Account withdraw(Account account, BigDecimal amount) {
        return new Account(account.number(), account.customerId(), account.type(),
                account.balance().subtract(amount));
    }

    /** Tries to add to an immutable list and reports what happened. */
    public static String tryToModify(List<Transaction> txns) {
        try {
            txns.add(txns.get(0));
            return "modified";
        } catch (UnsupportedOperationException e) {
            return "UnsupportedOperationException";
        }
    }

    public static void main(String[] args) {
        Account original = SampleData.accounts().get(0);
        Account updated = withdraw(original, new BigDecimal("500.00"));
        System.out.println("Original " + original.number() + " balance: " + original.balance());
        System.out.println("Updated  " + updated.number() + " balance: " + updated.balance());
        System.out.println("Adding to SampleData.transactions(): " + tryToModify(SampleData.transactions()));
    }
}
