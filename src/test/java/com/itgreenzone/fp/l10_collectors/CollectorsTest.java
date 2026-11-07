package com.itgreenzone.fp.l10_collectors;

import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.l10_collectors.theory.AggregatingCollectors;
import com.itgreenzone.fp.l10_collectors.theory.CollectionCollectors;
import com.itgreenzone.fp.l10_collectors.theory.ComposingCollectors;
import com.itgreenzone.fp.l10_collectors.theory.ToMapCollector;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;

class CollectorsTest {

    @Test
    void collectionCollectors() {
        assertEquals(Set.of("Bangkok", "Colombo", "Jakarta", "Kuala Lumpur", "Singapore"),
                CollectionCollectors.citiesAsSet(SampleData.customers()));
        assertEquals(List.of("Bangkok", "Colombo", "Jakarta", "Kuala Lumpur", "Singapore"),
                List.copyOf(CollectionCollectors.citiesSorted(SampleData.customers())));
        assertEquals(CollectionCollectors.citiesSorted(SampleData.customers()),
                CollectionCollectors.citiesHandWritten(SampleData.customers()));
        assertEquals("GA827", CollectionCollectors.flightStack(SampleData.flights()).peekLast());
        assertEquals("size 2, add -> UnsupportedOperationException", CollectionCollectors.unmodifiableSet());
    }

    @Test
    void toMapShapes() {
        Map<String, String> names = ToMapCollector.namesById(SampleData.customers());
        assertEquals(10, names.size());
        assertEquals("C001", names.keySet().iterator().next());
        assertEquals("Dewi Lestari", ToMapCollector.byId(SampleData.customers()).get("C004").name());
        assertEquals("IllegalStateException: Duplicate key Singapore (attempted merging values Alice Tan and Chen Wei)",
                ToMapCollector.duplicateKey(SampleData.customers()));
        assertEquals("Alice Tan, Chen Wei, Ethan Lim, Jasmine Ong", ToMapCollector.namesPerCity(SampleData.customers()).get("Singapore"));
        Map<String, BigDecimal> bal = ToMapCollector.balancePerCustomer(SampleData.accounts());
        assertEquals(List.of("C001", "C002", "C003", "C004", "C005", "C006", "C007", "C008", "C009", "C010"), List.copyOf(bal.keySet()));
        assertEquals(new BigDecimal("163950.25"), bal.get("C003"));
        assertEquals("NullPointerException", ToMapCollector.nullValue(SampleData.customers()));
    }

    @Test
    void aggregating() {
        assertEquals("Flights: [SQ318, SQ12, TR808, MH602, SQ938, UL309, SQ21, GA827]",
                AggregatingCollectors.flightCodes(SampleData.flights()));
        assertEquals(12L, AggregatingCollectors.countingCollector(SampleData.payments()));
        assertEquals(1808, AggregatingCollectors.totalBooked(SampleData.flights()));
        assertEquals("226.0", String.valueOf(AggregatingCollectors.averageBooked(SampleData.flights())));
        assertEquals("count=8 sum=2078 min=160 max=471 average=259.75", AggregatingCollectors.seatStatistics(SampleData.flights()));
        assertEquals(Optional.of("P005 1500.00"), AggregatingCollectors.largestPayment(SampleData.payments()));
        assertEquals(new BigDecimal("4429.84"), AggregatingCollectors.totalAmount(SampleData.payments()));
        assertEquals(new BigDecimal("4429.84"), AggregatingCollectors.totalAmountMapping(SampleData.payments()));
    }

    @Test
    void composing() {
        assertEquals("P005", ComposingCollectors.largestPaymentId(SampleData.payments()));
        assertEquals("none", ComposingCollectors.largestPaymentId(List.of()));
        assertEquals("Alice Tan | Dewi Lestari | Ganesh Perera | Jasmine Ong", ComposingCollectors.goldNames(SampleData.customers()));
        assertEquals(8L, ComposingCollectors.successCount(SampleData.payments()));
        assertEquals(List.of("ACC-1001", "ACC-1002", "ACC-1004", "ACC-1005", "ACC-1006", "ACC-1008", "ACC-1014", "ACC-1015"),
                ComposingCollectors.singaporeAccounts(SampleData.customers(), SampleData.accounts()));
        assertEquals("12 payments, total 4429.84", ComposingCollectors.countAndTotal(SampleData.payments()).toString());
        assertEquals("-150.25 .. 100000.00", ComposingCollectors.balanceRange(SampleData.accounts()));
    }
}
