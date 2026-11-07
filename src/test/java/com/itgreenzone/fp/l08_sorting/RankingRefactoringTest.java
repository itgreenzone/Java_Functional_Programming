package com.itgreenzone.fp.l08_sorting;

import com.itgreenzone.fp.l08_sorting.after.StreamCustomerRanking;
import com.itgreenzone.fp.l08_sorting.before.LegacyCustomerRanking;
import com.itgreenzone.fp.l08_sorting.modern.ModernCustomerRanking;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class RankingRefactoringTest {

    @Test
    void allVersionsProduceTheSameRanking() {
        List<String> legacy = LegacyCustomerRanking.ranking();
        assertEquals(10, legacy.size());
        assertEquals(legacy, StreamCustomerRanking.ranking());
        assertEquals(legacy, ModernCustomerRanking.ranking());
    }

    @Test
    void documentedRanking() {
        List<String> r = ModernCustomerRanking.ranking();
        assertEquals("1. C003 Chen Wei PLATINUM 163950.25", r.get(0));
        assertEquals("3. C010 Jasmine Ong GOLD 68900.00", r.get(2));
        assertEquals("10. C009 Irfan Hakim SILVER -150.25", r.get(9));
        assertEquals(List.of("C009", "C002", "C005"), ModernCustomerRanking.bottomThree());
    }
}
