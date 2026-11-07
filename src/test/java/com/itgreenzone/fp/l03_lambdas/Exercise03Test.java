package com.itgreenzone.fp.l03_lambdas;

import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.l03_lambdas.exercise.LegacyPaymentScreening;
import com.itgreenzone.fp.l03_lambdas.exercise.Exercise03;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** The lambda version must behave exactly like the anonymous-class version. */
@Disabled("Remove this line when you have completed Exercise03")
class Exercise03Test {

    @Test
    void screeningMessagesMatchTheLegacyCode() {
        List<String> expected = List.of(
                "P005: PayNow over 1000.00: confirm with customer",
                "P006: refunded: exclude from settlement",
                "P008: pending: re-check with gateway");
        assertEquals(expected, LegacyPaymentScreening.screen(SampleData.payments()));
        assertEquals(expected, Exercise03.screen(SampleData.payments()));
    }

    @Test
    void rulesGiveTheSameMessagePerPayment() {
        for (Payment p : SampleData.payments()) {
            for (int i = 0; i < 3; i++) {
                assertEquals(LegacyPaymentScreening.rules().get(i).check(p), Exercise03.rules().get(i).check(p));
            }
        }
    }

    @Test
    void comparatorSortsHighestFirst() {
        List<String> legacy = SampleData.payments().stream().sorted(LegacyPaymentScreening.byAmountHighestFirst()).map(Payment::id).toList();
        List<String> lambda = SampleData.payments().stream().sorted(Exercise03.byAmountHighestFirst()).map(Payment::id).toList();
        assertEquals(List.of("P005", "P010", "P008"), lambda.subList(0, 3));
        assertEquals(legacy, lambda);
    }

    @Test
    void countWithoutACapturedCounter() {
        assertEquals(3, LegacyPaymentScreening.flaggedCount(SampleData.payments()));
        assertEquals(3L, Exercise03.flaggedCount(SampleData.payments()));
    }
}
