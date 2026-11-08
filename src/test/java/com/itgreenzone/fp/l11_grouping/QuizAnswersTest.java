package com.itgreenzone.fp.l11_grouping;

import com.itgreenzone.fp.testutil.StdOut;
import org.junit.jupiter.api.Test;

import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** Runs the exact code of every "predict the output" question in L11_GroupingPartitioning_Quiz.html. */
class QuizAnswersTest {

    @Test
    void q1PartitioningAlwaysHasBothKeys() {
        String out = StdOut.capture(() -> {
            Map<Boolean, Long> m = Stream.of(120, 45, 89)
                    .collect(Collectors.partitioningBy(n -> n > 1000, Collectors.counting()));
            System.out.print(m);
        });
        assertEquals("{false=3, true=0}", out);
    }

    @Test
    void q2FilterBeforeGroupingDropsGroups() {
        String out = StdOut.capture(() -> {
            Map<String, Long> m = Stream.of("CARD:OK", "PAYNOW:FAIL", "CARD:OK")
                    .filter(s -> s.endsWith("FAIL"))
                    .collect(Collectors.groupingBy(s -> s.split(":")[0], TreeMap::new, Collectors.counting()));
            System.out.print(m);
        });
        assertEquals("{PAYNOW=1}", out);
    }

    @Test
    void q3FilteringKeepsGroups() {
        String out = StdOut.capture(() -> {
            Map<String, Long> m = Stream.of("CARD:OK", "PAYNOW:FAIL", "CARD:OK")
                    .collect(Collectors.groupingBy(s -> s.split(":")[0], TreeMap::new,
                            Collectors.filtering(s -> s.endsWith("FAIL"), Collectors.counting())));
            System.out.print(m);
        });
        assertEquals("{CARD=0, PAYNOW=1}", out);
    }

    @Test
    void q4MappingToJoiningPerGroup() {
        String out = StdOut.capture(() -> {
            Map<Integer, String> m = Stream.of("SQ12", "TR808", "SQ21", "GA827")
                    .collect(Collectors.groupingBy(String::length, TreeMap::new, Collectors.joining("+")));
            System.out.print(m);
        });
        assertEquals("{4=SQ12+SQ21, 5=TR808+GA827}", out);
    }
}
