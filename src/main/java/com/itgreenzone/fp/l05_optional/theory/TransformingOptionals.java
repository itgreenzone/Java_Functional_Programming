package com.itgreenzone.fp.l05_optional.theory;

import com.itgreenzone.fp.data.Account;
import com.itgreenzone.fp.data.AccountType;
import com.itgreenzone.fp.data.Customer;
import com.itgreenzone.fp.data.Policy;
import com.itgreenzone.fp.data.Transaction;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

/**
 * map, filter and flatMap [Java 8]: transform the value inside the box; an empty box stays empty.
 * map with a function that itself returns Optional gives Optional&lt;Optional&lt;T&gt;&gt; - use flatMap.
 */
public final class TransformingOptionals {

    private TransformingOptionals() {
    }

    /** map: Customer -> String. */
    public static Optional<String> customerCity(String id) {
        return BankRepository.findCustomer(id)
                .map(Customer::city);
    }

    /** filter: keep the value only if it passes the test. */
    public static Optional<Policy> activePolicy(String number, LocalDate today) {
        return BankRepository.findPolicy(number)
                .filter(p -> !p.expiry().isBefore(today));
    }

    /** map with an Optional-returning function: a box inside a box. */
    public static Optional<Optional<Account>> nestedWithMap(String customerId) {
        return BankRepository.findCustomer(customerId)
                .map(c -> BankRepository.findAccount(c.id(), AccountType.SAVINGS));
    }

    /** The chain: Customer -> Account -> latest Transaction -> amount. flatMap keeps it flat. */
    public static Optional<BigDecimal> latestAmount(String customerId, AccountType type) {
        return BankRepository.findCustomer(customerId)
                .flatMap(c -> BankRepository.findAccount(c.id(), type))
                .flatMap(a -> BankRepository.latestTransaction(a.number()))
                .map(Transaction::amount);
    }

    public static void main(String[] args) {
        LocalDate today = LocalDate.of(2026, 11, 7);
        System.out.println("map city C004             : " + customerCity("C004"));
        System.out.println("filter active POL-509     : " + activePolicy("POL-509", today).map(Policy::number));
        System.out.println("filter active on 2026-11-13: " + activePolicy("POL-509", LocalDate.of(2026, 11, 13)));
        System.out.println("map -> nested             : " + nestedWithMap("C008").map(o -> o.map(Account::number)));
        System.out.println("chain C001 SAVINGS        : " + latestAmount("C001", AccountType.SAVINGS));
        System.out.println("chain C003 FIXED_DEPOSIT  : " + latestAmount("C003", AccountType.FIXED_DEPOSIT));
        System.out.println("chain C005 CURRENT        : " + latestAmount("C005", AccountType.CURRENT));
        System.out.println("chain C999 SAVINGS        : " + latestAmount("C999", AccountType.SAVINGS));
    }
}
