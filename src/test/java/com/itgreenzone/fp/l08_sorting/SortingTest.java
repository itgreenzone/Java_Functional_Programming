package com.itgreenzone.fp.l08_sorting;

import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Tier;
import com.itgreenzone.fp.l08_sorting.theory.ChainingAndReversed;
import com.itgreenzone.fp.l08_sorting.theory.ComparatorFactories;
import com.itgreenzone.fp.l08_sorting.theory.NaturalVsComparator;
import com.itgreenzone.fp.l08_sorting.theory.NullsAndStability;
import com.itgreenzone.fp.l08_sorting.theory.SortingMapsAndLists;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SortingTest {

    @Test
    void naturalOrdering() {
        assertEquals(List.of("Bangkok", "Colombo", "Jakarta", "Kuala Lumpur", "Singapore"),
                NaturalVsComparator.citiesNatural(SampleData.customers()));
        assertTrue(NaturalVsComparator.sortCustomersNaturally(SampleData.customers()).startsWith("ClassCastException"));
        assertEquals(List.of(Tier.SILVER, Tier.GOLD, Tier.GOLD, Tier.PLATINUM), NaturalVsComparator.tiersNatural());
        assertEquals(List.of("-1", "9.5", "10.00", "10.0"), NaturalVsComparator.bigDecimalNatural());
        assertEquals("Bangkok/C008", NaturalVsComparator.customersByCity(SampleData.customers()).get(0));
    }

    @Test
    void factories() {
        List<String> top3 = List.of("POL-505 185.00", "POL-509 210.00", "POL-504 720.00");
        assertEquals(top3, ComparatorFactories.policiesByPremium(ComparatorFactories.BY_PREMIUM_JAVA7));
        assertEquals(top3, ComparatorFactories.policiesByPremium(ComparatorFactories.BY_PREMIUM));
        assertEquals("MH602 160", ComparatorFactories.flightsBySeats().get(0));
        assertEquals(List.of("MH602", "GA827", "SQ12", "UL309", "SQ938", "SQ318", "TR808", "SQ21"),
                ComparatorFactories.flightsByLoadFactor());
        assertEquals(List.of("Singapore", "Kuala Lumpur", "Jakarta", "Colombo", "Bangkok"),
                ComparatorFactories.citiesZtoA(SampleData.customers()));
        assertEquals("natural [CARD, PayPal, card, paynow] | case-insensitive [CARD, card, paynow, PayPal]",
                ComparatorFactories.caseSensitivity());
        assertEquals(List.of(471, 222, 160), ComparatorFactories.seatsDescending());
    }

    @Test
    void reversedReversesTheWholeChain() {
        List<String> asc = ChainingAndReversed.sortedIds(ChainingAndReversed.TIER_THEN_NAME);
        assertEquals(List.of("C002", "C005", "C008", "C009", "C001", "C004", "C007", "C010", "C003", "C006"), asc);
        assertEquals(asc.reversed(), ChainingAndReversed.sortedIds(ChainingAndReversed.WRONG_TIER_DESC_NAME_ASC));
        assertEquals(List.of("C003", "C006", "C001", "C004", "C007", "C010", "C002", "C005", "C008", "C009"),
                ChainingAndReversed.sortedIds(ChainingAndReversed.TIER_DESC_NAME_ASC));
        assertEquals(List.of("C003", "C006", "C010", "C001", "C004", "C007", "C008", "C005", "C002", "C009"),
                ChainingAndReversed.sortedIds(ChainingAndReversed.RANKING));
    }

    @Test
    void nullsAndStability() {
        assertEquals("NullPointerException", NullsAndStability.withoutNullHandling());
        List<NullsAndStability.Activity> recent = NullsAndStability.recentFirstNullsLast();
        assertEquals("ACC-1011=2026-10-30", recent.get(0).toString());
        assertEquals("ACC-1006=null", recent.get(13).toString());
        assertEquals("ACC-1015=null", recent.get(14).toString());
        assertEquals(List.of("ACC-1006", "ACC-1015", "ACC-1001", "ACC-1002"), NullsAndStability.dormantFirst());
        List<String> aug = NullsAndStability.augustByDateStable();
        assertEquals(List.of("26:T012", "26:T013"), aug.subList(2, 4));
        assertEquals(List.of("22:T009", "22:T010"), aug.subList(5, 7));
    }

    @Test
    void mapsAndLists() {
        assertEquals(List.of("ACC-1003=7", "ACC-1004=6", "ACC-1008=6"), SortingMapsAndLists.busiestAccounts(3));
        assertEquals("UnsupportedOperationException", SortingMapsAndLists.listSortOnImmutable());
        assertEquals("first in source=SQ318, first sorted=GA827", SortingMapsAndLists.streamSortedLeavesSource());
        assertEquals(SortingMapsAndLists.listSortInPlace().getLast(), SortingMapsAndLists.reversedView().getFirst());
        assertEquals("SQ318", SampleData.flights().get(0).code());
    }
}
