package com.itgreenzone.fp.l10_collectors;

import com.itgreenzone.fp.l10_collectors.after.StreamPortfolioSummary;
import com.itgreenzone.fp.l10_collectors.before.LegacyPortfolioSummary;
import com.itgreenzone.fp.l10_collectors.modern.ModernPortfolioSummary;
import com.itgreenzone.fp.l10_collectors.solution.Solution10;
import com.itgreenzone.fp.l10_collectors.theory.AggregatingCollectors;
import com.itgreenzone.fp.l10_collectors.theory.CollectionCollectors;
import com.itgreenzone.fp.l10_collectors.theory.ComposingCollectors;
import com.itgreenzone.fp.l10_collectors.theory.ToMapCollector;
import com.itgreenzone.fp.testutil.StdOut;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** Golden-file tests: src/test/resources/l10/expected/&lt;ClassName&gt;.txt */
class MainOutputTest {

    @ParameterizedTest(name = "{0}")
    @ValueSource(classes = {
            CollectionCollectors.class, ToMapCollector.class, AggregatingCollectors.class, ComposingCollectors.class,
            LegacyPortfolioSummary.class, StreamPortfolioSummary.class, ModernPortfolioSummary.class, Solution10.class})
    void mainPrintsTheDocumentedOutput(Class<?> mainClass) throws IOException {
        assertEquals(expected(mainClass), StdOut.captureMain(mainClass));
    }

    private static String expected(Class<?> mainClass) throws IOException {
        String path = "/l10/expected/" + mainClass.getSimpleName() + ".txt";
        try (InputStream in = MainOutputTest.class.getResourceAsStream(path)) {
            if (in == null) {
                throw new IOException("Missing golden file " + path);
            }
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
