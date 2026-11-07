package com.itgreenzone.fp.l05_optional;

import com.itgreenzone.fp.data.AccountType;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.l05_optional.theory.AntiPatterns;
import com.itgreenzone.fp.l05_optional.theory.BankRepository;
import com.itgreenzone.fp.l05_optional.theory.ConsumingOptionals;
import com.itgreenzone.fp.l05_optional.theory.CreatingOptionals;
import com.itgreenzone.fp.l05_optional.theory.OrElseVsOrElseGet;
import com.itgreenzone.fp.l05_optional.theory.PrimitiveOptionals;
import com.itgreenzone.fp.l05_optional.theory.TransformingOptionals;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.OptionalInt;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class OptionalApiTest {

    @Test
    void creating() {
        assertEquals(Optional.of("Ali"), CreatingOptionals.nickname("C001"));
        assertEquals(Optional.empty(), CreatingOptionals.nickname("C002"));
        assertThrows(NullPointerException.class, () -> Optional.of(CreatingOptionals.legacyNickname("C002")));
        assertEquals("Optional.of(null) -> NullPointerException", CreatingOptionals.describeOfNull());
    }

    @ParameterizedTest(name = "{0}: orElse calls={1}, orElseGet calls={2}")
    @CsvSource({"C001, 1, 0", "C999, 1, 1"})
    void orElseIsEagerOrElseGetIsLazy(String id, int orElseCalls, int orElseGetCalls) {
        StringBuilder eager = new StringBuilder();
        StringBuilder lazy = new StringBuilder();
        assertEquals(OrElseVsOrElseGet.withOrElse(id, eager), OrElseVsOrElseGet.withOrElseGet(id, lazy));
        assertEquals(orElseCalls, count(eager));
        assertEquals(orElseGetCalls, count(lazy));
    }

    private static int count(StringBuilder calls) {
        return calls.toString().isBlank() ? 0 : calls.toString().strip().split(" ").length;
    }

    @ParameterizedTest(name = "chain {0} {1} -> {2}")
    @CsvSource({"C001, SAVINGS, 447.37", "C003, FIXED_DEPOSIT, empty", "C005, CURRENT, empty", "C999, SAVINGS, empty", "C009, CURRENT, 4231.84"})
    void flatMapChainCustomerAccountTransaction(String customerId, AccountType type, String expected) {
        Optional<BigDecimal> amount = TransformingOptionals.latestAmount(customerId, type);
        assertEquals(expected, amount.map(BigDecimal::toPlainString).orElse("empty"));
    }

    @Test
    void mapFilterAndNestedMap() {
        assertEquals(Optional.of("Jakarta"), TransformingOptionals.customerCity("C004"));
        assertTrue(TransformingOptionals.activePolicy("POL-509", LocalDate.of(2026, 11, 7)).isPresent());
        assertTrue(TransformingOptionals.activePolicy("POL-509", LocalDate.of(2026, 11, 13)).isEmpty());
        assertEquals(Optional.of(Optional.of("ACC-1012")),
                TransformingOptionals.nestedWithMap("C008").map(o -> o.map(a -> a.number())));
    }

    @Test
    void consuming() {
        assertEquals("Hello Bala Kumar", ConsumingOptionals.greet("C002"));
        assertEquals("Customer C999 not found", ConsumingOptionals.greet("C999"));
        IllegalArgumentException e = assertThrows(IllegalArgumentException.class, () -> ConsumingOptionals.requireCustomer("C999"));
        assertEquals("Unknown customer C999", e.getMessage());
        assertEquals("NoSuchElementException: No value present", ConsumingOptionals.noArgOrElseThrowMessage());
        assertEquals(Optional.of("Jasmine Ong"), ConsumingOptionals.nameFromPrimaryOrBackup("C999", "C010"));
        assertEquals(Optional.of("Alice Tan"), ConsumingOptionals.nameFromPrimaryOrBackup("C001", "C010"));
        assertEquals(List.of("POL-502", "POL-509"), ConsumingOptionals.existingPolicies(List.of("POL-502", "POL-999", "POL-509")));
        assertTrue(ConsumingOptionals.unknown("C999"));
        assertFalse(ConsumingOptionals.unknown("C001"));
        assertEquals(new BigDecimal("1105.75"), ConsumingOptionals.premiumOrZero("POL-506"));
        assertEquals(BigDecimal.ZERO, ConsumingOptionals.premiumOrZero("POL-999"));
        assertThrows(NoSuchElementException.class, () -> BankRepository.findCustomer("C999").get());
    }

    @Test
    void primitiveOptionals() {
        assertEquals(OptionalInt.of(63), PrimitiveOptionals.mostSeatsLeft(SampleData.flights()));
        assertEquals(OptionalInt.empty(), PrimitiveOptionals.mostSeatsLeft(List.of()));
        assertEquals(455L, PrimitiveOptionals.largestBooking(SampleData.flights()).getAsLong());
        double avg = PrimitiveOptionals.averageLoadFactorPercent(SampleData.flights()).getAsDouble();
        assertTrue(avg > 84.0 && avg < 84.2, "average was " + avg);
    }

    @Test
    void antiPatternsAndTheirFixesAgree() {
        for (String id : List.of("C001", "C003", "C999")) {
            assertEquals(AntiPatterns.nameBad(id), AntiPatterns.nameGood(id));
        }
        assertEquals("get() on empty -> No value present", AntiPatterns.getWithoutCheck("C999"));
        assertEquals(Optional.empty(), new AntiPatterns.CustomerProfile(null).nickname());
        assertEquals(Optional.of("Ali"), new AntiPatterns.CustomerProfile("Ali").nickname());
        assertEquals(List.of(), AntiPatterns.policies("C005"));
        assertEquals(Optional.empty(), AntiPatterns.policiesBad("C005"));
        assertEquals(2, AntiPatterns.policies("C003").size());
    }
}
