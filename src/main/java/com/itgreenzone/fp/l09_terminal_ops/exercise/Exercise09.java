package com.itgreenzone.fp.l09_terminal_ops.exercise;

import com.itgreenzone.fp.data.Transaction;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

/**
 * L09 EXERCISE (about 30 minutes): month-end totals in SGD with correct BigDecimal rounding.
 * Bank rule used in this exercise: a USD transaction is converted at the fixed month-end rate USD_SGD and each
 * converted line is rounded to 2 decimals HALF_UP BEFORE it is added (toSgd below). Use reduce, max, toList.
 * Expected values are in each Javadoc; Exercise09Test checks them.
 */
public final class Exercise09 {

    /** Fixed exercise rate (not live data). */
    public static final BigDecimal USD_SGD = new BigDecimal("1.3456");

    public static final List<YearMonth> MONTHS = List.of(YearMonth.of(2026, 8), YearMonth.of(2026, 9), YearMonth.of(2026, 10));

    private Exercise09() {
    }

    /** Given: one line in SGD, scale 2, HALF_UP. */
    public static BigDecimal toSgd(Transaction t) {
        BigDecimal sgd = "USD".equals(t.currency()) ? t.amount().multiply(USD_SGD) : t.amount();
        return sgd.setScale(2, RoundingMode.HALF_UP);
    }

    /** TODO 1: sum of DEBIT lines (toSgd) in the month. Expected 2026-08: 4031.61, 2026-09: 7328.44, 2026-10: 5832.65. Empty month: 0. */
    public static BigDecimal debitTotal(YearMonth month) {
        throw new UnsupportedOperationException("TODO 1");
    }

    /** TODO 2: sum of CREDIT lines (toSgd) in the month. Expected 455.99, 19215.71, 30722.84. */
    public static BigDecimal creditTotal(YearMonth month) {
        throw new UnsupportedOperationException("TODO 2");
    }

    /** TODO 3: credits - debits. Expected -3575.62, 11887.27, 24890.19. */
    public static BigDecimal net(YearMonth month) {
        throw new UnsupportedOperationException("TODO 3");
    }

    /** TODO 4: average DEBIT line, scale 2, HALF_UP. Expected 335.97, 431.08, 364.54. Empty month: 0.00 (no ArithmeticException). */
    public static BigDecimal averageDebit(YearMonth month) {
        throw new UnsupportedOperationException("TODO 4");
    }

    /** TODO 5: the largest DEBIT line as "id amountInSgd", or Optional.empty() for an empty month.
     * Expected "T003 1221.40", "T026 1726.41", "T042 1432.93". */
    public static Optional<String> largestDebit(YearMonth month) {
        throw new UnsupportedOperationException("TODO 5");
    }
}
