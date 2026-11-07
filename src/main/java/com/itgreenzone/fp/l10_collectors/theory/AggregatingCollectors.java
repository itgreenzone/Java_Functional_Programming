package com.itgreenzone.fp.l10_collectors.theory;

import com.itgreenzone.fp.data.Flight;
import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.SampleData;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.IntSummaryStatistics;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * joining, counting, summingInt/Long/Double, averagingInt/Long/Double, summarizingInt/Long/Double,
 * minBy/maxBy, reducing [all Java 8]. These shine as DOWNSTREAM collectors in groupingBy (L11);
 * at top level most have a simpler stream equivalent.
 */
public final class AggregatingCollectors {

    private AggregatingCollectors() {
    }

    /** joining(delimiter, prefix, suffix). */
    public static String flightCodes(List<Flight> flights) {
        return flights.stream().map(Flight::code).collect(Collectors.joining(", ", "Flights: [", "]"));
    }

    public static long countingCollector(List<Payment> payments) {
        return payments.stream().collect(Collectors.counting());          // = stream.count()
    }

    public static int totalBooked(List<Flight> flights) {
        return flights.stream().collect(Collectors.summingInt(Flight::booked));
    }

    public static double averageBooked(List<Flight> flights) {
        return flights.stream().collect(Collectors.averagingInt(Flight::booked));
    }

    /** One pass, five numbers. Fields printed one by one: IntSummaryStatistics.toString uses the default locale. */
    public static String seatStatistics(List<Flight> flights) {
        IntSummaryStatistics st = flights.stream().collect(Collectors.summarizingInt(Flight::seats));
        return String.format(Locale.ROOT, "count=%d sum=%d min=%d max=%d average=%.2f",
                st.getCount(), st.getSum(), st.getMin(), st.getMax(), st.getAverage());
    }

    public static Optional<String> largestPayment(List<Payment> payments) {
        return payments.stream()
                .collect(Collectors.maxBy(Comparator.comparing(Payment::amount)))
                .map(p -> p.id() + " " + p.amount());
    }

    /** reducing(identity, mapper, op): the collector form of map + reduce. BigDecimal totals. */
    public static BigDecimal totalAmount(List<Payment> payments) {
        return payments.stream().collect(Collectors.reducing(BigDecimal.ZERO, Payment::amount, BigDecimal::add));
    }

    /** The same with mapping(mapper, reducing(identity, op)). */
    public static BigDecimal totalAmountMapping(List<Payment> payments) {
        return payments.stream()
                .collect(Collectors.mapping(Payment::amount, Collectors.reducing(BigDecimal.ZERO, BigDecimal::add)));
    }

    public static void main(String[] args) {
        List<Flight> flights = SampleData.flights();
        List<Payment> payments = SampleData.payments();
        System.out.println("joining           : " + flightCodes(flights));
        System.out.println("counting          : " + countingCollector(payments));
        System.out.println("summingInt booked : " + totalBooked(flights));
        System.out.println("averagingInt      : " + averageBooked(flights));
        System.out.println("summarizingInt    : " + seatStatistics(flights));
        System.out.println("maxBy amount      : " + largestPayment(payments).orElse("none"));
        System.out.println("reducing total    : " + totalAmount(payments));
        System.out.println("mapping+reducing  : " + totalAmountMapping(payments));
    }
}
