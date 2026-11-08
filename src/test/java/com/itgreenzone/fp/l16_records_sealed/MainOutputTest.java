package com.itgreenzone.fp.l16_records_sealed;

import com.itgreenzone.fp.l16_records_sealed.after.PolymorphicOutcomeReport;
import com.itgreenzone.fp.l16_records_sealed.before.LegacyOutcomeReport;
import com.itgreenzone.fp.l16_records_sealed.modern.SealedOutcomeReport;
import com.itgreenzone.fp.l16_records_sealed.solution.Solution16;
import com.itgreenzone.fp.l16_records_sealed.theory.PatternMatchingEvolution;
import com.itgreenzone.fp.l16_records_sealed.theory.PaymentResults;
import com.itgreenzone.fp.l16_records_sealed.theory.RecordsInPipelines;
import com.itgreenzone.fp.l16_records_sealed.theory.SequencedCollectionsDemo;
import com.itgreenzone.fp.testutil.StdOut;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** Golden-file tests: src/test/resources/l16/expected/&lt;ClassName&gt;.txt */
class MainOutputTest {

    @ParameterizedTest(name = "{0}")
    @ValueSource(classes = {
            RecordsInPipelines.class, PaymentResults.class, PatternMatchingEvolution.class, SequencedCollectionsDemo.class,
            LegacyOutcomeReport.class, PolymorphicOutcomeReport.class, SealedOutcomeReport.class, Solution16.class})
    void mainPrintsTheDocumentedOutput(Class<?> mainClass) throws IOException {
        assertEquals(expected(mainClass), StdOut.captureMain(mainClass));
    }

    private static String expected(Class<?> mainClass) throws IOException {
        String path = "/l16/expected/" + mainClass.getSimpleName() + ".txt";
        try (InputStream in = MainOutputTest.class.getResourceAsStream(path)) {
            if (in == null) {
                throw new IOException("Missing golden file " + path);
            }
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
