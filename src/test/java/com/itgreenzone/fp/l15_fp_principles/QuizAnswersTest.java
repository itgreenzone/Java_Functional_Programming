package com.itgreenzone.fp.l15_fp_principles;

import com.itgreenzone.fp.testutil.StdOut;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.function.Function;
import java.util.function.Supplier;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** Runs the exact code of every "predict the output" question in L15_FPPrinciples_Quiz.html. */
class QuizAnswersTest {

    @Test
    void q1AndThenVsCompose() {
        String out = StdOut.capture(() -> {
            Function<Integer, Integer> plus2 = x -> x + 2;
            Function<Integer, Integer> times10 = x -> x * 10;
            System.out.print(plus2.andThen(times10).apply(1) + " " + plus2.compose(times10).apply(1));
        });
        assertEquals("30 12", out);
    }

    @Test
    void q2UnmodifiableIsAView() {
        String out = StdOut.capture(() -> {
            List<String> src = new ArrayList<>(List.of("A"));
            List<String> view = Collections.unmodifiableList(src);
            src.add("B");
            System.out.print(view);
        });
        assertEquals("[A, B]", out);
    }

    @Test
    void q3OrElseIsEager() {
        String out = StdOut.capture(() -> {
            int[] calls = {0};
            Supplier<String> d = () -> "D" + (++calls[0]);
            Optional.of("X").orElse(d.get());
            Optional.of("X").orElseGet(d);
            System.out.print(calls[0]);
        });
        assertEquals("1", out);
    }

    @Test
    void q4Currying() {
        String out = StdOut.capture(() -> {
            Function<Integer, Function<Integer, Integer>> add = a -> b -> a + b;
            Function<Integer, Integer> add5 = add.apply(5);
            System.out.print(add5.apply(3) + add5.apply(10));
        });
        assertEquals("23", out);
    }
}
