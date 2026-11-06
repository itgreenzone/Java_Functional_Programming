package com.itgreenzone.fp.l01_why_fp.theory;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Pure vs impure functions.
 * A pure function: same input gives the same output, and it changes nothing outside itself.
 */
public final class PureFunctions {

    private static final BigDecimal RATE = new BigDecimal("0.005");
    private static final BigDecimal MIN_FEE = new BigDecimal("1.00");

    private PureFunctions() {
    }

    /** PURE: 0.5% transfer fee, minimum 1.00. Depends only on its argument. */
    public static BigDecimal transferFee(BigDecimal amount) {
        BigDecimal fee = amount.multiply(RATE).setScale(2, RoundingMode.HALF_UP);
        return fee.max(MIN_FEE);
    }

    /** IMPURE (anti-pattern): the result depends on mutable state that can change between calls. */
    public static final class ImpureFeeCalculator {
        private BigDecimal rate = RATE;
        private int callCount;

        public void changeRate(BigDecimal newRate) {
            this.rate = newRate;
        }

        public BigDecimal transferFee(BigDecimal amount) {
            callCount++;                                   // side effect: changes object state
            return amount.multiply(rate).setScale(2, RoundingMode.HALF_UP).max(MIN_FEE);
        }

        public int callCount() {
            return callCount;
        }
    }

    public static void main(String[] args) {
        BigDecimal amount = new BigDecimal("2500.00");
        System.out.println("Pure fee, call 1:   " + transferFee(amount));
        System.out.println("Pure fee, call 2:   " + transferFee(amount));

        ImpureFeeCalculator impure = new ImpureFeeCalculator();
        System.out.println("Impure fee, call 1: " + impure.transferFee(amount));
        impure.changeRate(new BigDecimal("0.010"));
        System.out.println("Impure fee, call 2: " + impure.transferFee(amount) + "  <- same input, different answer");
    }
}
