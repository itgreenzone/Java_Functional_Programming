package com.itgreenzone.fp.l05_optional.theory;

import com.itgreenzone.fp.data.Flight;
import com.itgreenzone.fp.data.SampleData;

import java.util.List;
import java.util.Locale;
import java.util.OptionalDouble;
import java.util.OptionalInt;
import java.util.OptionalLong;

/**
 * OptionalInt, OptionalLong, OptionalDouble [Java 8]: returned by IntStream.max(), average() and friends.
 * No boxing; use getAsInt() / orElse(...). They have no map/filter/flatMap.
 */
public final class PrimitiveOptionals {

    private PrimitiveOptionals() {
    }

    public static OptionalInt mostSeatsLeft(List<Flight> flights) {
        return flights.stream()
                .mapToInt(f -> f.seats() - f.booked())
                .max();
    }

    public static OptionalDouble averageLoadFactorPercent(List<Flight> flights) {
        return flights.stream()
                .mapToDouble(f -> 100.0 * f.booked() / f.seats())
                .average();
    }

    public static OptionalLong largestBooking(List<Flight> flights) {
        return flights.stream()
                .mapToLong(Flight::booked)
                .max();
    }

    public static void main(String[] args) {
        List<Flight> flights = SampleData.flights();
        System.out.println("max seats left        : " + mostSeatsLeft(flights));
        System.out.println("getAsInt()            : " + mostSeatsLeft(flights).getAsInt());
        System.out.println("average load factor   : "
                + String.format(Locale.ROOT, "%.1f%%", averageLoadFactorPercent(flights).orElse(0)));
        System.out.println("largest booking       : " + largestBooking(flights));
        System.out.println("empty list max        : " + mostSeatsLeft(List.of()));
        System.out.println("empty list orElse(0)  : " + mostSeatsLeft(List.of()).orElse(0));
    }
}
