package com.itgreenzone.fp.l03_lambdas.modern;

import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.PaymentStatus;
import com.itgreenzone.fp.data.SampleData;

import java.math.BigDecimal;
import java.util.List;
import java.util.function.Predicate;

/**
 * Java 16-21 style: rules are data (records [16]), no nulls, method references to named predicates,
 * Stream.toList() [16], var in lambda parameters [11].
 */
public final class ModernPaymentValidator {

    /** A rule = a message + the condition that VIOLATES it. */
    public record Rule(String message, Predicate<Payment> violatedBy) {
    }

    /** One validation error. */
    public record ValidationError(String paymentId, String message) {
        @Override
        public String toString() {
            return paymentId + ": " + message;
        }
    }

    private static final BigDecimal PAYPAL_LIMIT = new BigDecimal("300.00");
    private static final BigDecimal APPROVAL_LIMIT = new BigDecimal("1000.00");

    public static final List<Rule> RULES = List.of(
            new Rule("amount must be positive", Predicate.not(ModernPaymentValidator::isPositive)),
            new Rule("failed payments cannot be settled", ModernPaymentValidator::isFailed),
            new Rule("PayPal limit is 300.00", ModernPaymentValidator::isPayPalOverLimit),
            new Rule("needs manual approval over 1000.00", (final var p) -> p.amount().compareTo(APPROVAL_LIMIT) > 0));

    private ModernPaymentValidator() {
    }

    static boolean isPositive(Payment p) {
        return p.amount().signum() > 0;
    }

    static boolean isFailed(Payment p) {
        return p.status() == PaymentStatus.FAILED;
    }

    static boolean isPayPalOverLimit(Payment p) {
        return "PAYPAL".equals(p.method()) && p.amount().compareTo(PAYPAL_LIMIT) > 0;
    }

    public static List<ValidationError> validate(List<Payment> payments) {
        return payments.stream()
                .flatMap(p -> RULES.stream()
                        .filter(rule -> rule.violatedBy().test(p))
                        .map(rule -> new ValidationError(p.id(), rule.message())))
                .toList();
    }

    public static void main(String[] args) {
        validate(SampleData.payments()).forEach(System.out::println);
    }
}
