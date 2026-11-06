package com.itgreenzone.fp.l01_why_fp.before;

import com.itgreenzone.fp.data.Transaction;

import java.math.BigDecimal;

/** Step 1 (strategy pattern): a whole named class just to hold one condition. */
public final class HighValueFilter implements TransactionFilter {

    private final BigDecimal threshold;

    public HighValueFilter(BigDecimal threshold) {
        this.threshold = threshold;
    }

    @Override
    public boolean matches(Transaction txn) {
        return txn.amount().compareTo(threshold) > 0;
    }
}
