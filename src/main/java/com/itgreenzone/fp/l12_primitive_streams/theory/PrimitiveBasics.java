package com.itgreenzone.fp.l12_primitive_streams.theory;

import com.itgreenzone.fp.data.Flight;
import com.itgreenzone.fp.data.SampleData;

import java.util.IntSummaryStatistics;
import java.util.List;
import java.util.Locale;
import java.util.OptionalDouble;
import java.util.OptionalInt;
import java.util.stream.IntStream;

/**
 * The three primitive streams [Java 8]: IntStream, LongStream, DoubleStream.
 * They hold int/long/double values directly (no Integer objects) and add numeric terminals:
 * sum(), average(), min(), max(), summaryStatistics().
 */
public final class PrimitiveBasics {

    private PrimitiveBasics() {
    }

    /** range is half-open [from, to); rangeClosed includes the end. */
    public static int sumRange(int from, int to) {
        return IntStream.range(from, to).sum();
    }

    public static int sumRangeClosed(int from, int to) {
        return IntStream.rangeClosed(from, to).sum();
    }

    /** mapToInt switches from Stream&lt;Flight&gt; to IntStream; sum() of an empty IntStream is 0. */
    public static int totalSeats(List<Flight> flights) {
        return flights.stream().mapToInt(Flight::seats).sum();
    }

    /** average() returns OptionalDouble: empty for an empty stream, never a division by zero. */
    public static OptionalDouble averageSeats(List<Flight> flights) {
        return flights.stream().mapToInt(Flight::seats).average();
    }

    /** max() returns OptionalInt. */
    public static OptionalInt maxBooked(List<Flight> flights) {
        return flights.stream().mapToInt(Flight::booked).max();
    }

    /** One pass: count, sum, min, max, average. */
    public static IntSummaryStatistics seatStatistics(List<Flight> flights) {
        return flights.stream().mapToInt(Flight::seats).summaryStatistics();
    }

    /** IntSummaryStatistics.toString() uses the default locale for the average, so format it ourselves. */
    public static String format(IntSummaryStatistics s) {
        return String.format(Locale.ROOT, "count=%d sum=%d min=%d max=%d avg=%.2f",
                s.getCount(), s.getSum(), s.getMin(), s.getMax(), s.getAverage());
    }

    /** IntStream.iterate(seed, next) [Java 8] is infinite: limit it. */
    public static List<Integer> doublings(int count) {
        return IntStream.iterate(1, n -> n * 2).limit(count).boxed().toList();
    }

    /** IntStream.iterate(seed, hasNext, next) [Java 9]: a for-loop as a stream. */
    public static List<Integer> seatRowsEvery10(int seats) {
        return IntStream.iterate(1, row -> row <= seats, row -> row + 10).boxed().toList();
    }

    public static void main(String[] args) {
        List<Flight> flights = SampleData.flights();
        System.out.println("range(1, 5).sum()        : " + sumRange(1, 5));
        System.out.println("rangeClosed(1, 5).sum()  : " + sumRangeClosed(1, 5));
        System.out.println("total seats              : " + totalSeats(flights));
        System.out.println("total seats (no flights) : " + totalSeats(List.of()));
        System.out.println("average seats            : " + averageSeats(flights));
        System.out.println("average seats (empty)    : " + averageSeats(List.of()));
        System.out.println("max booked               : " + maxBooked(flights));
        System.out.println("statistics               : " + format(seatStatistics(flights)));
        System.out.println("iterate + limit          : " + doublings(8));
        System.out.println("iterate with predicate   : " + seatRowsEvery10(42));
    }
}
