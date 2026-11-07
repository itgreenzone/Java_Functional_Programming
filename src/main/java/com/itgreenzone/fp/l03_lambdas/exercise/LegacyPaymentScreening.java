package com.itgreenzone.fp.l03_lambdas.exercise;

import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.PaymentStatus;
import com.itgreenzone.fp.l03_lambdas.before.PaymentValidation;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Consumer;

/**
 * EXERCISE INPUT - working legacy code with anonymous classes and a counter "hack".
 * Rewrite it in {@link Exercise03}. Do not change this file.
 */
public final class LegacyPaymentScreening {

    private LegacyPaymentScreening() {
    }

    public static List<PaymentValidation> rules() {
        List<PaymentValidation> rules = new ArrayList<>();
        rules.add(new PaymentValidation() {
            @Override
            public String check(Payment p) {
                return p.status() == PaymentStatus.PENDING ? "pending: re-check with gateway" : null;
            }
        });
        rules.add(new PaymentValidation() {
            @Override
            public String check(Payment p) {
                return p.status() == PaymentStatus.REFUNDED ? "refunded: exclude from settlement" : null;
            }
        });
        rules.add(new PaymentValidation() {
            @Override
            public String check(Payment p) {
                if ("PAYNOW".equals(p.method()) && p.amount().compareTo(new BigDecimal("1000.00")) > 0) {
                    return "PayNow over 1000.00: confirm with customer";
                }
                return null;
            }
        });
        return rules;
    }

    public static Comparator<Payment> byAmountHighestFirst() {
        return new Comparator<Payment>() {
            @Override
            public int compare(Payment a, Payment b) {
                return b.amount().compareTo(a.amount());
            }
        };
    }

    public static List<String> screen(List<Payment> payments) {
        List<String> messages = new ArrayList<>();
        for (Payment p : payments) {
            for (PaymentValidation rule : rules()) {
                String m = rule.check(p);
                if (m != null) {
                    messages.add(p.id() + ": " + m);
                }
            }
        }
        return messages;
    }

    /** Counts flagged payments with a mutable counter captured by an anonymous Consumer. */
    public static int flaggedCount(List<Payment> payments) {
        final AtomicInteger counter = new AtomicInteger();
        payments.forEach(new Consumer<Payment>() {
            @Override
            public void accept(Payment p) {
                for (PaymentValidation rule : rules()) {
                    if (rule.check(p) != null) {
                        counter.incrementAndGet();
                        return;
                    }
                }
            }
        });
        return counter.get();
    }
}
