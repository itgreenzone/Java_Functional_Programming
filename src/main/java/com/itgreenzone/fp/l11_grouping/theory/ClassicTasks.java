package com.itgreenzone.fp.l11_grouping.theory;

import com.itgreenzone.fp.data.Account;
import com.itgreenzone.fp.data.Category;
import com.itgreenzone.fp.data.Customer;
import com.itgreenzone.fp.data.Flight;
import com.itgreenzone.fp.data.Policy;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;

import java.time.YearMonth;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

import static java.util.Comparator.comparing;
import static java.util.stream.Collectors.groupingBy;

/** The classic grouping interview tasks, on the course dataset. */
public final class ClassicTasks {

    private ClassicTasks() {
    }

    /** Top-3 transactions (by amount) per account: collectingAndThen(toList(), sort + limit). */
    public static Map<String, List<String>> top3PerAccount(List<Transaction> txns) {
        return txns.stream()
                .collect(groupingBy(Transaction::accountNumber, TreeMap::new,
                        Collectors.collectingAndThen(Collectors.toList(), list -> list.stream()
                                .sorted(comparing(Transaction::amount).reversed())
                                .limit(3)
                                .map(Transaction::id)
                                .toList())));
    }

    /** Highest-balance account per customer. */
    public static Map<String, String> richestAccountPerCustomer(List<Account> accounts) {
        return accounts.stream()
                .collect(groupingBy(Account::customerId, TreeMap::new,
                        Collectors.collectingAndThen(Collectors.maxBy(comparing(Account::balance)),
                                o -> o.orElseThrow().number())));
    }

    /** Count of flights per route "FROM-TO", and per origin. */
    public static Map<String, Long> flightsPerOrigin(List<Flight> flights) {
        return flights.stream().collect(groupingBy(Flight::from, TreeMap::new, Collectors.counting()));
    }

    /** Policies by expiry month: YearMonth keys in a TreeMap (chronological). */
    public static Map<YearMonth, List<String>> policiesByExpiryMonth(List<Policy> policies) {
        return policies.stream()
                .collect(groupingBy(p -> YearMonth.from(p.expiry()), TreeMap::new,
                        Collectors.mapping(Policy::number, Collectors.toList())));
    }

    /** Frequency map -> sort entries by count desc, then key -> top N. */
    public static List<String> topCategoriesByCount(List<Transaction> txns, int n) {
        Map<Category, Long> freq = txns.stream().collect(groupingBy(Transaction::category, Collectors.counting()));
        return freq.entrySet().stream()
                .sorted(Map.Entry.<Category, Long>comparingByValue(Comparator.reverseOrder())
                        .thenComparing(Map.Entry.comparingByKey()))
                .limit(n)
                .map(e -> e.getKey() + "=" + e.getValue())
                .toList();
    }

    /** Invert a map: customerId -> city  becomes  city -> [customerIds]. */
    public static Map<String, List<String>> invert(Map<String, String> idToCity) {
        return idToCity.entrySet().stream()
                .collect(groupingBy(Map.Entry::getValue, TreeMap::new,
                        Collectors.mapping(Map.Entry::getKey, Collectors.toList())));
    }

    public static Map<String, String> idToCity(List<Customer> customers) {
        return customers.stream().collect(Collectors.toMap(Customer::id, Customer::city, (a, b) -> a, TreeMap::new));
    }

    public static void main(String[] args) {
        System.out.println("top-3 per account (first 3 accounts):");
        top3PerAccount(SampleData.transactions()).entrySet().stream().limit(3)
                .forEach(e -> System.out.println("  " + e));
        System.out.println("richest account per customer : " + richestAccountPerCustomer(SampleData.accounts()));
        System.out.println("flights per origin           : " + flightsPerOrigin(SampleData.flights()));
        System.out.println("policies by expiry month     : " + policiesByExpiryMonth(SampleData.policies()));
        System.out.println("top 3 categories by count    : " + topCategoriesByCount(SampleData.transactions(), 3));
        System.out.println("invert id->city              : " + invert(idToCity(SampleData.customers())));
    }
}
