package com.itgreenzone.fp.l02_functional_interfaces;

import com.itgreenzone.fp.l02_functional_interfaces.theory.Composition;
import com.itgreenzone.fp.testutil.StdOut;
import org.junit.jupiter.api.Test;

import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Supplier;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** Runs the exact code of every "predict the output" question in L02_FunctionalInterfaces_Quiz.html. */
class QuizAnswersTest {

    @Test
    void q1AndThenVersusCompose() {
        String out = StdOut.capture(() -> {
            Function<Integer, Integer> plus2 = x -> x + 2;
            Function<Integer, Integer> times3 = x -> x * 3;
            System.out.print(plus2.andThen(times3).apply(5) + " " + plus2.compose(times3).apply(5));
        });
        assertEquals("21 17", out);
    }

    @Test
    void q2SupplierIsLazy() {
        String out = StdOut.capture(() -> {
            Supplier<String> s = () -> {
                System.out.print("A");
                return "B";
            };
            System.out.print("C");
            System.out.print(s.get());
        });
        assertEquals("CAB", out);
    }

    @Test
    void q3NegateTheCombinedRule() {
        String out = StdOut.capture(() ->
                System.out.print(Composition.count(Composition.IS_DEBIT.and(Composition.IS_LARGE).negate())));
        assertEquals("57", out);
    }

    @Test
    void q4ConsumerAndThenOrder() {
        String out = StdOut.capture(() -> {
            Consumer<String> a = s -> System.out.print("A" + s);
            a.andThen(s -> System.out.print("B" + s)).accept("1");
        });
        assertEquals("A1B1", out);
    }
}
