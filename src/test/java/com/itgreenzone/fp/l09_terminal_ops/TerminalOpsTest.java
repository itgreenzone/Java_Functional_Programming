package com.itgreenzone.fp.l09_terminal_ops;

import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.l09_terminal_ops.theory.CollectingResults;
import com.itgreenzone.fp.l09_terminal_ops.theory.MatchFindCount;
import com.itgreenzone.fp.l09_terminal_ops.theory.Reducing;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.TreeSet;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TerminalOpsTest {

    @Test
    void collectingResults() {
        assertEquals(List.of("SQ318", "SQ12", "TR808", "MH602", "SQ938", "UL309", "SQ21", "GA827"),
                CollectingResults.forEachOrderedParallel());
        Set<String> all = new TreeSet<>(List.of("GA827", "MH602", "SQ12", "SQ21", "SQ318", "SQ938", "TR808", "UL309"));
        assertEquals(all, CollectingResults.forEachParallel());
        assertEquals("toList().add -> UnsupportedOperationException", CollectingResults.toListIsUnmodifiable());
        assertEquals("ArrayList size 13", CollectingResults.collectorsToListToday());
        assertEquals("toList()=[SQ12, null], toUnmodifiableList()=NullPointerException", CollectingResults.nullsInLists());
        assertEquals("String[] [SQ318, SQ12, TR808] vs Object[]", CollectingResults.toArrayTyped());
    }

    @Test
    void reduceForms() {
        assertEquals(new BigDecimal("300382.25"), Reducing.totalBalance(SampleData.accounts()));
        assertEquals(Optional.of(new BigDecimal("7721.99")), Reducing.largestAmount(SampleData.transactions()));
        assertEquals(2078, Reducing.totalSeats(SampleData.flights()));
        assertEquals(2078, Reducing.totalSeatsMapToInt(SampleData.flights()));
        assertEquals(new BigDecimal("1082.65"), Reducing.averagePremium(SampleData.policies()));
        assertEquals("sequential=-55, parallel differs=true", Reducing.nonAssociative());
        assertEquals("sequential=155, parallel bigger=true", Reducing.wrongIdentity());
        assertEquals("identity form=0, optional form=Optional.empty", Reducing.emptyStreams());
        assertEquals(Optional.empty(), Reducing.largestAmount(List.of()));
    }

    @Test
    void matchFindCount() {
        assertEquals(1, MatchFindCount.refundedCount(SampleData.payments()));
        assertEquals("T049", MatchFindCount.highest(SampleData.transactions()).orElseThrow().id());
        assertEquals("T046", MatchFindCount.lowest(SampleData.transactions()).orElseThrow().id());
        assertTrue(MatchFindCount.anyOverdrawn(SampleData.accounts()));
        assertFalse(MatchFindCount.anyOverdrawn(SampleData.accounts().subList(0, 12)));
        assertTrue(MatchFindCount.allAmountsPositive(SampleData.transactions()));
        assertTrue(MatchFindCount.noneInEur(SampleData.transactions()));
        assertEquals("anyMatch=false allMatch=true noneMatch=true", MatchFindCount.emptyStreamMatches());
        assertEquals(Optional.of("P003"), MatchFindCount.firstFailed(SampleData.payments()));
        assertTrue(Set.of("P003", "P012").contains(MatchFindCount.anyFailedParallel(SampleData.payments()).orElseThrow()));
    }
}
