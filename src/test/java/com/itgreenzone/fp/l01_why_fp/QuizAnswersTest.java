package com.itgreenzone.fp.l01_why_fp;

import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;
import com.itgreenzone.fp.l01_why_fp.theory.FunctionsAsValues;
import com.itgreenzone.fp.testutil.StdOut;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

/** Runs the exact code of every "predict the output" question in L01_WhyFP_Quiz.html. */
class QuizAnswersTest {

    private static final BigDecimal LIMIT = new BigDecimal("200.00");

    @Test
    void q1ElementsFlowOneAtATime() {
        String out = StdOut.capture(() -> {
            List<String> ids = SampleData.transactions().subList(0, 4).stream()
                    .peek(t -> System.out.print("f" + t.id().substring(3) + " "))
                    .filter(t -> t.amount().compareTo(LIMIT) > 0)
                    .peek(t -> System.out.print("m" + t.id().substring(3) + " "))
                    .map(Transaction::id)
                    .toList();
            System.out.print(ids);
        });
        assertEquals("f1 f2 f3 m3 f4 m4 [T003, T004]", out);
    }

    @Test
    void q2NoTerminalOperationPrintsNothing() {
        String out = StdOut.capture(() -> {
            Stream<String> s = SampleData.transactions().stream()
                    .peek(t -> System.out.println("checking " + t.id()))
                    .filter(t -> t.amount().compareTo(LIMIT) > 0)
                    .map(Transaction::id);
            System.out.println("done");
            s.close();
        });
        assertEquals("done\n", out);
    }

    @Test
    void q3DiscountThenGst() {
        String out = StdOut.capture(() ->
                System.out.println(FunctionsAsValues.discountOf(10)
                        .andThen(FunctionsAsValues.ADD_GST)
                        .apply(new BigDecimal("59.90"))));
        assertEquals("58.76\n", out);
    }

    @Test
    void q4StreamToListIsUnmodifiable() {
        List<String> ids = Stream.of("T003", "T019").toList();
        assertThrows(UnsupportedOperationException.class, () -> ids.add("T025"));

        List<String> mutable = Stream.of("T003", "T019").collect(Collectors.toList());
        mutable.add("T025");                         // works today, but no guarantee in the Javadoc
        assertEquals("[T003, T019, T025]", mutable.toString());
    }

    @Test
    void q7SideEffectAndFixGiveSameIdsSequentially() {
        List<String> viaSideEffect = new ArrayList<>();
        SampleData.transactions().stream()
                .filter(HighValueRule::isHighValue)
                .forEach(t -> viaSideEffect.add(t.id()));
        List<String> viaPipeline = SampleData.transactions().stream()
                .filter(HighValueRule::isHighValue)
                .map(Transaction::id)
                .toList();
        assertEquals(viaPipeline, viaSideEffect);
        assertEquals(11, viaPipeline.size());
    }
}
