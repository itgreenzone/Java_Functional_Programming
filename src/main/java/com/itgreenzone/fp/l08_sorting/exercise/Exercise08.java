package com.itgreenzone.fp.l08_sorting.exercise;

import com.itgreenzone.fp.data.Flight;
import com.itgreenzone.fp.data.SampleData;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;

/**
 * L08 EXERCISE (about 25 minutes): the airport departures board.
 * The board is built from SampleData.flights(). Scenario: SQ318 and UL309 have been rescheduled and their
 * new departure time is not announced yet, so their time is null ("TBA"). Use Comparator factories only.
 */
public final class Exercise08 {

    /** One row of the board. time == null means "TBA". */
    public record Departure(String code, String to, LocalDate date, LocalTime time) {
        @Override
        public String toString() {
            return date + " " + (time == null ? "TBA  " : time) + " " + code;
        }
    }

    public static final Set<String> TIME_TBA = Set.of("SQ318", "UL309");

    private Exercise08() {
    }

    public static List<Departure> board() {
        return SampleData.flights().stream()
                .map(Exercise08::toDeparture)
                .toList();
    }

    private static Departure toDeparture(Flight f) {
        LocalTime time = TIME_TBA.contains(f.code()) ? null : f.departure().toLocalTime();
        return new Departure(f.code(), f.to(), f.departure().toLocalDate(), time);
    }

    /**
     * TODO 1: date ASC, time ASC with TBA (null) LAST within each day, then code ASC.
     * Expected codes: [TR808, SQ12, GA827, MH602, SQ318, UL309, SQ938, SQ21]
     */
    public static List<String> departuresBoard() {
        throw new UnsupportedOperationException("TODO 1");
    }

    /**
     * TODO 2: the "needs attention" view: TBA rows FIRST (by code), then the rest by date and time.
     * Expected codes: [SQ318, UL309, TR808, SQ12, GA827, MH602, SQ938, SQ21]
     */
    public static List<String> tbaFirst() {
        throw new UnsupportedOperationException("TODO 2");
    }

    /**
     * TODO 3: latest first: date DESC, time DESC, but TBA still LAST within each day, then code ASC.
     * Careful: reversed() at the end of the chain would also move the nulls.
     * Expected codes: [SQ21, SQ938, MH602, GA827, SQ12, TR808, SQ318, UL309]
     */
    public static List<String> latestFirst() {
        throw new UnsupportedOperationException("TODO 3");
    }

    /**
     * TODO 4: destinations (to) in alphabetical order, case-insensitive, no duplicates.
     * Expected: [BKK, CGK, CMB, EWR, KUL, LHR, NRT, SIN]
     */
    public static List<String> destinations() {
        throw new UnsupportedOperationException("TODO 4");
    }
}
