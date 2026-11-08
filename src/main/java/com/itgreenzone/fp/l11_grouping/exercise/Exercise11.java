package com.itgreenzone.fp.l11_grouping.exercise;

import com.itgreenzone.fp.data.Category;
import com.itgreenzone.fp.data.PolicyType;
import com.itgreenzone.fp.data.Tier;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;

/**
 * L11 EXERCISE (about 45 minutes): 12 interview-level grouping problems on SampleData.
 * Each Javadoc gives the exact expected toString() of the result. Use groupingBy / partitioningBy with the right
 * map factory and downstream collector. Then remove @Disabled in Exercise11Test.
 */
public final class Exercise11 {

    private Exercise11() {
    }

    /**
     * 1: number of customers per city, cities sorted (TreeMap).
     * Expected: {Bangkok=1, Colombo=1, Jakarta=2, Kuala Lumpur=2, Singapore=4}
     */
    public static Map<String, Long> customersPerCity() {
        throw new UnsupportedOperationException("TODO 1");
    }

    /**
     * 2: customer names per tier, tiers in enum order (EnumMap).
     * Expected: {SILVER=[Bala Kumar, Ethan Lim, Hana Sato, Irfan Hakim], GOLD=[Alice Tan, Dewi Lestari, Ganesh Perera, Jasmine Ong], PLATINUM=[Chen Wei, Farah Aziz]}
     */
    public static Map<Tier, List<String>> namesPerTier() {
        throw new UnsupportedOperationException("TODO 2");
    }

    /**
     * 3: total DEBIT amount per category (EnumMap, BigDecimal).
     * Expected: {TRANSFER=7190.92, GROCERIES=1131.80, DINING=839.28, TRAVEL=3173.90, UTILITIES=1578.49, SHOPPING=1577.27, INSURANCE=1200.78}
     */
    public static Map<Category, BigDecimal> debitTotalPerCategory() {
        throw new UnsupportedOperationException("TODO 3");
    }

    /**
     * 4: average premium per policy type, scale 2 HALF_UP (collectingAndThen).
     * Expected: {LIFE=2125.00, HEALTH=1032.88, MOTOR=1275.25, TRAVEL=197.50, HOME=782.63}
     */
    public static Map<PolicyType, BigDecimal> averagePremiumPerType() {
        throw new UnsupportedOperationException("TODO 4");
    }

    /**
     * 5: id of the largest transaction per account (maxBy + unwrap the Optional).
     * Expected: {ACC-1001=T018, ACC-1002=T005, ACC-1003=T049, ACC-1004=T025, ACC-1005=T029, ACC-1007=T019, ACC-1008=T038, ACC-1009=T040, ACC-1010=T027, ACC-1011=T033, ACC-1012=T057, ACC-1013=T039, ACC-1014=T052}
     */
    public static Map<String, String> largestTxnPerAccount() {
        throw new UnsupportedOperationException("TODO 5");
    }

    /**
     * 6: ids of the 3 largest transactions per account (ties by id).
     * Expected: {ACC-1001=[T018, T009, T012], ACC-1002=[T005, T020], ACC-1003=[T049, T055, T042], ACC-1004=[T025, T026, T028], ACC-1005=[T029, T059, T053], ACC-1007=[T019, T014, T030], ACC-1008=[T038, T003, T058], ACC-1009=[T040, T047, T054], ACC-1010=[T027, T056, T050], ACC-1011=[T033, T060, T051], ACC-1012=[T057, T036, T021], ACC-1013=[T039, T023, T024], ACC-1014=[T052, T007, T006]}
     */
    public static Map<String, List<String>> top3PerAccount() {
        throw new UnsupportedOperationException("TODO 6");
    }

    /**
     * 7: city -> tier -> count (two-level grouping).
     * Expected: {Bangkok={SILVER=1}, Colombo={GOLD=1}, Jakarta={SILVER=1, GOLD=1}, Kuala Lumpur={SILVER=1, PLATINUM=1}, Singapore={SILVER=1, GOLD=2, PLATINUM=1}}
     */
    public static Map<String, Map<Tier, Long>> cityTierCount() {
        throw new UnsupportedOperationException("TODO 7");
    }

    /**
     * 8: FAILED payments per method, KEEPING methods with 0 (filtering, not filter).
     * Expected: {CARD=0, PAYNOW=1, PAYPAL=1}
     */
    public static Map<String, Long> failedPerMethodWithZeros() {
        throw new UnsupportedOperationException("TODO 8");
    }

    /**
     * 9: total amount of SUCCESS (true) vs all other payments (false).
     * Expected: {false=1430.65, true=2999.19}
     */
    public static Map<Boolean, BigDecimal> successPartitionTotals() {
        throw new UnsupportedOperationException("TODO 9");
    }

    /**
     * 10: policy numbers by expiry YearMonth, chronological.
     * Expected: {2026-11=[POL-502, POL-505, POL-509], 2026-12=[POL-503, POL-508], 2027-01=[POL-506], 2027-02=[POL-510], 2027-03=[POL-501], 2027-06=[POL-504], 2028-09=[POL-507]}
     */
    public static Map<YearMonth, List<String>> policiesByExpiryMonth() {
        throw new UnsupportedOperationException("TODO 10");
    }

    /**
     * 11: the n most frequent categories as "CATEGORY=count", count desc then name (n = 3).
     * Expected: [TRANSFER=15, DINING=10, SALARY=8]
     */
    public static List<String> topCategoriesByCount(int n) {
        throw new UnsupportedOperationException("TODO 11");
    }

    /**
     * 12: the highest-balance account number per customer.
     * Expected: {C001=ACC-1001, C002=ACC-1003, C003=ACC-1006, C004=ACC-1007, C005=ACC-1008, C006=ACC-1009, C007=ACC-1011, C008=ACC-1012, C009=ACC-1013, C010=ACC-1015}
     */
    public static Map<String, String> richestAccountPerCustomer() {
        throw new UnsupportedOperationException("TODO 12");
    }
}
