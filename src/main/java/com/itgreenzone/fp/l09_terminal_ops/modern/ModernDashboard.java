package com.itgreenzone.fp.l09_terminal_ops.modern;

import com.itgreenzone.fp.data.Account;
import com.itgreenzone.fp.data.Policy;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

/**
 * MODERN (Java 16-21): a record for the result, a reusable BigDecimal sum, Optional kept in the record
 * (no "none" string), and an empty-safe average.
 */
public final class ModernDashboard {

    public record Dashboard(BigDecimal totalBalance, Optional<Transaction> highest, boolean anyOverdrawn,
                            BigDecimal averagePremium) {
        public List<String> lines() {
            return List.of(
                    "total balance   : " + totalBalance,
                    "highest txn     : " + highest.map(t -> t.id() + " " + t.amount()).orElse("none"),
                    "any overdrawn   : " + anyOverdrawn,
                    "average premium : " + averagePremium);
        }
    }

    private ModernDashboard() {
    }

    static BigDecimal sum(List<BigDecimal> values) {
        return values.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /** Empty-safe: no ArithmeticException for an empty list. */
    static BigDecimal average(List<BigDecimal> values) {
        return values.isEmpty()
                ? BigDecimal.ZERO.setScale(2)
                : sum(values).divide(BigDecimal.valueOf(values.size()), 2, RoundingMode.HALF_UP);
    }

    public static Dashboard build(List<Account> accounts, List<Transaction> txns, List<Policy> policies) {
        return new Dashboard(
                sum(accounts.stream().map(Account::balance).toList()),
                txns.stream().max(Comparator.comparing(Transaction::amount).thenComparing(Transaction::id)),
                accounts.stream().anyMatch(a -> a.balance().signum() < 0),
                average(policies.stream().map(Policy::premium).toList()));
    }

    public static List<String> dashboard() {
        return build(SampleData.accounts(), SampleData.transactions(), SampleData.policies()).lines();
    }

    public static void main(String[] args) {
        dashboard().forEach(System.out::println);
        System.out.println("empty data      : " + build(List.of(), List.of(), List.of()).lines());
    }
}
