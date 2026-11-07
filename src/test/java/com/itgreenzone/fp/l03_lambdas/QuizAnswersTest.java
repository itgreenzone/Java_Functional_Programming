package com.itgreenzone.fp.l03_lambdas;

import com.itgreenzone.fp.data.Flight;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.l03_lambdas.theory.Amounts;
import com.itgreenzone.fp.l03_lambdas.theory.ThisAndScope;
import com.itgreenzone.fp.l03_lambdas.theory.ThrowingFunction;
import com.itgreenzone.fp.l03_lambdas.theory.WrappedCheckedException;
import com.itgreenzone.fp.testutil.StdOut;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Supplier;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** Runs the exact code of every "predict the output" question in L03_Lambdas_Quiz.html. */
class QuizAnswersTest {

    @Test
    void q1ThisInLambdaVersusAnonymousClass() {
        String out = StdOut.capture(() -> {
            ThisAndScope s = new ThisAndScope("payment-service");
            System.out.print(s.lambdaThis().get() + " | " + s.anonymousThis().get());
        });
        assertEquals("payment-service | anonymous object", out);
    }

    @Test
    void q2ForEachLoopCapturesEachValue() {
        String out = StdOut.capture(() -> {
            List<Supplier<String>> list = new ArrayList<>();
            for (Flight f : SampleData.flights().subList(0, 3)) {
                list.add(() -> f.code());
            }
            list.forEach(s -> System.out.print(s.get() + " "));
        });
        assertEquals("SQ318 SQ12 TR808 ", out);
    }

    @Test
    void q3WrappedCheckedExceptionKeepsTheCause() {
        String out = StdOut.capture(() -> {
            List<String> raw = List.of("120.00", "abc");
            try {
                raw.stream().map(ThrowingFunction.unchecked(Amounts::parse)).toList();
            } catch (WrappedCheckedException e) {
                System.out.print(e.getCause().getMessage());
            }
        });
        assertEquals("Invalid amount: abc", out);
    }

    @Test
    void q4LambdaClassIsHiddenNotAnonymous() {
        String out = StdOut.capture(() -> {
            Runnable r = () -> { };
            System.out.print(r.getClass().isAnonymousClass() + " " + r.getClass().isHidden());
        });
        assertEquals("false true", out);
    }
}
