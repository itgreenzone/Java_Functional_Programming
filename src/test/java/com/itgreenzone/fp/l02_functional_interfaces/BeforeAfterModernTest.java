package com.itgreenzone.fp.l02_functional_interfaces;

import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.l02_functional_interfaces.after.PaymentRules;
import com.itgreenzone.fp.l02_functional_interfaces.before.LegacyPaymentChecks;
import com.itgreenzone.fp.l02_functional_interfaces.modern.ModernInterfaces;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class BeforeAfterModernTest {

    @Test
    void legacyClassesAndPredicatesSelectTheSamePayments() {
        List<String> expected = List.of("P001", "P005", "P010");
        assertEquals(expected, LegacyPaymentChecks.settleTodayIds(SampleData.payments()));
        assertEquals(expected, PaymentRules.settleTodayIds(SampleData.payments()));
    }

    @Test
    void recordCanImplementPredicate() {
        assertEquals(List.of("T025", "T027", "T038", "T049", "T055", "T056"),
                ModernInterfaces.aboveFiveThousand(SampleData.transactions()));
        assertEquals(38L, ModernInterfaces.notAboveFiveHundred(SampleData.transactions()));
        assertEquals(new ModernInterfaces.AboveThreshold(new BigDecimal("1.00")),
                new ModernInterfaces.AboveThreshold(new BigDecimal("1.00")));
    }

    @Test
    void switchExpressionInsideAFunction() {
        assertEquals(new BigDecimal("0.05"), ModernInterfaces.CASHBACK_RATE.apply(com.itgreenzone.fp.data.Category.DINING));
        assertEquals(BigDecimal.ZERO, ModernInterfaces.CASHBACK_RATE.apply(com.itgreenzone.fp.data.Category.SALARY));
        assertEquals(new BigDecimal("123.43"), ModernInterfaces.totalCashback(SampleData.transactions()));
    }
}
