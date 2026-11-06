package com.itgreenzone.fp.l01_why_fp;

import com.itgreenzone.fp.l01_why_fp.after.LambdaDemo;
import com.itgreenzone.fp.l01_why_fp.after.StreamDemo;
import com.itgreenzone.fp.l01_why_fp.before.AnonymousClassDemo;
import com.itgreenzone.fp.l01_why_fp.before.StrategyClassDemo;
import com.itgreenzone.fp.l01_why_fp.modern.ModernDemo;
import com.itgreenzone.fp.l01_why_fp.solution.Solution01;
import com.itgreenzone.fp.l01_why_fp.theory.FeatureTimeline;
import com.itgreenzone.fp.l01_why_fp.theory.FunctionsAsValues;
import com.itgreenzone.fp.l01_why_fp.theory.ImmutabilityDemo;
import com.itgreenzone.fp.l01_why_fp.theory.ImperativeVsDeclarative;
import com.itgreenzone.fp.l01_why_fp.theory.LazinessDemo;
import com.itgreenzone.fp.l01_why_fp.theory.PureFunctions;
import com.itgreenzone.fp.testutil.StdOut;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * Golden-file tests: every main() prints exactly what the slides, quiz and notes show.
 * Expected output lives in src/test/resources/l01/expected/&lt;ClassName&gt;.txt
 */
class MainOutputTest {

    @ParameterizedTest(name = "{0}")
    @ValueSource(classes = {
            ImperativeVsDeclarative.class, FunctionsAsValues.class, PureFunctions.class,
            ImmutabilityDemo.class, LazinessDemo.class, FeatureTimeline.class,
            StrategyClassDemo.class, AnonymousClassDemo.class, LambdaDemo.class,
            StreamDemo.class, ModernDemo.class, Solution01.class})
    void mainPrintsTheDocumentedOutput(Class<?> mainClass) throws IOException {
        assertEquals(expected(mainClass), StdOut.captureMain(mainClass));
    }

    private static String expected(Class<?> mainClass) throws IOException {
        String path = "/l01/expected/" + mainClass.getSimpleName() + ".txt";
        try (InputStream in = MainOutputTest.class.getResourceAsStream(path)) {
            if (in == null) {
                throw new IOException("Missing golden file " + path);
            }
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
