package com.itgreenzone.fp.l16_records_sealed;

import com.itgreenzone.fp.l16_records_sealed.after.PolymorphicOutcomeReport;
import com.itgreenzone.fp.l16_records_sealed.before.LegacyOutcomeReport;
import com.itgreenzone.fp.l16_records_sealed.modern.SealedOutcomeReport;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class OutcomeReportRefactoringTest {

    @Test
    void allVersionsAgree() {
        List<String> legacy = LegacyOutcomeReport.report();
        assertEquals(13, legacy.size());
        assertEquals("P005 APPROVED large PAYNOW 1500.00", legacy.get(4));
        assertEquals("P008 PENDING since 2026-11-03T07:20:00Z", legacy.get(7));
        assertEquals("APPROVED=8 DECLINED=2 PENDING=1 REFUNDED=1 settled=2999.19", legacy.get(12));
        assertEquals(legacy, PolymorphicOutcomeReport.report());
        assertEquals(legacy, SealedOutcomeReport.report());
    }
}
