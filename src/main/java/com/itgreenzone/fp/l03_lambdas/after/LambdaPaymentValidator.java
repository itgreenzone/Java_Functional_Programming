package com.itgreenzone.fp.l03_lambdas.after;

import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.PaymentStatus;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.l03_lambdas.before.PaymentValidation;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;

/** Java 8: the same interface, each rule is now a one-line lambda. */
public final class LambdaPaymentValidator {

    private static final BigDecimal PAYPAL_LIMIT = new BigDecimal("300.00");
    private static final BigDecimal APPROVAL_LIMIT = new BigDecimal("1000.00");

    public static final List<PaymentValidation> RULES = List.of(
            p -> p.amount().signum() > 0 ? null : "amount must be positive",
            p -> p.status() == PaymentStatus.FAILED ? "failed payments cannot be settled" : null,
            p -> isPayPalOverLimit(p) ? "PayPal limit is 300.00" : null,
            p -> p.amount().compareTo(APPROVAL_LIMIT) > 0 ? "needs manual approval over 1000.00" : null);

    private LambdaPaymentValidator() {
    }

    /** A rule longer than one condition is extracted into a named method. */
    private static boolean isPayPalOverLimit(Payment p) {
        return "PAYPAL".equals(p.method()) && p.amount().compareTo(PAYPAL_LIMIT) > 0;
    }

    public static List<String> validate(List<Payment> payments) {
        return payments.stream()
                .flatMap(p -> RULES.stream()
                        .map(rule -> rule.check(p))
                        .filter(Objects::nonNull)
                        .map(message -> p.id() + ": " + message))
                .toList();
    }

    public static void main(String[] args) {
        validate(SampleData.payments()).forEach(System.out::println);
    }
}
