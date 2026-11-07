package com.itgreenzone.fp.l09_terminal_ops;

import com.itgreenzone.fp.l09_terminal_ops.solution.Solution09;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** Month-end totals in SGD, USD lines converted at 1.3456 and rounded per line. */
class Solution09Test {

    static final YearMonth AUG = YearMonth.of(2026, 8);
    static final YearMonth SEP = YearMonth.of(2026, 9);
    static final YearMonth OCT = YearMonth.of(2026, 10);
    static final YearMonth NOV = YearMonth.of(2026, 11);

    @Test
    void task1DebitTotals() {
        assertEquals(new BigDecimal("4031.61"), Solution09.debitTotal(AUG));
        assertEquals(new BigDecimal("7328.44"), Solution09.debitTotal(SEP));
        assertEquals(new BigDecimal("5832.65"), Solution09.debitTotal(OCT));
        assertEquals(0, Solution09.debitTotal(NOV).signum());
    }

    @Test
    void task2CreditTotals() {
        assertEquals(new BigDecimal("455.99"), Solution09.creditTotal(AUG));
        assertEquals(new BigDecimal("19215.71"), Solution09.creditTotal(SEP));
        assertEquals(new BigDecimal("30722.84"), Solution09.creditTotal(OCT));
    }

    @Test
    void task3Net() {
        assertEquals(new BigDecimal("-3575.62"), Solution09.net(AUG));
        assertEquals(new BigDecimal("11887.27"), Solution09.net(SEP));
        assertEquals(new BigDecimal("24890.19"), Solution09.net(OCT));
    }

    @Test
    void task4AverageDebit() {
        assertEquals(new BigDecimal("335.97"), Solution09.averageDebit(AUG));
        assertEquals(new BigDecimal("431.08"), Solution09.averageDebit(SEP));
        assertEquals(new BigDecimal("364.54"), Solution09.averageDebit(OCT));
        assertEquals(new BigDecimal("0.00"), Solution09.averageDebit(NOV));
    }

    @Test
    void task5LargestDebit() {
        assertEquals(Optional.of("T003 1221.40"), Solution09.largestDebit(AUG));
        assertEquals(Optional.of("T026 1726.41"), Solution09.largestDebit(SEP));
        assertEquals(Optional.of("T042 1432.93"), Solution09.largestDebit(OCT));
        assertEquals(Optional.empty(), Solution09.largestDebit(NOV));
    }

    @Test
    void roundingPerLineDiffersFromRoundingAtTheEnd() {
        assertEquals("USD lines [T010, T023]: per line=1947.75, at end=1947.74", Solution09.perLineVsAtEnd());
    }
}
