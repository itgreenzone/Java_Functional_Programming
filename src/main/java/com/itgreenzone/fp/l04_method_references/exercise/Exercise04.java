package com.itgreenzone.fp.l04_method_references.exercise;

import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.Transaction;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.function.BinaryOperator;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.IntFunction;
import java.util.function.Predicate;
import java.util.function.Supplier;

/**
 * L04 EXERCISE (about 20 minutes).
 * Convert each lambda below to a method reference WHERE POSSIBLE.
 * Some must stay lambdas: for each of those, write a one-line comment explaining why.
 * Exercise04Test must stay green after every change (behaviour must not change).
 * Then compare with solution.Solution04.
 */
public final class Exercise04 {

    private static final BigDecimal LIMIT = new BigDecimal("1000.00");

    private Exercise04() {
    }

    // 1
    public static final Function<Transaction, BigDecimal> AMOUNT = t -> t.amount();
    // 2
    public static final Function<String, BigDecimal> PARSE = s -> new BigDecimal(s);
    // 3
    public static final Predicate<Object> NOT_NULL = o -> Objects.nonNull(o);
    // 4
    public static final BinaryOperator<BigDecimal> SUM = (a, b) -> a.add(b);
    // 5
    public static final Supplier<List<Payment>> NEW_LIST = () -> new ArrayList<>();
    // 6
    public static final IntFunction<String[]> NEW_ARRAY = n -> new String[n];
    // 7
    public static final Function<String, String> UPPER = s -> s.toUpperCase();
    // 8
    public static Consumer<String> logTo(StringBuilder log) {
        return s -> log.append(s);
    }
    // 9
    public static final Predicate<Transaction> HIGH = t -> t.amount().compareTo(LIMIT) > 0;
    // 10
    public static final Function<Integer, String> TO_TEXT = i -> i.toString();
}
