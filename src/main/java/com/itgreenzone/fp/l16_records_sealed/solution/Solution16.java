package com.itgreenzone.fp.l16_records_sealed.solution;

import com.itgreenzone.fp.data.Policy;
import com.itgreenzone.fp.data.PolicyType;
import com.itgreenzone.fp.data.SampleData;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.TreeMap;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * L16 reference solution: insurance claim outcomes modelled with sealed records and processed with streams.
 * Course rules for this exercise (stated, not real insurance terms):
 *   unknown policy -> Rejected("unknown policy"); incident after expiry -> Rejected("policy expired");
 *   documents missing -> UnderReview("documents missing"); claimed over 10 x annual premium ->
 *   PartiallyApproved(paid = 10 x premium, "over limit"); otherwise Approved(paid = claimed).
 */
public final class Solution16 {

    private Solution16() {
    }

    /** A claim. The compact constructor validates: positive amount, scale 2. [16] */
    public record Claim(String id, String policyNumber, LocalDate incident, BigDecimal claimed, boolean documentsComplete) {
        public Claim {
            Objects.requireNonNull(id, "id");
            Objects.requireNonNull(policyNumber, "policyNumber");
            Objects.requireNonNull(incident, "incident");
            if (claimed.signum() <= 0) {
                throw new IllegalArgumentException("claimed must be positive: " + claimed);
            }
            claimed = claimed.setScale(2);
        }
    }

    /** The outcome of a claim: exactly one of four records. [17 sealed + 16 records] */
    public sealed interface ClaimOutcome permits Approved, PartiallyApproved, Rejected, UnderReview {
        String claimId();
    }

    public record Approved(String claimId, BigDecimal paid) implements ClaimOutcome { }

    public record PartiallyApproved(String claimId, BigDecimal paid, String reason) implements ClaimOutcome { }

    public record Rejected(String claimId, String reason) implements ClaimOutcome { }

    public record UnderReview(String claimId, String reason) implements ClaimOutcome { }

    /** The exercise input: eight claims against SampleData policies (the dataset has no claims). */
    public static final List<Claim> CLAIMS = List.of(
            new Claim("CL-01", "POL-501", LocalDate.of(2026, 10, 1), new BigDecimal("5000.00"), true),
            new Claim("CL-02", "POL-502", LocalDate.of(2026, 12, 10), new BigDecimal("800.00"), true),
            new Claim("CL-03", "POL-503", LocalDate.of(2026, 11, 2), new BigDecimal("12000.00"), true),
            new Claim("CL-04", "POL-505", LocalDate.of(2026, 11, 1), new BigDecimal("450.00"), false),
            new Claim("CL-05", "POL-509", LocalDate.of(2026, 11, 5), new BigDecimal("380.50"), true),
            new Claim("CL-06", "POL-999", LocalDate.of(2026, 10, 20), new BigDecimal("100.00"), true),
            new Claim("CL-07", "POL-504", LocalDate.of(2026, 9, 15), new BigDecimal("7200.00"), true),
            new Claim("CL-08", "POL-508", LocalDate.of(2026, 11, 2), new BigDecimal("15000.00"), true));

    static Optional<Policy> policy(String number) {
        return SampleData.policies().stream().filter(p -> p.number().equals(number)).findFirst();
    }

    /** 1: decide one claim (rules in the class Javadoc). */
    public static ClaimOutcome decide(Claim c) {
        Optional<Policy> found = policy(c.policyNumber());
        if (found.isEmpty()) {
            return new Rejected(c.id(), "unknown policy");
        }
        Policy p = found.get();
        if (c.incident().isAfter(p.expiry())) {
            return new Rejected(c.id(), "policy expired");
        }
        if (!c.documentsComplete()) {
            return new UnderReview(c.id(), "documents missing");
        }
        BigDecimal limit = p.premium().multiply(BigDecimal.TEN).setScale(2);
        return c.claimed().compareTo(limit) > 0
                ? new PartiallyApproved(c.id(), limit, "over limit")
                : new Approved(c.id(), c.claimed());
    }

    /** 2: describe with an exhaustive pattern switch, record patterns and a guard. [21] */
    public static String describe(ClaimOutcome o) {
        return switch (o) {
            case Approved(var id, var paid) when paid.compareTo(new BigDecimal("5000")) >= 0 -> id + " APPROVED (large) " + paid;
            case Approved(var id, var paid) -> id + " APPROVED " + paid;
            case PartiallyApproved(var id, var paid, var reason) -> id + " PARTIAL " + paid + " (" + reason + ")";
            case Rejected(var id, var reason) -> id + " REJECTED (" + reason + ")";
            case UnderReview(var id, var reason) -> id + " UNDER REVIEW (" + reason + ")";
        };
    }

    /** 3: all outcomes, in claim order. */
    public static List<ClaimOutcome> outcomes() {
        return CLAIMS.stream().map(Solution16::decide).toList();
    }

    /** 4: number of outcomes per kind (TreeMap by kind name). */
    public static Map<String, Long> countByKind() {
        return outcomes().stream().collect(Collectors.groupingBy(o -> switch (o) {
            case Approved a -> "APPROVED";
            case PartiallyApproved p -> "PARTIAL";
            case Rejected r -> "REJECTED";
            case UnderReview u -> "UNDER_REVIEW";
        }, TreeMap::new, Collectors.counting()));
    }

    /** 5: the amount paid for one outcome (0.00 if nothing is paid). */
    public static BigDecimal paid(ClaimOutcome o) {
        return switch (o) {
            case Approved(var id, var paid) -> paid;
            case PartiallyApproved(var id, var paid, var reason) -> paid;
            case Rejected r -> BigDecimal.ZERO.setScale(2);
            case UnderReview u -> BigDecimal.ZERO.setScale(2);
        };
    }

    /** 6: total paid across all claims. */
    public static BigDecimal totalPaid() {
        return outcomes().stream().map(Solution16::paid).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /** 7: ids of rejected claims with their reason, using instanceof patterns [16]. */
    public static List<String> rejected() {
        return outcomes().stream()
                .flatMap(o -> o instanceof Rejected r ? Stream.of(r.claimId() + ": " + r.reason()) : Stream.empty())
                .toList();
    }

    /** 8: paid amount per policy type (EnumMap; types with no payment are absent). */
    public static Map<PolicyType, BigDecimal> paidPerPolicyType() {
        record Paid(PolicyType type, BigDecimal amount) { }      // a local record for the intermediate step
        return CLAIMS.stream()
                .map(c -> new Paid(policy(c.policyNumber()).map(Policy::type).orElse(null), paid(decide(c))))
                .filter(p -> p.amount().signum() > 0)
                .collect(Collectors.groupingBy(Paid::type, () -> new EnumMap<>(PolicyType.class),
                        Collectors.reducing(BigDecimal.ZERO, Paid::amount, BigDecimal::add)));
    }

    /** 9: the last outcome, using SequencedCollection.getLast() [21]. */
    public static String lastOutcome() {
        return describe(outcomes().getLast());
    }

    public static void main(String[] args) {
        outcomes().forEach(o -> System.out.println(describe(o)));
        System.out.println("4 count by kind      : " + countByKind());
        System.out.println("6 total paid         : " + totalPaid());
        System.out.println("7 rejected           : " + rejected());
        System.out.println("8 paid per policy type: " + paidPerPolicyType());
        System.out.println("9 last outcome       : " + lastOutcome());
    }
}
