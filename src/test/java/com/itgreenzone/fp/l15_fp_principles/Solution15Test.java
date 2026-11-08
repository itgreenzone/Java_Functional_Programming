package com.itgreenzone.fp.l15_fp_principles;

import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Tier;
import com.itgreenzone.fp.l15_fp_principles.solution.Solution15;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** The renewal-quote pipeline: the expected value of each small function and of the whole pipeline. */
class Solution15Test {

    private static final BigDecimal P = new BigDecimal("1240.50");

    private static String s(BigDecimal v) {
        return v.toString();
    }

    @Test
    void step01PercentOff() {
        assertEquals("1116.45", s(Solution15.percentOff(10).apply(P)));
    }

    @Test
    void step02FlatOffNeverNegative() {
        assertEquals("1215.50", s(Solution15.flatOff(new BigDecimal("25.00")).apply(P)));
        assertEquals("0.00", s(Solution15.flatOff(new BigDecimal("25.00")).apply(new BigDecimal("10.00"))));
    }

    @Test
    void step03CapAt() {
        assertEquals("1000.00", s(Solution15.capAt(new BigDecimal("1000.00")).apply(P)));
        assertEquals("999.99", s(Solution15.capAt(new BigDecimal("1000.00")).apply(new BigDecimal("999.99"))));
    }

    @Test
    void step04AddGst() {
        assertEquals("1352.15", s(Solution15.addGst().apply(P)));
    }

    @Test
    void step05PipelineAndIdentity() {
        assertEquals("1091.45", s(Solution15.pipeline(List.of(Solution15.percentOff(10),
                Solution15.flatOff(new BigDecimal("25.00")))).apply(P)));
        assertEquals("1240.50", s(Solution15.pipeline(List.of()).apply(P)));
    }

    @Test
    void step06CurriedRiskLoading() {
        assertEquals("1426.58", s(Solution15.RISK_LOADING.apply(15).apply(P)));
    }

    @Test
    void step07TierDiscountPartiallyApplied() {
        assertEquals("1178.48", s(Solution15.tierDiscount(Tier.GOLD).apply(P)));
        assertEquals("1116.45", s(Solution15.tierDiscount(Tier.PLATINUM).apply(P)));
        assertEquals("1240.50", s(Solution15.tierDiscount(Tier.SILVER).apply(P)));
        assertEquals(Solution15.TIER_DISCOUNT.apply(Tier.GOLD, P), Solution15.tierDiscount(Tier.GOLD).apply(P));
    }

    @Test
    void step08When() {
        assertEquals("400.00", s(Solution15.when(x -> x.compareTo(new BigDecimal("500.00")) > 0,
                Solution15.flatOff(new BigDecimal("25.00"))).apply(new BigDecimal("400.00"))));
        assertEquals("1215.50", s(Solution15.when(x -> x.compareTo(new BigDecimal("500.00")) > 0,
                Solution15.flatOff(new BigDecimal("25.00"))).apply(P)));
    }

    @Test
    void step09RenewalQuote() {
        assertEquals("1257.29", s(Solution15.renewalQuote(SampleData.policies().get(1))));
    }

    @Test
    void step10AllRenewalQuotes() {
        assertEquals("{POL-501=1888.43, POL-502=1257.29, POL-503=1019.15, POL-504=679.07, POL-505=181.49, POL-506=1117.75, "
                + "POL-507=2327.15, POL-508=1329.26, POL-509=228.90, POL-510=848.01}", Solution15.renewalQuotes().toString());
    }
}
