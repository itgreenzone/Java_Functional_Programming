package com.itgreenzone.fp.l05_optional.after;

import com.itgreenzone.fp.data.AccountType;
import com.itgreenzone.fp.l05_optional.theory.BankRepository;

/** Java 8: the same rule as one flat chain. Every step may be empty; the chain handles it. */
public final class OptionalStatementService {

    private OptionalStatementService() {
    }

    public static String latestActivity(String customerId, AccountType type) {
        return BankRepository.findCustomer(customerId)
                .flatMap(c -> BankRepository.findAccount(c.id(), type))
                .flatMap(a -> BankRepository.latestTransaction(a.number()))
                .map(t -> customerId + " " + type + " -> " + t.id() + " " + t.amount())
                .orElse(customerId + " " + type + " -> no data");
    }

    public static void main(String[] args) {
        System.out.println(latestActivity("C001", AccountType.SAVINGS));
        System.out.println(latestActivity("C003", AccountType.FIXED_DEPOSIT));
        System.out.println(latestActivity("C005", AccountType.CURRENT));
        System.out.println(latestActivity("C999", AccountType.SAVINGS));
    }
}
