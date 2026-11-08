package com.itgreenzone.fp.l13_advanced.theory;

import com.itgreenzone.fp.data.Account;
import com.itgreenzone.fp.data.Customer;
import com.itgreenzone.fp.data.Flight;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Making streams that do not come from a collection, and flattening nested data:
 * Stream.iterate [8] / with a predicate [9], Stream.generate [8], Stream.concat [8], Stream.ofNullable [9], flatMap.
 */
public final class GeneratingAndFlattening {

    private GeneratingAndFlattening() {
    }

    /** Statement months from the first transaction month to the course month, as a for-loop stream [9]. */
    public static List<YearMonth> statementMonths(YearMonth from, YearMonth to) {
        return Stream.iterate(from, m -> !m.isAfter(to), m -> m.plusMonths(1)).toList();
    }

    /** Weekly reminder dates before a policy expiry: iterate + limit [8]. */
    public static List<LocalDate> weeklyReminders(LocalDate expiry, int weeks) {
        return Stream.iterate(expiry.minusWeeks(weeks), d -> d.plusWeeks(1)).limit(weeks).toList();
    }

    /** generate: an infinite supplier; here a fixed placeholder row for an empty seat map. */
    public static List<String> emptyRows(int count) {
        return Stream.generate(() -> "------").limit(count).toList();
    }

    /** concat two streams (keeps the order: first a, then b). */
    public static List<String> departuresThenArrivalsAtSin(List<Flight> flights) {
        return Stream.concat(
                flights.stream().filter(f -> f.from().equals("SIN")).map(f -> "DEP " + f.code()),
                flights.stream().filter(f -> f.to().equals("SIN")).map(f -> "ARR " + f.code())).toList();
    }

    /** ofNullable [9]: 0 or 1 element; useful inside flatMap for optional values. */
    public static long countPresent(List<String> maybeNulls) {
        return maybeNulls.stream().flatMap(Stream::ofNullable).count();
    }

    /** Deep flattening: customers -> accounts -> transactions. Count transactions of Singapore customers. */
    public static long singaporeTransactionCount(List<Customer> customers, List<Account> accounts, List<Transaction> txns) {
        Map<String, List<Account>> accountsByCustomer = accounts.stream()
                .collect(Collectors.groupingBy(Account::customerId));
        Map<String, List<Transaction>> txnsByAccount = txns.stream()
                .collect(Collectors.groupingBy(Transaction::accountNumber));
        return customers.stream()
                .filter(c -> c.city().equals("Singapore"))
                .flatMap(c -> accountsByCustomer.getOrDefault(c.id(), List.of()).stream())
                .flatMap(a -> txnsByAccount.getOrDefault(a.number(), List.of()).stream())
                .count();
    }

    /** Flattening Optionals: Optional.stream() [9] turns each Optional into 0 or 1 elements. */
    public static List<String> knownCustomerNames(List<String> ids, Function<String, Optional<Customer>> lookup) {
        return ids.stream().map(lookup).flatMap(Optional::stream).map(Customer::name).toList();
    }

    public static void main(String[] args) {
        System.out.println("statement months     : " + statementMonths(YearMonth.of(2026, 8), YearMonth.of(2026, 11)));
        System.out.println("weekly reminders     : " + weeklyReminders(LocalDate.of(2026, 11, 30), 4));
        System.out.println("generate + limit     : " + emptyRows(3));
        System.out.println("concat               : " + departuresThenArrivalsAtSin(SampleData.flights()));
        System.out.println("ofNullable           : " + countPresent(java.util.Arrays.asList("SQ12", null, "TR808", null)));
        System.out.println("SG customers' txns   : "
                + singaporeTransactionCount(SampleData.customers(), SampleData.accounts(), SampleData.transactions()));
        Map<String, Customer> byId = SampleData.customers().stream()
                .collect(Collectors.toMap(Customer::id, Function.identity()));
        System.out.println("Optional::stream     : "
                + knownCustomerNames(List.of("C001", "C999", "C003"), id -> Optional.ofNullable(byId.get(id))));
    }
}
