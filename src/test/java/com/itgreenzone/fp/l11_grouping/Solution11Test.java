package com.itgreenzone.fp.l11_grouping;

import com.itgreenzone.fp.l11_grouping.solution.Solution11;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** 12 grouping problems: the expected toString() of each result. */
class Solution11Test {

    @Test
    void problem01CustomersPerCity() {
        assertEquals("{Bangkok=1, Colombo=1, Jakarta=2, Kuala Lumpur=2, Singapore=4}", Solution11.customersPerCity().toString());
    }

    @Test
    void problem02NamesPerTier() {
        assertEquals("{SILVER=[Bala Kumar, Ethan Lim, Hana Sato, Irfan Hakim], GOLD=[Alice Tan, Dewi Lestari, Ganesh Perera, Jasmine Ong], PLATINUM=[Chen Wei, Farah Aziz]}", Solution11.namesPerTier().toString());
    }

    @Test
    void problem03DebitTotalPerCategory() {
        assertEquals("{TRANSFER=7190.92, GROCERIES=1131.80, DINING=839.28, TRAVEL=3173.90, UTILITIES=1578.49, SHOPPING=1577.27, INSURANCE=1200.78}", Solution11.debitTotalPerCategory().toString());
    }

    @Test
    void problem04AveragePremiumPerType() {
        assertEquals("{LIFE=2125.00, HEALTH=1032.88, MOTOR=1275.25, TRAVEL=197.50, HOME=782.63}", Solution11.averagePremiumPerType().toString());
    }

    @Test
    void problem05LargestTxnPerAccount() {
        assertEquals("{ACC-1001=T018, ACC-1002=T005, ACC-1003=T049, ACC-1004=T025, ACC-1005=T029, ACC-1007=T019, ACC-1008=T038, ACC-1009=T040, ACC-1010=T027, ACC-1011=T033, ACC-1012=T057, ACC-1013=T039, ACC-1014=T052}", Solution11.largestTxnPerAccount().toString());
    }

    @Test
    void problem06Top3PerAccount() {
        assertEquals("{ACC-1001=[T018, T009, T012], ACC-1002=[T005, T020], ACC-1003=[T049, T055, T042], ACC-1004=[T025, T026, T028], ACC-1005=[T029, T059, T053], ACC-1007=[T019, T014, T030], ACC-1008=[T038, T003, T058], ACC-1009=[T040, T047, T054], ACC-1010=[T027, T056, T050], ACC-1011=[T033, T060, T051], ACC-1012=[T057, T036, T021], ACC-1013=[T039, T023, T024], ACC-1014=[T052, T007, T006]}", Solution11.top3PerAccount().toString());
    }

    @Test
    void problem07CityTierCount() {
        assertEquals("{Bangkok={SILVER=1}, Colombo={GOLD=1}, Jakarta={SILVER=1, GOLD=1}, Kuala Lumpur={SILVER=1, PLATINUM=1}, Singapore={SILVER=1, GOLD=2, PLATINUM=1}}", Solution11.cityTierCount().toString());
    }

    @Test
    void problem08FailedPerMethodWithZeros() {
        assertEquals("{CARD=0, PAYNOW=1, PAYPAL=1}", Solution11.failedPerMethodWithZeros().toString());
    }

    @Test
    void problem09SuccessPartitionTotals() {
        assertEquals("{false=1430.65, true=2999.19}", Solution11.successPartitionTotals().toString());
    }

    @Test
    void problem10PoliciesByExpiryMonth() {
        assertEquals("{2026-11=[POL-502, POL-505, POL-509], 2026-12=[POL-503, POL-508], 2027-01=[POL-506], 2027-02=[POL-510], 2027-03=[POL-501], 2027-06=[POL-504], 2028-09=[POL-507]}", Solution11.policiesByExpiryMonth().toString());
    }

    @Test
    void problem11TopCategoriesByCount() {
        assertEquals("[TRANSFER=15, DINING=10, SALARY=8]", Solution11.topCategoriesByCount(3).toString());
    }

    @Test
    void problem12RichestAccountPerCustomer() {
        assertEquals("{C001=ACC-1001, C002=ACC-1003, C003=ACC-1006, C004=ACC-1007, C005=ACC-1008, C006=ACC-1009, C007=ACC-1011, C008=ACC-1012, C009=ACC-1013, C010=ACC-1015}", Solution11.richestAccountPerCustomer().toString());
    }
}
