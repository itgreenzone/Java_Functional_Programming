package com.itgreenzone.fp.l12_primitive_streams.theory;

import com.itgreenzone.fp.data.Flight;
import com.itgreenzone.fp.data.SampleData;

import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

/**
 * Moving between object and primitive streams [Java 8]:
 *   Stream -> IntStream : mapToInt, mapToLong, mapToDouble
 *   IntStream -> Stream : boxed(), mapToObj(f)
 *   IntStream -> LongStream / DoubleStream : asLongStream(), asDoubleStream()
 * IntStream has no collect(Collector): box first, or use the 3-argument collect.
 */
public final class BoxingAndConversions {

    private BoxingAndConversions() {
    }

    /** Boxed version: every element is an Integer object, and reduce unboxes and re-boxes at each step. */
    public static int totalBookedBoxed(List<Flight> flights) {
        return flights.stream().map(Flight::booked).reduce(0, Integer::sum);
    }

    /** Primitive version: no Integer objects at all. Same answer. */
    public static int totalBookedPrimitive(List<Flight> flights) {
        return flights.stream().mapToInt(Flight::booked).sum();
    }

    /** mapToObj: from an index to an object. Seat labels for row 1 of a 6-abreast cabin. */
    public static List<String> rowLabels(int row) {
        return "ABCDEF".chars().mapToObj(c -> row + String.valueOf((char) c)).toList();
    }

    /** boxed() is needed before a Collector: IntStream.collect only takes supplier/accumulator/combiner. */
    public static Map<Boolean, List<Integer>> evenOddUpTo(int n) {
        return IntStream.rangeClosed(1, n).boxed().collect(Collectors.partitioningBy(i -> i % 2 == 0));
    }

    /** asDoubleStream: int to double without a cast. Load factor = booked / seats. */
    public static double averageEmptySeats(List<Flight> flights) {
        return flights.stream().mapToInt(f -> f.seats() - f.booked()).asDoubleStream().average().orElse(0);
    }

    /** IntStream over indexes: pair each flight with its position (the classic "zip with index"). */
    public static Map<Integer, String> numbered(List<Flight> flights) {
        return IntStream.range(0, flights.size()).boxed()
                .collect(Collectors.toMap(i -> i + 1, i -> flights.get(i).code(), (a, b) -> a, TreeMap::new));
    }

    /**
     * The Integer cache trap: boxed values are objects. Integer.valueOf caches -128..127 by default,
     * so == compares references and works by accident for small numbers only. Always use equals.
     */
    public static String identityTrap(int value) {
        List<Integer> two = IntStream.of(value, value).boxed().toList();
        return "==" + (two.get(0) == two.get(1)) + " equals=" + two.get(0).equals(two.get(1));
    }

    public static void main(String[] args) {
        List<Flight> flights = SampleData.flights();
        System.out.println("booked (boxed reduce)    : " + totalBookedBoxed(flights));
        System.out.println("booked (mapToInt.sum)    : " + totalBookedPrimitive(flights));
        System.out.println("mapToObj seat labels     : " + rowLabels(1));
        System.out.println("boxed + partitioningBy   : " + evenOddUpTo(6));
        System.out.println("asDoubleStream average   : " + averageEmptySeats(flights));
        System.out.println("zip with index           : " + numbered(flights));
        System.out.println("Integer 100  boxed twice : " + identityTrap(100));
        System.out.println("Integer 1000 boxed twice : " + identityTrap(1000));
    }
}
