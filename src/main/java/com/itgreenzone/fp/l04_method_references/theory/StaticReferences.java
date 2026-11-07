package com.itgreenzone.fp.l04_method_references.theory;

import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.SampleData;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;
import java.util.function.BiFunction;
import java.util.function.BinaryOperator;
import java.util.function.Function;
import java.util.function.Predicate;

/**
 * Kind 1: STATIC method reference [Java 8]   ClassName::staticMethod
 * All lambda parameters become the method's arguments, in order.
 */
public final class StaticReferences {

    public static final Function<String, Integer> PARSE = Integer::parseInt;           // s -> Integer.parseInt(s)
    public static final BinaryOperator<Integer> MAX = Math::max;                         // (a, b) -> Math.max(a, b)
    public static final Predicate<Object> NOT_NULL = Objects::nonNull;                   // o -> Objects.nonNull(o)
    public static final Function<BigDecimal, BigDecimal> TRANSFER_FEE = Fees::transferFee; // a -> Fees.transferFee(a)
    public static final BiFunction<BigDecimal, BigDecimal, BigDecimal> FEE = Fees::fee;  // (a, r) -> Fees.fee(a, r)
    public static final Predicate<Payment> SUCCESSFUL = Fees::isSuccessful;              // p -> Fees.isSuccessful(p)

    private StaticReferences() {
    }

    public static void main(String[] args) {
        List<Payment> payments = SampleData.payments();
        System.out.println("Integer::parseInt(\"120\")      : " + PARSE.apply("120"));
        System.out.println("Math::max(301, 264)            : " + MAX.apply(301, 264));
        System.out.println("Objects::nonNull(null)         : " + NOT_NULL.test(null));
        System.out.println("Fees::transferFee(2500.00)     : " + TRANSFER_FEE.apply(new BigDecimal("2500.00")));
        System.out.println("Fees::fee(1500.00, 0.25)       : " + FEE.apply(new BigDecimal("1500.00"), new BigDecimal("0.25")));
        System.out.println("Fees::isSuccessful (count)     : " + payments.stream().filter(SUCCESSFUL).count());
    }
}
