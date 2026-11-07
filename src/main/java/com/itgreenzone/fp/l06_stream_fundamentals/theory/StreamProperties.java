package com.itgreenzone.fp.l06_stream_fundamentals.theory;

import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.PaymentStatus;
import com.itgreenzone.fp.data.SampleData;

import java.util.HashSet;
import java.util.List;
import java.util.Spliterator;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Stream;

/**
 * Stream properties: one-shot, stateless vs stateful, short-circuiting, encounter order,
 * and the sequential/parallel flag. (The AtomicInteger counters only make the behaviour visible.)
 */
public final class StreamProperties {

    private StreamProperties() {
    }

    /** Short-circuiting: anyMatch stops at the first FAILED payment. */
    public static int inspectedByAnyMatch(List<Payment> payments) {
        AtomicInteger inspected = new AtomicInteger();
        payments.stream()
                .peek(p -> inspected.incrementAndGet())
                .anyMatch(p -> p.status() == PaymentStatus.FAILED);
        return inspected.get();
    }

    /** Short-circuiting makes an infinite stream usable. */
    public static List<Integer> firstPowersOfTwoOver(int limit) {
        return Stream.iterate(1, n -> n * 2)
                .filter(n -> n > limit)
                .limit(3)
                .toList();
    }

    /** Stateful: distinct() and sorted() must remember what they have seen. */
    public static List<String> distinctSortedMethods(List<Payment> payments) {
        return payments.stream()
                .map(Payment::method)
                .distinct()
                .sorted()
                .toList();
    }

    /** Encounter order comes from the source: a List is ORDERED, a HashSet is not. */
    public static String orderCharacteristics(List<Payment> payments) {
        boolean listOrdered = payments.spliterator().hasCharacteristics(Spliterator.ORDERED);
        boolean setOrdered = new HashSet<>(payments).spliterator().hasCharacteristics(Spliterator.ORDERED);
        return "List ORDERED=" + listOrdered + ", HashSet ORDERED=" + setOrdered;
    }

    /** The parallel flag is one flag for the whole pipeline; the LAST call wins. */
    public static String parallelFlags(List<Payment> payments) {
        return "stream()=" + payments.stream().isParallel()
                + ", parallelStream()=" + payments.parallelStream().isParallel()
                + ", parallel().sequential()=" + payments.stream().parallel().sequential().isParallel();
    }

    public static void main(String[] args) {
        List<Payment> payments = SampleData.payments();
        System.out.println("one-shot             : " + StreamVsCollection.reuseMessage());
        System.out.println("anyMatch inspected   : " + inspectedByAnyMatch(payments) + " of " + payments.size());
        System.out.println("infinite + limit     : " + firstPowersOfTwoOver(1000));
        System.out.println("stateful distinct    : " + distinctSortedMethods(payments));
        System.out.println("encounter order      : " + orderCharacteristics(payments));
        System.out.println("parallel flag        : " + parallelFlags(payments));
    }
}
