package com.itgreenzone.fp.l06_stream_fundamentals;

import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.l06_stream_fundamentals.exercise.Exercise06;
import com.itgreenzone.fp.testutil.StdOut;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** Your predicted output must match what each pipeline really prints. */
@Disabled("Remove this line when you have written your predictions in Exercise06")
class Exercise06Test {

    private final List<Payment> five = SampleData.payments().subList(0, 5);

    @Test
    void pipeline1VerticalWithLimit() {
        assertEquals(Exercise06.EXPECTED_1, StdOut.capture(() -> Exercise06.pipeline1(five)));
    }

    @Test
    void pipeline2SortedBarrier() {
        assertEquals(Exercise06.EXPECTED_2, StdOut.capture(() -> Exercise06.pipeline2(five)));
    }

    @Test
    void pipeline3ShortCircuit() {
        assertEquals(Exercise06.EXPECTED_3, StdOut.capture(() -> Exercise06.pipeline3(five)));
    }

    @Test
    void pipeline4NoTerminal() {
        assertEquals(Exercise06.EXPECTED_4, StdOut.capture(() -> Exercise06.pipeline4(five)));
    }
}
