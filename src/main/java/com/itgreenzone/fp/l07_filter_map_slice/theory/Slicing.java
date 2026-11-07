package com.itgreenzone.fp.l07_filter_map_slice.theory;

import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;

/**
 * limit(n), skip(n) [Java 8]: slice by POSITION.
 * takeWhile, dropWhile [Java 9]: slice by a CONDITION, and stop at the first element that fails it,
 * so they only make sense on input that is sorted (or ordered) by that condition.
 */
public final class Slicing {

    static final BigDecimal THREE_HUNDRED = new BigDecimal("300.00");

    private Slicing() {
    }

    /** Practice 5: first 5 transactions by date (id breaks ties). */
    public static List<String> firstFiveByDate(List<Transaction> txns) {
        return txns.stream()
                .sorted(Comparator.comparing(Transaction::date).thenComparing(Transaction::id))
                .limit(5)
                .map(t -> t.date() + " " + t.id())
                .toList();
    }

    /** Practice 6: pagination. Page numbers start at 1. */
    public static <T> List<T> page(List<T> items, int pageNo, int size) {
        if (pageNo < 1 || size < 1) {
            throw new IllegalArgumentException("pageNo and size must be >= 1");
        }
        return items.stream()
                .skip((long) (pageNo - 1) * size)
                .limit(size)
                .toList();
    }

    public static List<String> transactionIds() {
        return SampleData.transactions().stream().map(Transaction::id).toList();
    }

    /** takeWhile on input sorted by time: everything before the cut-off. */
    public static List<String> paidBefore(List<Payment> payments, Instant cutOff) {
        return payments.stream()
                .sorted(Comparator.comparing(Payment::at))
                .takeWhile(p -> p.at().isBefore(cutOff))
                .map(Payment::id)
                .toList();
    }

    /** dropWhile: the complement, everything from the cut-off on. */
    public static List<String> paidFrom(List<Payment> payments, Instant cutOff) {
        return payments.stream()
                .sorted(Comparator.comparing(Payment::at))
                .dropWhile(p -> p.at().isBefore(cutOff))
                .map(Payment::id)
                .toList();
    }

    /** The gotcha: takeWhile on UNSORTED input stops at the first failure. */
    public static List<String> smallPaymentsTakeWhile(List<Payment> payments) {
        return payments.stream()
                .takeWhile(p -> p.amount().compareTo(THREE_HUNDRED) < 0)
                .map(Payment::id)
                .toList();
    }

    public static List<String> smallPaymentsFilter(List<Payment> payments) {
        return payments.stream()
                .filter(p -> p.amount().compareTo(THREE_HUNDRED) < 0)
                .map(Payment::id)
                .toList();
    }

    /** Sorted by amount first, takeWhile is correct and stops early. */
    public static List<String> smallPaymentsSortedTakeWhile(List<Payment> payments) {
        return payments.stream()
                .sorted(Comparator.comparing(Payment::amount))
                .takeWhile(p -> p.amount().compareTo(THREE_HUNDRED) < 0)
                .map(Payment::id)
                .toList();
    }

    public static void main(String[] args) {
        List<Payment> payments = SampleData.payments();
        Instant cutOff = Instant.parse("2026-11-03T00:00:00Z");
        System.out.println("first 5 by date      : " + firstFiveByDate(SampleData.transactions()));
        System.out.println("page 2, size 5       : " + page(transactionIds(), 2, 5));
        System.out.println("page 12, size 5      : " + page(transactionIds(), 12, 5));
        System.out.println("page 13, size 5      : " + page(transactionIds(), 13, 5));
        System.out.println("takeWhile < 11-03    : " + paidBefore(payments, cutOff));
        System.out.println("dropWhile < 11-03    : " + paidFrom(payments, cutOff));
        System.out.println("< 300, takeWhile     : " + smallPaymentsTakeWhile(payments) + "  <- stops at P003 (310.25)");
        System.out.println("< 300, filter        : " + smallPaymentsFilter(payments));
        System.out.println("< 300, sorted+take   : " + smallPaymentsSortedTakeWhile(payments));
    }
}
