package com.itgreenzone.fp.l06_stream_fundamentals;

import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.l06_stream_fundamentals.theory.LazinessAndFusion;
import com.itgreenzone.fp.l06_stream_fundamentals.theory.MethodMap;
import com.itgreenzone.fp.l06_stream_fundamentals.theory.StreamProperties;
import com.itgreenzone.fp.l06_stream_fundamentals.theory.StreamSources;
import com.itgreenzone.fp.l06_stream_fundamentals.theory.StreamVsCollection;
import org.junit.jupiter.api.Test;

import java.nio.file.Path;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class StreamBasicsTest {

    @Test
    void aStreamDoesNotChangeItsSourceAndIsOneShot() {
        assertEquals(List.of("P003", "P012"), StreamVsCollection.failedPaymentIds(SampleData.payments()));
        assertEquals(12, StreamVsCollection.sourceSizeAfterFiltering(SampleData.payments()));
        assertEquals("IllegalStateException: stream has already been operated upon or closed", StreamVsCollection.reuseMessage());
        Stream<String> s = Stream.of("A");
        s.count();
        assertThrows(IllegalStateException.class, s::count);
    }

    @Test
    void nothingRunsWithoutATerminalOperation() {
        List<String> trace = new ArrayList<>();
        LazinessAndFusion.withoutTerminal(SampleData.payments(), trace).close();
        assertEquals(List.of(), trace);
    }

    @Test
    void elementsFlowVerticallyAndLimitStopsEarly() {
        List<String> trace = new ArrayList<>();
        assertEquals(List.of("P001", "P003"), LazinessAndFusion.verticalOrder(SampleData.payments().subList(0, 5), trace));
        assertEquals(List.of("filter P001", "map P001", "filter P002", "filter P003", "map P003"), trace);
    }

    @Test
    void sortedIsABarrier() {
        List<String> trace = new ArrayList<>();
        assertEquals(List.of("P001", "P003", "P005"), LazinessAndFusion.sortedIsABarrier(SampleData.payments().subList(0, 5), trace));
        assertEquals(List.of("filter P001", "filter P002", "filter P003", "filter P004", "filter P005",
                "map P001", "map P003", "map P005"), trace);
    }

    @Test
    void sources() {
        assertEquals(4L, StreamSources.goldCustomers());
        assertEquals(List.of("CARD", "PAYNOW", "PAYPAL"), StreamSources.paymentMethods());
        assertEquals(2078, StreamSources.totalSeats());
        assertEquals(List.of(10, 11, 12), StreamSources.monthsOfQ4());
        assertEquals(List.of("2026-11-30", "2026-12-30", "2027-01-30"), StreamSources.nextThreeStatementDates(LocalDate.of(2026, 11, 30)));
        assertEquals(5, StreamSources.weeklyReviewDates(LocalDate.of(2026, 11, 2), LocalDate.of(2026, 11, 30)).size());
        assertEquals(List.of("PENDING", "PENDING", "PENDING"), StreamSources.initialStatuses(3));
        assertEquals(2L, StreamSources.countOf('P', "PAYPAL"));
        assertEquals(0L, StreamSources.ofNullableCount(null));
        assertEquals(1L, StreamSources.ofNullableCount("SGD"));
        assertEquals(List.of("Bangkok=1", "Colombo=1", "Jakarta=2", "Kuala Lumpur=2", "Singapore=4"), StreamSources.customersPerCity());
        Path csv = StreamSources.writePaymentsCsv();
        assertEquals(8L, StreamSources.successLines(csv));
    }

    @Test
    void properties() {
        assertEquals(3, StreamProperties.inspectedByAnyMatch(SampleData.payments()));
        assertEquals(List.of(1024, 2048, 4096), StreamProperties.firstPowersOfTwoOver(1000));
        assertEquals(List.of("CARD", "PAYNOW", "PAYPAL"), StreamProperties.distinctSortedMethods(SampleData.payments()));
        assertEquals("List ORDERED=true, HashSet ORDERED=false", StreamProperties.orderCharacteristics(SampleData.payments()));
        assertEquals("stream()=false, parallelStream()=true, parallel().sequential()=false", StreamProperties.parallelFlags(SampleData.payments()));
    }

    @Test
    void methodMapFacts() {
        assertEquals(24, MethodMap.OPS.size());
        assertEquals(List.of("mapMulti [16]", "takeWhile [9]", "dropWhile [9]", "toList [16]"), MethodMap.after(8));
        assertTrue(MethodMap.OPS.stream().filter(op -> op.name().equals("sorted")).allMatch(MethodMap.Op::stateful));
        assertEquals(4L, MethodMap.OPS.stream().filter(MethodMap.Op::shortCircuit).count());
        assertEquals(14, MethodMap.namesByKind().get(MethodMap.Kind.INTERMEDIATE).size());
    }
}
