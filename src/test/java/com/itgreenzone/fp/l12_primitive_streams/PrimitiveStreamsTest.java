package com.itgreenzone.fp.l12_primitive_streams;

import com.itgreenzone.fp.data.Flight;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.l12_primitive_streams.exercise.Exercise12;
import com.itgreenzone.fp.l12_primitive_streams.solution.Solution12;
import com.itgreenzone.fp.l12_primitive_streams.theory.BoxingAndConversions;
import com.itgreenzone.fp.l12_primitive_streams.theory.CharsAndRandom;
import com.itgreenzone.fp.l12_primitive_streams.theory.MoneyAndDoubles;
import com.itgreenzone.fp.l12_primitive_streams.theory.PrimitiveBasics;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.stream.IntStream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PrimitiveStreamsTest {

    private final List<Flight> flights = SampleData.flights();

    @Test
    void rangeIsHalfOpenRangeClosedIsNot() {
        assertEquals(10, PrimitiveBasics.sumRange(1, 5));
        assertEquals(15, PrimitiveBasics.sumRangeClosed(1, 5));
        assertEquals(0, PrimitiveBasics.sumRange(5, 5));
    }

    @Test
    void numericTerminals() {
        assertEquals(2078, PrimitiveBasics.totalSeats(flights));
        assertEquals(0, PrimitiveBasics.totalSeats(List.of()));
        assertEquals("259.75", String.valueOf(PrimitiveBasics.averageSeats(flights).getAsDouble()));
        assertFalse(PrimitiveBasics.averageSeats(List.of()).isPresent());
        assertEquals(455, PrimitiveBasics.maxBooked(flights).getAsInt());
        assertEquals("count=8 sum=2078 min=160 max=471 avg=259.75",
                PrimitiveBasics.format(PrimitiveBasics.seatStatistics(flights)));
    }

    @Test
    void getAsDoubleOnEmptyThrows() {
        assertThrows(NoSuchElementException.class, () -> IntStream.empty().average().getAsDouble());
    }

    @Test
    void iterateForms() {
        assertEquals(List.of(1, 2, 4, 8, 16, 32, 64, 128), PrimitiveBasics.doublings(8));
        assertEquals(List.of(1, 11, 21, 31, 41), PrimitiveBasics.seatRowsEvery10(42));
    }

    @Test
    void boxedAndPrimitiveTotalsAgree() {
        assertEquals(1808, BoxingAndConversions.totalBookedBoxed(flights));
        assertEquals(BoxingAndConversions.totalBookedBoxed(flights), BoxingAndConversions.totalBookedPrimitive(flights));
    }

    @Test
    void conversions() {
        assertEquals(List.of("1A", "1B", "1C", "1D", "1E", "1F"), BoxingAndConversions.rowLabels(1));
        assertEquals("{false=[1, 3, 5], true=[2, 4, 6]}", BoxingAndConversions.evenOddUpTo(6).toString());
        assertEquals("33.75", String.valueOf(BoxingAndConversions.averageEmptySeats(flights)));
        Map<Integer, String> numbered = BoxingAndConversions.numbered(flights);
        assertEquals("SQ318", numbered.get(1));
        assertEquals("GA827", numbered.get(8));
    }

    @Test
    void integerCacheTrap() {
        assertEquals("==true equals=true", BoxingAndConversions.identityTrap(100));
        assertEquals("==false equals=true", BoxingAndConversions.identityTrap(1000));
    }

    @Test
    void doubleIsNotForMoney() {
        assertEquals("0.30000000000000004", String.valueOf(MoneyAndDoubles.pointOnePlusPointTwo()));
        assertEquals("0.9999999999999999", String.valueOf(MoneyAndDoubles.tenTimesTenCentsLoop()));
        assertEquals("0.9999999999999999", String.valueOf(MoneyAndDoubles.tenTimesTenCentsReduce()));
        assertEquals("1.0", String.valueOf(MoneyAndDoubles.tenTimesTenCentsSum()));
        assertEquals("0.6000000000000001 vs 0.6", MoneyAndDoubles.orderMatters());
        assertEquals(new BigDecimal("1.00"), MoneyAndDoubles.tenTimesTenCentsExact());
    }

    @Test
    void bigDecimalPatternsAgree() {
        assertEquals(new BigDecimal("4429.84"), MoneyAndDoubles.total(SampleData.payments()));
        assertEquals(new BigDecimal("369.15"), MoneyAndDoubles.average(SampleData.payments()));
        assertEquals(new BigDecimal("0.00"), MoneyAndDoubles.average(List.of()));
        assertEquals(442984L, MoneyAndDoubles.totalCents(SampleData.payments()));
        assertEquals(MoneyAndDoubles.total(SampleData.payments()),
                MoneyAndDoubles.fromCents(MoneyAndDoubles.totalCents(SampleData.payments())));
    }

    @Test
    void charsGivesIntsNotChars() {
        assertEquals(List.of(83, 73, 78), CharsAndRandom.rawChars("SIN"));
        assertEquals(List.of('S', 'I', 'N'), CharsAndRandom.letters("SIN"));
    }

    @Test
    void characterFrequencyCountsEveryCharacter() {
        List<String> codes = flights.stream().map(Flight::code).toList();
        Map<Character, Long> freq = CharsAndRandom.charFrequency(codes);
        long totalChars = codes.stream().mapToInt(String::length).sum();
        assertEquals(totalChars, freq.values().stream().mapToLong(Long::longValue).sum());
        assertEquals("5", String.valueOf(freq.get('8')));
        assertEquals("22 digits, 16 letters", CharsAndRandom.digitsAndLetters(codes));
        assertEquals("G", CharsAndRandom.firstNonRepeated("SINGAPORE AIRLINES"));
        assertEquals("none", CharsAndRandom.firstNonRepeated("ABAB"));
    }

    @Test
    void codePointsCountRealCharacters() {
        assertEquals("chars=6 codePoints=5", CharsAndRandom.charsVsCodePoints("Pay 💳"));
    }

    @Test
    void seededRandomIsRepeatableAndInRange() {
        assertEquals(CharsAndRandom.diceRolls(42, 6), CharsAndRandom.diceRolls(42, 6));
        assertTrue(CharsAndRandom.diceRolls(1, 100).stream().allMatch(d -> d >= 1 && d <= 6));
        List<Integer> seats = CharsAndRandom.randomDistinctSeats(7, flights.get(3), 5);
        assertEquals(5, seats.stream().distinct().count());
        assertTrue(seats.stream().allMatch(s -> s >= 1 && s <= 160));
        assertFalse(CharsAndRandom.diceRolls(1, 20).equals(CharsAndRandom.diceRolls(2, 20)));
    }

    @Test
    void exerciseAndSolutionUseTheSamePnrs() {
        assertEquals(Exercise12.PNRS, Solution12.PNRS);
    }
}
