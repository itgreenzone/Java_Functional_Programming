package com.itgreenzone.fp.l02_functional_interfaces.before;

import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.PaymentStatus;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Pre-Java-8 rule set: one class per rule plus hand-written combinators (And, Not).
 * Rule: settle today = SUCCESS AND amount >= 100.00 AND NOT PayPal.
 */
public final class LegacyPaymentChecks {

    private LegacyPaymentChecks() {
    }

    public static final class SuccessfulCheck implements PaymentCheck {
        @Override
        public boolean passes(Payment payment) {
            return payment.status() == PaymentStatus.SUCCESS;
        }
    }

    public static final class MinimumAmountCheck implements PaymentCheck {
        private final BigDecimal minimum;

        public MinimumAmountCheck(BigDecimal minimum) {
            this.minimum = minimum;
        }

        @Override
        public boolean passes(Payment payment) {
            return payment.amount().compareTo(minimum) >= 0;
        }
    }

    public static final class MethodCheck implements PaymentCheck {
        private final String method;

        public MethodCheck(String method) {
            this.method = method;
        }

        @Override
        public boolean passes(Payment payment) {
            return method.equals(payment.method());
        }
    }

    /** Hand-written combinator: every project re-wrote this. */
    public static final class AndCheck implements PaymentCheck {
        private final List<PaymentCheck> checks;

        public AndCheck(List<PaymentCheck> checks) {
            this.checks = checks;
        }

        @Override
        public boolean passes(Payment payment) {
            for (PaymentCheck check : checks) {
                if (!check.passes(payment)) {
                    return false;
                }
            }
            return true;
        }
    }

    public static final class NotCheck implements PaymentCheck {
        private final PaymentCheck check;

        public NotCheck(PaymentCheck check) {
            this.check = check;
        }

        @Override
        public boolean passes(Payment payment) {
            return !check.passes(payment);
        }
    }

    public static PaymentCheck settleToday() {
        List<PaymentCheck> checks = new ArrayList<>();
        checks.add(new SuccessfulCheck());
        checks.add(new MinimumAmountCheck(new BigDecimal("100.00")));
        checks.add(new NotCheck(new MethodCheck("PAYPAL")));
        return new AndCheck(checks);
    }

    public static List<String> settleTodayIds(List<Payment> payments) {
        PaymentCheck rule = settleToday();
        List<String> ids = new ArrayList<>();
        for (Payment p : payments) {
            if (rule.passes(p)) {
                ids.add(p.id());
            }
        }
        return ids;
    }

    public static void main(String[] args) {
        System.out.println("Legacy checks -> settle today: "
                + settleTodayIds(com.itgreenzone.fp.data.SampleData.payments()));
    }
}
