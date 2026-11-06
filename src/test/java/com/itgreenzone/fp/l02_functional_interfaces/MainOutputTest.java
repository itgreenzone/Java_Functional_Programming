package com.itgreenzone.fp.l02_functional_interfaces;

import com.itgreenzone.fp.l02_functional_interfaces.after.PaymentRules;
import com.itgreenzone.fp.l02_functional_interfaces.before.LegacyPaymentChecks;
import com.itgreenzone.fp.l02_functional_interfaces.modern.ModernInterfaces;
import com.itgreenzone.fp.l02_functional_interfaces.solution.Solution02;
import com.itgreenzone.fp.l02_functional_interfaces.theory.BuiltInCatalogue;
import com.itgreenzone.fp.l02_functional_interfaces.theory.Composition;
import com.itgreenzone.fp.l02_functional_interfaces.theory.OlderSams;
import com.itgreenzone.fp.l02_functional_interfaces.theory.OverloadingStandards;
import com.itgreenzone.fp.l02_functional_interfaces.theory.PrimitiveSpecialisations;
import com.itgreenzone.fp.l02_functional_interfaces.theory.SamInspector;
import com.itgreenzone.fp.l02_functional_interfaces.theory.SamRules;
import com.itgreenzone.fp.testutil.StdOut;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** Golden-file tests: src/test/resources/l02/expected/&lt;ClassName&gt;.txt */
class MainOutputTest {

    @ParameterizedTest(name = "{0}")
    @ValueSource(classes = {
            SamRules.class, SamInspector.class, BuiltInCatalogue.class, PrimitiveSpecialisations.class,
            Composition.class, OlderSams.class, OverloadingStandards.class, LegacyPaymentChecks.class,
            PaymentRules.class, ModernInterfaces.class, Solution02.class})
    void mainPrintsTheDocumentedOutput(Class<?> mainClass) throws IOException {
        assertEquals(expected(mainClass), StdOut.captureMain(mainClass));
    }

    private static String expected(Class<?> mainClass) throws IOException {
        String path = "/l02/expected/" + mainClass.getSimpleName() + ".txt";
        try (InputStream in = MainOutputTest.class.getResourceAsStream(path)) {
            if (in == null) {
                throw new IOException("Missing golden file " + path);
            }
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
