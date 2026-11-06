package com.itgreenzone.fp.l02_functional_interfaces.theory;

import com.itgreenzone.fp.data.Account;
import com.itgreenzone.fp.data.Customer;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Tier;
import com.itgreenzone.fp.data.Transaction;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.function.BiConsumer;
import java.util.function.BiFunction;
import java.util.function.BiPredicate;
import java.util.function.BinaryOperator;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.function.Supplier;
import java.util.function.UnaryOperator;

/** The core java.util.function interfaces [Java 8], one banking example each. */
public final class BuiltInCatalogue {

    /** Supplier&lt;T&gt;: () -> T. Produces a value; takes nothing. */
    public static final Supplier<LocalDate> STATEMENT_DATE = () -> LocalDate.of(2026, 10, 31);

    /** Function&lt;T,R&gt;: T -> R. Transforms one value into another. */
    public static final Function<Transaction, String> LABEL = t -> t.id() + " " + t.category() + " " + t.amount();

    /** BiFunction&lt;T,U,R&gt;: (T, U) -> R. Two inputs, one result. */
    public static final BiFunction<BigDecimal, BigDecimal, BigDecimal> ADD_INTEREST =
            (balance, ratePercent) -> balance.add(balance.multiply(ratePercent).movePointLeft(2))
                    .setScale(2, RoundingMode.HALF_UP);

    /** UnaryOperator&lt;T&gt;: T -> T. A Function whose input and output types are the same. */
    public static final UnaryOperator<String> MASK = number -> "****" + number.substring(number.length() - 4);

    /** BinaryOperator&lt;T&gt;: (T, T) -> T. Combines two values of the same type. */
    public static final BinaryOperator<BigDecimal> ADD = BigDecimal::add;

    /** Predicate&lt;T&gt;: T -> boolean. A yes/no test. */
    public static final Predicate<Account> OVERDRAWN = a -> a.balance().signum() < 0;

    /** BiPredicate&lt;T,U&gt;: (T, U) -> boolean. A test on two values. */
    public static final BiPredicate<Customer, Tier> HAS_TIER = (c, tier) -> c.tier() == tier;

    /** Consumer&lt;T&gt;: T -> void. Does something (a side effect) with a value. */
    public static final Consumer<Account> PRINT_ACCOUNT =
            a -> System.out.println("  " + MASK.apply(a.number()) + " " + a.balance());

    /** BiConsumer&lt;T,U&gt;: (T, U) -> void. A side effect with two values. */
    public static final BiConsumer<String, BigDecimal> PRINT_PAIR =
            (label, amount) -> System.out.println("  " + label + " = " + amount);

    private BuiltInCatalogue() {
    }

    public static void main(String[] args) {
        Transaction t = SampleData.transactions().get(2);
        Account a = SampleData.accounts().get(0);
        Customer c = SampleData.customers().get(0);

        System.out.println("Supplier       -> " + STATEMENT_DATE.get());
        System.out.println("Function       -> " + LABEL.apply(t));
        System.out.println("BiFunction     -> " + ADD_INTEREST.apply(a.balance(), new BigDecimal("2.5")));
        System.out.println("UnaryOperator  -> " + MASK.apply(a.number()));
        System.out.println("BinaryOperator -> " + ADD.apply(new BigDecimal("120.00"), new BigDecimal("45.50")));
        System.out.println("Predicate      -> " + SampleData.accounts().stream().filter(OVERDRAWN).map(Account::number).toList());
        System.out.println("BiPredicate    -> " + c.name() + " is GOLD: " + HAS_TIER.test(c, Tier.GOLD));
        System.out.println("Consumer       ->");
        PRINT_ACCOUNT.accept(a);
        System.out.println("BiConsumer     ->");
        PRINT_PAIR.accept("ACC-1001 interest", ADD_INTEREST.apply(a.balance(), new BigDecimal("2.5")).subtract(a.balance()));
    }
}
