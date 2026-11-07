package com.itgreenzone.fp.l10_collectors.theory;

import com.itgreenzone.fp.data.Account;
import com.itgreenzone.fp.data.Customer;
import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.PaymentStatus;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Tier;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Collectors that wrap other collectors:
 * collectingAndThen [8], mapping [8], filtering [9], flatMapping [9], teeing [12].
 */
public final class ComposingCollectors {

    /** Result of teeing: two collectors over ONE pass. [record: Java 16] */
    public record CountAndTotal(long count, BigDecimal total) {
        @Override
        public String toString() {
            return count + " payments, total " + total;
        }
    }

    private ComposingCollectors() {
    }

    /** collectingAndThen: run a finisher on the result, e.g. unwrap the Optional of maxBy. */
    public static String largestPaymentId(List<Payment> payments) {
        return payments.stream()
                .collect(Collectors.collectingAndThen(
                        Collectors.maxBy(Comparator.comparing(Payment::amount)),
                        opt -> opt.map(Payment::id).orElse("none")));
    }

    /** mapping(mapper, downstream): map inside the collector. */
    public static String goldNames(List<Customer> customers) {
        return customers.stream()
                .filter(c -> c.tier() == Tier.GOLD)
                .collect(Collectors.mapping(Customer::name, Collectors.joining(" | ")));
    }

    /** filtering [9]: filter inside the collector (essential in groupingBy, L11, to keep empty groups). */
    public static long successCount(List<Payment> payments) {
        return payments.stream()
                .collect(Collectors.filtering(p -> p.status() == PaymentStatus.SUCCESS, Collectors.counting()));
    }

    /** flatMapping [9]: flatMap inside the collector. Customer -> account numbers. */
    public static List<String> singaporeAccounts(List<Customer> customers, List<Account> accounts) {
        return customers.stream()
                .filter(c -> c.city().equals("Singapore"))
                .collect(Collectors.flatMapping(
                        c -> accounts.stream().filter(a -> a.customerId().equals(c.id())).map(Account::number),
                        Collectors.toList()));
    }

    /** teeing [12]: two collectors in one pass, then merge their results. */
    public static CountAndTotal countAndTotal(List<Payment> payments) {
        return payments.stream()
                .collect(Collectors.teeing(
                        Collectors.counting(),
                        Collectors.reducing(BigDecimal.ZERO, Payment::amount, BigDecimal::add),
                        CountAndTotal::new));
    }

    /** teeing for a min/max range of balances. */
    public static String balanceRange(List<Account> accounts) {
        return accounts.stream()
                .map(Account::balance)
                .collect(Collectors.teeing(
                        Collectors.minBy(Comparator.<BigDecimal>naturalOrder()),
                        Collectors.maxBy(Comparator.<BigDecimal>naturalOrder()),
                        (min, max) -> min.orElseThrow() + " .. " + max.orElseThrow()));
    }

    public static void main(String[] args) {
        List<Payment> payments = SampleData.payments();
        System.out.println("collectingAndThen  : largest payment " + largestPaymentId(payments));
        System.out.println("mapping + joining  : " + goldNames(SampleData.customers()));
        System.out.println("filtering [9]      : " + successCount(payments) + " SUCCESS");
        System.out.println("flatMapping [9]    : " + singaporeAccounts(SampleData.customers(), SampleData.accounts()));
        System.out.println("teeing [12]        : " + countAndTotal(payments));
        System.out.println("teeing min..max    : " + balanceRange(SampleData.accounts()));
    }
}
