package com.itgreenzone.fp.l01_why_fp.exercise;

import com.itgreenzone.fp.data.Account;
import com.itgreenzone.fp.data.Customer;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

/**
 * EXERCISE INPUT - working pre-Java-8 code written with anonymous classes.
 * Rewrite each anonymous class as a lambda in {@link Exercise01}. Do not change this file.
 */
public final class LegacyBatchJobs {

    private LegacyBatchJobs() {
    }

    /** Customers ordered by the date they joined, oldest first. */
    public static Comparator<Customer> byJoinedDateOldestFirst() {
        return new Comparator<Customer>() {
            @Override
            public int compare(Customer a, Customer b) {
                return a.joined().compareTo(b.joined());
            }
        };
    }

    /** Accounts ordered by balance, highest first. */
    public static Comparator<Account> byBalanceHighestFirst() {
        return new Comparator<Account>() {
            @Override
            public int compare(Account a, Account b) {
                return b.balance().compareTo(a.balance());
            }
        };
    }

    /** A job that prints the month-end banner for the given accounts. */
    public static Runnable monthEndJob(final List<Account> accounts) {
        return new Runnable() {
            @Override
            public void run() {
                BigDecimal total = BigDecimal.ZERO;
                for (Account a : accounts) {
                    total = total.add(a.balance());
                }
                System.out.println("Month-end job: " + accounts.size() + " accounts, total balance " + total);
            }
        };
    }
}
