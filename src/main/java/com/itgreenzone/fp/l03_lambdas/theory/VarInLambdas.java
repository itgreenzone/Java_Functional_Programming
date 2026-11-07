package com.itgreenzone.fp.l03_lambdas.theory;

import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.math.BigDecimal;
import java.util.function.BinaryOperator;
import java.util.function.Function;

/**
 * var in lambda parameters [Java 11].
 * Useful only when you need a modifier (final) or an annotation on an inferred parameter.
 * Rule: all parameters use var, or none do. Mixing does not compile:
 * "invalid lambda parameter declaration (cannot mix 'var' and implicitly-typed parameters)".
 * Beyond Java 21: the unnamed variable _ for unused parameters, e.g. (a, _) -> a, is final in
 * Java 22 (it is a preview feature in Java 21 and disabled by default).
 */
public final class VarInLambdas {

    /** A marker annotation, to show why var exists in lambda parameters. */
    @Retention(RetentionPolicy.RUNTIME)
    @Target({ElementType.PARAMETER, ElementType.LOCAL_VARIABLE})
    public @interface Audited {
    }

    public static final BinaryOperator<BigDecimal> ADD = (var a, var b) -> a.add(b);

    public static final Function<Transaction, String> LABEL = (final var t) -> t.id() + "/" + t.currency();

    public static final Function<Transaction, BigDecimal> AUDITED_AMOUNT = (@Audited var t) -> t.amount();

    private VarInLambdas() {
    }

    public static void main(String[] args) {
        Transaction t010 = SampleData.transactions().get(9);
        System.out.println("(var a, var b)  : " + ADD.apply(new BigDecimal("120.00"), new BigDecimal("45.50")));
        System.out.println("(final var t)   : " + LABEL.apply(t010));
        System.out.println("(@Audited var t): " + AUDITED_AMOUNT.apply(t010));
    }
}
