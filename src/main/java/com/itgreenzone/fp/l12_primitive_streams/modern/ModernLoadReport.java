package com.itgreenzone.fp.l12_primitive_streams.modern;

import com.itgreenzone.fp.data.Flight;
import com.itgreenzone.fp.data.SampleData;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.IntSummaryStatistics;
import java.util.List;
import java.util.Locale;
import java.util.stream.Stream;

/**
 * MODERN (Java 16-21): a FlightLoad record computes an exact BigDecimal percentage (scale 2, HALF_UP),
 * sorting compares the exact fractions with integer arithmetic (no double at all),
 * and Stream.concat + Stream.toList() [16] assemble the report.
 */
public final class ModernLoadReport {

    /** One line of the report. [Java 16 record] */
    public record FlightLoad(String code, String route, int booked, int seats) {

        public static FlightLoad of(Flight f) {
            return new FlightLoad(f.code(), f.from() + "-" + f.to(), f.booked(), f.seats());
        }

        public BigDecimal percent() {
            return ModernLoadReport.percent(booked, seats);
        }

        public int empty() {
            return seats - booked;
        }

        /** booked/seats &gt; other.booked/other.seats, compared exactly as booked*other.seats vs other.booked*seats. */
        static final Comparator<FlightLoad> BY_LOAD_DESC =
                (a, b) -> Long.compare((long) b.booked * a.seats, (long) a.booked * b.seats);

        String line() {
            return String.format(Locale.ROOT, "%-6s %s %3d/%3d %6s%%", code, route, booked, seats, percent());
        }
    }

    static BigDecimal percent(long part, long whole) {
        return BigDecimal.valueOf(part * 100).divide(BigDecimal.valueOf(whole), 2, RoundingMode.HALF_UP);
    }

    public static List<String> report() {
        List<FlightLoad> loads = SampleData.flights().stream().map(FlightLoad::of).toList();
        int seats = loads.stream().mapToInt(FlightLoad::seats).sum();
        int booked = loads.stream().mapToInt(FlightLoad::booked).sum();
        IntSummaryStatistics empty = loads.stream().mapToInt(FlightLoad::empty).summaryStatistics();
        Stream<String> perFlight = loads.stream().sorted(FlightLoad.BY_LOAD_DESC).map(FlightLoad::line);
        Stream<String> footer = Stream.of(
                "TOTAL  %d/%d booked, load %s%%".formatted(booked, seats, ModernLoadReport.percent(booked, seats)),
                String.format(Locale.ROOT, "EMPTY SEATS min=%d max=%d avg=%.2f",
                        empty.getMin(), empty.getMax(), empty.getAverage()));
        return Stream.concat(perFlight, footer).toList();
    }

    public static void main(String[] args) {
        report().forEach(System.out::println);
    }
}
