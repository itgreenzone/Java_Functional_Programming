package com.itgreenzone.fp.l09_terminal_ops;

import com.itgreenzone.fp.testutil.StdOut;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** Runs the exact code of every "predict the output" question in L09_TerminalReduction_Quiz.html. */
class QuizAnswersTest {

    @Test
    void q1EmptyStreamMatches() {
        String out = StdOut.capture(() -> {
            List<String> none = List.of();
            System.out.print(none.stream().allMatch(s -> s.isEmpty()) + " " + none.stream().anyMatch(s -> true));
        });
        assertEquals("true false", out);
    }

    @Test
    void q2ReduceFormsOnEmpty() {
        String out = StdOut.capture(() -> System.out.print(
                Stream.<BigDecimal>empty().reduce(BigDecimal.ZERO, BigDecimal::add) + " "
                        + Stream.<BigDecimal>empty().reduce(BigDecimal::add)));
        assertEquals("0 Optional.empty", out);
    }

    @Test
    void q3ToListIsUnmodifiable() {
        String out = StdOut.capture(() -> {
            List<String> ids = Stream.of("P001", "P002").toList();
            try {
                ids.add("P003");
                System.out.print(ids.size());
            } catch (UnsupportedOperationException e) {
                System.out.print("UnsupportedOperationException");
            }
        });
        assertEquals("UnsupportedOperationException", out);
    }

    @Test
    void q4ReduceWithIdentity() {
        String out = StdOut.capture(() -> System.out.print(
                Stream.of(new BigDecimal("10.50"), new BigDecimal("2.25"))
                        .reduce(BigDecimal.ONE, BigDecimal::add)));
        assertEquals("13.75", out);
    }
}
