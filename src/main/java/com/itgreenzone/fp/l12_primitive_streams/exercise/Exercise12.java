package com.itgreenzone.fp.l12_primitive_streams.exercise;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * L12 EXERCISE (about 40 minutes): seat occupancy statistics per flight (SampleData.flights())
 * and character frequency of a PNR list. Use IntStream / mapToInt / chars() and avoid boxing where you can;
 * money-like percentages are BigDecimal (scale 2, HALF_UP). Each Javadoc gives the exact expected toString().
 * Then remove @Disabled in Exercise12Test.
 */
public final class Exercise12 {

    /** Booking references for problems 9-12 (the shared dataset has no PNRs; this list is the exercise input). */
    public static final List<String> PNRS =
            List.of("K7XQ2B", "M3PL9A", "ZQ4TR8", "A9KX2M", "TR7Q3Z", "B2MXK9", "QX8L2A", "M9ZK3Q");

    private Exercise12() {
    }

    /**
     * 1: total number of seats on all flights (mapToInt + sum).
     * Expected: 2078
     */
    public static int totalSeats() {
        throw new UnsupportedOperationException("TODO 1");
    }

    /**
     * 2: total number of booked seats on all flights.
     * Expected: 1808
     */
    public static int totalBooked() {
        throw new UnsupportedOperationException("TODO 2");
    }

    /**
     * 3: IntSummaryStatistics of the seats, formatted with Locale.ROOT as "count=%d sum=%d min=%d max=%d avg=%.2f".
     * Expected: count=8 sum=2078 min=160 max=471 avg=259.75
     */
    public static String seatStatistics() {
        throw new UnsupportedOperationException("TODO 3");
    }

    /**
     * 4: booked * 100 / seats per flight code, BigDecimal scale 2 HALF_UP, TreeMap.
     * Expected: {GA827=74.07, MH602=61.25, SQ12=76.14, SQ21=98.76, SQ318=96.60, SQ938=91.09, TR808=98.21, UL309=76.58}
     */
    public static Map<String, BigDecimal> occupancyPerFlight() {
        throw new UnsupportedOperationException("TODO 4");
    }

    /**
     * 5: seats - booked per flight code, TreeMap.
     * Expected: {GA827=42, MH602=62, SQ12=63, SQ21=2, SQ318=16, SQ938=27, TR808=6, UL309=52}
     */
    public static Map<String, Integer> emptySeatsPerFlight() {
        throw new UnsupportedOperationException("TODO 5");
    }

    /**
     * 6: code of the flight with the highest booked/seats ratio (compare exactly, without double).
     * Expected: SQ21
     */
    public static String fullestFlight() {
        throw new UnsupportedOperationException("TODO 6");
    }

    /**
     * 7: codes of flights that are at least 90% booked, sorted (integer arithmetic only).
     * Expected: [SQ21, SQ318, SQ938, TR808]
     */
    public static List<String> flightsAtLeast90Percent() {
        throw new UnsupportedOperationException("TODO 7");
    }

    /**
     * 8: total booked * 100 / total seats, scale 2 HALF_UP.
     * Expected: 87.01
     */
    public static BigDecimal overallLoadPercent() {
        throw new UnsupportedOperationException("TODO 8");
    }

    /**
     * 9: frequency of every character in PNRS (chars -&gt; mapToObj -&gt; groupingBy), TreeMap.
     * Expected: {2=4, 3=3, 4=1, 7=2, 8=2, 9=4, A=3, B=2, K=4, L=2, M=4, P=1, Q=5, R=2, T=2, X=4, Z=3}
     */
    public static Map<Character, Long> pnrCharFrequency() {
        throw new UnsupportedOperationException("TODO 9");
    }

    /**
     * 10: "char=count" for the most frequent PNR character (ties: smaller character wins).
     * Expected: Q=5
     */
    public static String mostFrequentPnrChar() {
        throw new UnsupportedOperationException("TODO 10");
    }

    /**
     * 11: number of digit characters in all PNRS (IntStream.filter(Character::isDigit)).
     * Expected: 16
     */
    public static long pnrDigitCount() {
        throw new UnsupportedOperationException("TODO 11");
    }

    /**
     * 12: sum of the digits of each PNR (c - '0'), TreeMap by PNR.
     * Expected: {A9KX2M=11, B2MXK9=11, K7XQ2B=9, M3PL9A=12, M9ZK3Q=12, QX8L2A=10, TR7Q3Z=10, ZQ4TR8=12}
     */
    public static Map<String, Integer> pnrDigitSum() {
        throw new UnsupportedOperationException("TODO 12");
    }
}
