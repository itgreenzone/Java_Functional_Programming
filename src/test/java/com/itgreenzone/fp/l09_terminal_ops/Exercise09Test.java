package com.itgreenzone.fp.l09_terminal_ops;

import com.itgreenzone.fp.l09_terminal_ops.exercise.Exercise09;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** Month-end totals in SGD, USD lines converted at 1.3456 and rounded per line. */
@Disabled("Remove this line when you have completed Exercise09")
class Exercise09Test {

    static final YearMonth AUG = YearMonth.of(2026, 8);
    static final YearMonth SEP = YearMonth.of(2026, 9);
    static final YearMonth OCT = YearMonth.of(2026, 10);
    static final YearMonth NOV = YearMonth.of(2026, 11);

    @Test
    void task1DebitTotals() {
        assertEquals(new BigDecimal("4031.61"), Exercise09.debitTotal(AUG));
        assertEquals(new BigDecimal("7328.44"), Exercise09.debitTotal(SEP));
        assertEquals(new BigDecimal("5832.65"), Exercise09.debitTotal(OCT));
        assertEquals(0, Exercise09.debitTotal(NOV).signum());
    }

    @Test
    void task2CreditTotals() {
        assertEquals(new BigDecimal("455.99"), Exercise09.creditTotal(AUG));
        assertEquals(new BigDecimal("19215.71"), Exercise09.creditTotal(SEP));
        assertEquals(new BigDecimal("30722.84"), Exercise09.creditTotal(OCT));
    }

    @Test
    void task3Net() {
        assertEquals(new BigDecimal("-3575.62"), Exercise09.net(AUG));
        assertEquals(new BigDecimal("11887.27"), Exercise09.net(SEP));
        assertEquals(new BigDecimal("24890.19"), Exercise09.net(OCT));
    }

    @Test
    void task4AverageDebit() {
        assertEquals(new BigDecimal("335.97"), Exercise09.averageDebit(AUG));
        assertEquals(new BigDecimal("431.08"), Exercise09.averageDebit(SEP));
        assertEquals(new BigDecimal("364.54"), Exercise09.averageDebit(OCT));
        assertEquals(new BigDecimal("0.00"), Exercise09.averageDebit(NOV));
    }

    @Test
    void task5LargestDebit() {
        assertEquals(Optional.of("T003 1221.40"), Exercise09.largestDebit(AUG));
        assertEquals(Optional.of("T026 1726.41"), Exercise09.largestDebit(SEP));
        assertEquals(Optional.of("T042 1432.93"), Exercise09.largestDebit(OCT));
        assertEquals(Optional.empty(), Exercise09.largestDebit(NOV));
    }
}
