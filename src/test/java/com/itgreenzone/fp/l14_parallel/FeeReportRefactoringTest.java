package com.itgreenzone.fp.l14_parallel;

import com.itgreenzone.fp.l14_parallel.after.StreamFeeReport;
import com.itgreenzone.fp.l14_parallel.before.LegacyFeeReport;
import com.itgreenzone.fp.l14_parallel.modern.ModernFeeReport;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class FeeReportRefactoringTest {

    @Test
    void allVersionsAgreeSequentialAndParallel() {
        List<String> legacy = LegacyFeeReport.report();
        assertEquals(8, legacy.size());
        assertEquals("TRANSFER: 8 debits, fees 17.97", legacy.get(0));
        assertEquals("TOTAL FEES 42.95", legacy.get(7));
        for (int run = 0; run < 20; run++) {
            assertEquals(legacy, StreamFeeReport.report(true));
            assertEquals(legacy, ModernFeeReport.report());
        }
        assertEquals(legacy, StreamFeeReport.report(false));
    }

    @Test
    void feeHasAMinimumAndRoundsHalfUp() {
        assertEquals(new BigDecimal("0.50"), LegacyFeeReport.fee(new BigDecimal("30.13")));
        assertEquals(new BigDecimal("3.58"), LegacyFeeReport.fee(new BigDecimal("1432.93")));
        assertEquals(new BigDecimal("0.50"), LegacyFeeReport.fee(new BigDecimal("200.00")));
        assertEquals(new BigDecimal("0.51"), LegacyFeeReport.fee(new BigDecimal("202.00")));
    }
}
