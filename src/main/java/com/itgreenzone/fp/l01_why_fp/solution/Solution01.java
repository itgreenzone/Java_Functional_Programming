package com.itgreenzone.fp.l01_why_fp.solution;

import com.itgreenzone.fp.data.Account;
import com.itgreenzone.fp.data.Customer;
import com.itgreenzone.fp.data.SampleData;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

/** Reference solution for the L01 exercise. */
public final class Solution01 {

    private Solution01() {
    }

    /** Lambda replaces the anonymous Comparator. (In L08: Comparator.comparing(Customer::joined).) */
    public static Comparator<Customer> byJoinedDateOldestFirst() {
        return (a, b) -> a.joined().compareTo(b.joined());
    }

    /** Swapping a and b gives "highest first". */
    public static Comparator<Account> byBalanceHighestFirst() {
        return (a, b) -> b.balance().compareTo(a.balance());
    }

    /** Runnable takes no arguments and returns nothing: () -> { ... }. */
    public static Runnable monthEndJob(List<Account> accounts) {
        return () -> {
            BigDecimal total = accounts.stream()
                    .map(Account::balance)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            System.out.println("Month-end job: " + accounts.size() + " accounts, total balance " + total);
        };
    }

    public static void main(String[] args) {
        String oldest = SampleData.customers().stream()
                .sorted(byJoinedDateOldestFirst())
                .map(Customer::name)
                .limit(3)
                .toList()
                .toString();
        System.out.println("Oldest 3 customers: " + oldest);

        String richest = SampleData.accounts().stream()
                .sorted(byBalanceHighestFirst())
                .map(a -> a.number() + "=" + a.balance())
                .limit(3)
                .toList()
                .toString();
        System.out.println("Top 3 balances:     " + richest);

        monthEndJob(SampleData.accounts()).run();
    }
}
