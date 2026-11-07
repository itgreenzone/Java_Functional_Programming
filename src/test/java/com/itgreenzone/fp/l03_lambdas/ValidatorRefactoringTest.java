package com.itgreenzone.fp.l03_lambdas;

import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.l03_lambdas.after.LambdaPaymentValidator;
import com.itgreenzone.fp.l03_lambdas.before.LegacyPaymentValidator;
import com.itgreenzone.fp.l03_lambdas.modern.ModernPaymentValidator;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** Refactoring must not change behaviour: legacy, lambda and modern validators agree exactly. */
class ValidatorRefactoringTest {

    static final List<String> EXPECTED = List.of(
            "P003: failed payments cannot be settled",
            "P003: PayPal limit is 300.00",
            "P005: needs manual approval over 1000.00",
            "P012: failed payments cannot be settled");

    @Test
    void legacyAnonymousClasses() {
        assertEquals(EXPECTED, new LegacyPaymentValidator().validate(SampleData.payments()));
    }

    @Test
    void java8Lambdas() {
        assertEquals(EXPECTED, LambdaPaymentValidator.validate(SampleData.payments()));
    }

    @Test
    void modernRecordsAndMethodReferences() {
        assertEquals(EXPECTED, ModernPaymentValidator.validate(SampleData.payments()).stream()
                .map(Object::toString).toList());
        assertEquals(new ModernPaymentValidator.ValidationError("P005", "needs manual approval over 1000.00"),
                ModernPaymentValidator.validate(SampleData.payments()).get(2));
    }

    @Test
    void emptyInputGivesNoErrors() {
        assertEquals(List.of(), LambdaPaymentValidator.validate(List.of()));
        assertEquals(List.of(), ModernPaymentValidator.validate(List.of()));
    }
}
