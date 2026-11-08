package com.itgreenzone.fp.l13_advanced;

import com.itgreenzone.fp.l13_advanced.solution.Solution13;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** Running balance and payment-file batches: the expected value of each result. */
class Solution13Test {

    @Test
    void task01OpeningBalance() {
        assertEquals("13608.84", String.valueOf(Solution13.openingBalance("ACC-1001")));
    }

    @Test
    void task02RunningBalances() {
        assertEquals("[13340.77, 13104.84, 12947.37, 12500.00]", String.valueOf(Solution13.runningBalances("ACC-1001")));
    }

    @Test
    void task03Statement() {
        assertEquals("[OPENING 19235.05, 2026-08-02 T001 -150.39 = 19084.66, 2026-08-18 T006 174.30 = 19258.96, 2026-08-19 T007 206.07 = 19465.03, 2026-09-01 T016 136.04 = 19601.07, 2026-09-30 T037 -39.45 = 19561.62, 2026-10-12 T052 -661.62 = 18900.00, CLOSING 18900.00]", String.valueOf(Solution13.statement("ACC-1014")));
    }

    @Test
    void task04LowestBalance() {
        assertEquals("-4382.09", String.valueOf(Solution13.lowestBalance("ACC-1013")));
    }

    @Test
    void task05AccountsThatWentNegative() {
        assertEquals("[ACC-1003, ACC-1008, ACC-1010, ACC-1013]", String.valueOf(Solution13.accountsThatWentNegative()));
    }

    @Test
    void task06BatchSizes() {
        assertEquals("[100, 100, 50]", String.valueOf(Solution13.batchSizes(250, 100)));
    }

    @Test
    void task07PaymentFileBatches() {
        assertEquals("[BATCH 1: 5 payments P001..P005 total 2065.65, BATCH 2: 5 payments P006..P010 total 1954.19, BATCH 3: 2 payments P011..P012 total 410.00]", String.valueOf(Solution13.paymentFileBatches(5)));
    }

    @Test
    void task08ControlTotalsMatch() {
        assertEquals("true", String.valueOf(Solution13.controlTotalsMatch(5)));
    }
}
