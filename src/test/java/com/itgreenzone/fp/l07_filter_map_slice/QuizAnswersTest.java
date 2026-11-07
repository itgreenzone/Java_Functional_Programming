package com.itgreenzone.fp.l07_filter_map_slice;

import com.itgreenzone.fp.testutil.StdOut;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.IntStream;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** Runs the exact code of every "predict the output" question in L07_FilterMapSlice_Quiz.html. */
class QuizAnswersTest {

    @Test
    void q1TakeWhileStopsAtTheFirstFailure() {
        String out = StdOut.capture(() ->
                System.out.print(Stream.of(5, 3, 8, 1).takeWhile(n -> n < 6).toList()));
        assertEquals("[5, 3]", out);
    }

    @Test
    void q2FlatMapNestedLists() {
        String out = StdOut.capture(() -> System.out.print(
                Stream.of(List.of(1, 2), List.of(3), List.<Integer>of())
                        .flatMap(List::stream)
                        .map(n -> n * 10)
                        .toList()));
        assertEquals("[10, 20, 30]", out);
    }

    @Test
    void q3DistinctUsesBigDecimalEquals() {
        String out = StdOut.capture(() -> System.out.print(
                Stream.of(new BigDecimal("2.0"), new BigDecimal("2.00"), new BigDecimal("2.0"))
                        .distinct()
                        .count()));
        assertEquals("2", out);
    }

    @Test
    void q4SkipThenLimit() {
        String out = StdOut.capture(() ->
                System.out.print(IntStream.rangeClosed(1, 10).skip(3).limit(4).sum()));
        assertEquals("22", out);
    }
}
