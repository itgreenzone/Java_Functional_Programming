package com.itgreenzone.fp.l07_filter_map_slice;

import com.itgreenzone.fp.l07_filter_map_slice.solution.Solution07;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** The 10 graded mini-tasks of L07. */
class Solution07Test {

    @Test
    void task01FailedPayments() {
        assertEquals(Expected07.FAILED, Solution07.failedPaymentIds());
    }

    @Test
    void task02PlatinumNamesUpper() {
        assertEquals(Expected07.PLATINUM_UPPER, Solution07.platinumNamesUpper());
    }

    @Test
    void task03SeatsLeft() {
        assertEquals(Expected07.SEATS_LEFT, Solution07.totalSeatsLeft());
    }

    @Test
    void task04TravelPolicies() {
        assertEquals(Expected07.TRAVEL, Solution07.travelPolicyNumbers());
    }

    @Test
    void task05DistinctCategories() {
        assertEquals(Expected07.ACC_1012_CATEGORIES, Solution07.categoriesOf("ACC-1012"));
    }

    @Test
    void task06SingaporeAccountsFlatMap() {
        assertEquals(Expected07.SINGAPORE_ACCOUNTS, Solution07.singaporeAccountNumbers());
    }

    @Test
    void task07FirstThreeOctober() {
        assertEquals(Expected07.FIRST_THREE_OCTOBER, Solution07.firstThreeOctober());
    }

    @Test
    void task08Pagination() {
        assertEquals(Expected07.PAYMENT_PAGE_3_OF_4, Solution07.paymentPage(3, 4));
        assertEquals(java.util.List.of(), Solution07.paymentPage(4, 4));
    }

    @Test
    void task09TakeWhileOnSortedInput() {
        assertEquals(Expected07.MORNING_FLIGHTS, Solution07.morningFlights());
    }

    @Test
    void task10MapMulti() {
        assertEquals(Expected07.RICH_ACCOUNTS, Solution07.richAccounts());
    }
}
