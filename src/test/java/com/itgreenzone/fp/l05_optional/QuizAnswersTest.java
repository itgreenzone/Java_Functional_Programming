package com.itgreenzone.fp.l05_optional;

import com.itgreenzone.fp.data.AccountType;
import com.itgreenzone.fp.data.Policy;
import com.itgreenzone.fp.l05_optional.theory.BankRepository;
import com.itgreenzone.fp.l05_optional.theory.TransformingOptionals;
import com.itgreenzone.fp.testutil.StdOut;
import org.junit.jupiter.api.Test;

import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.function.Supplier;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** Runs the exact code of every "predict the output" question in L05_Optional_Quiz.html. */
class QuizAnswersTest {

    @Test
    void q1OrElseArgumentIsAlwaysEvaluated() {
        String out = StdOut.capture(() -> {
            Supplier<String> fallback = () -> {
                System.out.print("F ");
                return "Default";
            };
            Optional<String> name = Optional.of("Alice");
            System.out.print(name.orElse(fallback.get()) + " ");
            System.out.print(name.orElseGet(fallback));
        });
        assertEquals("F Alice Alice", out);
    }

    @Test
    void q2FlatMapChain() {
        String out = StdOut.capture(() ->
                System.out.print(TransformingOptionals.latestAmount("C001", AccountType.SAVINGS) + " "
                        + TransformingOptionals.latestAmount("C999", AccountType.SAVINGS)));
        assertEquals("Optional[447.37] Optional.empty", out);
    }

    @Test
    void q3OrElseThrowOnEmpty() {
        String out = StdOut.capture(() -> {
            try {
                Optional.empty().orElseThrow();
            } catch (NoSuchElementException e) {
                System.out.print(e.getMessage());
            }
        });
        assertEquals("No value present", out);
    }

    @Test
    void q4OptionalStreamDropsEmpties() {
        String out = StdOut.capture(() ->
                System.out.print(Stream.of("POL-502", "POL-999", "POL-509")
                        .map(BankRepository::findPolicy)
                        .flatMap(Optional::stream)
                        .map(Policy::number)
                        .toList()));
        assertEquals("[POL-502, POL-509]", out);
    }
}
