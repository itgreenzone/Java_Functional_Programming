package com.itgreenzone.fp.l16_records_sealed;

import com.itgreenzone.fp.l16_records_sealed.solution.Solution16;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** Insurance claim outcomes: the expected value of each task. */
class Solution16Test {

    @Test
    void task01Decide() {
        assertEquals("PartiallyApproved[claimId=CL-03, paid=9600.00, reason=over limit]",
                Solution16.decide(Solution16.CLAIMS.get(2)).toString());
        assertEquals("Rejected[claimId=CL-02, reason=policy expired]", Solution16.decide(Solution16.CLAIMS.get(1)).toString());
        assertEquals("Approved[claimId=CL-07, paid=7200.00]", Solution16.decide(Solution16.CLAIMS.get(6)).toString());
    }

    @Test
    void task02Describe() {
        assertEquals(List.of(
                "CL-01 APPROVED (large) 5000.00",
                "CL-02 REJECTED (policy expired)",
                "CL-03 PARTIAL 9600.00 (over limit)",
                "CL-04 UNDER REVIEW (documents missing)",
                "CL-05 APPROVED 380.50",
                "CL-06 REJECTED (unknown policy)",
                "CL-07 APPROVED (large) 7200.00",
                "CL-08 PARTIAL 13100.00 (over limit)"),
                Solution16.outcomes().stream().map(Solution16::describe).toList());
    }

    @Test
    void task03Outcomes() {
        assertEquals(8, Solution16.outcomes().size());
        assertEquals("Approved[claimId=CL-01, paid=5000.00]", Solution16.outcomes().get(0).toString());
    }

    @Test
    void task04CountByKind() {
        assertEquals("{APPROVED=3, PARTIAL=2, REJECTED=2, UNDER_REVIEW=1}", Solution16.countByKind().toString());
    }

    @Test
    void task05Paid() {
        assertEquals("0.00", Solution16.paid(Solution16.outcomes().get(1)).toString());
        assertEquals("13100.00", Solution16.paid(Solution16.outcomes().get(7)).toString());
    }

    @Test
    void task06TotalPaid() {
        assertEquals("35280.50", Solution16.totalPaid().toString());
    }

    @Test
    void task07Rejected() {
        assertEquals("[CL-02: policy expired, CL-06: unknown policy]", Solution16.rejected().toString());
    }

    @Test
    void task08PaidPerPolicyType() {
        assertEquals("{LIFE=5000.00, HEALTH=9600.00, MOTOR=13100.00, TRAVEL=380.50, HOME=7200.00}",
                Solution16.paidPerPolicyType().toString());
    }

    @Test
    void task09LastOutcome() {
        assertEquals("CL-08 PARTIAL 13100.00 (over limit)", Solution16.lastOutcome());
    }
}
