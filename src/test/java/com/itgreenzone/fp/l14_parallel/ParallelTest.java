package com.itgreenzone.fp.l14_parallel;

import com.itgreenzone.fp.l14_parallel.theory.HowParallelWorks;
import com.itgreenzone.fp.l14_parallel.theory.OrderingAndFindAny;
import com.itgreenzone.fp.l14_parallel.theory.ParallelDecision;
import com.itgreenzone.fp.l14_parallel.theory.ParallelDecision.Pipeline;
import com.itgreenzone.fp.l14_parallel.theory.ParallelDecision.Source;
import com.itgreenzone.fp.l14_parallel.theory.RaceDemo;
import com.itgreenzone.fp.l14_parallel.theory.ThreadSafetyPitfalls;
import com.itgreenzone.fp.l14_parallel.theory.VirtualThreadsContext;
import com.itgreenzone.fp.data.SampleData;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ParallelTest {

    @Test
    void splitting() {
        assertEquals("8 + 8", HowParallelWorks.splitArrayList(16));
        assertEquals("16 + 0", HowParallelWorks.splitLinkedList(16));
        assertTrue(HowParallelWorks.iterateHasUnknownSize());
        assertFalse(HowParallelWorks.lastCallWins());
        assertTrue(HowParallelWorks.onlyMainAndCommonPoolThreads());
    }

    @Test
    void orderingGuarantees() {
        assertTrue(OrderingAndFindAny.toListKeepsOrder());
        assertTrue(OrderingAndFindAny.forEachSameElements());
        assertTrue(OrderingAndFindAny.forEachOrderedKeepsOrder());
        assertEquals("P005", OrderingAndFindAny.firstLarge());
        assertTrue(OrderingAndFindAny.anyLargeIsAMatch());
        assertTrue(OrderingAndFindAny.unorderedLimitTakesSomeSuccesses());
    }

    @Test
    void findFirstIsDeterministicAcrossManyRuns() {
        for (int i = 0; i < 50; i++) {
            assertEquals("P005", OrderingAndFindAny.firstLarge());
        }
    }

    @Test
    void reduceRules() {
        assertEquals(-55, ThreadSafetyPitfalls.subtractSequential());
        assertEquals(65, ThreadSafetyPitfalls.wrongIdentitySequential());
        assertEquals(65, ThreadSafetyPitfalls.startingValueDoneRight(false));
        assertEquals(65, ThreadSafetyPitfalls.startingValueDoneRight(true));
        assertTrue(ThreadSafetyPitfalls.bigDecimalTotalIsStable());
    }

    @Test
    void safeAlternatives() {
        List<Integer> list = ThreadSafetyPitfalls.collectSafely(50_000);
        assertEquals(50_000, list.size());
        assertEquals(Integer.valueOf(49_999), list.get(49_999));
        assertEquals(ThreadSafetyPitfalls.countWithCount(100_000), ThreadSafetyPitfalls.countWithAtomic(100_000));
    }

    @Test
    void raceDemoNeverExceedsTheInput() {
        int size = RaceDemo.sharedListSize(10_000);
        assertTrue(size == -1 || size <= 10_000);
    }

    @Test
    void decisionChecklist() {
        assertEquals(List.of("N x Q = 12 is too small"),
                ParallelDecision.reasonsAgainst(new Pipeline(12, 1, Source.ARRAY_OR_ARRAYLIST, false, false, false)));
        assertTrue(ParallelDecision.reasonsAgainst(
                new Pipeline(5_000_000, 200, Source.ARRAY_OR_ARRAYLIST, false, false, false)).isEmpty());
        assertEquals(1, ParallelDecision.reasonsAgainst(
                new Pipeline(10_000, 1, Source.RANGE, true, false, false)).size());
        assertTrue(ParallelDecision.verdict(new Pipeline(1_000_000, 50, Source.LINKED_LIST, false, false, false))
                .startsWith("NOT parallel()"));
    }

    @Test
    void virtualThreadsForBlockingWork() {
        List<String> out = VirtualThreadsContext.enrichWithVirtualThreads(SampleData.payments());
        assertEquals(12, out.size());
        assertEquals("P001:virtual", out.get(0));
        assertEquals("P012:virtual", out.get(11));
        assertTrue(VirtualThreadsContext.parallelStreamUsesPlatformThreads());
    }
}
