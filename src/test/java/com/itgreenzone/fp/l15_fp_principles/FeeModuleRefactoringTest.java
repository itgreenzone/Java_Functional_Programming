package com.itgreenzone.fp.l15_fp_principles;

import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;
import com.itgreenzone.fp.l15_fp_principles.after.FunctionalFeeCalculator;
import com.itgreenzone.fp.l15_fp_principles.before.LegacyFeeCalculator;
import com.itgreenzone.fp.l15_fp_principles.modern.FeePipeline;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class FeeModuleRefactoringTest {

    private static Transaction txn(String id) {
        return SampleData.transactions().stream().filter(t -> t.id().equals(id)).findFirst().orElseThrow();
    }

    @Test
    void allVersionsAgree() {
        List<String> legacy = LegacyFeeCalculator.report();
        assertEquals(List.of(
                "T001 150.39 SGD -> fee 0.50",
                "T010 533.03 USD -> fee 6.66",
                "T023 914.46 USD -> fee 10.00",
                "T042 1432.93 SGD -> fee 3.58",
                "TOTAL FEES {SGD=42.95, USD=16.66} on 45 debits"), legacy);
        assertEquals(legacy, FunctionalFeeCalculator.report());
        assertEquals(legacy, FeePipeline.report());
    }

    @Test
    void eachRuleIsTestableAlone() {
        Transaction t023 = txn("T023");
        assertEquals(new BigDecimal("2.29"), FunctionalFeeCalculator.BASE.apply(t023));
        assertEquals(new BigDecimal("0.50"), FunctionalFeeCalculator.MINIMUM.apply(t023, new BigDecimal("0.10")));
        assertEquals(new BigDecimal("11.43"), FunctionalFeeCalculator.FX_SURCHARGE.apply(t023, new BigDecimal("2.29")));
        assertEquals(new BigDecimal("10.00"), FunctionalFeeCalculator.CAP.apply(t023, new BigDecimal("11.43")));
    }

    @Test
    void pipelineKeepsAnAuditTrailAndRulesAreData() {
        FeePipeline.Quote q = FeePipeline.quote(txn("T023"), FeePipeline.STANDARD_RULES);
        assertEquals(List.of("base=2.29", "min=2.29", "fx=11.43", "cap=10.00"), q.audit());
        FeePipeline.Quote noCap = FeePipeline.quote(txn("T023"), FeePipeline.STANDARD_RULES.subList(0, 3));
        assertEquals(new BigDecimal("11.43"), noCap.fee());
    }

    @Test
    void legacyObjectAccumulatesHiddenState() {
        LegacyFeeCalculator calc = new LegacyFeeCalculator();
        BigDecimal first = calc.calculate(txn("T001"));
        BigDecimal second = calc.calculate(txn("T001"));
        assertEquals(first, second);
        assertEquals(FunctionalFeeCalculator.fee(txn("T001")), first);
    }
}
