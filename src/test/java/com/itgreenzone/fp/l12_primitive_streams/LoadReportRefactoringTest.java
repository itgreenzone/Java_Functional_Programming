package com.itgreenzone.fp.l12_primitive_streams;

import com.itgreenzone.fp.l12_primitive_streams.after.StreamLoadReport;
import com.itgreenzone.fp.l12_primitive_streams.before.LegacyLoadReport;
import com.itgreenzone.fp.l12_primitive_streams.modern.ModernLoadReport;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class LoadReportRefactoringTest {

    @Test
    void allVersionsAgree() {
        List<String> legacy = LegacyLoadReport.report();
        assertEquals(10, legacy.size());
        assertEquals("SQ21   SIN-EWR 159/161  98.76%", legacy.get(0));
        assertEquals("MH602  SIN-KUL  98/160  61.25%", legacy.get(7));
        assertEquals("TOTAL  1808/2078 booked, load 87.01%", legacy.get(8));
        assertEquals("EMPTY SEATS min=2 max=63 avg=33.75", legacy.get(9));
        assertEquals(legacy, StreamLoadReport.report());
        assertEquals(legacy, ModernLoadReport.report());
    }

    @Test
    void recordComputesExactPercent() {
        ModernLoadReport.FlightLoad sq21 = new ModernLoadReport.FlightLoad("SQ21", "SIN-EWR", 159, 161);
        assertEquals(new BigDecimal("98.76"), sq21.percent());
        assertEquals(2, sq21.empty());
        assertEquals(new BigDecimal("50.00"), new ModernLoadReport.FlightLoad("X", "A-B", 1, 2).percent());
    }
}
