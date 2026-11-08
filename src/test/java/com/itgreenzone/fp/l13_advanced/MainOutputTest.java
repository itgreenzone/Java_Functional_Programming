package com.itgreenzone.fp.l13_advanced;

import com.itgreenzone.fp.l13_advanced.after.StreamPaymentStats;
import com.itgreenzone.fp.l13_advanced.before.LegacyPaymentStats;
import com.itgreenzone.fp.l13_advanced.modern.ModernPaymentStats;
import com.itgreenzone.fp.l13_advanced.solution.Solution13;
import com.itgreenzone.fp.l13_advanced.theory.BatchesAndWindows;
import com.itgreenzone.fp.l13_advanced.theory.CustomCollectors;
import com.itgreenzone.fp.l13_advanced.theory.GeneratingAndFlattening;
import com.itgreenzone.fp.l13_advanced.theory.MapTransforms;
import com.itgreenzone.fp.l13_advanced.theory.PagingWithSpliterator;
import com.itgreenzone.fp.testutil.StdOut;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** Golden-file tests: src/test/resources/l13/expected/&lt;ClassName&gt;.txt */
class MainOutputTest {

    @ParameterizedTest(name = "{0}")
    @ValueSource(classes = {
            CustomCollectors.class, GeneratingAndFlattening.class, MapTransforms.class, BatchesAndWindows.class,
            PagingWithSpliterator.class, LegacyPaymentStats.class, StreamPaymentStats.class, ModernPaymentStats.class,
            Solution13.class})
    void mainPrintsTheDocumentedOutput(Class<?> mainClass) throws IOException {
        assertEquals(expected(mainClass), StdOut.captureMain(mainClass));
    }

    private static String expected(Class<?> mainClass) throws IOException {
        String path = "/l13/expected/" + mainClass.getSimpleName() + ".txt";
        try (InputStream in = MainOutputTest.class.getResourceAsStream(path)) {
            if (in == null) {
                throw new IOException("Missing golden file " + path);
            }
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
