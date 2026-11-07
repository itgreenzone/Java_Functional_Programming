package com.itgreenzone.fp.l05_optional.before;

import com.itgreenzone.fp.data.Account;
import com.itgreenzone.fp.data.AccountType;
import com.itgreenzone.fp.data.Customer;
import com.itgreenzone.fp.data.Transaction;

/** The "pyramid of doom": one null check per step. Forget one and you get a NullPointerException. */
public final class LegacyStatementService {

    private LegacyStatementService() {
    }

    public static String latestActivity(String customerId, AccountType type) {
        Customer customer = LegacyLookups.findCustomer(customerId);
        if (customer != null) {
            Account account = LegacyLookups.findAccount(customer.id(), type);
            if (account != null) {
                Transaction latest = LegacyLookups.latestTransaction(account.number());
                if (latest != null) {
                    return customerId + " " + type + " -> " + latest.id() + " " + latest.amount();
                }
            }
        }
        return customerId + " " + type + " -> no data";
    }

    public static void main(String[] args) {
        System.out.println(latestActivity("C001", AccountType.SAVINGS));
        System.out.println(latestActivity("C003", AccountType.FIXED_DEPOSIT));
        System.out.println(latestActivity("C005", AccountType.CURRENT));
        System.out.println(latestActivity("C999", AccountType.SAVINGS));
    }
}
