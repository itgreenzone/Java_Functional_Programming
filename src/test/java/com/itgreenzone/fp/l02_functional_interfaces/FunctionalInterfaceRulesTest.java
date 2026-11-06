package com.itgreenzone.fp.l02_functional_interfaces;

import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.l02_functional_interfaces.theory.SamInspector;
import com.itgreenzone.fp.l02_functional_interfaces.theory.SamRules;
import com.itgreenzone.fp.testutil.InMemoryCompiler;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import java.io.FileFilter;
import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.function.BinaryOperator;
import java.util.function.Predicate;
import java.util.function.UnaryOperator;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** The SAM rules, proved with reflection and with the real Java compiler. */
class FunctionalInterfaceRulesTest {

    static Stream<Arguments> functionalInterfaces() {
        return Stream.of(
                Arguments.of(SamRules.FeeRule.class, "feeFor"),
                Arguments.of(Comparator.class, "compare"),
                Arguments.of(Runnable.class, "run"),
                Arguments.of(Callable.class, "call"),
                Arguments.of(FileFilter.class, "accept"),
                Arguments.of(Predicate.class, "test"),
                Arguments.of(UnaryOperator.class, "apply"),
                Arguments.of(BinaryOperator.class, "apply"));
    }

    @ParameterizedTest(name = "{0} has exactly one counted abstract method: {1}")
    @MethodSource("functionalInterfaces")
    void exactlyOneCountedAbstractMethod(Class<?> type, String method) {
        assertEquals(List.of(method), SamInspector.countedAbstractMethods(type));
        assertTrue(SamInspector.isFunctionalInterface(type));
    }

    @Test
    void listIsNotAFunctionalInterface() {
        assertFalse(SamInspector.isFunctionalInterface(List.class));
    }

    @Test
    void feeRuleDefaultStaticAndPrivateMethodsWork() {
        var t003 = SampleData.transactions().get(2);
        assertEquals(new BigDecimal("1.72"), SamRules.CARD_FEE.feeFor(t003));
        assertEquals("T003:1221.40", SamRules.LABEL.convert(t003));
    }

    @Test
    void annotationRejectsTwoAbstractMethods() {
        List<String> errors = InMemoryCompiler.errors("TwoMethods", """
                import java.util.function.*;
                @FunctionalInterface
                interface FraudCheck {
                    boolean flags(String txnId);
                    String reason(String txnId);
                }
                class TwoMethods { }
                """);
        assertEquals(1, errors.size());
        assertTrue(errors.get(0).contains("Unexpected @FunctionalInterface annotation"), errors.toString());
        assertTrue(errors.get(0).contains("multiple non-overriding abstract methods"), errors.toString());
    }

    @Test
    void objectMethodsDefaultStaticAndPrivateDoNotBreakTheRule() {
        List<String> errors = InMemoryCompiler.errors("Valid", """
                @FunctionalInterface
                interface Rule {
                    boolean test(String s);
                    default Rule negate() { return s -> !test(s); }
                    static Rule alwaysTrue() { return s -> true; }
                    private static void helper() { }
                    boolean equals(Object o);
                    String toString();
                    int hashCode();
                }
                class Valid { Rule r = s -> s.isEmpty(); }
                """);
        assertEquals(List.of(), errors);
    }

    @Test
    void overloadingWithSameShapeInterfacesIsAmbiguous() {
        List<String> errors = InMemoryCompiler.errors("Overloads", """
                import java.util.concurrent.Callable;
                import java.util.function.Supplier;
                class Overloads {
                    static String run(Supplier<String> s) { return s.get(); }
                    static String run(Callable<String> c) throws Exception { return c.call(); }
                    static void use() throws Exception { run(() -> "x"); }
                }
                """);
        assertEquals(1, errors.size());
        assertTrue(errors.get(0).contains("reference to run is ambiguous"), errors.toString());
    }

    @Test
    void distinctMethodNamesFixTheAmbiguity() {
        List<String> errors = InMemoryCompiler.errors("Fixed", """
                import java.util.concurrent.Callable;
                import java.util.function.Supplier;
                class Fixed {
                    static String runSupplier(Supplier<String> s) { return s.get(); }
                    static String runCallable(Callable<String> c) throws Exception { return c.call(); }
                    static void use() throws Exception { runSupplier(() -> "x"); runCallable(() -> "y"); }
                }
                """);
        assertEquals(List.of(), errors);
    }
}
