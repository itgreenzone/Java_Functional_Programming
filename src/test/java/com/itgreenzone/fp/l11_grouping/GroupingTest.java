package com.itgreenzone.fp.l11_grouping;

import com.itgreenzone.fp.data.Category;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;
import com.itgreenzone.fp.l11_grouping.theory.ClassicTasks;
import com.itgreenzone.fp.l11_grouping.theory.DownstreamRecipes;
import com.itgreenzone.fp.l11_grouping.theory.GroupingBasics;
import com.itgreenzone.fp.l11_grouping.theory.MultiLevelAndPartitioning;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

class GroupingTest {

    @Test
    void basics() {
        assertEquals(4, GroupingBasics.customersByCity(SampleData.customers()).get("Singapore").size());
        assertEquals("{Bangkok=1, Colombo=1, Jakarta=2, Kuala Lumpur=2, Singapore=4}",
                GroupingBasics.countPerCity(SampleData.customers()).toString());
        assertEquals("{SILVER=[Bangkok, Jakarta, Kuala Lumpur, Singapore], GOLD=[Colombo, Jakarta, Singapore], PLATINUM=[Kuala Lumpur, Singapore]}",
                GroupingBasics.citiesPerTier(SampleData.customers()).toString());
        assertEquals("{CGK=162, SIN=1916}", GroupingBasics.seatsPerOrigin(SampleData.flights()).toString());
        assertEquals("T018", GroupingBasics.largestIdPerAccount(SampleData.transactions()).get("ACC-1001"));
        assertEquals(13, GroupingBasics.largestIdPerAccount(SampleData.transactions()).size());
    }

    @Test
    void filteringKeepsEmptyGroups() {
        assertEquals("{PAYNOW=1, PAYPAL=1}", DownstreamRecipes.failedPerMethodFilterFirst(SampleData.payments()).toString());
        assertEquals("{CARD=0, PAYNOW=1, PAYPAL=1}", DownstreamRecipes.failedPerMethodFiltering(SampleData.payments()).toString());
        assertEquals("{CARD=5/2070.29, PAYNOW=4/1824.30, PAYPAL=3/535.25}",
                DownstreamRecipes.countAndTotalPerMethod(SampleData.payments()).toString());
        assertEquals(List.of("ACC-1004", "ACC-1005", "ACC-1006", "ACC-1009", "ACC-1010"),
                DownstreamRecipes.accountsPerTier(SampleData.customers(), SampleData.accounts()).get(com.itgreenzone.fp.data.Tier.PLATINUM));
    }

    @Test
    void groupedTotalsPreserveTheGrandTotal() {
        Map<Category, BigDecimal> perCategory = DownstreamRecipes.totalPerCategory(SampleData.transactions());
        BigDecimal sumOfGroups = perCategory.values().stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal grand = SampleData.transactions().stream().map(Transaction::amount).reduce(BigDecimal.ZERO, BigDecimal::add);
        assertEquals(grand, sumOfGroups);
        assertEquals(new BigDecimal("10362.65"), perCategory.get(Category.TRANSFER));
    }

    @Test
    void multiLevelAndPartitioning() {
        assertEquals("{SILVER=1, GOLD=2, PLATINUM=1}", MultiLevelAndPartitioning.cityTierCount(SampleData.customers()).get("Singapore").toString());
        assertEquals(9, MultiLevelAndPartitioning.cityTierFlat(SampleData.customers()).size());
        assertEquals("{false=4, true=8}", MultiLevelAndPartitioning.successPartition(SampleData.payments()).toString());
        assertEquals("{false=1430.65, true=2999.19}", MultiLevelAndPartitioning.successTotals(SampleData.payments()).toString());
        assertEquals("partitioningBy={false=8, true=0} groupingBy={false=8}",
                MultiLevelAndPartitioning.overbookedPartitionVsGrouping(SampleData.flights()));
    }

    @Test
    void classicTasks() {
        assertEquals(List.of("T049", "T055", "T042"), ClassicTasks.top3PerAccount(SampleData.transactions()).get("ACC-1003"));
        assertEquals("ACC-1006", ClassicTasks.richestAccountPerCustomer(SampleData.accounts()).get("C003"));
        assertEquals("{CGK=1, SIN=7}", ClassicTasks.flightsPerOrigin(SampleData.flights()).toString());
        assertEquals("[POL-502, POL-505, POL-509]",
                ClassicTasks.policiesByExpiryMonth(SampleData.policies()).get(java.time.YearMonth.of(2026, 11)).toString());
        assertEquals(List.of("TRANSFER=15", "DINING=10", "SALARY=8"), ClassicTasks.topCategoriesByCount(SampleData.transactions(), 3));
        assertEquals("{Bangkok=[C008], Colombo=[C007], Jakarta=[C004, C009], Kuala Lumpur=[C002, C006], Singapore=[C001, C003, C005, C010]}",
                ClassicTasks.invert(ClassicTasks.idToCity(SampleData.customers())).toString());
    }
}
