package com.itgreenzone.fp.l08_sorting.solution;

import com.itgreenzone.fp.data.Flight;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.l08_sorting.exercise.Exercise08;
import com.itgreenzone.fp.l08_sorting.exercise.Exercise08.Departure;

import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;

/** Reference solution for Exercise08. */
public final class Solution08 {

    private static final Comparator<Departure> BOARD =
            Comparator.comparing(Departure::date)
                    .thenComparing(Departure::time, Comparator.nullsLast(Comparator.<LocalTime>naturalOrder()))
                    .thenComparing(Departure::code);

    private Solution08() {
    }

    public static List<String> departuresBoard() {
        return codes(BOARD);
    }

    public static List<String> tbaFirst() {
        Comparator<Departure> tbaFirst = Comparator
                .comparing((Departure d) -> d.time() != null)          // false (TBA) sorts before true
                .thenComparing(BOARD);
        return codes(tbaFirst);
    }

    public static List<String> latestFirst() {
        Comparator<Departure> latest =
                Comparator.comparing(Departure::date, Comparator.reverseOrder())
                        .thenComparing(Departure::time, Comparator.nullsLast(Comparator.<LocalTime>reverseOrder()))
                        .thenComparing(Departure::code);
        return codes(latest);
    }

    /** The wrong way, kept for the lesson: reversed() also turns nullsLast into nulls FIRST. */
    public static List<String> latestFirstWrong() {
        return codes(BOARD.reversed());
    }

    public static List<String> destinations() {
        return SampleData.flights().stream()
                .map(Flight::to)
                .distinct()
                .sorted(String.CASE_INSENSITIVE_ORDER)
                .toList();
    }

    private static List<String> codes(Comparator<Departure> order) {
        return Exercise08.board().stream().sorted(order).map(Departure::code).toList();
    }

    public static void main(String[] args) {
        System.out.println("board:");
        Exercise08.board().stream().sorted(BOARD).forEach(d -> System.out.println("  " + d));
        System.out.println("1 board          : " + departuresBoard());
        System.out.println("2 TBA first      : " + tbaFirst());
        System.out.println("3 latest first   : " + latestFirst());
        System.out.println("  BOARD.reversed : " + latestFirstWrong() + "  <- TBA first, codes reversed");
        System.out.println("4 destinations   : " + destinations());
    }
}
