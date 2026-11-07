package com.itgreenzone.fp.l05_optional.exercise;

import com.itgreenzone.fp.data.Customer;
import com.itgreenzone.fp.data.Policy;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * L05 EXERCISE (about 25 minutes): replace the null checks in {@link LegacyPolicyService} with Optional.
 * Rules: no null checks, no isPresent()+get(), no Optional fields or parameters. Return Optional where a
 * result may be missing. Same results as the legacy service. Then remove @Disabled in Exercise05Test.
 */
public final class Exercise05 {

    private Exercise05() {
    }

    public static Optional<Policy> findPolicy(String number) {
        // TODO 1: stream + filter + findFirst
        throw new UnsupportedOperationException("TODO 1");
    }

    public static Optional<Customer> findCustomer(String id) {
        // TODO 2
        throw new UnsupportedOperationException("TODO 2");
    }

    public static String holderName(String policyNumber) {
        // TODO 3: findPolicy -> flatMap(findCustomer) -> map(name) -> orElse("UNKNOWN")
        throw new UnsupportedOperationException("TODO 3");
    }

    public static BigDecimal premiumOrZero(String policyNumber) {
        // TODO 4: map + orElse (a constant default is fine with orElse)
        throw new UnsupportedOperationException("TODO 4");
    }

    public static Optional<LocalDate> activeExpiry(String policyNumber, LocalDate today) {
        // TODO 5: filter, then map
        throw new UnsupportedOperationException("TODO 5");
    }

    public static List<String> renewalReminders(List<String> numbers, LocalDate today) {
        // TODO 6: map(findPolicy) + flatMap(Optional::stream) + filter + map, same text as legacy
        throw new UnsupportedOperationException("TODO 6");
    }
}
