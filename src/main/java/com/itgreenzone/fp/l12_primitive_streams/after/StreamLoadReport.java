package com.itgreenzone.fp.l12_primitive_streams.after;

import com.itgreenzone.fp.data.Flight;
import com.itgreenzone.fp.data.SampleData;

import java.util.ArrayList;
import java.util.IntSummaryStatistics;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

import static java.util.Comparator.comparingDouble;

/** AFTER (Java 8): mapToInt for totals, summaryStatistics for the empty-seat line, no boxing. */
public final class StreamLoadReport {

    private StreamLoadReport() {
    }

    private static double load(Flight f) {
        return (double) f.booked() / f.seats();
    }

    public static List<String> report() {
        List<Flight> flights = SampleData.flights();
        List<String> lines = flights.stream()
                .sorted(comparingDouble(StreamLoadReport::load).reversed())
                .map(f -> String.format(Locale.ROOT, "%-6s %s-%s %3d/%3d %6.2f%%",
                        f.code(), f.from(), f.to(), f.booked(), f.seats(), load(f) * 100))
                .collect(Collectors.toCollection(ArrayList::new));
        int seats = flights.stream().mapToInt(Flight::seats).sum();
        int booked = flights.stream().mapToInt(Flight::booked).sum();
        IntSummaryStatistics empty = flights.stream().mapToInt(f -> f.seats() - f.booked()).summaryStatistics();
        lines.add(String.format(Locale.ROOT, "TOTAL  %d/%d booked, load %.2f%%", booked, seats, booked * 100.0 / seats));
        lines.add(String.format(Locale.ROOT, "EMPTY SEATS min=%d max=%d avg=%.2f",
                empty.getMin(), empty.getMax(), empty.getAverage()));
        return lines;
    }

    public static void main(String[] args) {
        report().forEach(System.out::println);
    }
}
