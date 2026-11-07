package com.itgreenzone.fp.l06_stream_fundamentals;

import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.l06_stream_fundamentals.after.StreamTopDebits;
import com.itgreenzone.fp.l06_stream_fundamentals.before.LegacyTopDebits;
import com.itgreenzone.fp.l06_stream_fundamentals.modern.ModernTopDebits;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class TopDebitsRefactoringTest {

    @ParameterizedTest(name = "top {0}")
    @ValueSource(ints = {0, 1, 3, 10, 100})
    void allVersionsAgreeForAnyN(int n) {
        List<String> legacy = LegacyTopDebits.topOctoberDebits(SampleData.transactions(), n);
        assertEquals(legacy, StreamTopDebits.topOctoberDebits(SampleData.transactions(), n));
        assertEquals(legacy, ModernTopDebits.topOctoberDebits(SampleData.transactions(), n).stream().map(Object::toString).toList());
    }

    @Test
    void documentedTop3() {
        assertEquals(List.of("T042 TRANSFER 1432.93", "T057 TRANSFER 962.80", "T050 TRANSFER 903.91"),
                StreamTopDebits.topOctoberDebits(SampleData.transactions(), 3));
    }

    @Test
    void iterateWithConditionBuildsWeeks() {
        assertEquals(List.of("2026-10-01: 5", "2026-10-08: 8", "2026-10-15: 0", "2026-10-22: 1", "2026-10-29: 2"),
                ModernTopDebits.octoberDebitsPerWeek(SampleData.transactions()));
    }
}
