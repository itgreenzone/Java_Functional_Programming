package com.itgreenzone.fp.l06_stream_fundamentals;

import com.itgreenzone.fp.l06_stream_fundamentals.after.StreamTopDebits;
import com.itgreenzone.fp.l06_stream_fundamentals.before.LegacyTopDebits;
import com.itgreenzone.fp.l06_stream_fundamentals.modern.ModernTopDebits;
import com.itgreenzone.fp.l06_stream_fundamentals.solution.Solution06;
import com.itgreenzone.fp.l06_stream_fundamentals.theory.LazinessAndFusion;
import com.itgreenzone.fp.l06_stream_fundamentals.theory.MethodMap;
import com.itgreenzone.fp.l06_stream_fundamentals.theory.StreamProperties;
import com.itgreenzone.fp.l06_stream_fundamentals.theory.StreamSources;
import com.itgreenzone.fp.l06_stream_fundamentals.theory.StreamVsCollection;
import com.itgreenzone.fp.testutil.StdOut;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** Golden-file tests: src/test/resources/l06/expected/&lt;ClassName&gt;.txt */
class MainOutputTest {

    @ParameterizedTest(name = "{0}")
    @ValueSource(classes = {
            StreamVsCollection.class, LazinessAndFusion.class, StreamSources.class, StreamProperties.class,
            MethodMap.class, LegacyTopDebits.class, StreamTopDebits.class, ModernTopDebits.class, Solution06.class})
    void mainPrintsTheDocumentedOutput(Class<?> mainClass) throws IOException {
        assertEquals(expected(mainClass), StdOut.captureMain(mainClass));
    }

    private static String expected(Class<?> mainClass) throws IOException {
        String path = "/l06/expected/" + mainClass.getSimpleName() + ".txt";
        try (InputStream in = MainOutputTest.class.getResourceAsStream(path)) {
            if (in == null) {
                throw new IOException("Missing golden file " + path);
            }
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
