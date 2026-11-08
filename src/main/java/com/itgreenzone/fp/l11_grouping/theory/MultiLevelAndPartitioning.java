package com.itgreenzone.fp.l11_grouping.theory;

import com.itgreenzone.fp.data.Customer;
import com.itgreenzone.fp.data.Flight;
import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.PaymentStatus;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Tier;

import java.math.BigDecimal;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

import static java.util.stream.Collectors.groupingBy;
import static java.util.stream.Collectors.partitioningBy;

/**
 * Multi-level grouping: a groupingBy as the downstream of another groupingBy (nested maps).
 * partitioningBy(predicate[, downstream]) [8]: ALWAYS a map with exactly two keys, false and true.
 */
public final class MultiLevelAndPartitioning {

    private MultiLevelAndPartitioning() {
    }

    /** city -> tier -> count. Outer TreeMap, inner EnumMap. */
    public static Map<String, Map<Tier, Long>> cityTierCount(List<Customer> customers) {
        return customers.stream()
                .collect(groupingBy(Customer::city, TreeMap::new,
                        groupingBy(Customer::tier, () -> new EnumMap<>(Tier.class), Collectors.counting())));
    }

    /** Alternative: a record as a composite key gives a FLAT map (easier to sort and print). */
    public record CityTier(String city, Tier tier) implements Comparable<CityTier> {
        @Override
        public int compareTo(CityTier o) {
            int c = city.compareTo(o.city);
            return c != 0 ? c : tier.compareTo(o.tier);
        }

        @Override
        public String toString() {
            return city + "/" + tier;
        }
    }

    public static Map<CityTier, Long> cityTierFlat(List<Customer> customers) {
        return customers.stream()
                .collect(groupingBy(c -> new CityTier(c.city(), c.tier()), TreeMap::new, Collectors.counting()));
    }

    public static Map<Boolean, Long> successPartition(List<Payment> payments) {
        return payments.stream().collect(partitioningBy(p -> p.status() == PaymentStatus.SUCCESS, Collectors.counting()));
    }

    public static Map<Boolean, BigDecimal> successTotals(List<Payment> payments) {
        return payments.stream().collect(partitioningBy(p -> p.status() == PaymentStatus.SUCCESS,
                Collectors.reducing(BigDecimal.ZERO, Payment::amount, BigDecimal::add)));
    }

    /** No flight is overbooked, yet both keys exist: {false=8, true=0}. groupingBy would give only {false=8}. */
    public static String overbookedPartitionVsGrouping(List<Flight> flights) {
        Map<Boolean, Long> p = flights.stream().collect(partitioningBy(f -> f.booked() > f.seats(), Collectors.counting()));
        Map<Boolean, Long> g = flights.stream().collect(groupingBy(f -> f.booked() > f.seats(), Collectors.counting()));
        return "partitioningBy=" + p + " groupingBy=" + g;
    }

    public static void main(String[] args) {
        List<Customer> customers = SampleData.customers();
        System.out.println("city -> tier -> count : " + cityTierCount(customers));
        System.out.println("record key (flat)     : " + cityTierFlat(customers));
        System.out.println("partition SUCCESS     : " + successPartition(SampleData.payments()));
        System.out.println("partition totals      : " + successTotals(SampleData.payments()));
        System.out.println("overbooked            : " + overbookedPartitionVsGrouping(SampleData.flights()));
    }
}
