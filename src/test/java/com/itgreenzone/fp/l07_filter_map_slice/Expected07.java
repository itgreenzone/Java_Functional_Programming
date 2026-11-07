package com.itgreenzone.fp.l07_filter_map_slice;

import com.itgreenzone.fp.data.Category;

import java.util.List;

/** Expected results of the 10 mini-tasks, shared by Exercise07Test and Solution07Test. */
final class Expected07 {

    static final List<String> FAILED = List.of("P003", "P012");
    static final List<String> PLATINUM_UPPER = List.of("CHEN WEI", "FARAH AZIZ");
    static final int SEATS_LEFT = 270;
    static final List<String> TRAVEL = List.of("POL-505", "POL-509");
    static final List<Category> ACC_1012_CATEGORIES =
            List.of(Category.TRANSFER, Category.GROCERIES, Category.DINING, Category.UTILITIES);
    static final List<String> SINGAPORE_ACCOUNTS =
            List.of("ACC-1001", "ACC-1002", "ACC-1004", "ACC-1005", "ACC-1006", "ACC-1008", "ACC-1014", "ACC-1015");
    static final List<String> FIRST_THREE_OCTOBER = List.of("T038", "T039", "T040");
    static final List<String> PAYMENT_PAGE_3_OF_4 = List.of("P009", "P010", "P011", "P012");
    static final List<String> MORNING_FLIGHTS = List.of("TR808", "SQ12");
    static final List<String> RICH_ACCOUNTS = List.of("C003 ACC-1004", "C003 ACC-1006", "C006 ACC-1009", "C010 ACC-1015");

    private Expected07() {
    }
}
