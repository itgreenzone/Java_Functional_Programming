package com.itgreenzone.fp.l02_functional_interfaces.after;

import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.PaymentStatus;
import com.itgreenzone.fp.data.SampleData;

import java.math.BigDecimal;
import java.util.List;
import java.util.function.Predicate;

/**
 * Java 8: reuse java.util.function.Predicate. No custom interface, no combinator classes:
 * and / or / negate come free as default methods.
 */
public final class PaymentRules {

    public static final Predicate<Payment> SUCCESSFUL = p -> p.status() == PaymentStatus.SUCCESS;
    public static final Predicate<Payment> AT_LEAST_100 = p -> p.amount().compareTo(new BigDecimal("100.00")) >= 0;
    public static final Predicate<Payment> PAYPAL = p -> "PAYPAL".equals(p.method());

    public static final Predicate<Payment> SETTLE_TODAY = SUCCESSFUL
            .and(AT_LEAST_100)
            .and(PAYPAL.negate());

    private PaymentRules() {
    }

    public static List<String> settleTodayIds(List<Payment> payments) {
        return payments.stream()
                .filter(SETTLE_TODAY)
                .map(Payment::id)
                .toList();
    }

    public static void main(String[] args) {
        System.out.println("Predicate rules -> settle today: " + settleTodayIds(SampleData.payments()));
        System.out.println("Needs review (NOT successful): "
                + SampleData.payments().stream().filter(SUCCESSFUL.negate()).map(Payment::id).toList());
    }
}
