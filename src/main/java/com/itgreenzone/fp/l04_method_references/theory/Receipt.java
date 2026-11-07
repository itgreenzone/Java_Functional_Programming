package com.itgreenzone.fp.l04_method_references.theory;

import com.itgreenzone.fp.data.Payment;

import java.math.BigDecimal;

/** A settlement receipt line. [Java 16 record] */
public record Receipt(String paymentId, BigDecimal amount) {

    /** Static factory: a perfect method-reference target, Receipt::from. */
    public static Receipt from(Payment payment) {
        return new Receipt(payment.id(), payment.amount());
    }

    public String line() {
        return paymentId + " " + amount;
    }
}
