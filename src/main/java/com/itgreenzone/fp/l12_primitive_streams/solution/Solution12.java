package com.itgreenzone.fp.l12_primitive_streams.solution;

import com.itgreenzone.fp.data.Flight;
import com.itgreenzone.fp.data.SampleData;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.IntSummaryStatistics;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TreeMap;
import java.util.function.Function;
import java.util.stream.Collectors;

/** L12 reference solution: seat occupancy statistics per flight and character frequency of a PNR list. */
public final class Solution12 {

    /**
     * Booking references (PNRs) for the exercise. The shared dataset has no PNRs, so this fixed list of eight
     * 6-character codes is the exercise input (one per flight, same order as SampleData.flights()).
     */
    public static final List<String> PNRS =
            List.of("K7XQ2B", "M3PL9A", "ZQ4TR8", "A9KX2M", "TR7Q3Z", "B2MXK9", "QX8L2A", "M9ZK3Q");

    private Solution12() {
    }

    private static BigDecimal percent(long part, long whole) {
        return BigDecimal.valueOf(part * 100).divide(BigDecimal.valueOf(whole), 2, RoundingMode.HALF_UP);
    }

    public static int totalSeats() {
        return SampleData.flights().stream().mapToInt(Flight::seats).sum();
    }

    public static int totalBooked() {
        return SampleData.flights().stream().mapToInt(Flight::booked).sum();
    }

    public static String seatStatistics() {
        IntSummaryStatistics s = SampleData.flights().stream().mapToInt(Flight::seats).summaryStatistics();
        return String.format(Locale.ROOT, "count=%d sum=%d min=%d max=%d avg=%.2f",
                s.getCount(), s.getSum(), s.getMin(), s.getMax(), s.getAverage());
    }

    public static Map<String, BigDecimal> occupancyPerFlight() {
        return SampleData.flights().stream().collect(Collectors.toMap(
                Flight::code, f -> percent(f.booked(), f.seats()), (a, b) -> a, TreeMap::new));
    }

    public static Map<String, Integer> emptySeatsPerFlight() {
        return SampleData.flights().stream().collect(Collectors.toMap(
                Flight::code, f -> f.seats() - f.booked(), (a, b) -> a, TreeMap::new));
    }

    /** Exact comparison of booked/seats without double: cross-multiply. */
    public static String fullestFlight() {
        Comparator<Flight> byLoad = (a, b) -> Long.compare((long) a.booked() * b.seats(), (long) b.booked() * a.seats());
        return SampleData.flights().stream().max(byLoad).map(Flight::code).orElse("none");
    }

    public static List<String> flightsAtLeast90Percent() {
        return SampleData.flights().stream()
                .filter(f -> f.booked() * 10 >= f.seats() * 9)
                .map(Flight::code)
                .sorted()
                .toList();
    }

    public static BigDecimal overallLoadPercent() {
        return percent(totalBooked(), totalSeats());
    }

    public static Map<Character, Long> pnrCharFrequency() {
        return PNRS.stream()
                .flatMapToInt(String::chars)
                .mapToObj(c -> (char) c)
                .collect(Collectors.groupingBy(Function.identity(), TreeMap::new, Collectors.counting()));
    }

    /** Highest count; ties broken by the smaller character (TreeMap order + max keeps the first maximum). */
    public static String mostFrequentPnrChar() {
        return pnrCharFrequency().entrySet().stream()
                .max(Map.Entry.<Character, Long>comparingByValue()
                        .thenComparing(Map.Entry.<Character, Long>comparingByKey().reversed()))
                .map(e -> e.getKey() + "=" + e.getValue())
                .orElse("none");
    }

    public static long pnrDigitCount() {
        return PNRS.stream().flatMapToInt(String::chars).filter(Character::isDigit).count();
    }

    /** Sum of the digits of each PNR: chars() -&gt; filter digits -&gt; map to their value -&gt; sum(). */
    public static Map<String, Integer> pnrDigitSum() {
        return PNRS.stream().collect(Collectors.toMap(Function.identity(),
                p -> p.chars().filter(Character::isDigit).map(c -> c - '0').sum(), (a, b) -> a, TreeMap::new));
    }

    public static void main(String[] args) {
        System.out.println(" 1 total seats            : " + totalSeats());
        System.out.println(" 2 total booked           : " + totalBooked());
        System.out.println(" 3 seat statistics        : " + seatStatistics());
        System.out.println(" 4 occupancy % per flight : " + occupancyPerFlight());
        System.out.println(" 5 empty seats per flight : " + emptySeatsPerFlight());
        System.out.println(" 6 fullest flight         : " + fullestFlight());
        System.out.println(" 7 flights >= 90% booked  : " + flightsAtLeast90Percent());
        System.out.println(" 8 overall load %         : " + overallLoadPercent());
        System.out.println(" 9 PNR char frequency     : " + pnrCharFrequency());
        System.out.println("10 most frequent PNR char : " + mostFrequentPnrChar());
        System.out.println("11 digits in PNRs         : " + pnrDigitCount());
        System.out.println("12 digit sum per PNR      : " + pnrDigitSum());
    }
}
