package com.itgreenzone.fp.l12_primitive_streams;

import com.itgreenzone.fp.testutil.StdOut;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.stream.IntStream;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** Runs the exact code of every "predict the output" question in L12_PrimitiveStreams_Quiz.html. */
class QuizAnswersTest {

    @Test
    void q1RangeIsHalfOpen() {
        String out = StdOut.capture(() -> System.out.print(IntStream.range(1, 5).sum()));
        assertEquals("10", out);
    }

    @Test
    void q2AverageOfEmptyStream() {
        String out = StdOut.capture(() -> System.out.print(IntStream.of().average()));
        assertEquals("OptionalDouble.empty", out);
    }

    @Test
    void q3BoxedIdentity() {
        String out = StdOut.capture(() -> {
            List<Integer> a = IntStream.of(1000, 1000).boxed().toList();
            System.out.print((a.get(0) == a.get(1)) + " " + a.get(0).equals(a.get(1)));
        });
        assertEquals("false true", out);
    }

    @Test
    void q4CharsAreInts() {
        String out = StdOut.capture(() -> System.out.print("SIN".chars().boxed().toList()));
        assertEquals("[83, 73, 78]", out);
    }
}
