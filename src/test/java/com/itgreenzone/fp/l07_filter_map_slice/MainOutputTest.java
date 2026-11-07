package com.itgreenzone.fp.l07_filter_map_slice;

import com.itgreenzone.fp.l07_filter_map_slice.after.StreamGoldStatement;
import com.itgreenzone.fp.l07_filter_map_slice.before.LegacyGoldStatement;
import com.itgreenzone.fp.l07_filter_map_slice.modern.ModernGoldStatement;
import com.itgreenzone.fp.l07_filter_map_slice.solution.Solution07;
import com.itgreenzone.fp.l07_filter_map_slice.theory.DistinctAndPeek;
import com.itgreenzone.fp.l07_filter_map_slice.theory.Filtering;
import com.itgreenzone.fp.l07_filter_map_slice.theory.FlatMapping;
import com.itgreenzone.fp.l07_filter_map_slice.theory.Mapping;
import com.itgreenzone.fp.l07_filter_map_slice.theory.Slicing;
import com.itgreenzone.fp.testutil.StdOut;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** Golden-file tests: src/test/resources/l07/expected/&lt;ClassName&gt;.txt */
class MainOutputTest {

    @ParameterizedTest(name = "{0}")
    @ValueSource(classes = {
            Filtering.class, Mapping.class, FlatMapping.class, DistinctAndPeek.class, Slicing.class,
            LegacyGoldStatement.class, StreamGoldStatement.class, ModernGoldStatement.class, Solution07.class})
    void mainPrintsTheDocumentedOutput(Class<?> mainClass) throws IOException {
        assertEquals(expected(mainClass), StdOut.captureMain(mainClass));
    }

    private static String expected(Class<?> mainClass) throws IOException {
        String path = "/l07/expected/" + mainClass.getSimpleName() + ".txt";
        try (InputStream in = MainOutputTest.class.getResourceAsStream(path)) {
            if (in == null) {
                throw new IOException("Missing golden file " + path);
            }
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
