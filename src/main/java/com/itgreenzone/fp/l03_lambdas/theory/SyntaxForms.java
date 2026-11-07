package com.itgreenzone.fp.l03_lambdas.theory;

import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.function.BiFunction;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Supplier;

/**
 * Every lambda syntax form [Java 8]:  (parameters) -> body
 * body = an expression (its value is returned) or a { block } (needs return if a value is expected).
 */
public final class SyntaxForms {

    /** No parameters: empty parentheses are required. */
    public static final Supplier<String> NO_PARAMS = () -> "statement ready";

    /** One parameter with an inferred type: parentheses are optional. */
    public static final Function<Transaction, String> ONE_PARAM = t -> t.id();

    /** Same lambda with parentheses. */
    public static final Function<Transaction, String> ONE_PARAM_PARENS = (t) -> t.id();

    /** Explicit parameter type: parentheses are required. */
    public static final Function<Transaction, String> EXPLICIT_TYPE = (Transaction t) -> t.id();

    /** Two parameters: parentheses are required. */
    public static final BiFunction<BigDecimal, BigDecimal, BigDecimal> TWO_PARAMS = (a, b) -> a.add(b);

    /** Block body: braces, statements, and an explicit return. */
    public static final Function<BigDecimal, BigDecimal> BLOCK_BODY = amount -> {
        BigDecimal fee = amount.multiply(new BigDecimal("0.005")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal minimum = new BigDecimal("1.00");
        return amount.add(fee.max(minimum));
    };

    /**
     * Void-compatible: a Consumer returns nothing, but an expression statement such as add(..)
     * is allowed as the body; its boolean result is simply ignored.
     */
    public static final Consumer<List<String>> VOID_COMPATIBLE = list -> list.add("audited");

    /** Value-compatible: the very same expression, now its boolean result IS returned. */
    public static final Function<List<String>, Boolean> VALUE_COMPATIBLE = list -> list.add("audited");

    private SyntaxForms() {
    }

    public static void main(String[] args) {
        Transaction t = SampleData.transactions().get(2);
        System.out.println("() -> ...            : " + NO_PARAMS.get());
        System.out.println("t -> ...             : " + ONE_PARAM.apply(t));
        System.out.println("(t) -> ...           : " + ONE_PARAM_PARENS.apply(t));
        System.out.println("(Transaction t) -> ..: " + EXPLICIT_TYPE.apply(t));
        System.out.println("(a, b) -> ...        : " + TWO_PARAMS.apply(new BigDecimal("120.00"), new BigDecimal("45.50")));
        System.out.println("block body           : " + BLOCK_BODY.apply(new BigDecimal("2500.00")));
        List<String> log = new ArrayList<>();
        VOID_COMPATIBLE.accept(log);
        System.out.println("void-compatible      : " + log);
        System.out.println("value-compatible     : " + VALUE_COMPATIBLE.apply(log) + " " + log);
    }
}
