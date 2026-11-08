package com.itgreenzone.fp.l16_records_sealed.theory;

import com.itgreenzone.fp.data.Account;
import com.itgreenzone.fp.data.Customer;
import com.itgreenzone.fp.data.PaymentStatus;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Tier;
import com.itgreenzone.fp.l16_records_sealed.theory.RecordsInPipelines.Money;

import java.math.BigDecimal;
import java.util.List;

/**
 * From casts to patterns:
 *   Java 8   : instanceof + cast, switch statements with break
 *   Java 14  : switch EXPRESSIONS (arrow, yield, exhaustive over enums)
 *   Java 16  : pattern matching for instanceof
 *   Java 21  : pattern matching for switch, record patterns (also nested), guards (when), case null
 *   Beyond 21: unnamed patterns "_" (final in Java 22), primitive patterns (preview)
 */
public final class PatternMatchingEvolution {

    private PatternMatchingEvolution() {
    }

    /** Java 8 style: test, cast, use. */
    public static String describeJava8(Object o) {
        if (o instanceof Customer) {
            Customer c = (Customer) o;
            return "customer " + c.name();
        } else if (o instanceof Account) {
            Account a = (Account) o;
            return "account " + a.number();
        }
        return "unknown";
    }

    /** Java 16: the pattern variable is declared and cast in one step; it is in scope only where the test is true. */
    public static String describeJava16(Object o) {
        if (o instanceof Customer c && c.tier() == Tier.PLATINUM) {
            return "PLATINUM customer " + c.name();
        }
        if (o instanceof Customer c) {
            return "customer " + c.name();
        }
        if (o instanceof Account a) {
            return "account " + a.number();
        }
        return "unknown";
    }

    /** Java 14: switch expression over an enum; exhaustive, so no default; yield for a block. */
    public static int riskScore(PaymentStatus status) {
        return switch (status) {
            case SUCCESS -> 0;
            case PENDING -> 2;
            case REFUNDED, FAILED -> {
                int base = 5;
                yield status == PaymentStatus.FAILED ? base * 2 : base;
            }
        };
    }

    /** Java 21: switch over Object with type patterns, record patterns, a guard and case null. */
    public static String describeJava21(Object o) {
        return switch (o) {
            case null -> "null!";
            case Customer(var id, var name, var city, var tier, var joined) when tier == Tier.PLATINUM ->
                    "PLATINUM customer " + name + " (" + city + ")";
            case Customer c -> "customer " + c.name();
            case Account(var number, var owner, var type, var balance) when balance.signum() < 0 ->
                    "OVERDRAWN account " + number + " " + balance;
            case Account a -> "account " + a.number();
            case Money(var currency, var amount) when !currency.equals("SGD") -> "foreign money " + currency + " " + amount;
            case Money m -> "money " + m;
            default -> "unknown " + o.getClass().getSimpleName();
        };
    }

    /** A NESTED record pattern: destructure a record inside a record in one case. */
    public record Fee(String txnId, Money money) { }

    public static String nested(Fee fee) {
        return switch (fee) {
            case Fee(var id, Money(var ccy, var amt)) when amt.compareTo(new BigDecimal("10")) >= 0 -> id + ": capped fee " + ccy + " " + amt;
            case Fee(var id, Money(var ccy, var amt)) -> id + ": fee " + ccy + " " + amt;
        };
    }

    public static void main(String[] args) {
        Customer alice = SampleData.customers().get(0);
        Customer chen = SampleData.customers().get(2);
        Account overdrawn = SampleData.accounts().stream().filter(a -> a.balance().signum() < 0).findFirst().orElseThrow();
        List<Object> things = java.util.Arrays.asList(alice, chen, overdrawn, SampleData.accounts().get(0),
                Money.of("USD", "533.03"), Money.of("SGD", "1"), 42, null);
        System.out.println("Java 8  : " + describeJava8(alice) + " | " + describeJava8(overdrawn));
        System.out.println("Java 16 : " + describeJava16(chen) + " | " + describeJava16(alice));
        System.out.println("Java 14 : risk SUCCESS=" + riskScore(PaymentStatus.SUCCESS) + " PENDING=" + riskScore(PaymentStatus.PENDING)
                + " REFUNDED=" + riskScore(PaymentStatus.REFUNDED) + " FAILED=" + riskScore(PaymentStatus.FAILED));
        things.forEach(o -> System.out.println("Java 21 : " + describeJava21(o)));
        System.out.println("nested  : " + nested(new Fee("T023", Money.of("USD", "10.00"))) + " | "
                + nested(new Fee("T001", Money.of("SGD", "0.50"))));
    }
}
