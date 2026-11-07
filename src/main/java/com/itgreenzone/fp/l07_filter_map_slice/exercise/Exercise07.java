package com.itgreenzone.fp.l07_filter_map_slice.exercise;

import com.itgreenzone.fp.data.Category;

import java.util.List;

/**
 * L07 EXERCISE (about 30 minutes): 10 graded mini-tasks on SampleData.
 * Easy (1-4) -> medium (5-8) -> harder (9-10). Each method has its expected result in the comment.
 * Use streams only (no loops). Then remove @Disabled in Exercise07Test.
 */
public final class Exercise07 {

    private Exercise07() {
    }

    /** 1 (filter + map): ids of FAILED payments. Expected [P003, P012]. */
    public static List<String> failedPaymentIds() {
        throw new UnsupportedOperationException("TODO 1");
    }

    /** 2 (filter + map): PLATINUM customer names in uppercase (Locale.ROOT). Expected [CHEN WEI, FARAH AZIZ]. */
    public static List<String> platinumNamesUpper() {
        throw new UnsupportedOperationException("TODO 2");
    }

    /** 3 (mapToInt): total seats still free on all flights (seats - booked). Expected 270. */
    public static int totalSeatsLeft() {
        throw new UnsupportedOperationException("TODO 3");
    }

    /** 4 (filter + map): numbers of TRAVEL policies. Expected [POL-505, POL-509]. */
    public static List<String> travelPolicyNumbers() {
        throw new UnsupportedOperationException("TODO 4");
    }

    /** 5 (distinct): categories used by account ACC-1012, first-seen order. Expected [TRANSFER, GROCERIES, DINING, UTILITIES]. */
    public static List<Category> categoriesOf(String accountNumber) {
        throw new UnsupportedOperationException("TODO 5");
    }

    /**
     * 6 (flatMap): account numbers of customers who live in Singapore.
     * Expected [ACC-1001, ACC-1002, ACC-1004, ACC-1005, ACC-1006, ACC-1008, ACC-1014, ACC-1015].
     */
    public static List<String> singaporeAccountNumbers() {
        throw new UnsupportedOperationException("TODO 6");
    }

    /** 7 (sorted + limit): first 3 October transactions by date, then id. Expected [T038, T039, T040]. */
    public static List<String> firstThreeOctober() {
        throw new UnsupportedOperationException("TODO 7");
    }

    /** 8 (skip + limit): page 3 of payment ids, page size 4 (pages start at 1). Expected [P009, P010, P011, P012]. */
    public static List<String> paymentPage(int pageNo, int size) {
        throw new UnsupportedOperationException("TODO 8");
    }

    /** 9 (sorted + takeWhile): flight codes, in departure order, departing before 2026-11-06T12:00. Expected [TR808, SQ12]. */
    public static List<String> morningFlights() {
        throw new UnsupportedOperationException("TODO 9");
    }

    /**
     * 10 (mapMulti [16]): for each customer, in customer order, emit "customerId accountNumber" for every account
     * with a balance over 20000.00. Expected [C003 ACC-1004, C003 ACC-1006, C006 ACC-1009, C010 ACC-1015].
     */
    public static List<String> richAccounts() {
        throw new UnsupportedOperationException("TODO 10");
    }
}
