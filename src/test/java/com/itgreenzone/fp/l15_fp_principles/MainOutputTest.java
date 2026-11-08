package com.itgreenzone.fp.l15_fp_principles;

import com.itgreenzone.fp.l15_fp_principles.after.FunctionalFeeCalculator;
import com.itgreenzone.fp.l15_fp_principles.before.LegacyFeeCalculator;
import com.itgreenzone.fp.l15_fp_principles.modern.FeePipeline;
import com.itgreenzone.fp.l15_fp_principles.solution.Solution15;
import com.itgreenzone.fp.l15_fp_principles.theory.HigherOrderFunctions;
import com.itgreenzone.fp.l15_fp_principles.theory.ImmutabilityInDepth;
import com.itgreenzone.fp.l15_fp_principles.theory.LazinessAndMemoization;
import com.itgreenzone.fp.l15_fp_principles.theory.PurityAndEdges;
import com.itgreenzone.fp.testutil.StdOut;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** Golden-file tests: src/test/resources/l15/expected/&lt;ClassName&gt;.txt */
class MainOutputTest {

    @ParameterizedTest(name = "{0}")
    @ValueSource(classes = {
            PurityAndEdges.class, ImmutabilityInDepth.class, HigherOrderFunctions.class, LazinessAndMemoization.class,
            LegacyFeeCalculator.class, FunctionalFeeCalculator.class, FeePipeline.class, Solution15.class})
    void mainPrintsTheDocumentedOutput(Class<?> mainClass) throws IOException {
        assertEquals(expected(mainClass), StdOut.captureMain(mainClass));
    }

    private static String expected(Class<?> mainClass) throws IOException {
        String path = "/l15/expected/" + mainClass.getSimpleName() + ".txt";
        try (InputStream in = MainOutputTest.class.getResourceAsStream(path)) {
            if (in == null) {
                throw new IOException("Missing golden file " + path);
            }
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
