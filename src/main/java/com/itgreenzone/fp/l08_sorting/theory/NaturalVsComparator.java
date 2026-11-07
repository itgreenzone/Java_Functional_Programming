package com.itgreenzone.fp.l08_sorting.theory;

import com.itgreenzone.fp.data.Customer;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Tier;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;

/**
 * sorted() [Java 8] uses NATURAL ordering: the element must implement Comparable.
 * sorted(Comparator) [Java 8] uses an explicit ordering and works for any type.
 */
public final class NaturalVsComparator {

    private NaturalVsComparator() {
    }

    /** String is Comparable: sorted() gives alphabetical (Unicode) order. */
    public static List<String> citiesNatural(List<Customer> customers) {
        return customers.stream().map(Customer::city).distinct().sorted().toList();
    }

    /** Customer is a record but NOT Comparable: sorted() fails at run time, not at compile time. */
    public static String sortCustomersNaturally(List<Customer> customers) {
        try {
            customers.stream().sorted().toList();
            return "no error";
        } catch (ClassCastException e) {
            return "ClassCastException: " + e.getMessage().split(" \\(")[0];
        }
    }

    /** With a Comparator any type can be sorted. */
    public static List<String> customersByCity(List<Customer> customers) {
        return customers.stream()
                .sorted(Comparator.comparing(Customer::city))
                .map(c -> c.city() + "/" + c.id())
                .toList();
    }

    /** Enums compare by declaration order: SILVER < GOLD < PLATINUM. */
    public static List<Tier> tiersNatural() {
        return Stream.of(Tier.GOLD, Tier.PLATINUM, Tier.SILVER, Tier.GOLD).sorted().toList();
    }

    /** BigDecimal's natural order is compareTo: 10.0 and 10.00 are EQUAL for sorting (stable: input order kept). */
    public static List<String> bigDecimalNatural() {
        return Stream.of(new BigDecimal("10.00"), new BigDecimal("9.5"), new BigDecimal("10.0"), new BigDecimal("-1"))
                .sorted()
                .map(BigDecimal::toPlainString)
                .toList();
    }

    public static void main(String[] args) {
        List<Customer> customers = SampleData.customers();
        System.out.println("cities, sorted()     : " + citiesNatural(customers));
        System.out.println("customers, sorted()  : " + sortCustomersNaturally(customers));
        System.out.println("by city (Comparator) : " + customersByCity(customers));
        System.out.println("enum natural order   : " + tiersNatural());
        System.out.println("BigDecimal natural   : " + bigDecimalNatural());
    }
}
