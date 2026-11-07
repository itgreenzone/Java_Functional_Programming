package com.itgreenzone.fp.l05_optional;

import com.itgreenzone.fp.l05_optional.after.OptionalStatementService;
import com.itgreenzone.fp.l05_optional.before.LegacyStatementService;
import com.itgreenzone.fp.l05_optional.modern.ModernStatementService;
import com.itgreenzone.fp.l05_optional.solution.Solution05;
import com.itgreenzone.fp.l05_optional.theory.AntiPatterns;
import com.itgreenzone.fp.l05_optional.theory.ConsumingOptionals;
import com.itgreenzone.fp.l05_optional.theory.CreatingOptionals;
import com.itgreenzone.fp.l05_optional.theory.OrElseVsOrElseGet;
import com.itgreenzone.fp.l05_optional.theory.PrimitiveOptionals;
import com.itgreenzone.fp.l05_optional.theory.TransformingOptionals;
import com.itgreenzone.fp.testutil.StdOut;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** Golden-file tests: src/test/resources/l05/expected/&lt;ClassName&gt;.txt */
class MainOutputTest {

    @ParameterizedTest(name = "{0}")
    @ValueSource(classes = {
            CreatingOptionals.class, OrElseVsOrElseGet.class, TransformingOptionals.class, ConsumingOptionals.class,
            PrimitiveOptionals.class, AntiPatterns.class, LegacyStatementService.class, OptionalStatementService.class,
            ModernStatementService.class, Solution05.class})
    void mainPrintsTheDocumentedOutput(Class<?> mainClass) throws IOException {
        assertEquals(expected(mainClass), StdOut.captureMain(mainClass));
    }

    private static String expected(Class<?> mainClass) throws IOException {
        String path = "/l05/expected/" + mainClass.getSimpleName() + ".txt";
        try (InputStream in = MainOutputTest.class.getResourceAsStream(path)) {
            if (in == null) {
                throw new IOException("Missing golden file " + path);
            }
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
