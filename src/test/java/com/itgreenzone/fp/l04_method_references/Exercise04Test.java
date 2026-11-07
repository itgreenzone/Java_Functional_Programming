package com.itgreenzone.fp.l04_method_references;

import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;
import com.itgreenzone.fp.l04_method_references.exercise.Exercise04;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** Behaviour of all 10 functions. Must stay green while you convert lambdas to method references. */
class Exercise04Test {

    @Test
    void amountAndSum() {
        BigDecimal total = SampleData.transactions().stream().map(Exercise04.AMOUNT).reduce(BigDecimal.ZERO, Exercise04.SUM);
        assertEquals(new BigDecimal("67086.98"), total);
    }

    @Test
    void parseNotNullUpper() {
        assertEquals(new BigDecimal("59.90"), Exercise04.PARSE.apply("59.90"));
        assertFalse(Exercise04.NOT_NULL.test(null));
        assertTrue(Exercise04.NOT_NULL.test("x"));
        assertEquals("CARD", Exercise04.UPPER.apply("card"));
    }

    @Test
    void factories() {
        assertEquals(0, Exercise04.NEW_LIST.get().size());
        assertEquals(4, Exercise04.NEW_ARRAY.apply(4).length);
    }

    @Test
    void boundLogger() {
        StringBuilder log = new StringBuilder();
        Exercise04.logTo(log).andThen(Exercise04.logTo(log)).accept("ok;");
        assertEquals("ok;ok;", log.toString());
    }

    @Test
    void theTwoThatStayLambdas() {
        assertEquals(11L, SampleData.transactions().stream().filter(Exercise04.HIGH).count());
        Transaction t003 = SampleData.transactions().get(2);
        assertTrue(Exercise04.HIGH.test(t003));
        assertEquals("42", Exercise04.TO_TEXT.apply(42));
    }
}
