package com.itgreenzone.fp.l05_optional.theory;

import com.itgreenzone.fp.data.Account;
import com.itgreenzone.fp.data.AccountType;
import com.itgreenzone.fp.data.Customer;
import com.itgreenzone.fp.data.Policy;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;

import java.util.Comparator;
import java.util.Optional;

/**
 * A read-only repository over the shared dataset.
 * Every lookup that may find nothing returns Optional [Java 8]: the type says "maybe no result".
 */
public final class BankRepository {

    private BankRepository() {
    }

    public static Optional<Customer> findCustomer(String id) {
        return SampleData.customers().stream()
                .filter(c -> c.id().equals(id))
                .findFirst();
    }

    public static Optional<Account> findAccount(String customerId, AccountType type) {
        return SampleData.accounts().stream()
                .filter(a -> a.customerId().equals(customerId))
                .filter(a -> a.type() == type)
                .findFirst();
    }

    /** Latest transaction on an account: newest date, then highest id. Empty if the account has none. */
    public static Optional<Transaction> latestTransaction(String accountNumber) {
        return SampleData.transactions().stream()
                .filter(t -> t.accountNumber().equals(accountNumber))
                .max(Comparator.comparing(Transaction::date).thenComparing(Transaction::id));
    }

    public static Optional<Policy> findPolicy(String number) {
        return SampleData.policies().stream()
                .filter(p -> p.number().equals(number))
                .findFirst();
    }
}
