package com.itgreenzone.fp.l15_fp_principles.solution;

import com.itgreenzone.fp.data.Customer;
import com.itgreenzone.fp.data.Policy;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Tier;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.function.BiFunction;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.function.UnaryOperator;
import java.util.stream.Collectors;

/**
 * L15 reference solution: a composable renewal-quote pipeline for insurance premiums, built from small pure functions.
 * Quote = premium -> tier discount -> 25.00 promo (only if the price is still over 500.00) -> +9% GST.
 */
public final class Solution15 {

    private Solution15() {
    }

    static BigDecimal money(BigDecimal v) {
        return v.setScale(2, RoundingMode.HALF_UP);
    }

    /** 1: x percent off, rounded to 2 dp HALF_UP. */
    public static UnaryOperator<BigDecimal> percentOff(int percent) {
        BigDecimal factor = BigDecimal.valueOf(100 - percent).movePointLeft(2);
        return p -> money(p.multiply(factor));
    }

    /** 2: a flat amount off, never below 0.00. */
    public static UnaryOperator<BigDecimal> flatOff(BigDecimal amount) {
        return p -> money(p.subtract(amount).max(BigDecimal.ZERO));
    }

    /** 3: never more than the cap. */
    public static UnaryOperator<BigDecimal> capAt(BigDecimal cap) {
        return p -> money(p.min(cap));
    }

    /** 4: Singapore GST 9%. */
    public static UnaryOperator<BigDecimal> addGst() {
        return p -> money(p.multiply(new BigDecimal("1.09")));
    }

    /** 5: compose the steps left to right into one function (identity for an empty list). */
    public static UnaryOperator<BigDecimal> pipeline(List<UnaryOperator<BigDecimal>> steps) {
        Function<BigDecimal, BigDecimal> composed = steps.stream()
                .map(s -> (Function<BigDecimal, BigDecimal>) s)
                .reduce(Function.identity(), Function::andThen);
        return composed::apply;
    }

    /** 6: a curried risk loading: percent -> (premium -> premium + percent%). */
    public static final Function<Integer, UnaryOperator<BigDecimal>> RISK_LOADING =
            percent -> p -> money(p.multiply(BigDecimal.valueOf(100 + percent).movePointLeft(2)));

    /** 7a: a two-argument tier discount... */
    public static final BiFunction<Tier, BigDecimal, BigDecimal> TIER_DISCOUNT = (tier, p) -> switch (tier) {
        case SILVER -> money(p);
        case GOLD -> percentOff(5).apply(p);
        case PLATINUM -> percentOff(10).apply(p);
    };

    /** 7b: ...partially applied: fix the tier, get a one-argument step. */
    public static UnaryOperator<BigDecimal> tierDiscount(Tier tier) {
        return p -> TIER_DISCOUNT.apply(tier, p);
    }

    /** 8: a conditional step: apply f only when the predicate holds, otherwise pass the value through. */
    public static UnaryOperator<BigDecimal> when(Predicate<BigDecimal> condition, UnaryOperator<BigDecimal> f) {
        return p -> condition.test(p) ? f.apply(p) : p;
    }

    /** 9: the renewal quote of one policy. */
    public static BigDecimal renewalQuote(Policy policy) {
        Tier tier = SampleData.customers().stream()
                .filter(c -> c.id().equals(policy.customerId()))
                .map(Customer::tier)
                .findFirst().orElseThrow();
        UnaryOperator<BigDecimal> quote = pipeline(List.of(
                tierDiscount(tier),
                when(p -> p.compareTo(new BigDecimal("500.00")) > 0, flatOff(new BigDecimal("25.00"))),
                addGst()));
        return quote.apply(policy.premium());
    }

    /** 10: renewal quotes for all policies, by policy number. */
    public static Map<String, BigDecimal> renewalQuotes() {
        return SampleData.policies().stream()
                .collect(Collectors.toMap(Policy::number, Solution15::renewalQuote, (a, b) -> a, TreeMap::new));
    }

    public static void main(String[] args) {
        BigDecimal p = new BigDecimal("1240.50");
        System.out.println(" 1 percentOff(10)       : " + percentOff(10).apply(p));
        System.out.println(" 2 flatOff(25.00)       : " + flatOff(new BigDecimal("25.00")).apply(p)
                + ", on 10.00: " + flatOff(new BigDecimal("25.00")).apply(new BigDecimal("10.00")));
        System.out.println(" 3 capAt(1000.00)       : " + capAt(new BigDecimal("1000.00")).apply(p));
        System.out.println(" 4 addGst               : " + addGst().apply(p));
        System.out.println(" 5 pipeline(10%, -25)   : " + pipeline(List.of(percentOff(10), flatOff(new BigDecimal("25.00")))).apply(p));
        System.out.println(" 6 RISK_LOADING(15)     : " + RISK_LOADING.apply(15).apply(p));
        System.out.println(" 7 tierDiscount(GOLD)   : " + tierDiscount(Tier.GOLD).apply(p));
        System.out.println(" 8 when(>500, -25) on 400.00: " + when(x -> x.compareTo(new BigDecimal("500.00")) > 0,
                flatOff(new BigDecimal("25.00"))).apply(new BigDecimal("400.00")));
        Policy pol502 = SampleData.policies().stream().filter(x -> x.number().equals("POL-502")).findFirst().orElseThrow();
        System.out.println(" 9 renewalQuote(POL-502): " + renewalQuote(pol502));
        System.out.println("10 all renewal quotes   : " + renewalQuotes());
    }
}
