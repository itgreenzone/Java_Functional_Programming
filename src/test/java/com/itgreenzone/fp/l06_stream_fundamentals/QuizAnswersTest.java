package com.itgreenzone.fp.l06_stream_fundamentals;

import com.itgreenzone.fp.testutil.StdOut;
import org.junit.jupiter.api.Test;

import java.util.stream.IntStream;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** Runs the exact code of every "predict the output" question in L06_StreamFundamentals_Quiz.html. */
class QuizAnswersTest {

    @Test
    void q1SortedIsABarrier() {
        String out = StdOut.capture(() -> Stream.of("b", "a", "c")
                .peek(s -> System.out.print("p" + s + " "))
                .sorted()
                .forEach(s -> System.out.print(s.toUpperCase() + " ")));
        assertEquals("pb pa pc A B C ", out);
    }

    @Test
    void q2StreamsAreOneShot() {
        String out = StdOut.capture(() -> {
            Stream<String> s = Stream.of("SGD", "USD");
            System.out.print(s.count() + " ");
            try {
                System.out.print(s.count());
            } catch (IllegalStateException e) {
                System.out.print(e.getMessage());
            }
        });
        assertEquals("2 stream has already been operated upon or closed", out);
    }

    @Test
    void q3RangeVersusRangeClosed() {
        String out = StdOut.capture(() ->
                System.out.print(IntStream.rangeClosed(1, 5).sum() + IntStream.range(1, 5).sum()));
        assertEquals("25", out);
    }

    @Test
    void q4IterateWithCondition() {
        String out = StdOut.capture(() ->
                System.out.print(Stream.iterate(1, i -> i <= 20, i -> i * 3).toList()));
        assertEquals("[1, 3, 9]", out);
    }
}
