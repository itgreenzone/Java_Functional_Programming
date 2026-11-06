package com.itgreenzone.fp.l02_functional_interfaces.theory;

import com.itgreenzone.fp.data.Flight;
import com.itgreenzone.fp.data.SampleData;

import java.util.List;
import java.util.function.IntPredicate;
import java.util.function.IntUnaryOperator;
import java.util.function.ObjIntConsumer;
import java.util.function.ToIntFunction;

/**
 * Primitive specialisations [Java 8] work on int/long/double directly, so no Integer objects
 * are created (no boxing / unboxing). Same idea as Function, Predicate and Consumer.
 */
public final class PrimitiveSpecialisations {

    /** ToIntFunction&lt;T&gt;: T -> int. Instead of Function&lt;Flight, Integer&gt;. */
    public static final ToIntFunction<Flight> BOOKED = Flight::booked;

    /** IntPredicate: int -> boolean. Instead of Predicate&lt;Integer&gt;. */
    public static final IntPredicate FEWER_THAN_10 = seatsLeft -> seatsLeft < 10;

    /** IntUnaryOperator: int -> int. Overbooking allowance of 10% (integer division). */
    public static final IntUnaryOperator WITH_OVERBOOKING = seats -> seats + seats / 10;

    /** ObjIntConsumer&lt;T&gt;: (T, int) -> void. */
    public static final ObjIntConsumer<String> PRINT_SEATS_LEFT =
            (code, left) -> System.out.println("  " + code + " has " + left + " seats left");

    private PrimitiveSpecialisations() {
    }

    public static int totalBooked(List<Flight> flights) {
        return flights.stream()
                .mapToInt(BOOKED)
                .sum();
    }

    public static List<String> nearlyFull(List<Flight> flights) {
        return flights.stream()
                .filter(f -> FEWER_THAN_10.test(f.seats() - f.booked()))
                .map(Flight::code)
                .toList();
    }

    public static void main(String[] args) {
        List<Flight> flights = SampleData.flights();
        System.out.println("Total booked seats: " + totalBooked(flights));
        System.out.println("Nearly full (< 10 left): " + nearlyFull(flights));
        System.out.println("SQ318 capacity with 10% overbooking: " + WITH_OVERBOOKING.applyAsInt(flights.get(0).seats()));
        for (Flight f : flights.subList(0, 3)) {
            PRINT_SEATS_LEFT.accept(f.code(), f.seats() - f.booked());
        }
    }
}
