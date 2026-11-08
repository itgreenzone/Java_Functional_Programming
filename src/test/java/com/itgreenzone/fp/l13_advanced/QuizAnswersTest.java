package com.itgreenzone.fp.l13_advanced;

import com.itgreenzone.fp.testutil.StdOut;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.IntStream;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** Runs the exact code of every "predict the output" question in L13_AdvancedOperations_Quiz.html. */
class QuizAnswersTest {

    @Test
    void q1IterateWithPredicate() {
        String out = StdOut.capture(() -> System.out.print(Stream.iterate(1, n -> n <= 10, n -> n * 3).toList()));
        assertEquals("[1, 3, 9]", out);
    }

    @Test
    void q2MapMerge() {
        String out = StdOut.capture(() -> {
            Map<String, Integer> m = new TreeMap<>();
            for (String s : List.of("SIN", "KUL", "SIN")) {
                m.merge(s, 1, Integer::sum);
            }
            System.out.print(m);
        });
        assertEquals("{KUL=1, SIN=2}", out);
    }

    @Test
    void q3Chunking() {
        String out = StdOut.capture(() -> {
            List<Integer> l = List.of(1, 2, 3, 4, 5);
            System.out.print(IntStream.range(0, (l.size() + 1) / 2)
                    .mapToObj(i -> l.subList(i * 2, Math.min(l.size(), i * 2 + 2)))
                    .toList());
        });
        assertEquals("[[1, 2], [3, 4], [5]]", out);
    }

    @Test
    void q4OfNullable() {
        String out = StdOut.capture(() -> System.out.print(
                Stream.of("SQ12", null, "TR808").flatMap(Stream::ofNullable).count()));
        assertEquals("2", out);
    }
}
