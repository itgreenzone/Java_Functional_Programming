package com.itgreenzone.fp.l13_advanced;

import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.l13_advanced.theory.BatchesAndWindows;
import com.itgreenzone.fp.l13_advanced.theory.CustomCollectors;
import com.itgreenzone.fp.l13_advanced.theory.CustomCollectors.MoneyStats;
import com.itgreenzone.fp.l13_advanced.theory.GeneratingAndFlattening;
import com.itgreenzone.fp.l13_advanced.theory.MapTransforms;
import com.itgreenzone.fp.l13_advanced.theory.PagingWithSpliterator;
import com.itgreenzone.fp.l13_advanced.theory.PagingWithSpliterator.TransactionPages;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.IntStream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AdvancedOperationsTest {

    @Test
    void moneyStatsCollector() {
        MoneyStats s = CustomCollectors.paymentStats(SampleData.payments());
        assertEquals("count=12 sum=4429.84 min=18.80 max=1500.00 avg=369.15", s.toString());
        assertEquals(MoneyStats.EMPTY, CustomCollectors.paymentStats(List.of()));
        assertEquals("0.00", CustomCollectors.paymentStats(List.of()).average().toString());
    }

    @Test
    void moneyStatsCombinerGivesTheSameResultInParallel() {
        assertEquals(CustomCollectors.paymentStats(SampleData.payments()),
                CustomCollectors.paymentStatsParallel(SampleData.payments()));
        List<BigDecimal> many = IntStream.rangeClosed(1, 10_000).mapToObj(i -> BigDecimal.valueOf(i, 2)).toList();
        assertEquals(many.stream().collect(CustomCollectors.moneyStats()),
                many.parallelStream().collect(CustomCollectors.moneyStats()));
    }

    @Test
    void customCollectorAsDownstream() {
        Map<String, MoneyStats> perMethod = CustomCollectors.statsPerMethod(SampleData.payments());
        assertEquals("count=5 sum=2070.29 min=89.90 max=999.99 avg=414.06", perMethod.get("CARD").toString());
        long total = perMethod.values().stream().mapToLong(MoneyStats::count).sum();
        assertEquals(12L, total);
    }

    @Test
    void iterateGenerateConcat() {
        assertEquals(List.of(YearMonth.of(2026, 8), YearMonth.of(2026, 9), YearMonth.of(2026, 10), YearMonth.of(2026, 11)),
                GeneratingAndFlattening.statementMonths(YearMonth.of(2026, 8), YearMonth.of(2026, 11)));
        assertEquals(LocalDate.of(2026, 11, 2), GeneratingAndFlattening.weeklyReminders(LocalDate.of(2026, 11, 30), 4).get(0));
        assertEquals(List.of("------", "------"), GeneratingAndFlattening.emptyRows(2));
        List<String> concat = GeneratingAndFlattening.departuresThenArrivalsAtSin(SampleData.flights());
        assertEquals(8, concat.size());
        assertEquals("ARR GA827", concat.get(7));
    }

    @Test
    void flattening() {
        assertEquals(2, GeneratingAndFlattening.countPresent(Arrays.asList("A", null, "B", null)));
        assertEquals(27, GeneratingAndFlattening.singaporeTransactionCount(
                SampleData.customers(), SampleData.accounts(), SampleData.transactions()));
    }

    @Test
    void mergeLoopAndToMapAgree() {
        Map<String, BigDecimal> merged = MapTransforms.balancePerCustomerWithMerge(SampleData.accounts());
        assertEquals(merged, MapTransforms.balancePerCustomerWithStream(SampleData.accounts()));
        BigDecimal total = merged.values().stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        assertEquals(new BigDecimal("300382.25"), total);
    }

    @Test
    void computeFamily() {
        assertEquals(List.of("ACC-1004", "ACC-1005", "ACC-1006"), MapTransforms.accountsPerCustomer(SampleData.accounts()).get("C003"));
        assertEquals("{CURRENT=4, FIXED_DEPOSIT=2, SAVINGS=9}", MapTransforms.countPerType(SampleData.accounts()).toString());
    }

    @Test
    void entryStreamsBuildNewMapsAndKeepTheSource() {
        Map<String, BigDecimal> totals = MapTransforms.balancePerCustomerWithMerge(SampleData.accounts());
        Map<String, BigDecimal> copy = Map.copyOf(totals);
        assertEquals("{C003=163950.25, C010=68900.00, C006=36400.40}", MapTransforms.topBalances(totals, 3).toString());
        assertEquals("HIGH", MapTransforms.balanceBands(totals).get("C003"));
        assertEquals(new BigDecimal("15857.51"), MapTransforms.withInterestCredited(totals, new BigDecimal("0.01")).get("C001"));
        assertEquals(copy, totals);
    }

    @Test
    void chunking() {
        assertEquals(List.of(100, 100, 50), BatchesAndWindows.chunk(IntStream.rangeClosed(1, 250).boxed().toList(), 100)
                .stream().map(List::size).toList());
        assertEquals(List.of(), BatchesAndWindows.chunk(List.of(), 3));
        assertEquals(List.of(List.of(1, 2, 3)), BatchesAndWindows.chunk(List.of(1, 2, 3), 10));
        assertThrows(IllegalArgumentException.class, () -> BatchesAndWindows.chunk(List.of(1), 0));
    }

    @Test
    void windowsAndZip() {
        assertEquals(List.of(List.of(1, 2, 3), List.of(2, 3, 4), List.of(3, 4, 5)), BatchesAndWindows.windows(List.of(1, 2, 3, 4, 5), 3));
        assertEquals(List.of(), BatchesAndWindows.windows(List.of(1, 2), 3));
        assertEquals(List.of("A=1", "B=2"), BatchesAndWindows.zip(List.of("A", "B", "C"), List.of("1", "2")));
    }

    @Test
    void runningTotalsAgree() {
        List<BigDecimal> values = List.copyOf(BatchesAndWindows.monthlyDebits(SampleData.transactions()).values());
        assertEquals(BatchesAndWindows.runningTotalLoop(values), BatchesAndWindows.runningTotalQuadratic(values));
        assertEquals(new BigDecimal("15244.95"), BatchesAndWindows.runningTotalLoop(values).get(2));
        assertEquals(List.of(new BigDecimal("4706.15"), new BigDecimal("5965.30")), BatchesAndWindows.movingAverage(values, 2));
    }

    @Test
    void pagingIsLazy() {
        TransactionPages all = new TransactionPages(SampleData.transactions(), 25);
        assertEquals(60, PagingWithSpliterator.stream(all).count());
        assertEquals(4, all.fetches());
        TransactionPages first = new TransactionPages(SampleData.transactions(), 25);
        assertEquals("T001", PagingWithSpliterator.stream(first).findFirst().orElseThrow().id());
        assertEquals(1, first.fetches());
        TransactionPages tw = new TransactionPages(SampleData.transactions(), 7);
        List<String> ids = PagingWithSpliterator.streamWithTakeWhile(tw).map(t -> t.id()).toList();
        assertEquals(SampleData.transactions().stream().map(t -> t.id()).toList(), ids);
    }

    @Test
    void pagingWithEmptySource() {
        TransactionPages none = new TransactionPages(Collections.emptyList(), 25);
        assertEquals(0, PagingWithSpliterator.stream(none).count());
        assertTrue(none.fetches() >= 1);
    }
}
