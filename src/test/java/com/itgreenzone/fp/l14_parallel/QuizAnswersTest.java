package com.itgreenzone.fp.l14_parallel;

import com.itgreenzone.fp.testutil.StdOut;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.Spliterator;
import java.util.stream.IntStream;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** Runs the exact code of every "predict the output" question in L14_ParallelStreams_Quiz.html (each 20 times). */
class QuizAnswersTest {

    @Test
    void q1ToListKeepsEncounterOrder() {
        for (int i = 0; i < 20; i++) {
            String out = StdOut.capture(() -> System.out.print(
                    List.of(1, 2, 3, 4, 5).parallelStream().map(x -> x * 10).toList()));
            assertEquals("[10, 20, 30, 40, 50]", out);
        }
    }

    @Test
    void q2LastCallWins() {
        String out = StdOut.capture(() -> System.out.print(
                Stream.of(1, 2, 3).parallel().filter(x -> x > 1).sequential().isParallel()));
        assertEquals("false", out);
    }

    @Test
    void q3ArrayListSplitsInHalf() {
        String out = StdOut.capture(() -> {
            List<Integer> list = new ArrayList<>(IntStream.range(0, 16).boxed().toList());
            Spliterator<Integer> right = list.spliterator();
            Spliterator<Integer> left = right.trySplit();
            System.out.print(left.estimateSize() + " + " + right.estimateSize());
        });
        assertEquals("8 + 8", out);
    }

    @Test
    void q4ForEachOrdered() {
        for (int i = 0; i < 20; i++) {
            String out = StdOut.capture(() -> {
                StringBuilder sb = new StringBuilder();
                Stream.of("A", "B", "C", "D").parallel().forEachOrdered(sb::append);
                System.out.print(sb);
            });
            assertEquals("ABCD", out);
        }
    }
}
