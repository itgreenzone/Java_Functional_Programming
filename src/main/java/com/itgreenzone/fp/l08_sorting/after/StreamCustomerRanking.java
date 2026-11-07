package com.itgreenzone.fp.l08_sorting.after;

import com.itgreenzone.fp.data.Account;
import com.itgreenzone.fp.data.Customer;
import com.itgreenzone.fp.data.SampleData;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

/** AFTER (Java 8): totals with a collector, then one Comparator chain with reverseOrder() per DESC key. */
public final class StreamCustomerRanking {

    private StreamCustomerRanking() {
    }

    public static List<String> ranking() {
        Map<String, BigDecimal> totals = SampleData.accounts().stream()
                .collect(Collectors.toMap(Account::customerId, Account::balance, BigDecimal::add));   // L10
        Comparator<Customer> order = Comparator
                .comparing(Customer::tier, Comparator.reverseOrder())
                .thenComparing(c -> totals.get(c.id()), Comparator.reverseOrder())
                .thenComparing(Customer::name);
        AtomicInteger rank = new AtomicInteger();
        return SampleData.customers().stream()
                .sorted(order)
                .map(c -> rank.incrementAndGet() + ". " + c.id() + " " + c.name() + " " + c.tier() + " " + totals.get(c.id()))
                .collect(Collectors.toList());
    }

    public static void main(String[] args) {
        ranking().forEach(System.out::println);
    }
}
