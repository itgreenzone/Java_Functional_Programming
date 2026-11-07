package com.itgreenzone.fp.l10_collectors;

import com.itgreenzone.fp.data.PolicyType;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.l10_collectors.after.StreamPortfolioSummary;
import com.itgreenzone.fp.l10_collectors.before.LegacyPortfolioSummary;
import com.itgreenzone.fp.l10_collectors.modern.ModernPortfolioSummary;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class PortfolioRefactoringTest {

    @Test
    void allVersionsAgree() {
        List<String> legacy = LegacyPortfolioSummary.summary();
        assertEquals(6, legacy.size());
        assertEquals("LIFE: 2 policies, 4250.00 [POL-501, POL-507]", legacy.get(0));
        assertEquals("TOTAL: 10 policies, 10826.50", legacy.get(5));
        assertEquals(legacy, StreamPortfolioSummary.summary());
        assertEquals(legacy, ModernPortfolioSummary.summary());
    }

    @Test
    void modernMergeWorksInParallelToo() {
        ModernPortfolioSummary.Portfolio p = ModernPortfolioSummary.portfolio(SampleData.policies().parallelStream());
        assertEquals(ModernPortfolioSummary.summary(), p.lines());
        assertEquals(new BigDecimal("10826.50"), p.grandTotal().total());
        assertEquals(List.of("POL-505", "POL-509"), p.byType().get(PolicyType.TRAVEL).numbers());
    }
}
