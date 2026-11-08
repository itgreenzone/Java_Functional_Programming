package com.itgreenzone.fp.l16_records_sealed.theory;

import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;
import com.itgreenzone.fp.data.TxnType;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.SequencedMap;
import java.util.SequencedSet;
import java.util.TreeMap;
import java.util.stream.Collectors;

/**
 * Sequenced collections [21] (JEP 431): one interface for "has a first and a last element".
 * List, Deque, LinkedHashSet, TreeSet (SequencedCollection / SequencedSet) and LinkedHashMap, TreeMap (SequencedMap)
 * gain getFirst/getLast, addFirst/addLast, removeFirst/removeLast, reversed(), firstEntry/lastEntry/pollFirstEntry.
 */
public final class SequencedCollectionsDemo {

    private SequencedCollectionsDemo() {
    }

    public static String listEnds() {
        List<Payment> payments = SampleData.payments();
        return "first=" + payments.getFirst().id() + " last=" + payments.getLast().id()
                + " reversed first 3=" + payments.reversed().stream().limit(3).map(Payment::id).toList();
    }

    /** Before Java 21: list.get(0), list.get(list.size() - 1), Collections.reverse on a copy. */
    public static String listEndsJava8() {
        List<Payment> payments = SampleData.payments();
        return "first=" + payments.get(0).id() + " last=" + payments.get(payments.size() - 1).id();
    }

    /** reversed() is a VIEW: changes to the source show through it. */
    public static String reversedIsAView() {
        List<String> ids = new ArrayList<>(List.of("P001", "P002"));
        List<String> rev = ids.reversed();
        ids.addFirst("P000");
        return rev.toString();
    }

    public static String earliestAndLatestTransaction() {
        List<Transaction> byDate = SampleData.transactions().stream()
                .sorted(Comparator.comparing(Transaction::date).thenComparing(Transaction::id)).toList();
        return byDate.getFirst().id() + " " + byDate.getFirst().date() + " .. " + byDate.getLast().id() + " " + byDate.getLast().date();
    }

    /** A SequencedMap: first and last month of SGD debits, and the map in reverse order. */
    public static String monthlyEnds() {
        SequencedMap<YearMonth, BigDecimal> monthly = SampleData.transactions().stream()
                .filter(t -> t.type() == TxnType.DEBIT && t.currency().equals("SGD"))
                .collect(Collectors.groupingBy(t -> YearMonth.from(t.date()), TreeMap::new,
                        Collectors.reducing(BigDecimal.ZERO, Transaction::amount, BigDecimal::add)));
        return "first=" + monthly.firstEntry() + " last=" + monthly.lastEntry() + " reversed=" + monthly.reversed();
    }

    /** LinkedHashMap keeps insertion order; pollFirstEntry removes and returns the oldest entry (a simple queue). */
    public static String queueOfPending() {
        SequencedMap<String, String> queue = new LinkedHashMap<>();
        queue.put("P008", "CARD");
        queue.put("P012", "PAYNOW");
        queue.putFirst("P003", "PAYPAL");
        var head = queue.pollFirstEntry();
        return "polled " + head + ", remaining " + queue;
    }

    public static String sequencedSet() {
        SequencedSet<String> cities = SampleData.customers().stream()
                .map(c -> c.city()).collect(Collectors.toCollection(LinkedHashSet::new));
        return cities + " first=" + cities.getFirst() + " last=" + cities.getLast();
    }

    public static void main(String[] args) {
        System.out.println("List [21]          : " + listEnds());
        System.out.println("List (Java 8)      : " + listEndsJava8());
        System.out.println("reversed() is view : " + reversedIsAView());
        System.out.println("by date            : " + earliestAndLatestTransaction());
        System.out.println("SequencedMap       : " + monthlyEnds());
        System.out.println("LinkedHashMap queue: " + queueOfPending());
        System.out.println("SequencedSet       : " + sequencedSet());
    }
}
