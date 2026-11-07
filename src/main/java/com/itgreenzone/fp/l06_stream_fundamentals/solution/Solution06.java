package com.itgreenzone.fp.l06_stream_fundamentals.solution;

import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.PaymentStatus;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;

/**
 * SOLUTION for the L06 exercise. The predicted outputs, with the reason for each.
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
public final class Solution06 {

    // 1: elements flow one at a time; limit(2) stops after the 2nd SUCCESS.
    public static final String EXPECTED_1 = "f:P001 m:P001 f:P002 m:P002 ";
    // 2: sorted() is a barrier: all 4 filtered first, then mapped in amount order (89.90, 120.00, 310.25).
    public static final String EXPECTED_2 = "f:P001 f:P002 f:P003 f:P004 m:P004 m:P001 m:P003 ";
    // 3: anyMatch stops at P003, the first FAILED payment.
    public static final String EXPECTED_3 = "f:P001 f:P002 f:P003 ";
    // 4: no terminal operation, so nothing runs and nothing is printed.
    public static final String EXPECTED_4 = "";

    private static final BigDecimal FIFTY = new BigDecimal("50.00");

    private Solution06() {
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

    public static void main(String[] args) {
        List<Payment> five = com.itgreenzone.fp.data.SampleData.payments().subList(0, 5);
        System.out.print("1: ");
        pipeline1(five);
        System.out.println();
        System.out.print("2: ");
        pipeline2(five);
        System.out.println();
        System.out.print("3: ");
        pipeline3(five);
        System.out.println();
        System.out.print("4: ");
        pipeline4(five);
        System.out.println("(nothing)");
    }
}
