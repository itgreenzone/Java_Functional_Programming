package com.itgreenzone.fp.l12_primitive_streams;

import com.itgreenzone.fp.l12_primitive_streams.after.StreamLoadReport;
import com.itgreenzone.fp.l12_primitive_streams.before.LegacyLoadReport;
import com.itgreenzone.fp.l12_primitive_streams.modern.ModernLoadReport;
import com.itgreenzone.fp.l12_primitive_streams.solution.Solution12;
import com.itgreenzone.fp.l12_primitive_streams.theory.BoxingAndConversions;
import com.itgreenzone.fp.l12_primitive_streams.theory.CharsAndRandom;
import com.itgreenzone.fp.l12_primitive_streams.theory.MoneyAndDoubles;
import com.itgreenzone.fp.l12_primitive_streams.theory.PrimitiveBasics;
import com.itgreenzone.fp.testutil.StdOut;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** Golden-file tests: src/test/resources/l12/expected/&lt;ClassName&gt;.txt */
class MainOutputTest {

    @ParameterizedTest(name = "{0}")
    @ValueSource(classes = {
            PrimitiveBasics.class, BoxingAndConversions.class, MoneyAndDoubles.class, CharsAndRandom.class,
            LegacyLoadReport.class, StreamLoadReport.class, ModernLoadReport.class, Solution12.class})
    void mainPrintsTheDocumentedOutput(Class<?> mainClass) throws IOException {
        assertEquals(expected(mainClass), StdOut.captureMain(mainClass));
    }

    private static String expected(Class<?> mainClass) throws IOException {
        String path = "/l12/expected/" + mainClass.getSimpleName() + ".txt";
        try (InputStream in = MainOutputTest.class.getResourceAsStream(path)) {
            if (in == null) {
                throw new IOException("Missing golden file " + path);
            }
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
