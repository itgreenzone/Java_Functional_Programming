package com.itgreenzone.fp.l07_filter_map_slice;

import com.itgreenzone.fp.l07_filter_map_slice.after.StreamGoldStatement;
import com.itgreenzone.fp.l07_filter_map_slice.before.LegacyGoldStatement;
import com.itgreenzone.fp.l07_filter_map_slice.modern.ModernGoldStatement;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

/** before, after and modern must return the same page for every page size and page number. */
class GoldStatementRefactoringTest {

    @ParameterizedTest(name = "size {0}")
    @ValueSource(ints = {1, 2, 3, 5, 11, 12, 50})
    void allVersionsAgree(int size) {
        for (int page = 1; page <= 13; page++) {
            List<String> legacy = LegacyGoldStatement.page(page, size);
            assertEquals(legacy, StreamGoldStatement.page(page, size), "after p" + page);
            assertEquals(legacy, ModernGoldStatement.page(page, size).stream().map(Object::toString).toList(), "modern p" + page);
        }
    }

    @Test
    void documentedPages() {
        assertEquals(List.of(
                "2026-10-30 T060 ACC-1011 INSURANCE 194.28",
                "2026-10-12 T052 ACC-1014 TRANSFER 661.62",
                "2026-09-23 T033 ACC-1011 UTILITIES 306.29",
                "2026-09-06 T020 ACC-1002 DINING 170.53",
                "2026-09-03 T017 ACC-1001 GROCERIES 157.47"), StreamGoldStatement.page(1, 5));
        assertEquals(List.of("2026-08-02 T001 ACC-1014 GROCERIES 150.39"), StreamGoldStatement.page(3, 5));
        assertEquals(11, StreamGoldStatement.page(1, 100).size());
        assertEquals(List.of(), StreamGoldStatement.page(4, 5));
    }

    @Test
    void modernRejectsInvalidPages() {
        assertThrows(IllegalArgumentException.class, () -> ModernGoldStatement.page(0, 5));
        assertThrows(IllegalArgumentException.class, () -> ModernGoldStatement.page(1, 0));
    }
}
