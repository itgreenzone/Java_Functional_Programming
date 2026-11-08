package com.itgreenzone.fp.l11_grouping.theory;

import com.itgreenzone.fp.data.Customer;
import com.itgreenzone.fp.data.Flight;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Tier;
import com.itgreenzone.fp.data.Transaction;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;
import java.util.stream.Collectors;

import static java.util.Comparator.comparing;
import static java.util.stream.Collectors.groupingBy;

/**
 * groupingBy [Java 8] in its three overloads:
 *   groupingBy(classifier)                          -> Map&lt;K, List&lt;T&gt;&gt; (a HashMap: no order)
 *   groupingBy(classifier, downstream)              -> Map&lt;K, D&gt;
 *   groupingBy(classifier, mapFactory, downstream)  -> your map type (TreeMap, EnumMap) + D
 */
public final class GroupingBasics {

    private GroupingBasics() {
    }

    /** 1-arg: a HashMap of lists. Fine for lookups; print it through a TreeMap for a stable order. */
    public static Map<String, List<Customer>> customersByCity(List<Customer> customers) {
        return customers.stream().collect(groupingBy(Customer::city));
    }

    /** 3-arg with TreeMap and counting(). */
    public static Map<String, Long> countPerCity(List<Customer> customers) {
        return customers.stream().collect(groupingBy(Customer::city, TreeMap::new, Collectors.counting()));
    }

    /** EnumMap keeps enum declaration order: SILVER, GOLD, PLATINUM. mapping -> toSet: distinct cities per tier. */
    public static Map<Tier, Set<String>> citiesPerTier(List<Customer> customers) {
        return customers.stream().collect(groupingBy(Customer::tier, () -> new EnumMap<>(Tier.class),
                Collectors.mapping(Customer::city, Collectors.toCollection(TreeSet::new))));
    }

    /** summingInt / averagingInt per key: seats per origin airport. */
    public static Map<String, Integer> seatsPerOrigin(List<Flight> flights) {
        return flights.stream().collect(groupingBy(Flight::from, TreeMap::new, Collectors.summingInt(Flight::seats)));
    }

    public static Map<String, Double> averageBookedPerOrigin(List<Flight> flights) {
        return flights.stream().collect(groupingBy(Flight::from, TreeMap::new, Collectors.averagingInt(Flight::booked)));
    }

    /** maxBy gives Optional per group (never empty inside groupingBy) ... */
    public static Map<String, Optional<Transaction>> largestPerAccountOptional(List<Transaction> txns) {
        return txns.stream().collect(groupingBy(Transaction::accountNumber, TreeMap::new,
                Collectors.maxBy(comparing(Transaction::amount))));
    }

    /** ... so unwrap it with collectingAndThen(maxBy(..), Optional::orElseThrow) and map to the id. */
    public static Map<String, String> largestIdPerAccount(List<Transaction> txns) {
        return txns.stream().collect(groupingBy(Transaction::accountNumber, TreeMap::new,
                Collectors.collectingAndThen(Collectors.maxBy(comparing(Transaction::amount)),
                        o -> o.orElseThrow().id())));
    }

    /** joining per group. */
    public static Map<Tier, String> namesPerTier(List<Customer> customers) {
        return customers.stream().collect(groupingBy(Customer::tier, () -> new EnumMap<>(Tier.class),
                Collectors.mapping(Customer::name, Collectors.joining(", "))));
    }

    public static void main(String[] args) {
        List<Customer> customers = SampleData.customers();
        System.out.println("groupingBy(city) -> HashMap; Singapore = "
                + customersByCity(customers).get("Singapore").stream().map(Customer::id).toList());
        System.out.println("count per city (TreeMap)   : " + countPerCity(customers));
        System.out.println("cities per tier (EnumMap)  : " + citiesPerTier(customers));
        System.out.println("seats per origin           : " + seatsPerOrigin(SampleData.flights()));
        System.out.println("avg booked per origin      : " + averageBookedPerOrigin(SampleData.flights()));
        System.out.println("maxBy (Optional) ACC-1001  : "
                + largestPerAccountOptional(SampleData.transactions()).get("ACC-1001").map(Transaction::id));
        System.out.println("largest id per account     : " + largestIdPerAccount(SampleData.transactions()));
        System.out.println("names per tier (joining)   : " + namesPerTier(customers));
    }
}
