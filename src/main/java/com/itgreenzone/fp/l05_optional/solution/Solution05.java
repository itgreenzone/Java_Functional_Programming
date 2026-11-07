package com.itgreenzone.fp.l05_optional.solution;

import com.itgreenzone.fp.data.Customer;
import com.itgreenzone.fp.data.Policy;
import com.itgreenzone.fp.data.SampleData;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/** Reference solution for the L05 exercise: no null checks anywhere. */
public final class Solution05 {

    /** Course "today", fixed so that results are deterministic. */
    public static final LocalDate TODAY = LocalDate.of(2026, 11, 7);

    private Solution05() {
    }

    public static Optional<Policy> findPolicy(String number) {
        return SampleData.policies().stream()
                .filter(p -> p.number().equals(number))
                .findFirst();
    }

    public static Optional<Customer> findCustomer(String id) {
        return SampleData.customers().stream()
                .filter(c -> c.id().equals(id))
                .findFirst();
    }

    public static String holderName(String policyNumber) {
        return findPolicy(policyNumber)
                .flatMap(p -> findCustomer(p.customerId()))
                .map(Customer::name)
                .orElse("UNKNOWN");
    }

    public static BigDecimal premiumOrZero(String policyNumber) {
        return findPolicy(policyNumber)
                .map(Policy::premium)
                .orElse(BigDecimal.ZERO);
    }

    public static Optional<LocalDate> activeExpiry(String policyNumber, LocalDate today) {
        return findPolicy(policyNumber)
                .filter(p -> !p.expiry().isBefore(today))
                .map(Policy::expiry);
    }

    private static boolean expiresWithin30Days(Policy p, LocalDate today) {
        return !p.expiry().isBefore(today) && !p.expiry().isAfter(today.plusDays(30));
    }

    public static List<String> renewalReminders(List<String> numbers, LocalDate today) {
        return numbers.stream()
                .map(Solution05::findPolicy)
                .flatMap(Optional::stream)
                .filter(p -> expiresWithin30Days(p, today))
                .map(p -> p.number() + " " + p.type() + " expires " + p.expiry() + " - remind " + holderName(p.number()))
                .toList();
    }

    public static void main(String[] args) {
        System.out.println("holderName POL-506 / POL-999 : " + holderName("POL-506") + " / " + holderName("POL-999"));
        System.out.println("premiumOrZero POL-510 / X    : " + premiumOrZero("POL-510") + " / " + premiumOrZero("X"));
        System.out.println("activeExpiry POL-505         : " + activeExpiry("POL-505", TODAY));
        System.out.println("activeExpiry POL-505 in Dec  : " + activeExpiry("POL-505", LocalDate.of(2026, 12, 1)));
        List<String> all = SampleData.policies().stream().map(Policy::number).toList();
        List<String> withUnknown = new java.util.ArrayList<>(all);
        withUnknown.add(2, "POL-999");
        renewalReminders(withUnknown, TODAY).forEach(System.out::println);
    }
}
