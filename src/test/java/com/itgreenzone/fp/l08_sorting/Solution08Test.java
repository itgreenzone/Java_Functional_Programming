package com.itgreenzone.fp.l08_sorting;

import com.itgreenzone.fp.l08_sorting.solution.Solution08;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** The departures board (TBA = null time). */
class Solution08Test {

    @Test
    void task1Board() {
        assertEquals(List.of("TR808", "SQ12", "GA827", "MH602", "SQ318", "UL309", "SQ938", "SQ21"), Solution08.departuresBoard());
    }

    @Test
    void task2TbaFirst() {
        assertEquals(List.of("SQ318", "UL309", "TR808", "SQ12", "GA827", "MH602", "SQ938", "SQ21"), Solution08.tbaFirst());
    }

    @Test
    void task3LatestFirstTbaStillLast() {
        assertEquals(List.of("SQ21", "SQ938", "MH602", "GA827", "SQ12", "TR808", "SQ318", "UL309"), Solution08.latestFirst());
    }

    @Test
    void task4Destinations() {
        assertEquals(List.of("BKK", "CGK", "CMB", "EWR", "KUL", "LHR", "NRT", "SIN"), Solution08.destinations());
    }

    @Test
    void reversedAlsoMovesTheNulls() {
        assertEquals(List.of("SQ21", "SQ938", "UL309", "SQ318", "MH602", "GA827", "SQ12", "TR808"), Solution08.latestFirstWrong());
    }
}
