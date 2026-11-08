package com.itgreenzone.fp.l16_records_sealed;

import com.itgreenzone.fp.data.PaymentStatus;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.l16_records_sealed.theory.PatternMatchingEvolution;
import com.itgreenzone.fp.l16_records_sealed.theory.PaymentResults;
import com.itgreenzone.fp.l16_records_sealed.theory.PaymentResults.Approved;
import com.itgreenzone.fp.l16_records_sealed.theory.PaymentResults.PaymentResult;
import com.itgreenzone.fp.l16_records_sealed.theory.RecordsInPipelines;
import com.itgreenzone.fp.l16_records_sealed.theory.RecordsInPipelines.Money;
import com.itgreenzone.fp.l16_records_sealed.theory.SequencedCollectionsDemo;
import com.itgreenzone.fp.l16_records_sealed.solution.Solution16.Claim;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RecordsSealedPatternsTest {

    @Test
    void moneyValidatesAndNormalises() {
        assertEquals("SGD 10.01", Money.of("SGD", "10.005").toString());
        assertThrows(IllegalArgumentException.class, () -> Money.of("sgd", "1"));
        assertThrows(NullPointerException.class, () -> new Money(null, BigDecimal.ONE));
        assertThrows(IllegalArgumentException.class, () -> Money.of("SGD", "1").plus(Money.of("USD", "1")));
        assertEquals(Money.of("SGD", "5"), Money.of("SGD", "5.00"));
        assertEquals(Money.of("SGD", "5").hashCode(), Money.of("SGD", "5.00").hashCode());
    }

    @Test
    void recordsInPipelines() {
        assertEquals("{SGD=SGD 15244.95, USD=USD 1447.49}", RecordsInPipelines.debitTotalPerCurrency(SampleData.transactions()).toString());
        assertEquals(29, RecordsInPipelines.distinctAccountMonths(SampleData.transactions()));
        assertEquals(List.of("ACC-1004=2915.69", "ACC-1012=2372.16", "ACC-1003=1798.71"),
                RecordsInPipelines.topSpenders(SampleData.transactions(), 3));
    }

    @Test
    void sealedResultsAreExhaustive() {
        List<PaymentResult> results = PaymentResults.results();
        assertEquals(12, results.size());
        assertEquals("{APPROVED=8, DECLINED=2, PENDING=1, REFUNDED=1}", PaymentResults.countByKind(results).toString());
        assertEquals(new BigDecimal("2999.19"), PaymentResults.settled(results));
        assertEquals("P005 APPROVED large PAYNOW 1500.00", PaymentResults.describe(results.get(4)));
        assertTrue(results.get(0) instanceof Approved);
    }

    @Test
    void permittedSubclassesAreKnownAtRuntime() {
        assertTrue(PaymentResult.class.isSealed());
        assertEquals(4, PaymentResult.class.getPermittedSubclasses().length);
    }

    @Test
    void patternMatchingEvolution() {
        assertEquals("customer Alice Tan", PatternMatchingEvolution.describeJava8(SampleData.customers().get(0)));
        assertEquals("PLATINUM customer Chen Wei", PatternMatchingEvolution.describeJava16(SampleData.customers().get(2)));
        assertEquals(10, PatternMatchingEvolution.riskScore(PaymentStatus.FAILED));
        assertEquals(5, PatternMatchingEvolution.riskScore(PaymentStatus.REFUNDED));
        assertEquals("null!", PatternMatchingEvolution.describeJava21(null));
        assertEquals("OVERDRAWN account ACC-1013 -150.25", PatternMatchingEvolution.describeJava21(SampleData.accounts().get(12)));
        assertEquals("foreign money USD 533.03", PatternMatchingEvolution.describeJava21(Money.of("USD", "533.03")));
        assertEquals("unknown Integer", PatternMatchingEvolution.describeJava21(42));
        assertEquals("T023: capped fee USD 10.00",
                PatternMatchingEvolution.nested(new PatternMatchingEvolution.Fee("T023", Money.of("USD", "10"))));
    }

    @Test
    void sequencedCollections() {
        assertEquals("first=P001 last=P012 reversed first 3=[P012, P011, P010]", SequencedCollectionsDemo.listEnds());
        assertEquals("[P002, P001, P000]", SequencedCollectionsDemo.reversedIsAView());
        assertEquals("T001 2026-08-02 .. T060 2026-10-30", SequencedCollectionsDemo.earliestAndLatestTransaction());
        assertEquals("polled P003=PAYPAL, remaining {P008=CARD, P012=PAYNOW}", SequencedCollectionsDemo.queueOfPending());
    }

    @Test
    void claimRecordValidates() {
        assertThrows(IllegalArgumentException.class,
                () -> new Claim("X", "POL-501", LocalDate.of(2026, 1, 1), new BigDecimal("-1"), true));
        assertThrows(NullPointerException.class, () -> new Claim(null, "POL-501", LocalDate.of(2026, 1, 1), BigDecimal.ONE, true));
        assertFalse(new Claim("X", "P", LocalDate.of(2026, 1, 1), BigDecimal.ONE, false).documentsComplete());
    }
}
