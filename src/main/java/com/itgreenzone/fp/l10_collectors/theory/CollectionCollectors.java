package com.itgreenzone.fp.l10_collectors.theory;

import com.itgreenzone.fp.data.Customer;
import com.itgreenzone.fp.data.Flight;
import com.itgreenzone.fp.data.SampleData;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Collecting into collections: toList / toSet / toCollection [8], toUnmodifiableList / Set [10].
 * A Collector is a recipe: supplier (new container), accumulator (add one), combiner (merge two), finisher.
 */
public final class CollectionCollectors {

    private CollectionCollectors() {
    }

    /** toSet: duplicates removed, but a HashSet has NO defined order. Only size and contents are reliable. */
    public static Set<String> citiesAsSet(List<Customer> customers) {
        return customers.stream().map(Customer::city).collect(Collectors.toSet());
    }

    /** toCollection(TreeSet::new): you choose the implementation: sorted and distinct. */
    public static TreeSet<String> citiesSorted(List<Customer> customers) {
        return customers.stream().map(Customer::city).collect(Collectors.toCollection(TreeSet::new));
    }

    /** toCollection works with any Collection type, e.g. an ArrayDeque (elements added at the tail). */
    public static Deque<String> flightStack(List<Flight> flights) {
        return flights.stream().map(Flight::code).collect(Collectors.toCollection(ArrayDeque::new));
    }

    /** toUnmodifiableSet [10]: immutable; a later add throws. */
    public static String unmodifiableSet() {
        Set<String> s = Stream.of("SGD", "USD", "SGD").collect(Collectors.toUnmodifiableSet());
        try {
            s.add("EUR");
            return "added";
        } catch (UnsupportedOperationException e) {
            return "size " + s.size() + ", add -> UnsupportedOperationException";
        }
    }

    /** The same recipe written by hand with collect(supplier, accumulator, combiner). */
    public static TreeSet<String> citiesHandWritten(List<Customer> customers) {
        return customers.stream().map(Customer::city).collect(TreeSet::new, TreeSet::add, TreeSet::addAll);
    }

    public static void main(String[] args) {
        List<Customer> customers = SampleData.customers();
        System.out.println("toSet size             : " + citiesAsSet(customers).size() + " (HashSet: order not defined)");
        System.out.println("toCollection(TreeSet)  : " + citiesSorted(customers));
        System.out.println("hand-written collect   : " + citiesHandWritten(customers));
        System.out.println("toCollection(Deque)    : peekLast=" + flightStack(SampleData.flights()).peekLast());
        System.out.println("toUnmodifiableSet [10] : " + unmodifiableSet());
    }
}
