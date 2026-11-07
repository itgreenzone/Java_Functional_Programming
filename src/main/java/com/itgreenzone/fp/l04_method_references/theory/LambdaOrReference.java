package com.itgreenzone.fp.l04_method_references.theory;

import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;
import com.itgreenzone.fp.data.TxnType;

import java.math.BigDecimal;
import java.util.List;
import java.util.function.Function;
import java.util.function.Predicate;

/**
 * When is a method reference clearer, and when must (or should) it stay a lambda?
 * Integer::toString as a Function&lt;Integer, String&gt; does NOT compile:
 * "reference to toString is ambiguous: both method toString(int) in Integer and method toString() in Integer match".
 */
public final class LambdaOrReference {

    private static final BigDecimal LIMIT = new BigDecimal("1000.00");
    private static final BigDecimal RATE = new BigDecimal("0.25");

    private LambdaOrReference() {
    }

    // Stays a lambda: an extra constant argument (partial application).
    public static final Function<BigDecimal, BigDecimal> QUARTER_PERCENT_FEE = a -> Fees.fee(a, RATE);

    // Stays a lambda: a chain of calls plus a comparison...
    public static final Predicate<Transaction> HIGH_VALUE_LAMBDA = t -> t.amount().compareTo(LIMIT) > 0;

    // ...unless you give the logic a NAME; then a method reference reads best.
    public static boolean isHighValue(Transaction t) {
        return t.amount().compareTo(LIMIT) > 0;
    }

    public static final Predicate<Transaction> HIGH_VALUE_REF = LambdaOrReference::isHighValue;

    // Negation: Predicate.not(...) [Java 11] keeps the method reference.
    public static boolean isDebit(Transaction t) {
        return t.type() == TxnType.DEBIT;
    }

    public static final Predicate<Transaction> CREDITS = Predicate.not(LambdaOrReference::isDebit);

    // Ambiguous overloads: keep the lambda, or pick an unambiguous method.
    public static final Function<Integer, String> TO_TEXT_LAMBDA = i -> i.toString();
    public static final Function<Integer, String> TO_TEXT_VALUE_OF = String::valueOf;

    public static void main(String[] args) {
        List<Transaction> txns = SampleData.transactions();
        System.out.println("a -> Fees.fee(a, RATE) on 1500.00 : " + QUARTER_PERCENT_FEE.apply(new BigDecimal("1500.00")));
        System.out.println("lambda vs named reference         : " + txns.stream().filter(HIGH_VALUE_LAMBDA).count()
                + " = " + txns.stream().filter(HIGH_VALUE_REF).count());
        System.out.println("Predicate.not(::isDebit)          : " + txns.stream().filter(CREDITS).count());
        System.out.println("i -> i.toString() / String::valueOf: " + TO_TEXT_LAMBDA.apply(42) + " / " + TO_TEXT_VALUE_OF.apply(42));
    }
}
