package com.itgreenzone.fp.l10_collectors;

import com.itgreenzone.fp.testutil.StdOut;
import org.junit.jupiter.api.Test;

import java.util.Map;
import java.util.TreeMap;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** Runs the exact code of every "predict the output" question in L10_Collectors_Quiz.html. */
class QuizAnswersTest {

    @Test
    void q1ToMapDuplicateKey() {
        String out = StdOut.capture(() -> {
            try {
                System.out.print(Stream.of("SQ12", "SQ21", "TR808")
                        .collect(Collectors.toMap(s -> s.substring(0, 2), Function.identity())));
            } catch (IllegalStateException e) {
                System.out.print("IllegalStateException");
            }
        });
        assertEquals("IllegalStateException", out);
    }

    @Test
    void q2ToMapMergeAndTreeMap() {
        String out = StdOut.capture(() -> {
            Map<String, Integer> m = Stream.of("SQ12", "TR808", "SQ21")
                    .collect(Collectors.toMap(s -> s.substring(0, 2), s -> 1, Integer::sum, TreeMap::new));
            System.out.print(m);
        });
        assertEquals("{SQ=2, TR=1}", out);
    }

    @Test
    void q3Joining() {
        String out = StdOut.capture(() -> System.out.print(Stream.of("P003", "P012")
                .collect(Collectors.joining(", ", "failed: [", "]"))));
        assertEquals("failed: [P003, P012]", out);
    }

    @Test
    void q4Teeing() {
        String out = StdOut.capture(() -> {
            String r = Stream.of(160, 471, 222)
                    .collect(Collectors.teeing(
                            Collectors.counting(),
                            Collectors.summingInt(Integer::intValue),
                            (n, sum) -> n + ":" + sum));
            System.out.print(r);
        });
        assertEquals("3:853", out);
    }
}
