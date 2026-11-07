package com.itgreenzone.fp.l06_stream_fundamentals.exercise;

import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.PaymentStatus;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;

/**
 * L06 EXERCISE (about 20 minutes): trace the execution order.
 * Do NOT run the code first. For each pipeline, write what it PRINTS into the EXPECTED_n constant,
 * using the payments below. Then remove @Disabled in Exercise06Test and check your predictions.
 *
 *   P001 CARD   120.00  SUCCESS
 *   P002 PAYNOW  45.50  SUCCESS
 *   P003 PAYPAL 310.25  FAILED
 *   P004 CARD    89.90  SUCCESS
 *   P005 PAYNOW 1500.00 SUCCESS
 *
 * Each peek prints its label and the payment id, followed by one space, e.g. "f:P001 ".
 */
public final class Exercise06 {

    // TODO 1: what does pipeline1 print?
    public static final String EXPECTED_1 = "TODO";
    // TODO 2: what does pipeline2 print?
    public static final String EXPECTED_2 = "TODO";
    // TODO 3: what does pipeline3 print?
    public static final String EXPECTED_3 = "TODO";
    // TODO 4: what does pipeline4 print?
    public static final String EXPECTED_4 = "TODO";

    private static final BigDecimal FIFTY = new BigDecimal("50.00");

    private Exercise06() {
    }

    /** Stateless steps + limit. */
    public static void pipeline1(List<Payment> five) {
        five.stream()
                .peek(p -> System.out.print("f:" + p.id() + " "))
                .filter(p -> p.status() == PaymentStatus.SUCCESS)
                .peek(p -> System.out.print("m:" + p.id() + " "))
                .map(Payment::id)
                .limit(2)
                .toList();
    }

    /** A stateful sorted() in the middle. */
    public static void pipeline2(List<Payment> five) {
        five.stream()
                .limit(4)
                .peek(p -> System.out.print("f:" + p.id() + " "))
                .filter(p -> p.amount().compareTo(FIFTY) > 0)
                .sorted(Comparator.comparing(Payment::amount))
                .peek(p -> System.out.print("m:" + p.id() + " "))
                .map(Payment::id)
                .toList();
    }

    /** A short-circuiting terminal operation. */
    public static void pipeline3(List<Payment> five) {
        five.stream()
                .peek(p -> System.out.print("f:" + p.id() + " "))
                .anyMatch(p -> p.status() == PaymentStatus.FAILED);
    }

    /** No terminal operation. */
    public static void pipeline4(List<Payment> five) {
        Stream<String> notRun = five.stream()
                .peek(p -> System.out.print("f:" + p.id() + " "))
                .map(Payment::id);
        notRun.close();
    }
}
