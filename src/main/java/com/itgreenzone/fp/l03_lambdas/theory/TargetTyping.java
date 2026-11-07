package com.itgreenzone.fp.l03_lambdas.theory;

import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;

import java.math.BigDecimal;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.function.Supplier;

/**
 * A lambda has no type of its own. Its type comes from the context it appears in: the TARGET TYPE.
 * The same text can become different functional interfaces.
 */
public final class TargetTyping {

    private static final BigDecimal LIMIT = new BigDecimal("1000.00");

    /** A domain interface with the same shape as Predicate&lt;Transaction&gt;. */
    @FunctionalInterface
    public interface HighValueCheck {
        boolean isHighValue(Transaction txn);
    }

    // The SAME lambda text, three target types:
    public static final Predicate<Transaction> AS_PREDICATE = t -> t.amount().compareTo(LIMIT) > 0;
    public static final Function<Transaction, Boolean> AS_FUNCTION = t -> t.amount().compareTo(LIMIT) > 0;
    public static final HighValueCheck AS_DOMAIN_TYPE = t -> t.amount().compareTo(LIMIT) > 0;

    // The SAME lambda text, two target types with different exception rules:
    public static final Supplier<String> SUPPLIER = () -> "ok";
    public static final Callable<String> CALLABLE = () -> "ok";

    private TargetTyping() {
    }

    /** Context 1: a method argument. filter(...) expects a Predicate, so t is a Transaction. */
    public static long countHighValue(List<Transaction> txns) {
        return txns.stream()
                .filter(t -> t.amount().compareTo(LIMIT) > 0)
                .count();
    }

    /** Context 2: a return statement. The return type supplies the target type. */
    public static Predicate<Transaction> currency(String code) {
        return t -> code.equals(t.currency());
    }

    /** Context 3: a conditional expression. Both branches get the target type. */
    public static Predicate<Transaction> rule(boolean strict) {
        return strict ? t -> t.amount().compareTo(LIMIT) > 0 : t -> true;
    }

    /** Context 4: a cast. Object is not a functional interface, so a cast is needed. */
    public static Object asObject() {
        return (Supplier<String>) () -> "cast gives the target type";
    }

    public static void main(String[] args) throws Exception {
        List<Transaction> txns = SampleData.transactions();
        Transaction t003 = txns.get(2);
        System.out.println("Predicate          : " + AS_PREDICATE.test(t003));
        System.out.println("Function<_,Boolean>: " + AS_FUNCTION.apply(t003));
        System.out.println("HighValueCheck     : " + AS_DOMAIN_TYPE.isHighValue(t003));
        System.out.println("Supplier / Callable: " + SUPPLIER.get() + " / " + CALLABLE.call());
        System.out.println("argument context   : " + countHighValue(txns));
        System.out.println("return context     : " + txns.stream().filter(currency("USD")).map(Transaction::id).toList());
        System.out.println("conditional context: " + txns.stream().filter(rule(false)).count());
        if (asObject() instanceof Supplier<?> s) {
            System.out.println("cast context       : " + s.get());
        }
    }
}
