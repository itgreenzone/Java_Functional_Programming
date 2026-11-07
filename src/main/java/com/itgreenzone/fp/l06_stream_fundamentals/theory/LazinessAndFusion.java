package com.itgreenzone.fp.l06_stream_fundamentals.theory;

import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.PaymentStatus;
import com.itgreenzone.fp.data.SampleData;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;

/**
 * Laziness and loop fusion [Java 8].
 * - Intermediate operations do nothing until a terminal operation asks for elements.
 * - Elements travel ONE AT A TIME through all stateless steps ("vertical" order).
 * - A stateful operation such as sorted() is a barrier: it must see every element first.
 * peek(...) only records the flow for this demonstration; it is a debugging tool.
 */
public final class LazinessAndFusion {

    private static final BigDecimal HUNDRED = new BigDecimal("100.00");

    private LazinessAndFusion() {
    }

    /** No terminal operation: returns the (unused) pipeline; the trace stays empty. */
    public static Stream<String> withoutTerminal(List<Payment> payments, List<String> trace) {
        return payments.stream()
                .peek(p -> trace.add("filter " + p.id()))
                .filter(p -> p.status() == PaymentStatus.SUCCESS)
                .map(Payment::id);
    }

    /** Stateless steps + short-circuiting limit: vertical order, stops early. */
    public static List<String> verticalOrder(List<Payment> payments, List<String> trace) {
        return payments.stream()
                .peek(p -> trace.add("filter " + p.id()))
                .filter(p -> p.amount().compareTo(HUNDRED) >= 0)
                .peek(p -> trace.add("map " + p.id()))
                .map(Payment::id)
                .limit(2)
                .toList();
    }

    /** sorted() is stateful: every element is filtered first, then sorted, then mapped. */
    public static List<String> sortedIsABarrier(List<Payment> payments, List<String> trace) {
        return payments.stream()
                .peek(p -> trace.add("filter " + p.id()))
                .filter(p -> p.amount().compareTo(HUNDRED) >= 0)
                .sorted(Comparator.comparing(Payment::amount))
                .peek(p -> trace.add("map " + p.id()))
                .map(Payment::id)
                .toList();
    }

    public static void main(String[] args) {
        List<Payment> firstFive = SampleData.payments().subList(0, 5);

        List<String> trace = new ArrayList<>();
        withoutTerminal(firstFive, trace).close();
        System.out.println("1 no terminal op   : trace=" + trace);

        trace.clear();
        List<String> ids = verticalOrder(firstFive, trace);
        System.out.println("2 vertical + limit : " + String.join(", ", trace) + " -> " + ids);

        trace.clear();
        ids = sortedIsABarrier(firstFive, trace);
        System.out.println("3 sorted barrier   : " + String.join(", ", trace) + " -> " + ids);
    }
}
