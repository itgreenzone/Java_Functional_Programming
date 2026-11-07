package com.itgreenzone.fp.l03_lambdas.solution;

import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.PaymentStatus;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.l03_lambdas.before.PaymentValidation;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

/** Reference solution for the L03 exercise. */
public final class Solution03 {

    private static final BigDecimal PAYNOW_CONFIRM_LIMIT = new BigDecimal("1000.00");

    private Solution03() {
    }

    public static List<PaymentValidation> rules() {
        return List.of(
                p -> p.status() == PaymentStatus.PENDING ? "pending: re-check with gateway" : null,
                p -> p.status() == PaymentStatus.REFUNDED ? "refunded: exclude from settlement" : null,
                p -> isLargePayNow(p) ? "PayNow over 1000.00: confirm with customer" : null);
    }

    private static boolean isLargePayNow(Payment p) {
        return "PAYNOW".equals(p.method()) && p.amount().compareTo(PAYNOW_CONFIRM_LIMIT) > 0;
    }

    public static Comparator<Payment> byAmountHighestFirst() {
        return (a, b) -> b.amount().compareTo(a.amount());
    }

    private static List<String> messagesFor(Payment p) {
        return rules().stream()
                .map(rule -> rule.check(p))
                .filter(Objects::nonNull)
                .toList();
    }

    public static List<String> screen(List<Payment> payments) {
        return payments.stream()
                .flatMap(p -> messagesFor(p).stream().map(m -> p.id() + ": " + m))
                .toList();
    }

    public static long flaggedCount(List<Payment> payments) {
        return payments.stream()
                .filter(p -> !messagesFor(p).isEmpty())
                .count();
    }

    public static void main(String[] args) {
        List<Payment> payments = SampleData.payments();
        screen(payments).forEach(System.out::println);
        System.out.println("Flagged payments: " + flaggedCount(payments));
        System.out.println("Largest 3: " + payments.stream()
                .sorted(byAmountHighestFirst())
                .limit(3)
                .map(p -> p.id() + "=" + p.amount())
                .toList());
    }
}
