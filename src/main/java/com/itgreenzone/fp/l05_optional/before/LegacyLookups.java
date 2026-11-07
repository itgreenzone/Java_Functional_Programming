package com.itgreenzone.fp.l05_optional.before;

import com.itgreenzone.fp.data.Account;
import com.itgreenzone.fp.data.AccountType;
import com.itgreenzone.fp.data.Customer;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;

/** Pre-Java-8 lookups: "not found" is signalled by returning null. Nothing in the signature warns you. */
public final class LegacyLookups {

    private LegacyLookups() {
    }

    public static Customer findCustomer(String id) {
        for (Customer c : SampleData.customers()) {
            if (c.id().equals(id)) {
                return c;
            }
        }
        return null;
    }

    public static Account findAccount(String customerId, AccountType type) {
        for (Account a : SampleData.accounts()) {
            if (a.customerId().equals(customerId) && a.type() == type) {
                return a;
            }
        }
        return null;
    }

    public static Transaction latestTransaction(String accountNumber) {
        Transaction latest = null;
        for (Transaction t : SampleData.transactions()) {
            if (t.accountNumber().equals(accountNumber)) {
                if (latest == null || t.date().isAfter(latest.date())
                        || (t.date().equals(latest.date()) && t.id().compareTo(latest.id()) > 0)) {
                    latest = t;
                }
            }
        }
        return latest;
    }
}
