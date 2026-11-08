package com.itgreenzone.fp.l13_advanced;

import com.itgreenzone.fp.l13_advanced.after.StreamPaymentStats;
import com.itgreenzone.fp.l13_advanced.before.LegacyPaymentStats;
import com.itgreenzone.fp.l13_advanced.modern.ModernPaymentStats;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class PaymentStatsRefactoringTest {

    @Test
    void allVersionsAgree() {
        List<String> legacy = LegacyPaymentStats.report();
        assertEquals(List.of(
                "CARD: count=5 sum=2070.29 min=89.90 max=999.99 avg=414.06",
                "PAYNOW: count=4 sum=1824.30 min=18.80 max=1500.00 avg=456.08",
                "PAYPAL: count=3 sum=535.25 min=75.00 max=310.25 avg=178.42"), legacy);
        assertEquals(legacy, StreamPaymentStats.report());
        assertEquals(legacy, ModernPaymentStats.report());
    }
}
