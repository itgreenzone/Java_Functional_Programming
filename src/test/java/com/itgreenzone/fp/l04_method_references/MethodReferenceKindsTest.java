package com.itgreenzone.fp.l04_method_references;

import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Tier;
import com.itgreenzone.fp.data.Transaction;
import com.itgreenzone.fp.l04_method_references.theory.BoundReferences;
import com.itgreenzone.fp.l04_method_references.theory.ConstructorReferences;
import com.itgreenzone.fp.l04_method_references.theory.Fees;
import com.itgreenzone.fp.l04_method_references.theory.LambdaOrReference;
import com.itgreenzone.fp.l04_method_references.theory.Receipt;
import com.itgreenzone.fp.l04_method_references.theory.StaticReferences;
import com.itgreenzone.fp.l04_method_references.theory.UnboundReferences;
import com.itgreenzone.fp.testutil.InMemoryCompiler;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.TreeSet;
import java.util.function.Function;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** Every method reference behaves exactly like its equivalent lambda. */
class MethodReferenceKindsTest {

    static Stream<Arguments> referenceAndLambdaOnTransactions() {
        Function<Transaction, Object> amountRef = UnboundReferences.AMOUNT::apply;
        Function<Transaction, Object> amountLambda = t -> t.amount();
        Function<Transaction, Object> highRef = LambdaOrReference.HIGH_VALUE_REF::test;
        Function<Transaction, Object> highLambda = LambdaOrReference.HIGH_VALUE_LAMBDA::test;
        return Stream.of(
                Arguments.of("Transaction::amount", amountRef, amountLambda),
                Arguments.of("::isHighValue vs lambda", highRef, highLambda));
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("referenceAndLambdaOnTransactions")
    void referenceEqualsLambdaForEveryTransaction(String name, Function<Transaction, Object> ref, Function<Transaction, Object> lambda) {
        for (Transaction t : SampleData.transactions()) {
            assertEquals(lambda.apply(t), ref.apply(t), name + " on " + t.id());
        }
    }

    @Test
    void staticReferences() {
        assertEquals(Integer.valueOf(120), StaticReferences.PARSE.apply("120"));
        assertEquals(Integer.valueOf(301), StaticReferences.MAX.apply(301, 264));
        assertFalse(StaticReferences.NOT_NULL.test(null));
        assertEquals(new BigDecimal("12.50"), StaticReferences.TRANSFER_FEE.apply(new BigDecimal("2500.00")));
        assertEquals(new BigDecimal("3.75"), StaticReferences.FEE.apply(new BigDecimal("1500.00"), new BigDecimal("0.25")));
        assertEquals(8L, SampleData.payments().stream().filter(StaticReferences.SUCCESSFUL).count());
    }

    @Test
    void boundReferences() {
        assertEquals(List.of("SETTLED | P001 120.00", "SETTLED | P002 45.50", "SETTLED | P004 89.90"),
                BoundReferences.printSuccessful(SampleData.payments()));
        assertTrue(BoundReferences.IS_SGD.test("SGD"));
        assertFalse(BoundReferences.IS_SGD.test("USD"));
    }

    @Test
    void boundReceiverIsEvaluatedOnceAtCreation() {
        assertEquals("creating both: new | 2 reference calls: | 2 lambda calls: new new", BoundReferences.receiverEvaluation());
    }

    @Test
    void nullReceiverFailsAtCreationForAReference() {
        assertEquals("lambda created; reference: NPE at creation; lambda: NPE at call", BoundReferences.nullReceiver());
    }

    @Test
    void unboundReferencesUseTheFirstParameterAsReceiver() {
        assertEquals("PAYNOW", UnboundReferences.UPPER.apply("paynow"));
        assertEquals(new BigDecimal("300382.25"), UnboundReferences.totalBalance(SampleData.accounts()));
        assertTrue(UnboundReferences.SAME_TEXT.test("sgd", "SGD"));
        assertEquals(new BigDecimal("5.00"), UnboundReferences.MOVE_POINT.apply(new BigDecimal("500"), 2));
        assertEquals(List.of("Bangkok", "Colombo", "Jakarta", "Kuala Lumpur", "Singapore"),
                UnboundReferences.cityNamesSorted(SampleData.customers()));
    }

    @Test
    void constructorAndArrayConstructorReferences() {
        assertEquals(0, ConstructorReferences.NEW_LIST.get().size());
        assertEquals(new BigDecimal("59.90"), ConstructorReferences.TO_AMOUNT.apply("59.90"));
        assertEquals(new Receipt("P005", new BigDecimal("1500.00")), ConstructorReferences.NEW_RECEIPT.apply("P005", new BigDecimal("1500.00")));
        assertEquals(Tier.SILVER, ConstructorReferences.NEW_CUSTOMER.create("C011", "Kumar Raj", "Singapore", Tier.SILVER, LocalDate.of(2026, 11, 1)).tier());
        assertEquals(3, ConstructorReferences.NEW_STRING_ARRAY.apply(3).length);
        assertArrayEquals(new int[8], ConstructorReferences.NEW_INT_ARRAY.apply(8));
        assertArrayEquals(new String[]{"P001", "P002"}, ConstructorReferences.paymentIds(SampleData.payments().subList(0, 2)));
        assertEquals(new TreeSet<>(List.of("CARD", "PAYNOW", "PAYPAL")), ConstructorReferences.methodsSorted(SampleData.payments()));
    }

    @Test
    void whenToKeepALambda() {
        assertEquals(new BigDecimal("3.75"), LambdaOrReference.QUARTER_PERCENT_FEE.apply(new BigDecimal("1500.00")));
        assertEquals(15L, SampleData.transactions().stream().filter(LambdaOrReference.CREDITS).count());
        assertEquals("42", LambdaOrReference.TO_TEXT_LAMBDA.apply(42));
        assertEquals("42", LambdaOrReference.TO_TEXT_VALUE_OF.apply(42));
        assertTrue(Objects.equals(Fees.isSuccessful(SampleData.payments().get(0)), true));
        Payment p003 = SampleData.payments().get(2);
        assertFalse(Fees.isSuccessful(p003));
    }

    @Test
    void integerToStringReferenceIsAmbiguous() {
        List<String> errors = InMemoryCompiler.errors("Ambiguous", """
                import java.util.function.Function;
                class Ambiguous { Function<Integer, String> f = Integer::toString; }
                """);
        assertEquals(1, errors.size());
        assertTrue(errors.get(0).contains("invalid method reference"), errors.toString());
        assertTrue(errors.get(0).contains("reference to toString is ambiguous"), errors.toString());
    }

    @Test
    void constructorReferenceNeedsAMatchingShape() {
        List<String> errors = InMemoryCompiler.errors("Shape", """
                import java.util.function.Function;
                import java.time.LocalDate;
                class Shape {
                    record Customer(String id, String name, String city, String tier, LocalDate joined) { }
                    Function<String, Customer> f = Customer::new;
                }
                """);
        assertEquals(1, errors.size());
        assertTrue(errors.get(0).contains("invalid constructor reference"), errors.toString());
    }
}
