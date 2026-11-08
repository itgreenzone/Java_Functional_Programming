package com.itgreenzone.fp.l16_records_sealed;

import com.itgreenzone.fp.testutil.StdOut;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** Runs the exact code of every "predict the output" question in L16_RecordsSealedPatterns_Quiz.html. */
class QuizAnswersTest {

    sealed interface Result permits Ok, Fail { }

    record Ok(int amount) implements Result { }

    record Fail(String reason) implements Result { }

    record M(BigDecimal a) { }

    @Test
    void q1RecordPatternWithGuard() {
        String out = StdOut.capture(() -> {
            Result r = new Ok(1500);
            String s = switch (r) {
                case Ok(var a) when a >= 1000 -> "large " + a;
                case Ok(var a) -> "ok " + a;
                case Fail(var why) -> "fail " + why;
            };
            System.out.print(s);
        });
        assertEquals("large 1500", out);
    }

    @Test
    void q2InstanceofPatternScope() {
        String out = StdOut.capture(() -> {
            Object o = "SQ12";
            if (o instanceof String s && s.length() > 3) {
                System.out.print(s.toLowerCase());
            } else {
                System.out.print("no");
            }
        });
        assertEquals("sq12", out);
    }

    @Test
    void q3ReversedIsAView() {
        String out = StdOut.capture(() -> {
            List<String> ids = new ArrayList<>(List.of("A", "B"));
            List<String> rev = ids.reversed();
            ids.addFirst("Z");
            System.out.print(rev);
        });
        assertEquals("[B, A, Z]", out);
    }

    @Test
    void q4RecordEqualsUsesComponentEquals() {
        String out = StdOut.capture(() ->
                System.out.print(new M(new BigDecimal("5")).equals(new M(new BigDecimal("5.00")))));
        assertEquals("false", out);
    }
}
