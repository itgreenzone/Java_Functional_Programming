package com.itgreenzone.fp.l10_collectors;

import com.itgreenzone.fp.l10_collectors.solution.Solution10;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** The payment gateway summary per method. */
class Solution10Test {

    @Test
    void task1CountByMethod() {
        assertEquals("{CARD=5, PAYNOW=4, PAYPAL=3}", Solution10.countByMethod().toString());
    }

    @Test
    void task2TotalByMethod() {
        assertEquals("{CARD=2070.29, PAYNOW=1824.30, PAYPAL=535.25}", Solution10.totalByMethod().toString());
    }

    @Test
    void task3SummaryByMethod() {
        assertEquals("{CARD=5 / 2070.29, PAYNOW=4 / 1824.30, PAYPAL=3 / 535.25}", Solution10.summaryByMethod().toString());
    }

    @Test
    void task4SuccessOnly() {
        assertEquals("{CARD=3 / 1209.89, PAYNOW=3 / 1564.30, PAYPAL=2 / 225.00}", Solution10.successSummaryByMethod().toString());
    }

    @Test
    void task5GatewayLine() {
        assertEquals("12 payments, 4429.84 total, failed: P003, P012", Solution10.gatewayLine());
    }
}
