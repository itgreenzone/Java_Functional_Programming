package com.itgreenzone.fp.l15_fp_principles.theory;

import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;
import com.itgreenzone.fp.data.TxnType;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.function.BiFunction;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.function.UnaryOperator;

/**
 * Higher-order functions: functions that take or return functions.
 * Currying (Function&lt;A, Function&lt;B, C&gt;&gt;), partial application, and composition pipelines.
 */
public final class HigherOrderFunctions {

    private HigherOrderFunctions() {
    }

    static BigDecimal money(BigDecimal v) {
        return v.setScale(2, RoundingMode.HALF_UP);
    }

    // ---------- functions that RETURN functions ----------

    /** A function factory: returns "x percent off". */
    public static UnaryOperator<BigDecimal> percentOff(int percent) {
        BigDecimal factor = BigDecimal.valueOf(100 - percent).movePointLeft(2);
        return amount -> money(amount.multiply(factor));
    }

    /** A predicate factory. */
    public static Predicate<Transaction> debitAbove(BigDecimal limit) {
        return t -> t.type() == TxnType.DEBIT && t.amount().compareTo(limit) > 0;
    }

    // ---------- functions that TAKE functions ----------

    public static <T> T applyTimes(UnaryOperator<T> f, int times, T start) {
        T result = start;
        for (int i = 0; i < times; i++) {
            result = f.apply(result);
        }
        return result;
    }

    // ---------- currying and partial application ----------

    /** A two-argument fee function: rate (e.g. 0.0025) and amount. */
    public static final BiFunction<BigDecimal, BigDecimal, BigDecimal> FEE =
            (rate, amount) -> money(amount.multiply(rate));

    /** The same function curried: give the rate now, the amount later. */
    public static final Function<BigDecimal, Function<BigDecimal, BigDecimal>> CURRIED_FEE =
            rate -> amount -> money(amount.multiply(rate));

    /** A general curry helper: BiFunction&lt;A, B, R&gt; -&gt; Function&lt;A, Function&lt;B, R&gt;&gt;. */
    public static <A, B, R> Function<A, Function<B, R>> curry(BiFunction<A, B, R> f) {
        return a -> b -> f.apply(a, b);
    }

    /** Partial application: fix the first argument of a BiFunction. */
    public static <A, B, R> Function<B, R> partial(BiFunction<A, B, R> f, A first) {
        return b -> f.apply(first, b);
    }

    // ---------- composition ----------

    /** andThen runs left to right; compose runs right to left. */
    public static String andThenVsCompose() {
        Function<Integer, Integer> plus2 = x -> x + 2;
        Function<Integer, Integer> times10 = x -> x * 10;
        return "andThen=" + plus2.andThen(times10).apply(1) + " compose=" + plus2.compose(times10).apply(1);
    }

    /** Fold a list of steps into ONE function. identity() is the neutral element of composition. */
    public static Function<BigDecimal, BigDecimal> pipeline(List<Function<BigDecimal, BigDecimal>> steps) {
        return steps.stream().reduce(Function.identity(), Function::andThen);
    }

    public static void main(String[] args) {
        BigDecimal price = new BigDecimal("1240.50");
        System.out.println("percentOff(10).apply(1240.50)   : " + percentOff(10).apply(price));
        System.out.println("10% off, three times             : " + applyTimes(percentOff(10), 3, price));
        long big = SampleData.transactions().stream().filter(debitAbove(new BigDecimal("1000"))).count();
        System.out.println("debits above 1000.00             : " + big);
        BigDecimal rate = new BigDecimal("0.0025");
        System.out.println("FEE.apply(rate, 1432.93)         : " + FEE.apply(rate, new BigDecimal("1432.93")));
        System.out.println("CURRIED_FEE.apply(rate).apply(..): " + CURRIED_FEE.apply(rate).apply(new BigDecimal("1432.93")));
        Function<BigDecimal, BigDecimal> standardFee = partial(FEE, rate);
        Function<BigDecimal, BigDecimal> premiumFee = curry(FEE).apply(new BigDecimal("0.0010"));
        System.out.println("partial: standard / premium fee  : " + standardFee.apply(new BigDecimal("1432.93"))
                + " / " + premiumFee.apply(new BigDecimal("1432.93")));
        System.out.println("andThen vs compose on 1          : " + andThenVsCompose());
        Function<BigDecimal, BigDecimal> quote = pipeline(List.of(percentOff(10), p -> p.subtract(new BigDecimal("25.00")),
                FunctionsCatalogue.ADD_GST));
        System.out.println("pipeline(10% off, -25, +GST)     : " + quote.apply(price));
        System.out.println("empty pipeline = identity        : " + pipeline(List.of()).apply(price));
    }

    /** Small named functions used above. */
    static final class FunctionsCatalogue {
        static final Function<BigDecimal, BigDecimal> ADD_GST = p -> money(p.multiply(new BigDecimal("1.09")));

        private FunctionsCatalogue() {
        }
    }
}
