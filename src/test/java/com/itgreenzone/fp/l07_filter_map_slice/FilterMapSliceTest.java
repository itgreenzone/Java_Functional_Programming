package com.itgreenzone.fp.l07_filter_map_slice;

import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.l07_filter_map_slice.theory.DistinctAndPeek;
import com.itgreenzone.fp.l07_filter_map_slice.theory.Filtering;
import com.itgreenzone.fp.l07_filter_map_slice.theory.FlatMapping;
import com.itgreenzone.fp.l07_filter_map_slice.theory.Mapping;
import com.itgreenzone.fp.l07_filter_map_slice.theory.Slicing;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class FilterMapSliceTest {

    @Test
    void filteringUsesCompareToAndBothFormsAgree() {
        List<String> expected = List.of("T003", "T005", "T010", "T023", "T026", "T028", "T036", "T042", "T050", "T052", "T057");
        assertEquals(expected, Filtering.debitsOver(SampleData.transactions(), Filtering.FIVE_HUNDRED));
        assertEquals(expected, Filtering.debitsOverCombined(SampleData.transactions(), Filtering.FIVE_HUNDRED));
        assertEquals(List.of("T010 USD", "T023 USD"), Filtering.foreignCurrency(SampleData.transactions()));
        assertEquals(List.of("ACC-1013"), Filtering.overdrawn(SampleData.accounts()));
        assertEquals("equals=false, compareTo=0", Filtering.equalsVsCompareTo());
    }

    @Test
    void mappingToObjectsAndPrimitives() {
        List<String> upper = Mapping.upperNames(SampleData.customers());
        assertEquals(10, upper.size());
        assertEquals("ALICE TAN", upper.get(0));
        assertEquals("JASMINE ONG", upper.get(9));
        assertEquals(new Mapping.CustomerCard("C001", "ALICE TAN", com.itgreenzone.fp.data.Tier.GOLD),
                Mapping.cards(SampleData.customers()).get(0));
        assertEquals(1808, Mapping.totalBooked(SampleData.flights()));
        assertEquals("84.1%", Mapping.averageLoadFactor(SampleData.flights()));
        assertEquals(List.of("Page 1", "Page 2", "Page 3"), Mapping.pageLabels(3));
        assertEquals(List.of(16, 63, 6, 62, 27, 52, 2, 42), Mapping.seatsLeft(SampleData.flights()));
    }

    @Test
    void flatMapAndMapMultiGiveTheSameFlatStream() {
        List<String> gold = FlatMapping.goldTransactions(SampleData.customers());
        assertEquals(19, gold.size());
        assertEquals(List.of("T009", "T012", "T017", "T018", "T005"), gold.subList(0, 5));
        assertEquals(gold, FlatMapping.goldTransactionsMapMulti(SampleData.customers()));
        assertEquals(10L, FlatMapping.mapVersusFlatMap(SampleData.customers()));
        assertEquals(List.of("SIN", "NRT", "SIN", "LHR", "SIN"),
                FlatMapping.flattenItineraries(List.of(List.of("SIN", "NRT"), List.of("SIN", "LHR", "SIN"), List.of())));
        assertEquals(List.of("BKK", "CGK", "CMB", "EWR", "KUL", "LHR", "NRT", "SIN"), FlatMapping.airports(SampleData.flights()));
        assertEquals(List.of("SQ318", "TR808", "SQ21"), FlatMapping.nearlyFullFlights(SampleData.flights()));
    }

    @Test
    void distinctDependsOnEqualsAndKeepsFirstOccurrence() {
        assertEquals(List.of("Singapore", "Kuala Lumpur", "Jakarta", "Colombo", "Bangkok"),
                DistinctAndPeek.distinctCities(SampleData.customers()));
        assertEquals(9L, DistinctAndPeek.distinctRecords(SampleData.customers()));
        assertEquals(10L, DistinctAndPeek.distinctBeans(SampleData.customers()));
        assertEquals(2L, DistinctAndPeek.distinctBigDecimals());
        assertEquals(1L, DistinctAndPeek.distinctBigDecimalsNormalised());
    }

    @Test
    void peekShowsTheVerticalFlow() {
        assertEquals(List.of("in P001", "in P002", "in P003", "FAILED P003", "in P004", "result [P003]"),
                DistinctAndPeek.peekTrace(SampleData.payments().subList(0, 4)));
    }

    @Test
    void countMaySkipPeekOnASizedSource() {
        assertEquals("count=12 peeked=0 | with filter: count=2 peeked=12",
                DistinctAndPeek.peekSkippedByCount(SampleData.payments()));
    }

    @Test
    void slicingByPosition() {
        assertEquals(List.of("2026-08-02 T001", "2026-08-12 T002", "2026-08-13 T003", "2026-08-14 T004", "2026-08-16 T005"),
                Slicing.firstFiveByDate(SampleData.transactions()));
        List<String> ids = Slicing.transactionIds();
        assertEquals(List.of("T006", "T007", "T008", "T009", "T010"), Slicing.page(ids, 2, 5));
        assertEquals(List.of("T056", "T057", "T058", "T059", "T060"), Slicing.page(ids, 12, 5));
        assertEquals(List.of(), Slicing.page(ids, 13, 5));
        List<String> all = new ArrayList<>();
        for (int p = 1; p <= 7; p++) {
            all.addAll(Slicing.page(ids, p, 9));
        }
        assertEquals(ids, all);
        assertThrows(IllegalArgumentException.class, () -> Slicing.page(ids, 0, 5));
    }

    @Test
    void takeWhileAndDropWhileOnSortedInput() {
        Instant cut = Instant.parse("2026-11-03T00:00:00Z");
        assertEquals(List.of("P001", "P002", "P003", "P004", "P005", "P006"), Slicing.paidBefore(SampleData.payments(), cut));
        assertEquals(List.of("P007", "P008", "P009", "P010", "P011", "P012"), Slicing.paidFrom(SampleData.payments(), cut));
    }

    @Test
    void takeWhileOnUnsortedInputStopsEarly() {
        assertEquals(List.of("P001", "P002"), Slicing.smallPaymentsTakeWhile(SampleData.payments()));
        assertEquals(List.of("P001", "P002", "P004", "P006", "P007", "P009", "P011", "P012"),
                Slicing.smallPaymentsFilter(SampleData.payments()));
        assertEquals(List.of("P009", "P002", "P007", "P004", "P001", "P011", "P006", "P012"),
                Slicing.smallPaymentsSortedTakeWhile(SampleData.payments()));
    }

    @Test
    void takeWhileShortCircuitsAnInfiniteStream() {
        assertEquals(List.of(1, 2, 4, 8), Stream.iterate(1, n -> n * 2).takeWhile(n -> n < 10).toList());
    }
}
