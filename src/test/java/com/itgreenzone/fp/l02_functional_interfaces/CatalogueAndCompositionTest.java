package com.itgreenzone.fp.l02_functional_interfaces;

import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Tier;
import com.itgreenzone.fp.l02_functional_interfaces.theory.BuiltInCatalogue;
import com.itgreenzone.fp.l02_functional_interfaces.theory.Composition;
import com.itgreenzone.fp.l02_functional_interfaces.theory.OlderSams;
import com.itgreenzone.fp.l02_functional_interfaces.theory.OverloadingStandards;
import com.itgreenzone.fp.l02_functional_interfaces.theory.PrimitiveSpecialisations;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.io.File;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.function.Predicate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CatalogueAndCompositionTest {

    @Test
    void coreInterfacesProduceTheDocumentedValues() {
        assertEquals(LocalDate.of(2026, 10, 31), BuiltInCatalogue.STATEMENT_DATE.get());
        assertEquals("T003 TRANSFER 1221.40", BuiltInCatalogue.LABEL.apply(SampleData.transactions().get(2)));
        assertEquals(new BigDecimal("12812.50"), BuiltInCatalogue.ADD_INTEREST.apply(new BigDecimal("12500.00"), new BigDecimal("2.5")));
        assertEquals("****1001", BuiltInCatalogue.MASK.apply("ACC-1001"));
        assertEquals(new BigDecimal("165.50"), BuiltInCatalogue.ADD.apply(new BigDecimal("120.00"), new BigDecimal("45.50")));
        assertEquals(List.of("ACC-1013"), SampleData.accounts().stream().filter(BuiltInCatalogue.OVERDRAWN).map(a -> a.number()).toList());
        assertTrue(BuiltInCatalogue.HAS_TIER.test(SampleData.customers().get(0), Tier.GOLD));
        assertFalse(BuiltInCatalogue.HAS_TIER.test(SampleData.customers().get(0), Tier.SILVER));
    }

    @Test
    void primitiveSpecialisationsAvoidBoxing() {
        assertEquals(1808, PrimitiveSpecialisations.totalBooked(SampleData.flights()));
        assertEquals(List.of("TR808", "SQ21"), PrimitiveSpecialisations.nearlyFull(SampleData.flights()));
        assertEquals(518, PrimitiveSpecialisations.WITH_OVERBOOKING.applyAsInt(471));
    }

    @ParameterizedTest(name = "andThen({0}) = {1}, compose({0}) = {2}")
    @CsvSource({"100.00, 110.09, 110.00", "0.00, 1.09, 1.00", "59.90, 66.38, 66.29"})
    void andThenAndComposeRunInOppositeOrder(BigDecimal amount, BigDecimal feeThenGst, BigDecimal gstThenFee) {
        assertEquals(feeThenGst, Composition.feeThenGst(amount));
        assertEquals(gstThenFee, Composition.gstThenFee(amount));
    }

    @Test
    void identityStartsAPipelineOfSteps() {
        assertEquals(new BigDecimal("111.09"),
                Composition.pipeline(List.of(Composition.ADD_FEE, Composition.ADD_GST, Composition.ADD_FEE)).apply(new BigDecimal("100.00")));
        assertEquals(new BigDecimal("100.00"), Composition.pipeline(List.of()).apply(new BigDecimal("100.00")));
    }

    @ParameterizedTest(name = "{0} -> {1}")
    @CsvSource({"debit, 45", "debit and large, 3", "debit or large, 53", "not debit, 15", "not large, 49", "not (debit and large), 57"})
    void predicateCompositionCounts(String rule, long expected) {
        Predicate<com.itgreenzone.fp.data.Transaction> p = switch (rule) {
            case "debit" -> Composition.IS_DEBIT;
            case "debit and large" -> Composition.IS_DEBIT.and(Composition.IS_LARGE);
            case "debit or large" -> Composition.IS_DEBIT.or(Composition.IS_LARGE);
            case "not debit" -> Composition.IS_DEBIT.negate();
            case "not large" -> Predicate.not(Composition.IS_LARGE);
            default -> Composition.IS_DEBIT.and(Composition.IS_LARGE).negate();
        };
        assertEquals(expected, Composition.count(p));
    }

    @Test
    void maxByAndComparator() {
        assertEquals("P005", Composition.largestPayment().orElseThrow().id());
        assertEquals(List.of("ACC-1006", "ACC-1015", "ACC-1004"), Composition.accountsByBalanceDesc());
    }

    @Test
    void olderSamsAcceptLambdas() throws Exception {
        StringBuilder log = new StringBuilder();
        OlderSams.endOfDayJob(log).run();
        assertEquals("EOD job ran", log.toString());
        assertEquals(new BigDecimal("2999.19"), OlderSams.settledTotal().call());
        assertEquals(List.of("a.csv"), OlderSams.csvFiles(List.of(new File("a.csv"), new File("b.txt"))));
        assertEquals("supplier ran", OverloadingStandards.runSupplier(() -> "supplier ran"));
    }
}
