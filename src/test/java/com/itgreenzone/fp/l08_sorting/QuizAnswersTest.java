package com.itgreenzone.fp.l08_sorting;

import com.itgreenzone.fp.data.Tier;
import com.itgreenzone.fp.testutil.StdOut;
import org.junit.jupiter.api.Test;

import java.util.Comparator;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** Runs the exact code of every "predict the output" question in L08_SortingComparators_Quiz.html. */
class QuizAnswersTest {

    @Test
    void q1ReversedReversesTheWholeChain() {
        String out = StdOut.capture(() -> System.out.print(Stream.of("a2", "b1", "a1")
                .sorted(Comparator.comparing((String s) -> s.charAt(0))
                        .thenComparing(s -> s.charAt(1))
                        .reversed())
                .toList()));
        assertEquals("[b1, a2, a1]", out);
    }

    @Test
    void q2NullsLast() {
        String out = StdOut.capture(() -> System.out.print(Stream.of("SQ12", null, "MH602")
                .sorted(Comparator.nullsLast(Comparator.naturalOrder()))
                .toList()));
        assertEquals("[MH602, SQ12, null]", out);
    }

    @Test
    void q3NaturalStringOrderIsCaseSensitive() {
        String out = StdOut.capture(() -> System.out.print(Stream.of("card", "PAYNOW", "Cash").sorted().toList()));
        assertEquals("[Cash, PAYNOW, card]", out);
    }

    @Test
    void q4EnumsSortByDeclarationOrder() {
        String out = StdOut.capture(() -> System.out.print(Stream.of(Tier.GOLD, Tier.SILVER, Tier.PLATINUM)
                .sorted(Comparator.reverseOrder())
                .toList()));
        assertEquals("[PLATINUM, GOLD, SILVER]", out);
    }
}
