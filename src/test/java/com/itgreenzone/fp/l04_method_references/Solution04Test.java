package com.itgreenzone.fp.l04_method_references;

import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;
import com.itgreenzone.fp.l04_method_references.solution.Solution04;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** Behaviour of all 10 functions. Must stay green while you convert lambdas to method references. */
class Solution04Test {

    @Test
    void amountAndSum() {
        BigDecimal total = SampleData.transactions().stream().map(Solution04.AMOUNT).reduce(BigDecimal.ZERO, Solution04.SUM);
        assertEquals(new BigDecimal("67086.98"), total);
    }

    @Test
    void parseNotNullUpper() {
        assertEquals(new BigDecimal("59.90"), Solution04.PARSE.apply("59.90"));
        assertFalse(Solution04.NOT_NULL.test(null));
        assertTrue(Solution04.NOT_NULL.test("x"));
        assertEquals("CARD", Solution04.UPPER.apply("card"));
    }

    @Test
    void factories() {
        assertEquals(0, Solution04.NEW_LIST.get().size());
        assertEquals(4, Solution04.NEW_ARRAY.apply(4).length);
    }

    @Test
    void boundLogger() {
        StringBuilder log = new StringBuilder();
        Solution04.logTo(log).andThen(Solution04.logTo(log)).accept("ok;");
        assertEquals("ok;ok;", log.toString());
    }

    @Test
    void theTwoThatStayLambdas() {
        assertEquals(11L, SampleData.transactions().stream().filter(Solution04.HIGH).count());
        Transaction t003 = SampleData.transactions().get(2);
        assertTrue(Solution04.HIGH.test(t003));
        assertEquals("42", Solution04.TO_TEXT.apply(42));
    }
}
