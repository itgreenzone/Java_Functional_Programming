package com.itgreenzone.fp.l08_sorting.theory;

import com.itgreenzone.fp.data.Customer;
import com.itgreenzone.fp.data.Flight;
import com.itgreenzone.fp.data.Policy;
import com.itgreenzone.fp.data.SampleData;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;

/**
 * Comparator factory methods [Java 8]:
 * comparing(keyExtractor), comparing(keyExtractor, keyComparator), comparingInt/Long/Double,
 * naturalOrder(), reverseOrder(), String.CASE_INSENSITIVE_ORDER [Java 1.2].
 */
public final class ComparatorFactories {

    private ComparatorFactories() {
    }

    /** Java 7 style: an anonymous class with a compare method. */
    public static final Comparator<Policy> BY_PREMIUM_JAVA7 = new Comparator<Policy>() {
        @Override
        public int compare(Policy a, Policy b) {
            return a.premium().compareTo(b.premium());
        }
    };

    /** Java 8: a key extractor; the key (BigDecimal) is Comparable. */
    public static final Comparator<Policy> BY_PREMIUM = Comparator.comparing(Policy::premium);

    public static List<String> policiesByPremium(Comparator<Policy> order) {
        return SampleData.policies().stream()
                .sorted(order)
                .map(p -> p.number() + " " + p.premium())
                .limit(3)
                .toList();
    }

    /** comparingInt: no boxing of the int key. */
    public static List<String> flightsBySeats() {
        return SampleData.flights().stream()
                .sorted(Comparator.comparingInt(Flight::seats))
                .map(f -> f.code() + " " + f.seats())
                .toList();
    }

    /** comparingDouble for a ratio (not money). */
    public static List<String> flightsByLoadFactor() {
        return SampleData.flights().stream()
                .sorted(Comparator.comparingDouble((Flight f) -> (double) f.booked() / f.seats()))
                .map(Flight::code)
                .toList();
    }

    /** comparing(key, keyComparator): the key is a String, compared in reverse. */
    public static List<String> citiesZtoA(List<Customer> customers) {
        return customers.stream()
                .sorted(Comparator.comparing(Customer::city, Comparator.reverseOrder()))
                .map(Customer::city)
                .distinct()
                .toList();
    }

    /** User-typed labels: natural order puts uppercase first; CASE_INSENSITIVE_ORDER ignores case. */
    public static String caseSensitivity() {
        List<String> labels = List.of("paynow", "PayPal", "CARD", "card");
        return "natural " + labels.stream().sorted(Comparator.naturalOrder()).toList()
                + " | case-insensitive " + labels.stream().sorted(String.CASE_INSENSITIVE_ORDER).toList();
    }

    /** naturalOrder / reverseOrder on a Comparable type. */
    public static List<Integer> seatsDescending() {
        return Stream.of(160, 471, 222).sorted(Comparator.reverseOrder()).toList();
    }

    public static void main(String[] args) {
        System.out.println("premium, Java 7     : " + policiesByPremium(BY_PREMIUM_JAVA7));
        System.out.println("premium, comparing  : " + policiesByPremium(BY_PREMIUM));
        System.out.println("comparingInt seats  : " + flightsBySeats());
        System.out.println("comparingDouble load: " + flightsByLoadFactor());
        System.out.println("city, reverseOrder  : " + citiesZtoA(SampleData.customers()));
        System.out.println("case                : " + caseSensitivity());
        System.out.println("reverseOrder ints   : " + seatsDescending());
    }
}
