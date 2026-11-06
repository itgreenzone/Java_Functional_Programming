package com.itgreenzone.fp.l01_why_fp;

import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.l01_why_fp.theory.ImperativeVsDeclarative;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ImperativeVsDeclarativeTest {

    @Test
    void bothStylesGiveTheSameTotalOfDebits() {
        BigDecimal expected = new BigDecimal("16692.44");
        assertEquals(expected, ImperativeVsDeclarative.totalDebitsImperative(SampleData.transactions()));
        assertEquals(expected, ImperativeVsDeclarative.totalDebitsDeclarative(SampleData.transactions()));
    }

    @Test
    void emptyInputGivesZero() {
        assertEquals(BigDecimal.ZERO, ImperativeVsDeclarative.totalDebitsImperative(List.of()));
        assertEquals(BigDecimal.ZERO, ImperativeVsDeclarative.totalDebitsDeclarative(List.of()));
    }
}
