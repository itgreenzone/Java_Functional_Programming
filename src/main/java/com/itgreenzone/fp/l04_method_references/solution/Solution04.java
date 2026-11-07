package com.itgreenzone.fp.l04_method_references.solution;

import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.SampleData;
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

/** Reference solution for the L04 exercise: 8 converted, 2 stay lambdas (with the reason). */
public final class Solution04 {

    private static final BigDecimal LIMIT = new BigDecimal("1000.00");

    private Solution04() {
    }

    // 1 unbound instance (record accessor)
    public static final Function<Transaction, BigDecimal> AMOUNT = Transaction::amount;
    // 2 constructor
    public static final Function<String, BigDecimal> PARSE = BigDecimal::new;
    // 3 static
    public static final Predicate<Object> NOT_NULL = Objects::nonNull;
    // 4 unbound instance with two parameters: a is the receiver, b the argument
    public static final BinaryOperator<BigDecimal> SUM = BigDecimal::add;
    // 5 constructor (no-arg)
    public static final Supplier<List<Payment>> NEW_LIST = ArrayList::new;
    // 6 array constructor
    public static final IntFunction<String[]> NEW_ARRAY = String[]::new;
    // 7 unbound instance
    public static final Function<String, String> UPPER = String::toUpperCase;

    // 8 bound instance: the receiver 'log' is fixed when the reference is created
    public static Consumer<String> logTo(StringBuilder log) {
        return log::append;
    }

    // 9 STAYS a lambda: a chain of calls plus a comparison with a constant has no single method to name.
    //   (Alternative: extract a named method isHighValue(t) and use Solution04::isHighValue.)
    public static final Predicate<Transaction> HIGH = t -> t.amount().compareTo(LIMIT) > 0;

    // 10 STAYS a lambda: Integer::toString is ambiguous (static toString(int) and instance toString()).
    //    String::valueOf would also work.
    public static final Function<Integer, String> TO_TEXT = i -> i.toString();

    public static void main(String[] args) {
        List<Transaction> txns = SampleData.transactions();
        BigDecimal total = txns.stream().map(AMOUNT).reduce(BigDecimal.ZERO, SUM);
        System.out.println("1+4 total of all amounts : " + total);
        System.out.println("2   PARSE(\"59.90\")        : " + PARSE.apply("59.90"));
        System.out.println("3   NOT_NULL(null)        : " + NOT_NULL.test(null));
        System.out.println("5   NEW_LIST size         : " + NEW_LIST.get().size());
        System.out.println("6   NEW_ARRAY(4) length   : " + NEW_ARRAY.apply(4).length);
        System.out.println("7   UPPER(\"card\")         : " + UPPER.apply("card"));
        StringBuilder log = new StringBuilder();
        logTo(log).andThen(logTo(log)).accept("ok;");
        System.out.println("8   logTo twice           : " + log);
        System.out.println("9   HIGH count            : " + txns.stream().filter(HIGH).count());
        System.out.println("10  TO_TEXT(42)           : " + TO_TEXT.apply(42));
    }
}
