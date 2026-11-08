package com.itgreenzone.fp.l14_parallel;

import com.itgreenzone.fp.l14_parallel.after.StreamFeeReport;
import com.itgreenzone.fp.l14_parallel.before.LegacyFeeReport;
import com.itgreenzone.fp.l14_parallel.modern.ModernFeeReport;
import com.itgreenzone.fp.l14_parallel.solution.Solution14;
import com.itgreenzone.fp.l14_parallel.theory.HowParallelWorks;
import com.itgreenzone.fp.l14_parallel.theory.OrderingAndFindAny;
import com.itgreenzone.fp.l14_parallel.theory.ParallelDecision;
import com.itgreenzone.fp.l14_parallel.theory.ThreadSafetyPitfalls;
import com.itgreenzone.fp.l14_parallel.theory.VirtualThreadsContext;
import com.itgreenzone.fp.testutil.StdOut;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * Golden-file tests: src/test/resources/l14/expected/&lt;ClassName&gt;.txt
 * RaceDemo is excluded on purpose: its output is non-deterministic by design.
 */
class MainOutputTest {

    @ParameterizedTest(name = "{0}")
    @ValueSource(classes = {
            HowParallelWorks.class, OrderingAndFindAny.class, ThreadSafetyPitfalls.class, ParallelDecision.class,
            VirtualThreadsContext.class, LegacyFeeReport.class, StreamFeeReport.class, ModernFeeReport.class,
            Solution14.class})
    void mainPrintsTheDocumentedOutput(Class<?> mainClass) throws IOException {
        assertEquals(expected(mainClass), StdOut.captureMain(mainClass));
    }

    private static String expected(Class<?> mainClass) throws IOException {
        String path = "/l14/expected/" + mainClass.getSimpleName() + ".txt";
        try (InputStream in = MainOutputTest.class.getResourceAsStream(path)) {
            if (in == null) {
                throw new IOException("Missing golden file " + path);
            }
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
