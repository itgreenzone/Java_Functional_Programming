package com.itgreenzone.fp.l03_lambdas;

import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.l03_lambdas.theory.Amounts;
import com.itgreenzone.fp.l03_lambdas.theory.CheckedExceptions;
import com.itgreenzone.fp.l03_lambdas.theory.InvalidAmountException;
import com.itgreenzone.fp.l03_lambdas.theory.LambdaVsAnonymous;
import com.itgreenzone.fp.l03_lambdas.theory.ThisAndScope;
import com.itgreenzone.fp.l03_lambdas.theory.VariableCapture;
import com.itgreenzone.fp.l03_lambdas.theory.WrappedCheckedException;
import com.itgreenzone.fp.testutil.InMemoryCompiler;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CaptureScopeAndExceptionsTest {

    @Test
    void effectivelyFinalLocalIsCapturedByValue() {
        assertEquals(new BigDecimal("4.00"), VariableCapture.cashback("5").apply(new BigDecimal("80.00")));
    }

    @Test
    void streamCountAndTheSmellsGiveTheSameNumber() {
        var txns = SampleData.transactions();
        assertEquals(45L, VariableCapture.countDebits(txns));
        assertEquals(45, VariableCapture.countDebitsWithAtomicSmell(txns));
        assertEquals(45, VariableCapture.countDebitsWithArraySmell(txns));
    }

    @Test
    void loopsCaptureTheRightValues() {
        var flights = SampleData.flights().subList(0, 3);
        assertEquals(List.of("SQ318", "SQ12", "TR808"), VariableCapture.labelsFromForEach(flights));
        assertEquals(List.of("1.SQ318", "2.SQ12", "3.TR808"), VariableCapture.labelsFromIndexLoop(flights));
    }

    @Test
    void reassigningACapturedLocalDoesNotCompile() {
        List<String> errors = InMemoryCompiler.errors("Capture", """
                import java.util.List;
                class Capture { void run(List<String> ids) { int count = 0; ids.forEach(id -> count++); } }
                """);
        assertEquals(1, errors.size());
        assertTrue(errors.get(0).contains("must be final or effectively final"), errors.toString());
    }

    @Test
    void thisMeansTheEnclosingInstanceInALambda() {
        ThisAndScope service = new ThisAndScope("payment-service");
        assertEquals("payment-service", service.lambdaThis().get());
        assertEquals("anonymous object", service.anonymousThis().get());
        assertEquals("ThisAndScope(payment-service)", service.lambdaToString().get());
        assertEquals("anonymous.toString()", service.anonymousToString().get());
    }

    @Test
    void lambdaParameterCannotShadowALocalVariable() {
        List<String> errors = InMemoryCompiler.errors("Shadow", """
                import java.util.function.Function;
                class Shadow { void run() { String id = "x"; Function<String, String> f = id -> id.trim(); } }
                """);
        assertEquals(1, errors.size());
        assertTrue(errors.get(0).contains("variable id is already defined"), errors.toString());
    }

    @Test
    void checkedExceptionInsideAFunctionDoesNotCompile() {
        List<String> errors = InMemoryCompiler.errors("Checked", """
                import java.util.function.Function;
                class Checked {
                    static class InvalidAmountException extends Exception { }
                    static Integer parse(String s) throws InvalidAmountException { return 1; }
                    Function<String, Integer> f = s -> parse(s);
                }
                """);
        assertEquals(1, errors.size());
        assertTrue(errors.get(0).contains("unreported exception"), errors.toString());
    }

    @ParameterizedTest(name = "parse(\"{0}\") = {1}")
    @CsvSource({"120.00, 120.00", "' 45.5 ', 45.50", "75, 75.00"})
    void parserNormalisesValidAmounts(String raw, BigDecimal expected) throws InvalidAmountException {
        assertEquals(expected, Amounts.parse(raw));
    }

    @Test
    void theFourPatternsForCheckedExceptions() throws InvalidAmountException {
        List<String> good = List.of("120.00", " 45.5 ", "999.99");
        List<String> mixed = List.of("120.00", "abc", "-10.00", "75");
        List<BigDecimal> expected = List.of(new BigDecimal("120.00"), new BigDecimal("45.50"), new BigDecimal("999.99"));
        assertEquals(expected, CheckedExceptions.parseWithTryCatch(good));
        assertEquals(expected, CheckedExceptions.parseAll(good, Amounts::parse));
        assertEquals(expected, CheckedExceptions.parseWithWrapper(good));

        assertThrows(IllegalArgumentException.class, () -> CheckedExceptions.parseWithTryCatch(mixed));
        InvalidAmountException checked = assertThrows(InvalidAmountException.class, () -> CheckedExceptions.parseAll(mixed, Amounts::parse));
        assertEquals("Invalid amount: abc", checked.getMessage());
        WrappedCheckedException wrapped = assertThrows(WrappedCheckedException.class, () -> CheckedExceptions.parseWithWrapper(mixed));
        assertTrue(wrapped.getCause() instanceof InvalidAmountException);
        assertEquals(List.of(new BigDecimal("120.00"), new BigDecimal("75.00")), CheckedExceptions.parseValidOnly(mixed));
        assertEquals(Optional.empty(), CheckedExceptions.parseOrEmpty("-10.00"));
    }

    @Test
    void anonymousClassIsARealClassLambdaIsHidden() {
        Class<?> anon = LambdaVsAnonymous.anonymous().getClass();
        Class<?> lambda = LambdaVsAnonymous.lambda().getClass();
        assertTrue(anon.isAnonymousClass());
        assertFalse(anon.isHidden());
        assertFalse(lambda.isAnonymousClass());
        assertTrue(lambda.isHidden());
        assertNotSame(LambdaVsAnonymous.anonymous(), LambdaVsAnonymous.anonymous());
    }

    @Test
    void onlyTheAnonymousClassProducedAClassFile() {
        assertTrue(LambdaVsAnonymous.class.getResource("LambdaVsAnonymous$1.class") != null);
        assertTrue(LambdaVsAnonymous.class.getResource("LambdaVsAnonymous$2.class") == null);
    }
}
