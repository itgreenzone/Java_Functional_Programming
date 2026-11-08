package com.itgreenzone.fp.l15_fp_principles.exercise;

import com.itgreenzone.fp.data.Policy;
import com.itgreenzone.fp.data.Tier;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.function.BiFunction;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.function.UnaryOperator;

/**
 * L15 EXERCISE (about 40 minutes): build a composable renewal-quote pipeline for insurance premiums from small,
 * pure functions. Every result is rounded to 2 dp with HALF_UP. The quote of a policy is:
 *   premium -> tier discount (SILVER 0%, GOLD 5%, PLATINUM 10%) -> 25.00 off only if the price is still over 500.00
 *           -> +9% GST.
 * Expected values (from SampleData) are in each Javadoc. Then remove @Disabled in Exercise15Test.
 */
public final class Exercise15 {

    private Exercise15() {
    }

    /** 1: x percent off. percentOff(10).apply(1240.50) = 1116.45 */
    public static UnaryOperator<BigDecimal> percentOff(int percent) {
        throw new UnsupportedOperationException("TODO 1");
    }

    /** 2: a flat amount off, never below 0.00. flatOff(25.00): 1240.50 -> 1215.50, 10.00 -> 0.00 */
    public static UnaryOperator<BigDecimal> flatOff(BigDecimal amount) {
        throw new UnsupportedOperationException("TODO 2");
    }

    /** 3: never more than the cap. capAt(1000.00).apply(1240.50) = 1000.00 */
    public static UnaryOperator<BigDecimal> capAt(BigDecimal cap) {
        throw new UnsupportedOperationException("TODO 3");
    }

    /** 4: +9% GST. addGst().apply(1240.50) = 1352.15 */
    public static UnaryOperator<BigDecimal> addGst() {
        throw new UnsupportedOperationException("TODO 4");
    }

    /** 5: compose steps left to right; an empty list is the identity. pipeline([10% off, 25.00 off]) on 1240.50 = 1091.45 */
    public static UnaryOperator<BigDecimal> pipeline(List<UnaryOperator<BigDecimal>> steps) {
        throw new UnsupportedOperationException("TODO 5");
    }

    /** 6: a CURRIED risk loading: percent -> (premium -> premium + percent%). RISK_LOADING.apply(15).apply(1240.50) = 1426.58 */
    public static final Function<Integer, UnaryOperator<BigDecimal>> RISK_LOADING = percent -> {
        throw new UnsupportedOperationException("TODO 6");
    };

    /** 7a: the two-argument tier discount (SILVER 0%, GOLD 5%, PLATINUM 10%). */
    public static final BiFunction<Tier, BigDecimal, BigDecimal> TIER_DISCOUNT = (tier, premium) -> {
        throw new UnsupportedOperationException("TODO 7a");
    };

    /** 7b: PARTIAL APPLICATION of TIER_DISCOUNT: fix the tier. tierDiscount(GOLD).apply(1240.50) = 1178.48 */
    public static UnaryOperator<BigDecimal> tierDiscount(Tier tier) {
        throw new UnsupportedOperationException("TODO 7b");
    }

    /** 8: apply f only when the condition holds. when(p &gt; 500.00, 25.00 off).apply(400.00) = 400.00 */
    public static UnaryOperator<BigDecimal> when(Predicate<BigDecimal> condition, UnaryOperator<BigDecimal> f) {
        throw new UnsupportedOperationException("TODO 8");
    }

    /** 9: the renewal quote of one policy (look up the customer's tier in SampleData). POL-502 (GOLD, 1240.50) = 1257.29 */
    public static BigDecimal renewalQuote(Policy policy) {
        throw new UnsupportedOperationException("TODO 9");
    }

    /**
     * 10: renewal quotes for all policies, TreeMap by policy number.
     * Expected: {POL-501=1888.43, POL-502=1257.29, POL-503=1019.15, POL-504=679.07, POL-505=181.49, POL-506=1117.75, POL-507=2327.15, POL-508=1329.26, POL-509=228.90, POL-510=848.01}
     */
    public static Map<String, BigDecimal> renewalQuotes() {
        throw new UnsupportedOperationException("TODO 10");
    }
}
