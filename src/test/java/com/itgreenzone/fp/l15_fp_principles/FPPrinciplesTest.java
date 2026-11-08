package com.itgreenzone.fp.l15_fp_principles;

import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.l15_fp_principles.theory.HigherOrderFunctions;
import com.itgreenzone.fp.l15_fp_principles.theory.ImmutabilityInDepth;
import com.itgreenzone.fp.l15_fp_principles.theory.ImmutabilityInDepth.Statement;
import com.itgreenzone.fp.l15_fp_principles.theory.LazinessAndMemoization;
import com.itgreenzone.fp.l15_fp_principles.theory.PurityAndEdges;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Function;
import java.util.function.Supplier;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class FPPrinciplesTest {

    @Test
    void pureFunctionTakesTheDate() {
        assertEquals(List.of("POL-509 in 5 days", "POL-505 in 13 days", "POL-502 in 23 days", "POL-508 in 28 days"),
                PurityAndEdges.expiringSoon(SampleData.policies(), PurityAndEdges.COURSE_DATE, 30));
        assertEquals(List.of(), PurityAndEdges.expiringSoon(SampleData.policies(), LocalDate.of(2030, 1, 1), 30));
    }

    @Test
    void clockAtTheEdgeIsTestable() {
        Clock fixed = Clock.fixed(LocalDate.of(2026, 11, 7).atStartOfDay().toInstant(ZoneOffset.UTC), ZoneOffset.UTC);
        assertEquals(PurityAndEdges.expiringSoon(SampleData.policies(), PurityAndEdges.COURSE_DATE, 30),
                PurityAndEdges.expiringSoon(SampleData.policies(), fixed, 30));
        assertTrue(PurityAndEdges.referentiallyTransparent());
        assertTrue(PurityAndEdges.impureSupplierChanges());
    }

    @Test
    void recordsNeedDefensiveCopies() {
        assertEquals("[T009, T012, T999]", ImmutabilityInDepth.naiveRecordLeaks());
        assertEquals("[T009, T012]", ImmutabilityInDepth.safeRecordDoesNotLeak());
        assertEquals("view=[A, B] copy=[A]", ImmutabilityInDepth.unmodifiableViewChanges());
        assertTrue(ImmutabilityInDepth.copyOfRejectsChanges());
    }

    @Test
    void compactConstructorValidatesAndCopies() {
        assertThrows(NullPointerException.class, () -> new Statement(null, List.of(), BigDecimal.ONE));
        assertThrows(NullPointerException.class, () -> new Statement("A", Arrays.asList("T1", null), BigDecimal.ONE));
        Statement s = new Statement("A", new ArrayList<>(List.of("T1")), new BigDecimal("5"));
        assertThrows(UnsupportedOperationException.class, () -> s.txnIds().add("T2"));
        assertEquals("original 12500.00, updated 12000.00", ImmutabilityInDepth.wither());
    }

    @Test
    void functionFactoriesAndCurrying() {
        BigDecimal p = new BigDecimal("1240.50");
        assertEquals(new BigDecimal("1116.45"), HigherOrderFunctions.percentOff(10).apply(p));
        assertEquals(new BigDecimal("904.33"), HigherOrderFunctions.applyTimes(HigherOrderFunctions.percentOff(10), 3, p));
        BigDecimal rate = new BigDecimal("0.0025");
        BigDecimal amount = new BigDecimal("1432.93");
        BigDecimal direct = HigherOrderFunctions.FEE.apply(rate, amount);
        assertEquals(direct, HigherOrderFunctions.CURRIED_FEE.apply(rate).apply(amount));
        assertEquals(direct, HigherOrderFunctions.curry(HigherOrderFunctions.FEE).apply(rate).apply(amount));
        assertEquals(direct, HigherOrderFunctions.partial(HigherOrderFunctions.FEE, rate).apply(amount));
        assertEquals(3L, SampleData.transactions().stream().filter(HigherOrderFunctions.debitAbove(new BigDecimal("1000"))).count());
    }

    @Test
    void composition() {
        assertEquals("andThen=30 compose=12", HigherOrderFunctions.andThenVsCompose());
        BigDecimal p = new BigDecimal("1240.50");
        assertEquals(p, HigherOrderFunctions.pipeline(List.of()).apply(p));
        Function<BigDecimal, BigDecimal> one = HigherOrderFunctions.pipeline(List.of(HigherOrderFunctions.percentOff(10)));
        assertEquals(new BigDecimal("1116.45"), one.apply(p));
    }

    @Test
    void lazinessAndMemoization() {
        assertEquals("orElse evaluated=1, orElseGet evaluated=0", LazinessAndMemoization.orElseVsOrElseGet());
        AtomicInteger built = new AtomicInteger();
        assertEquals(0, LazinessAndMemoization.lazyLog(false, () -> "x" + built.incrementAndGet()));
        assertEquals(0, built.get());
        AtomicInteger loads = new AtomicInteger();
        Supplier<Integer> once = LazinessAndMemoization.memoize(loads::incrementAndGet);
        assertEquals(once.get(), once.get());
        assertEquals(1, loads.get());
        assertEquals("12 calls, 2 real lookups", LazinessAndMemoization.fxLookups());
    }

    @Test
    void recursiveComputeIfAbsentFailsAndTheFixWorks() {
        assertEquals("HashMap.computeIfAbsent -> ConcurrentModificationException", LazinessAndMemoization.recursiveComputeIfAbsent());
        assertEquals(832040L, LazinessAndMemoization.fib(30, new HashMap<>()));
        assertEquals(2880067194370816120L, LazinessAndMemoization.fib(90, new HashMap<>()));
    }

    @Test
    void copyOfOfAnImmutableListMayReturnTheSameInstance() {
        assertSame(SampleData.transactions(), List.copyOf(SampleData.transactions()));
    }
}
