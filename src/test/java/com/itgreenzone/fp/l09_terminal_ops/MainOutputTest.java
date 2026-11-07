package com.itgreenzone.fp.l09_terminal_ops;

import com.itgreenzone.fp.l09_terminal_ops.after.StreamDashboard;
import com.itgreenzone.fp.l09_terminal_ops.before.LegacyDashboard;
import com.itgreenzone.fp.l09_terminal_ops.modern.ModernDashboard;
import com.itgreenzone.fp.l09_terminal_ops.solution.Solution09;
import com.itgreenzone.fp.l09_terminal_ops.theory.CollectingResults;
import com.itgreenzone.fp.l09_terminal_ops.theory.MatchFindCount;
import com.itgreenzone.fp.l09_terminal_ops.theory.Reducing;
import com.itgreenzone.fp.testutil.StdOut;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** Golden-file tests: src/test/resources/l09/expected/&lt;ClassName&gt;.txt */
class MainOutputTest {

    @ParameterizedTest(name = "{0}")
    @ValueSource(classes = {
            CollectingResults.class, Reducing.class, MatchFindCount.class, LegacyDashboard.class,
            StreamDashboard.class, ModernDashboard.class, Solution09.class})
    void mainPrintsTheDocumentedOutput(Class<?> mainClass) throws IOException {
        assertEquals(expected(mainClass), StdOut.captureMain(mainClass));
    }

    private static String expected(Class<?> mainClass) throws IOException {
        String path = "/l09/expected/" + mainClass.getSimpleName() + ".txt";
        try (InputStream in = MainOutputTest.class.getResourceAsStream(path)) {
            if (in == null) {
                throw new IOException("Missing golden file " + path);
            }
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
