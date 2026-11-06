package com.itgreenzone.fp.data;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DisplayName("Shared dataset is complete, consistent and immutable")
class SampleDataTest {

    @Test
    void sizesMatchTheCourseSpecification() {
        assertEquals(10, SampleData.customers().size());
        assertEquals(15, SampleData.accounts().size());
        assertEquals(60, SampleData.transactions().size());
        assertEquals(10, SampleData.policies().size());
        assertEquals(8, SampleData.flights().size());
        assertEquals(12, SampleData.payments().size());
    }

    @Test
    void idsAreUnique() {
        assertEquals(60L, SampleData.transactions().stream().map(Transaction::id).distinct().count());
        assertEquals(15L, SampleData.accounts().stream().map(Account::number).distinct().count());
    }

    @Test
    void everyTransactionAndAccountPointsToAnExistingParent() {
        var accountNumbers = SampleData.accounts().stream().map(Account::number).collect(Collectors.toSet());
        var customerIds = SampleData.customers().stream().map(Customer::id).collect(Collectors.toSet());
        assertTrue(SampleData.transactions().stream().allMatch(t -> accountNumbers.contains(t.accountNumber())));
        assertTrue(SampleData.accounts().stream().allMatch(a -> customerIds.contains(a.customerId())));
    }

    @Test
    void moneyIsScaleTwoAndAmountsArePositive() {
        assertTrue(SampleData.transactions().stream().allMatch(t -> t.amount().scale() == 2));
        assertTrue(SampleData.transactions().stream().allMatch(t -> t.amount().signum() > 0));
        assertTrue(SampleData.accounts().stream().allMatch(a -> a.balance().scale() == 2));
    }

    @Test
    void exactlyOneAccountIsOverdrawn() {
        assertEquals(1L, SampleData.accounts().stream().filter(a -> a.balance().compareTo(BigDecimal.ZERO) < 0).count());
    }

    @Test
    void listsAreImmutable() {
        assertThrows(UnsupportedOperationException.class, () -> SampleData.transactions().clear());
    }
}
