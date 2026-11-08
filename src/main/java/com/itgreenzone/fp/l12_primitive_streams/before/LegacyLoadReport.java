package com.itgreenzone.fp.l12_primitive_streams.before;

import com.itgreenzone.fp.data.Flight;
import com.itgreenzone.fp.data.SampleData;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;

/**
 * BEFORE (pre-Java 8 style): a flight load report with boxed List&lt;Integer&gt; buffers, a hand-written
 * min/max/sum loop and a Collections.sort with an anonymous Comparator.
 */
public final class LegacyLoadReport {

    private LegacyLoadReport() {
    }

    public static List<String> report() {
        List<Flight> flights = new ArrayList<>(SampleData.flights());
        Collections.sort(flights, new java.util.Comparator<Flight>() {
            @Override
            public int compare(Flight a, Flight b) {
                double la = (double) a.booked() / a.seats();
                double lb = (double) b.booked() / b.seats();
                return Double.compare(lb, la);
            }
        });
        List<String> lines = new ArrayList<>();
        List<Integer> emptySeats = new ArrayList<>();     // boxed: one Integer object per flight
        Integer totalSeats = 0;                           // boxed accumulator: unbox + box on every +=
        Integer totalBooked = 0;
        for (Flight f : flights) {
            lines.add(String.format(Locale.ROOT, "%-6s %s-%s %3d/%3d %6.2f%%",
                    f.code(), f.from(), f.to(), f.booked(), f.seats(), f.booked() * 100.0 / f.seats()));
            emptySeats.add(f.seats() - f.booked());
            totalSeats += f.seats();
            totalBooked += f.booked();
        }
        int min = Integer.MAX_VALUE;
        int max = Integer.MIN_VALUE;
        int sum = 0;
        for (Integer e : emptySeats) {
            if (e < min) {
                min = e;
            }
            if (e > max) {
                max = e;
            }
            sum += e;
        }
        double avg = emptySeats.isEmpty() ? 0 : (double) sum / emptySeats.size();
        lines.add(String.format(Locale.ROOT, "TOTAL  %d/%d booked, load %.2f%%", totalBooked, totalSeats,
                totalBooked * 100.0 / totalSeats));
        lines.add(String.format(Locale.ROOT, "EMPTY SEATS min=%d max=%d avg=%.2f", min, max, avg));
        return lines;
    }

    public static void main(String[] args) {
        report().forEach(System.out::println);
    }
}
