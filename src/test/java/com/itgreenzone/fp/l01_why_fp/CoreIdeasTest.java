package com.itgreenzone.fp.l01_why_fp;

import com.itgreenzone.fp.data.Account;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.l01_why_fp.modern.ModernDemo;
import com.itgreenzone.fp.l01_why_fp.theory.FeatureTimeline;
import com.itgreenzone.fp.l01_why_fp.theory.FunctionsAsValues;
import com.itgreenzone.fp.l01_why_fp.theory.ImmutabilityDemo;
import com.itgreenzone.fp.l01_why_fp.theory.LazinessDemo;
import com.itgreenzone.fp.l01_why_fp.theory.PureFunctions;
import com.itgreenzone.fp.testutil.StdOut;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotSame;
import static org.junit.jupiter.api.Assertions.assertThrows;

/** Functions as values, purity, immutability, laziness and the version timeline. */
class CoreIdeasTest {

    @ParameterizedTest(name = "GST on {0} = {1}")
    @CsvSource({"100.00, 109.00", "59.90, 65.29", "0.01, 0.01", "1000.00, 1090.00"})
    void addGstRoundsHalfUpToTwoDecimals(BigDecimal amount, BigDecimal expected) {
        assertEquals(expected, FunctionsAsValues.ADD_GST.apply(amount));
    }

    @ParameterizedTest(name = "{0}% off {1} = {2}")
    @CsvSource({"10, 100.00, 90.00", "10, 59.90, 53.91", "25, 80.00, 60.00", "0, 12.34, 12.34"})
    void discountOfReturnsAWorkingFunction(int percent, BigDecimal amount, BigDecimal expected) {
        assertEquals(expected, FunctionsAsValues.discountOf(percent).apply(amount));
    }

    @Test
    void functionsComposeWithAndThen() {
        List<BigDecimal> prices = List.of(new BigDecimal("100.00"), new BigDecimal("59.90"));
        assertEquals(List.of(new BigDecimal("98.10"), new BigDecimal("58.76")),
                FunctionsAsValues.applyToAll(prices, FunctionsAsValues.discountOf(10).andThen(FunctionsAsValues.ADD_GST)));
    }

    @ParameterizedTest(name = "fee on {0} = {1}")
    @CsvSource({"2500.00, 12.50", "100.00, 1.00", "200.00, 1.00", "201.00, 1.01", "0.00, 1.00"})
    void pureTransferFeeIsPredictable(BigDecimal amount, BigDecimal expectedFee) {
        assertEquals(expectedFee, PureFunctions.transferFee(amount));
        assertEquals(expectedFee, PureFunctions.transferFee(amount));
    }

    @Test
    void impureFeeChangesForTheSameInput() {
        var impure = new PureFunctions.ImpureFeeCalculator();
        BigDecimal amount = new BigDecimal("2500.00");
        assertEquals(new BigDecimal("12.50"), impure.transferFee(amount));
        impure.changeRate(new BigDecimal("0.010"));
        assertEquals(new BigDecimal("25.00"), impure.transferFee(amount));
        assertEquals(2, impure.callCount());
    }

    @Test
    void withdrawReturnsANewAccountAndKeepsTheOriginal() {
        Account original = SampleData.accounts().get(0);
        Account updated = ImmutabilityDemo.withdraw(original, new BigDecimal("500.00"));
        assertNotSame(original, updated);
        assertEquals(new BigDecimal("12500.00"), original.balance());
        assertEquals(new BigDecimal("12000.00"), updated.balance());
    }

    @Test
    void sampleListsRejectModification() {
        assertEquals("UnsupportedOperationException", ImmutabilityDemo.tryToModify(SampleData.transactions()));
        assertThrows(UnsupportedOperationException.class,
                () -> ModernDemo.highValueIds(SampleData.transactions()).add("X"));
    }

    @Test
    void nothingRunsWithoutATerminalOperation() {
        String printed = StdOut.capture(() -> LazinessDemo.buildOnly(SampleData.transactions()).close());
        assertEquals("", printed);
    }

    @Test
    void elementsFlowOneAtATime() {
        String printed = StdOut.capture(() ->
                assertEquals(List.of("T003", "T004"),
                        LazinessDemo.traceOverTwoHundred(SampleData.transactions().subList(0, 4))));
        assertEquals("""
                  filter T001
                  filter T002
                  filter T003
                  map    T003
                  filter T004
                  map    T004
                """, printed);
    }

    @Test
    void limitShortCircuitsAfterTheSecondMatch() {
        assertEquals(19, LazinessDemo.inspectedToFindFirstTwoHighValue(SampleData.transactions()));
    }

    @Test
    void predicateNotCountsTheRest() {
        assertEquals(49L, ModernDemo.countNotHighValue(SampleData.transactions()));
    }

    @Test
    void timelineIsSortedByVersion() {
        assertEquals(List.of(8, 9, 10, 11, 12, 14, 16, 17, 21), List.copyOf(FeatureTimeline.byVersion().keySet()));
        assertEquals(27, FeatureTimeline.FEATURES.size());
        assertEquals(List.of("Collectors.teeing"), FeatureTimeline.byVersion().get(12));
    }
}
