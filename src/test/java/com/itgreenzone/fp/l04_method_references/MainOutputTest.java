package com.itgreenzone.fp.l04_method_references;

import com.itgreenzone.fp.l04_method_references.after.LambdaSettlementReport;
import com.itgreenzone.fp.l04_method_references.before.LegacySettlementReport;
import com.itgreenzone.fp.l04_method_references.modern.MethodReferenceReport;
import com.itgreenzone.fp.l04_method_references.solution.Solution04;
import com.itgreenzone.fp.l04_method_references.theory.BoundReferences;
import com.itgreenzone.fp.l04_method_references.theory.ConstructorReferences;
import com.itgreenzone.fp.l04_method_references.theory.LambdaOrReference;
import com.itgreenzone.fp.l04_method_references.theory.StaticReferences;
import com.itgreenzone.fp.l04_method_references.theory.UnboundReferences;
import com.itgreenzone.fp.testutil.StdOut;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** Golden-file tests: src/test/resources/l04/expected/&lt;ClassName&gt;.txt */
class MainOutputTest {

    @ParameterizedTest(name = "{0}")
    @ValueSource(classes = {
            StaticReferences.class, BoundReferences.class, UnboundReferences.class, ConstructorReferences.class,
            LambdaOrReference.class, LegacySettlementReport.class, LambdaSettlementReport.class,
            MethodReferenceReport.class, Solution04.class})
    void mainPrintsTheDocumentedOutput(Class<?> mainClass) throws IOException {
        assertEquals(expected(mainClass), StdOut.captureMain(mainClass));
    }

    private static String expected(Class<?> mainClass) throws IOException {
        String path = "/l04/expected/" + mainClass.getSimpleName() + ".txt";
        try (InputStream in = MainOutputTest.class.getResourceAsStream(path)) {
            if (in == null) {
                throw new IOException("Missing golden file " + path);
            }
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
