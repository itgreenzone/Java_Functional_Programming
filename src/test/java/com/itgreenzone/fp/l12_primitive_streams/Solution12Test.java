package com.itgreenzone.fp.l12_primitive_streams;

import com.itgreenzone.fp.l12_primitive_streams.solution.Solution12;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** 12 primitive-stream problems: the expected value of each result. */
class Solution12Test {

    @Test
    void problem01TotalSeats() {
        assertEquals("2078", String.valueOf(Solution12.totalSeats()));
    }

    @Test
    void problem02TotalBooked() {
        assertEquals("1808", String.valueOf(Solution12.totalBooked()));
    }

    @Test
    void problem03SeatStatistics() {
        assertEquals("count=8 sum=2078 min=160 max=471 avg=259.75", String.valueOf(Solution12.seatStatistics()));
    }

    @Test
    void problem04OccupancyPerFlight() {
        assertEquals("{GA827=74.07, MH602=61.25, SQ12=76.14, SQ21=98.76, SQ318=96.60, SQ938=91.09, TR808=98.21, UL309=76.58}", String.valueOf(Solution12.occupancyPerFlight()));
    }

    @Test
    void problem05EmptySeatsPerFlight() {
        assertEquals("{GA827=42, MH602=62, SQ12=63, SQ21=2, SQ318=16, SQ938=27, TR808=6, UL309=52}", String.valueOf(Solution12.emptySeatsPerFlight()));
    }

    @Test
    void problem06FullestFlight() {
        assertEquals("SQ21", String.valueOf(Solution12.fullestFlight()));
    }

    @Test
    void problem07FlightsAtLeast90Percent() {
        assertEquals("[SQ21, SQ318, SQ938, TR808]", String.valueOf(Solution12.flightsAtLeast90Percent()));
    }

    @Test
    void problem08OverallLoadPercent() {
        assertEquals("87.01", String.valueOf(Solution12.overallLoadPercent()));
    }

    @Test
    void problem09PnrCharFrequency() {
        assertEquals("{2=4, 3=3, 4=1, 7=2, 8=2, 9=4, A=3, B=2, K=4, L=2, M=4, P=1, Q=5, R=2, T=2, X=4, Z=3}", String.valueOf(Solution12.pnrCharFrequency()));
    }

    @Test
    void problem10MostFrequentPnrChar() {
        assertEquals("Q=5", String.valueOf(Solution12.mostFrequentPnrChar()));
    }

    @Test
    void problem11PnrDigitCount() {
        assertEquals("16", String.valueOf(Solution12.pnrDigitCount()));
    }

    @Test
    void problem12PnrDigitSum() {
        assertEquals("{A9KX2M=11, B2MXK9=11, K7XQ2B=9, M3PL9A=12, M9ZK3Q=12, QX8L2A=10, TR7Q3Z=10, ZQ4TR8=12}", String.valueOf(Solution12.pnrDigitSum()));
    }
}
