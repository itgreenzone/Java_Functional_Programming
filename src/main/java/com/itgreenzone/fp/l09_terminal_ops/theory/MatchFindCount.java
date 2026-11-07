package com.itgreenzone.fp.l09_terminal_ops.theory;

import com.itgreenzone.fp.data.Account;
import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.PaymentStatus;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

/**
 * count, min, max [8]; anyMatch / allMatch / noneMatch [8] (short-circuiting);
 * findFirst / findAny [8]. On an EMPTY stream: anyMatch=false, allMatch=true, noneMatch=true.
 */
public final class MatchFindCount {

    private MatchFindCount() {
    }

    public static long refundedCount(List<Payment> payments) {
        return payments.stream().filter(p -> p.status() == PaymentStatus.REFUNDED).count();
    }

    /** Practice: highest transaction (max with a Comparator returns Optional). */
    public static Optional<Transaction> highest(List<Transaction> txns) {
        return txns.stream().max(Comparator.comparing(Transaction::amount));
    }

    public static Optional<Transaction> lowest(List<Transaction> txns) {
        return txns.stream().min(Comparator.comparing(Transaction::amount));
    }

    /** Practice: is any account overdrawn? */
    public static boolean anyOverdrawn(List<Account> accounts) {
        return accounts.stream().anyMatch(a -> a.balance().signum() < 0);
    }

    public static boolean allAmountsPositive(List<Transaction> txns) {
        return txns.stream().allMatch(t -> t.amount().signum() > 0);
    }

    public static boolean noneInEur(List<Transaction> txns) {
        return txns.stream().noneMatch(t -> "EUR".equals(t.currency()));
    }

    /** The empty-stream results are a classic interview trap ("vacuous truth"). */
    public static String emptyStreamMatches() {
        List<Account> none = List.of();
        return "anyMatch=" + none.stream().anyMatch(a -> true)
                + " allMatch=" + none.stream().allMatch(a -> false)
                + " noneMatch=" + none.stream().noneMatch(a -> true);
    }

    /** findFirst respects encounter order; findAny may return any match (it can be faster in parallel). */
    public static Optional<String> firstFailed(List<Payment> payments) {
        return payments.stream().filter(p -> p.status() == PaymentStatus.FAILED).map(Payment::id).findFirst();
    }

    public static Optional<String> anyFailedParallel(List<Payment> payments) {
        return payments.parallelStream().filter(p -> p.status() == PaymentStatus.FAILED).map(Payment::id).findAny();
    }

    public static void main(String[] args) {
        List<Transaction> txns = SampleData.transactions();
        System.out.println("count REFUNDED        : " + refundedCount(SampleData.payments()));
        System.out.println("highest transaction   : " + highest(txns).map(t -> t.id() + " " + t.amount()).orElse("none"));
        System.out.println("lowest transaction    : " + lowest(txns).map(t -> t.id() + " " + t.amount()).orElse("none"));
        System.out.println("any overdrawn         : " + anyOverdrawn(SampleData.accounts()));
        System.out.println("all amounts > 0       : " + allAmountsPositive(txns));
        System.out.println("none in EUR           : " + noneInEur(txns));
        System.out.println("empty stream          : " + emptyStreamMatches());
        System.out.println("findFirst FAILED      : " + firstFailed(SampleData.payments()));
        System.out.println("findAny FAILED (par.) : one of [P003, P012] = "
                + anyFailedParallel(SampleData.payments()).map(id -> id.equals("P003") || id.equals("P012")).orElse(false));
    }
}
