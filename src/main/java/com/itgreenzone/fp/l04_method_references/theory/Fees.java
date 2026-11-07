package com.itgreenzone.fp.l04_method_references.theory;

import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.PaymentStatus;

import java.math.BigDecimal;
import java.math.RoundingMode;

/** Small static helpers used as method-reference targets. */
public final class Fees {

    private static final BigDecimal RATE = new BigDecimal("0.005");
    private static final BigDecimal MINIMUM = new BigDecimal("1.00");

    private Fees() {
    }

    /** 0.5% transfer fee, minimum 1.00. */
    public static BigDecimal transferFee(BigDecimal amount) {
        return amount.multiply(RATE).setScale(2, RoundingMode.HALF_UP).max(MINIMUM);
    }

    /** Fee with an explicit rate in percent: two arguments. */
    public static BigDecimal fee(BigDecimal amount, BigDecimal ratePercent) {
        return amount.multiply(ratePercent).movePointLeft(2).setScale(2, RoundingMode.HALF_UP);
    }

    public static boolean isSuccessful(Payment payment) {
        return payment.status() == PaymentStatus.SUCCESS;
    }
}
