package com.itgreenzone.fp.l01_why_fp;

import com.itgreenzone.fp.data.Transaction;

import java.math.BigDecimal;

/**
 * The single business rule used by every L01 filter example:
 * "a transaction is high value when its amount is over 1,000.00".
 */
public final class HighValueRule {

    /** Threshold for a high-value transaction. Money is always BigDecimal, scale 2. */
    public static final BigDecimal THRESHOLD = new BigDecimal("1000.00");

    private HighValueRule() {
    }

    /** True when the amount is strictly greater than {@link #THRESHOLD}. */
    public static boolean isHighValue(Transaction txn) {
        return txn.amount().compareTo(THRESHOLD) > 0;
    }
}
