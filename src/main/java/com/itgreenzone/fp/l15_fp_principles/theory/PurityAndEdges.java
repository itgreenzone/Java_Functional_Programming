package com.itgreenzone.fp.l15_fp_principles.theory;

import com.itgreenzone.fp.data.Policy;
import com.itgreenzone.fp.data.SampleData;

import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.function.Supplier;

/**
 * Pure functions and referential transparency, beyond L01:
 * - a function that reads the clock is impure; inject the date (or a Clock) to make it pure and testable,
 * - "functional core, imperative shell": pure calculations in the middle, I/O (clock, console) at the edges.
 */
public final class PurityAndEdges {

    /** The course's fixed "today". */
    public static final LocalDate COURSE_DATE = LocalDate.of(2026, 11, 7);

    private PurityAndEdges() {
    }

    /** IMPURE: the answer changes with the real date, so a test written today fails next month. */
    public static List<String> expiringSoonImpure(List<Policy> policies, int days) {
        LocalDate today = LocalDate.now();
        return expiringSoon(policies, today, days);
    }

    /** PURE: same inputs, same output, no side effects. The date is a parameter. */
    public static List<String> expiringSoon(List<Policy> policies, LocalDate today, int days) {
        return policies.stream()
                .filter(p -> !p.expiry().isBefore(today) && !p.expiry().isAfter(today.plusDays(days)))
                .sorted(java.util.Comparator.comparing(Policy::expiry))
                .map(p -> p.number() + " in " + ChronoUnit.DAYS.between(today, p.expiry()) + " days")
                .toList();
    }

    /** Edge adapter: a Clock is injected at the edge (production: Clock.systemDefaultZone(); tests: Clock.fixed). */
    public static List<String> expiringSoon(List<Policy> policies, Clock clock, int days) {
        return expiringSoon(policies, LocalDate.now(clock), days);
    }

    /** Referential transparency: a pure call can be replaced by its value without changing the program. */
    public static boolean referentiallyTransparent() {
        List<String> a = expiringSoon(SampleData.policies(), COURSE_DATE, 30);
        List<String> b = expiringSoon(SampleData.policies(), COURSE_DATE, 30);
        return a.equals(b);
    }

    /** A counter-example: two calls to the same impure supplier give different values. */
    public static boolean impureSupplierChanges() {
        int[] calls = {0};
        Supplier<Integer> nextTicket = () -> ++calls[0];
        return !nextTicket.get().equals(nextTicket.get());
    }

    /** The imperative shell: the only method that does I/O. Everything it prints was computed by pure code. */
    public static void main(String[] args) {
        Clock fixed = Clock.fixed(COURSE_DATE.atStartOfDay(ZoneId.of("Asia/Singapore")).toInstant(), ZoneId.of("Asia/Singapore"));
        System.out.println("expiring in 30 days (pure)  : " + expiringSoon(SampleData.policies(), COURSE_DATE, 30));
        System.out.println("same via a fixed Clock      : " + expiringSoon(SampleData.policies(), fixed, 30));
        System.out.println("expiring in 7 days          : " + expiringSoon(SampleData.policies(), COURSE_DATE, 7));
        System.out.println("call == call (transparent)  : " + referentiallyTransparent());
        System.out.println("impure supplier differs     : " + impureSupplierChanges());
    }
}
