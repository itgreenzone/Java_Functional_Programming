package com.itgreenzone.fp.l04_method_references;

import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.l04_method_references.after.LambdaSettlementReport;
import com.itgreenzone.fp.l04_method_references.before.LegacySettlementReport;
import com.itgreenzone.fp.l04_method_references.modern.MethodReferenceReport;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;

class ReportRefactoringTest {

    static final List<String> EXPECTED = List.of(
            "SETTLED | P009 18.80", "SETTLED | P002 45.50", "SETTLED | P007 75.00", "SETTLED | P004 89.90",
            "SETTLED | P001 120.00", "SETTLED | P011 150.00", "SETTLED | P010 999.99", "SETTLED | P005 1500.00");

    @Test
    void allThreeVersionsPrintTheSameReport() {
        assertEquals(EXPECTED, LegacySettlementReport.build(SampleData.payments()));
        assertEquals(EXPECTED, LambdaSettlementReport.build(SampleData.payments()));
        assertEquals(EXPECTED, MethodReferenceReport.build(SampleData.payments()));
    }

    @Test
    void arrayConstructorReferenceInToArray() {
        assertArrayEquals(new String[]{"P001", "P002", "P004", "P005", "P007", "P009", "P010", "P011"},
                MethodReferenceReport.settledIds(SampleData.payments()));
    }
}
