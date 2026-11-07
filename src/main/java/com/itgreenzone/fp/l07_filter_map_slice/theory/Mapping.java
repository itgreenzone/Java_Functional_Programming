package com.itgreenzone.fp.l07_filter_map_slice.theory;

import com.itgreenzone.fp.data.Customer;
import com.itgreenzone.fp.data.Flight;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Tier;

import java.util.List;
import java.util.Locale;
import java.util.stream.IntStream;

/**
 * map(Function) [Java 8]: one element in, one element out (a new type is fine).
 * mapToInt / mapToLong / mapToDouble [Java 8] give primitive streams (no boxing, sum/average);
 * mapToObj and boxed [Java 8] go back to objects.
 */
public final class Mapping {

    /** A small view of a customer: map can build a new type. [record: Java 16] */
    public record CustomerCard(String id, String upperName, Tier tier) { }

    private Mapping() {
    }

    /** Practice 2: customer names in uppercase. Locale.ROOT keeps the result the same on every machine. */
    public static List<String> upperNames(List<Customer> customers) {
        return customers.stream()
                .map(Customer::name)
                .map(n -> n.toUpperCase(Locale.ROOT))
                .toList();
    }

    public static List<CustomerCard> cards(List<Customer> customers) {
        return customers.stream()
                .map(c -> new CustomerCard(c.id(), c.name().toUpperCase(Locale.ROOT), c.tier()))
                .toList();
    }

    /** mapToInt + sum: no Integer boxing. */
    public static int totalBooked(List<Flight> flights) {
        return flights.stream().mapToInt(Flight::booked).sum();
    }

    /** mapToDouble for a ratio (not money). Formatted with Locale.ROOT. */
    public static String averageLoadFactor(List<Flight> flights) {
        double avg = flights.stream()
                .mapToDouble(f -> 100.0 * f.booked() / f.seats())
                .average()
                .orElse(0);
        return String.format(Locale.ROOT, "%.1f%%", avg);
    }

    /** mapToObj: from int back to objects. */
    public static List<String> pageLabels(int pages) {
        return IntStream.rangeClosed(1, pages).mapToObj(i -> "Page " + i).toList();
    }

    /** boxed: IntStream -> Stream<Integer>, needed to collect into a List<Integer>. */
    public static List<Integer> seatsLeft(List<Flight> flights) {
        return flights.stream()
                .mapToInt(f -> f.seats() - f.booked())
                .boxed()
                .toList();
    }

    public static void main(String[] args) {
        System.out.println("upper names        : " + upperNames(SampleData.customers()));
        System.out.println("first card         : " + cards(SampleData.customers()).get(0));
        System.out.println("mapToInt sum       : " + totalBooked(SampleData.flights()) + " seats booked");
        System.out.println("mapToDouble avg    : " + averageLoadFactor(SampleData.flights()) + " load factor");
        System.out.println("mapToObj           : " + pageLabels(3));
        System.out.println("boxed              : " + seatsLeft(SampleData.flights()));
    }
}
