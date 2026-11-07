package com.itgreenzone.fp.l04_method_references;

import com.itgreenzone.fp.l04_method_references.theory.Receipt;
import com.itgreenzone.fp.l04_method_references.theory.ReceiptPrinter;
import com.itgreenzone.fp.testutil.StdOut;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.function.BinaryOperator;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Supplier;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

/** Runs the exact code of every "predict the output" question in L04_MethodReferences_Quiz.html. */
class QuizAnswersTest {

    @Test
    void q1BoundReceiverIsEvaluatedOnce() {
        String out = StdOut.capture(() -> {
            Receipt r = new Receipt("P001", new BigDecimal("120.00"));
            Supplier<ReceiptPrinter> newPrinter = () -> {
                System.out.print("new ");
                return new ReceiptPrinter("X");
            };
            Consumer<Receipt> ref = newPrinter.get()::print;
            Consumer<Receipt> lam = x -> newPrinter.get().print(x);
            System.out.print("| ");
            ref.accept(r);
            ref.accept(r);
            lam.accept(r);
            lam.accept(r);
        });
        assertEquals("new | new new ", out);
    }

    @Test
    void q2NullReceiverThrowsWhenTheReferenceIsCreated() {
        StringBuilder printed = new StringBuilder();
        assertThrows(NullPointerException.class, () -> {
            String code = null;
            Supplier<Integer> lam = () -> code.length();
            printed.append("A ");
            Supplier<Integer> ref = code::length;
            printed.append("B").append(lam).append(ref);
        });
        assertEquals("A ", printed.toString());
    }

    @Test
    void q3UnboundAndBound() {
        String out = StdOut.capture(() -> {
            Function<String, Integer> f = String::length;
            Supplier<Integer> g = "PAYNOW"::length;
            System.out.print(f.apply("CARD") + g.get());
        });
        assertEquals("10", out);
    }

    @Test
    void q4ConstructorAndUnboundInAPipeline() {
        String out = StdOut.capture(() -> {
            BinaryOperator<BigDecimal> add = BigDecimal::add;
            System.out.print(Stream.of("120.00", "45.50").map(BigDecimal::new).reduce(BigDecimal.ZERO, add));
        });
        assertEquals("165.50", out);
    }
}
