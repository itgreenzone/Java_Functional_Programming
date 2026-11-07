package com.itgreenzone.fp.l03_lambdas;

import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;
import com.itgreenzone.fp.l03_lambdas.theory.SyntaxForms;
import com.itgreenzone.fp.l03_lambdas.theory.TargetTyping;
import com.itgreenzone.fp.l03_lambdas.theory.VarInLambdas;
import com.itgreenzone.fp.testutil.InMemoryCompiler;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Supplier;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SyntaxAndTargetTypingTest {

    @Test
    void allSyntaxFormsOfTheSameFunctionAgree() {
        Transaction t003 = SampleData.transactions().get(2);
        assertEquals("T003", SyntaxForms.ONE_PARAM.apply(t003));
        assertEquals("T003", SyntaxForms.ONE_PARAM_PARENS.apply(t003));
        assertEquals("T003", SyntaxForms.EXPLICIT_TYPE.apply(t003));
        assertEquals("statement ready", SyntaxForms.NO_PARAMS.get());
    }

    @ParameterizedTest(name = "block body on {0} = {1}")
    @CsvSource({"2500.00, 2512.50", "100.00, 101.00", "201.00, 202.01"})
    void blockBodyReturnsExplicitly(BigDecimal amount, BigDecimal expected) {
        assertEquals(expected, SyntaxForms.BLOCK_BODY.apply(amount));
    }

    @Test
    void sameExpressionIsVoidOrValueCompatible() {
        List<String> log = new ArrayList<>();
        SyntaxForms.VOID_COMPATIBLE.accept(log);
        assertEquals(Boolean.TRUE, SyntaxForms.VALUE_COMPATIBLE.apply(log));
        assertEquals(List.of("audited", "audited"), log);
    }

    @Test
    void sameLambdaTextDifferentTargetTypes() throws Exception {
        for (Transaction t : SampleData.transactions()) {
            boolean expected = TargetTyping.AS_PREDICATE.test(t);
            assertEquals(expected, TargetTyping.AS_FUNCTION.apply(t));
            assertEquals(expected, TargetTyping.AS_DOMAIN_TYPE.isHighValue(t));
        }
        assertEquals(TargetTyping.SUPPLIER.get(), TargetTyping.CALLABLE.call());
    }

    @Test
    void everyContextSuppliesATargetType() {
        assertEquals(11L, TargetTyping.countHighValue(SampleData.transactions()));
        assertEquals(List.of("T010", "T023"), SampleData.transactions().stream()
                .filter(TargetTyping.currency("USD")).map(Transaction::id).toList());
        assertEquals(60L, SampleData.transactions().stream().filter(TargetTyping.rule(false)).count());
        assertEquals(11L, SampleData.transactions().stream().filter(TargetTyping.rule(true)).count());
        assertTrue(TargetTyping.asObject() instanceof Supplier<?>);
    }

    @Test
    void lambdaWithoutATargetTypeDoesNotCompile() {
        List<String> errors = InMemoryCompiler.errors("NoTarget", """
                class NoTarget { Object o = () -> "x"; }
                """);
        assertEquals(1, errors.size());
        assertTrue(errors.get(0).contains("not a functional interface"), errors.toString());
    }

    @Test
    void varInLambdaParameters() {
        assertEquals(new BigDecimal("165.50"), VarInLambdas.ADD.apply(new BigDecimal("120.00"), new BigDecimal("45.50")));
        assertEquals("T010/USD", VarInLambdas.LABEL.apply(SampleData.transactions().get(9)));
        assertEquals(new BigDecimal("533.03"), VarInLambdas.AUDITED_AMOUNT.apply(SampleData.transactions().get(9)));
    }

    @Test
    void mixingVarAndImplicitParametersDoesNotCompile() {
        List<String> errors = InMemoryCompiler.errors("Mix", """
                import java.util.function.BinaryOperator;
                class Mix { BinaryOperator<Integer> f = (var a, b) -> a + b; }
                """);
        assertEquals(1, errors.size());
        assertTrue(errors.get(0).contains("cannot mix 'var' and implicitly-typed parameters"), errors.toString());
    }

    @Test
    void unnamedUnderscoreIsOnlyAPreviewInJava21() {
        List<String> errors = InMemoryCompiler.errors("Unnamed", """
                import java.util.function.BiFunction;
                class Unnamed { BiFunction<String, String, String> f = (a, _) -> a; }
                """);
        assertEquals(1, errors.size());
        assertTrue(errors.get(0).contains("unnamed variables are a preview feature"), errors.toString());
    }
}
