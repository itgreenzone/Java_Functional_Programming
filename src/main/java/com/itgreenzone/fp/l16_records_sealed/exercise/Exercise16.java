package com.itgreenzone.fp.l16_records_sealed.exercise;

import com.itgreenzone.fp.data.PolicyType;
import com.itgreenzone.fp.l16_records_sealed.solution.Solution16.Claim;
import com.itgreenzone.fp.l16_records_sealed.solution.Solution16.ClaimOutcome;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * L16 EXERCISE (about 45 minutes): insurance claim outcomes with sealed records, processed with streams.
 *
 * The MODEL is given (so the tests compile): read it first in Solution16 (Claim, the sealed ClaimOutcome and its
 * four records Approved | PartiallyApproved | Rejected | UnderReview, and the eight CLAIMS). Do not read the
 * method bodies there until you are done.
 *
 * Rules (course rules): unknown policy -> Rejected("unknown policy"); incident after the policy's expiry ->
 * Rejected("policy expired"); documents missing -> UnderReview("documents missing"); claimed over 10 x annual
 * premium -> PartiallyApproved(paid = 10 x premium, "over limit"); otherwise Approved(paid = claimed).
 * Use pattern-matching switches without default. Then remove @Disabled in Exercise16Test.
 */
public final class Exercise16 {

    private Exercise16() {
    }

    /** 1: decide one claim. CL-03 (POL-503, premium 960.00, claimed 12000.00) -> PartiallyApproved[claimId=CL-03, paid=9600.00, reason=over limit] */
    public static ClaimOutcome decide(Claim c) {
        throw new UnsupportedOperationException("TODO 1");
    }

    /**
     * 2: describe an outcome with record patterns and a guard ("(large)" when an Approved payment is at least 5000.00).
     * Examples: "CL-01 APPROVED (large) 5000.00", "CL-05 APPROVED 380.50", "CL-03 PARTIAL 9600.00 (over limit)",
     * "CL-02 REJECTED (policy expired)", "CL-04 UNDER REVIEW (documents missing)"
     */
    public static String describe(ClaimOutcome o) {
        throw new UnsupportedOperationException("TODO 2");
    }

    /** 3: all outcomes, in claim order (8 outcomes). The first is Approved[claimId=CL-01, paid=5000.00]. */
    public static List<ClaimOutcome> outcomes() {
        throw new UnsupportedOperationException("TODO 3");
    }

    /** 4: count per kind, TreeMap. Expected: {APPROVED=3, PARTIAL=2, REJECTED=2, UNDER_REVIEW=1} */
    public static Map<String, Long> countByKind() {
        throw new UnsupportedOperationException("TODO 4");
    }

    /** 5: amount paid for one outcome; 0.00 when nothing is paid. */
    public static BigDecimal paid(ClaimOutcome o) {
        throw new UnsupportedOperationException("TODO 5");
    }

    /** 6: total paid. Expected: 35280.50 */
    public static BigDecimal totalPaid() {
        throw new UnsupportedOperationException("TODO 6");
    }

    /** 7: rejected claims as "id: reason". Expected: [CL-02: policy expired, CL-06: unknown policy] */
    public static List<String> rejected() {
        throw new UnsupportedOperationException("TODO 7");
    }

    /** 8: paid per policy type, EnumMap. Expected: {LIFE=5000.00, HEALTH=9600.00, MOTOR=13100.00, TRAVEL=380.50, HOME=7200.00} */
    public static Map<PolicyType, BigDecimal> paidPerPolicyType() {
        throw new UnsupportedOperationException("TODO 8");
    }

    /** 9: describe the last outcome with List.getLast() [21]. Expected: CL-08 PARTIAL 13100.00 (over limit) */
    public static String lastOutcome() {
        throw new UnsupportedOperationException("TODO 9");
    }
}
