package com.itgreenzone.fp.l03_lambdas.before;

import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.PaymentStatus;
import com.itgreenzone.fp.data.SampleData;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/** Pre-Java-8 validator: four anonymous classes, about 30 lines of ceremony for four one-line rules. */
public final class LegacyPaymentValidator {

    private static final BigDecimal PAYPAL_LIMIT = new BigDecimal("300.00");
    private static final BigDecimal APPROVAL_LIMIT = new BigDecimal("1000.00");

    private final List<PaymentValidation> validations = new ArrayList<>();

    public LegacyPaymentValidator() {
        validations.add(new PaymentValidation() {
            @Override
            public String check(Payment p) {
                return p.amount().signum() > 0 ? null : "amount must be positive";
            }
        });
        validations.add(new PaymentValidation() {
            @Override
            public String check(Payment p) {
                return p.status() == PaymentStatus.FAILED ? "failed payments cannot be settled" : null;
            }
        });
        validations.add(new PaymentValidation() {
            @Override
            public String check(Payment p) {
                if ("PAYPAL".equals(p.method()) && p.amount().compareTo(PAYPAL_LIMIT) > 0) {
                    return "PayPal limit is 300.00";
                }
                return null;
            }
        });
        validations.add(new PaymentValidation() {
            @Override
            public String check(Payment p) {
                return p.amount().compareTo(APPROVAL_LIMIT) > 0 ? "needs manual approval over 1000.00" : null;
            }
        });
    }

    public List<String> validate(List<Payment> payments) {
        List<String> errors = new ArrayList<>();
        for (Payment p : payments) {
            for (PaymentValidation v : validations) {
                String message = v.check(p);
                if (message != null) {
                    errors.add(p.id() + ": " + message);
                }
            }
        }
        return errors;
    }

    public static void main(String[] args) {
        new LegacyPaymentValidator().validate(SampleData.payments()).forEach(System.out::println);
    }
}
