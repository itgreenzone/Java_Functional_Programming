package com.itgreenzone.fp.l03_lambdas;

import com.itgreenzone.fp.l03_lambdas.after.LambdaPaymentValidator;
import com.itgreenzone.fp.l03_lambdas.before.LegacyPaymentValidator;
import com.itgreenzone.fp.l03_lambdas.modern.ModernPaymentValidator;
import com.itgreenzone.fp.l03_lambdas.solution.Solution03;
import com.itgreenzone.fp.l03_lambdas.theory.CheckedExceptions;
import com.itgreenzone.fp.l03_lambdas.theory.LambdaVsAnonymous;
import com.itgreenzone.fp.l03_lambdas.theory.SyntaxForms;
import com.itgreenzone.fp.l03_lambdas.theory.TargetTyping;
import com.itgreenzone.fp.l03_lambdas.theory.ThisAndScope;
import com.itgreenzone.fp.l03_lambdas.theory.VarInLambdas;
import com.itgreenzone.fp.l03_lambdas.theory.VariableCapture;
import com.itgreenzone.fp.testutil.StdOut;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** Golden-file tests: src/test/resources/l03/expected/&lt;ClassName&gt;.txt */
class MainOutputTest {

    @ParameterizedTest(name = "{0}")
    @ValueSource(classes = {
            SyntaxForms.class, TargetTyping.class, VariableCapture.class, ThisAndScope.class,
            VarInLambdas.class, CheckedExceptions.class, LambdaVsAnonymous.class,
            LegacyPaymentValidator.class, LambdaPaymentValidator.class, ModernPaymentValidator.class,
            Solution03.class})
    void mainPrintsTheDocumentedOutput(Class<?> mainClass) throws IOException {
        assertEquals(expected(mainClass), StdOut.captureMain(mainClass));
    }

    private static String expected(Class<?> mainClass) throws IOException {
        String path = "/l03/expected/" + mainClass.getSimpleName() + ".txt";
        try (InputStream in = MainOutputTest.class.getResourceAsStream(path)) {
            if (in == null) {
                throw new IOException("Missing golden file " + path);
            }
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
