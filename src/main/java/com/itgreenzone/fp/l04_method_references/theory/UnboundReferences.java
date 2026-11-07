package com.itgreenzone.fp.l04_method_references.theory;

import com.itgreenzone.fp.data.Account;
import com.itgreenzone.fp.data.Customer;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.function.BiFunction;
import java.util.function.BiPredicate;
import java.util.function.BinaryOperator;
import java.util.function.Function;

/**
 * Kind 3: UNBOUND instance method reference [Java 8]   ClassName::instanceMethod
 * The FIRST lambda parameter becomes the receiver; the rest become the arguments.
 */
public final class UnboundReferences {

    public static final Function<String, String> UPPER = String::toUpperCase;                  // s -> s.toUpperCase()
    public static final Function<Transaction, BigDecimal> AMOUNT = Transaction::amount;        // t -> t.amount()  [record 16]
    public static final BinaryOperator<BigDecimal> ADD = BigDecimal::add;                      // (a, b) -> a.add(b)
    public static final BiPredicate<String, String> SAME_TEXT = String::equalsIgnoreCase;      // (a, b) -> a.equalsIgnoreCase(b)
    public static final Comparator<String> IGNORE_CASE = String::compareToIgnoreCase;          // (a, b) -> a.compareToIgnoreCase(b)
    public static final BiFunction<BigDecimal, Integer, BigDecimal> MOVE_POINT = BigDecimal::movePointLeft; // (a, n) -> a.movePointLeft(n)

    private UnboundReferences() {
    }

    public static BigDecimal totalBalance(List<Account> accounts) {
        return accounts.stream()
                .map(Account::balance)
                .reduce(BigDecimal.ZERO, ADD);
    }

    public static List<String> cityNamesSorted(List<Customer> customers) {
        return customers.stream()
                .map(Customer::city)
                .distinct()
                .sorted(IGNORE_CASE)
                .toList();
    }

    public static void main(String[] args) {
        Transaction t003 = SampleData.transactions().get(2);
        System.out.println("String::toUpperCase(\"paynow\")      : " + UPPER.apply("paynow"));
        System.out.println("Transaction::amount(T003)          : " + AMOUNT.apply(t003));
        System.out.println("BigDecimal::add over all balances  : " + totalBalance(SampleData.accounts()));
        System.out.println("String::equalsIgnoreCase(sgd, SGD) : " + SAME_TEXT.test("sgd", "SGD"));
        System.out.println("BigDecimal::movePointLeft(500, 2)  : " + MOVE_POINT.apply(new BigDecimal("500"), 2));
        System.out.println("cities sorted (compareToIgnoreCase): " + cityNamesSorted(SampleData.customers()));
    }
}
