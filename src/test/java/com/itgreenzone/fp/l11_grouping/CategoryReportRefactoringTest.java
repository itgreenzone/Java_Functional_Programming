package com.itgreenzone.fp.l11_grouping;

import com.itgreenzone.fp.l11_grouping.after.StreamCategoryReport;
import com.itgreenzone.fp.l11_grouping.before.LegacyCategoryReport;
import com.itgreenzone.fp.l11_grouping.modern.ModernCategoryReport;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class CategoryReportRefactoringTest {

    @Test
    void allVersionsAgree() {
        List<String> legacy = LegacyCategoryReport.report();
        assertEquals(7, legacy.size());
        assertEquals("TRANSFER: 8 debits, total 7190.92, largest T042 1432.93", legacy.get(0));
        assertEquals("DINING: 10 debits, total 839.28, largest T020 170.53", legacy.get(6));
        assertEquals(legacy, StreamCategoryReport.report());
        assertEquals(legacy, ModernCategoryReport.report());
    }
}
