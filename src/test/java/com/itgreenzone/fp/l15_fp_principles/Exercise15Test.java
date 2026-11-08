package com.itgreenzone.fp.l15_fp_principles;

import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Tier;
import com.itgreenzone.fp.l15_fp_principles.exercise.Exercise15;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** The renewal-quote pipeline: the expected value of each small function and of the whole pipeline. */
@Disabled("Remove this line when you have completed Exercise15")
class Exercise15Test {

    private static final BigDecimal P = new BigDecimal("1240.50");

    private static String s(BigDecimal v) {
        return v.toString();
    }

    @Test
    void step01PercentOff() {
        assertEquals("1116.45", s(Exercise15.percentOff(10).apply(P)));
    }

    @Test
    void step02FlatOffNeverNegative() {
        assertEquals("1215.50", s(Exercise15.flatOff(new BigDecimal("25.00")).apply(P)));
        assertEquals("0.00", s(Exercise15.flatOff(new BigDecimal("25.00")).apply(new BigDecimal("10.00"))));
    }

    @Test
    void step03CapAt() {
        assertEquals("1000.00", s(Exercise15.capAt(new BigDecimal("1000.00")).apply(P)));
        assertEquals("999.99", s(Exercise15.capAt(new BigDecimal("1000.00")).apply(new BigDecimal("999.99"))));
    }

    @Test
    void step04AddGst() {
        assertEquals("1352.15", s(Exercise15.addGst().apply(P)));
    }

    @Test
    void step05PipelineAndIdentity() {
        assertEquals("1091.45", s(Exercise15.pipeline(List.of(Exercise15.percentOff(10),
                Exercise15.flatOff(new BigDecimal("25.00")))).apply(P)));
        assertEquals("1240.50", s(Exercise15.pipeline(List.of()).apply(P)));
    }

    @Test
    void step06CurriedRiskLoading() {
        assertEquals("1426.58", s(Exercise15.RISK_LOADING.apply(15).apply(P)));
    }

    @Test
    void step07TierDiscountPartiallyApplied() {
        assertEquals("1178.48", s(Exercise15.tierDiscount(Tier.GOLD).apply(P)));
        assertEquals("1116.45", s(Exercise15.tierDiscount(Tier.PLATINUM).apply(P)));
        assertEquals("1240.50", s(Exercise15.tierDiscount(Tier.SILVER).apply(P)));
        assertEquals(Exercise15.TIER_DISCOUNT.apply(Tier.GOLD, P), Exercise15.tierDiscount(Tier.GOLD).apply(P));
    }

    @Test
    void step08When() {
        assertEquals("400.00", s(Exercise15.when(x -> x.compareTo(new BigDecimal("500.00")) > 0,
                Exercise15.flatOff(new BigDecimal("25.00"))).apply(new BigDecimal("400.00"))));
        assertEquals("1215.50", s(Exercise15.when(x -> x.compareTo(new BigDecimal("500.00")) > 0,
                Exercise15.flatOff(new BigDecimal("25.00"))).apply(P)));
    }

    @Test
    void step09RenewalQuote() {
        assertEquals("1257.29", s(Exercise15.renewalQuote(SampleData.policies().get(1))));
    }

    @Test
    void step10AllRenewalQuotes() {
        assertEquals("{POL-501=1888.43, POL-502=1257.29, POL-503=1019.15, POL-504=679.07, POL-505=181.49, POL-506=1117.75, "
                + "POL-507=2327.15, POL-508=1329.26, POL-509=228.90, POL-510=848.01}", Exercise15.renewalQuotes().toString());
    }
}
