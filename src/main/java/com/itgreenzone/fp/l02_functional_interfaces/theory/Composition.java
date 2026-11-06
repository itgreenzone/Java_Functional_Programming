package com.itgreenzone.fp.l02_functional_interfaces.theory;

import com.itgreenzone.fp.data.Account;
import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;
import com.itgreenzone.fp.data.TxnType;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.function.BinaryOperator;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Predicate;

/** Building bigger behaviour from small functions with default and static methods. */
public final class Composition {

    public static final Function<BigDecimal, BigDecimal> ADD_FEE = a -> a.add(new BigDecimal("1.00"));
    public static final Function<BigDecimal, BigDecimal> ADD_GST =
            a -> a.multiply(new BigDecimal("1.09")).setScale(2, RoundingMode.HALF_UP);

    public static final Predicate<Transaction> IS_DEBIT = t -> t.type() == TxnType.DEBIT;
    public static final Predicate<Transaction> IS_LARGE = t -> t.amount().compareTo(new BigDecimal("1000.00")) > 0;

    private Composition() {
    }

    /** Function.andThen [8]: this first, then the argument. */
    public static BigDecimal feeThenGst(BigDecimal amount) {
        return ADD_FEE.andThen(ADD_GST).apply(amount);
    }

    /** Function.compose [8]: the argument first, then this. */
    public static BigDecimal gstThenFee(BigDecimal amount) {
        return ADD_FEE.compose(ADD_GST).apply(amount);
    }

    /** Function.identity [8] as the starting point when folding a list of steps into one function. */
    public static Function<BigDecimal, BigDecimal> pipeline(List<Function<BigDecimal, BigDecimal>> steps) {
        return steps.stream()
                .reduce(Function.identity(), Function::andThen);
    }

    public static long count(Predicate<Transaction> rule) {
        return SampleData.transactions().stream()
                .filter(rule)
                .count();
    }

    /** BinaryOperator.maxBy [8]: a BinaryOperator built from a Comparator. */
    public static Optional<Payment> largestPayment() {
        BinaryOperator<Payment> larger = BinaryOperator.maxBy(Comparator.comparing(Payment::amount));
        return SampleData.payments().stream()
                .reduce(larger);
    }

    /** Comparator is a functional interface too: compare(a, b) is its single abstract method. */
    public static List<String> accountsByBalanceDesc() {
        Comparator<Account> byBalance = (a, b) -> a.balance().compareTo(b.balance());
        return SampleData.accounts().stream()
                .sorted(byBalance.reversed())
                .map(Account::number)
                .limit(3)
                .toList();
    }

    public static void main(String[] args) {
        BigDecimal hundred = new BigDecimal("100.00");
        System.out.println("fee.andThen(gst)(100.00)  = " + feeThenGst(hundred));
        System.out.println("fee.compose(gst)(100.00)  = " + gstThenFee(hundred));
        System.out.println("identity(100.00)          = " + Function.<BigDecimal>identity().apply(hundred));
        System.out.println("pipeline[fee, gst, fee]   = " + pipeline(List.of(ADD_FEE, ADD_GST, ADD_FEE)).apply(hundred));

        System.out.println("debit                     : " + count(IS_DEBIT));
        System.out.println("debit AND large           : " + count(IS_DEBIT.and(IS_LARGE)));
        System.out.println("debit OR large            : " + count(IS_DEBIT.or(IS_LARGE)));
        System.out.println("debit.negate()            : " + count(IS_DEBIT.negate()));
        System.out.println("Predicate.not(large) [11] : " + count(Predicate.not(IS_LARGE)));
        System.out.println("isEqual(\"USD\") currency   : "
                + SampleData.transactions().stream().map(Transaction::currency).filter(Predicate.isEqual("USD")).count());

        Consumer<String> audit = s -> System.out.println("  audit: " + s);
        Consumer<String> notify = s -> System.out.println("  notify: " + s);
        audit.andThen(notify).accept("P005 settled");

        System.out.println("maxBy amount              : " + largestPayment().map(Payment::id).orElse("none"));
        System.out.println("top 3 balances            : " + accountsByBalanceDesc());
    }
}
