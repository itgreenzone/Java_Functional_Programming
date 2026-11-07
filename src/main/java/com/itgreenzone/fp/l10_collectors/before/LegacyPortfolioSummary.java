package com.itgreenzone.fp.l10_collectors.before;

import com.itgreenzone.fp.data.Policy;
import com.itgreenzone.fp.data.PolicyType;
import com.itgreenzone.fp.data.SampleData;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * BEFORE (Java 7 style): insurance portfolio summary per policy type, plus a grand total.
 * Three maps kept in sync by hand, containsKey/put dances, and a StringBuilder for the number list.
 */
public final class LegacyPortfolioSummary {

    private LegacyPortfolioSummary() {
    }

    public static List<String> summary() {
        Map<PolicyType, Integer> counts = new HashMap<PolicyType, Integer>();
        Map<PolicyType, BigDecimal> totals = new HashMap<PolicyType, BigDecimal>();
        Map<PolicyType, StringBuilder> numbers = new HashMap<PolicyType, StringBuilder>();
        BigDecimal grand = BigDecimal.ZERO;
        for (Policy p : SampleData.policies()) {
            PolicyType t = p.type();
            if (!counts.containsKey(t)) {
                counts.put(t, 0);
                totals.put(t, BigDecimal.ZERO);
                numbers.put(t, new StringBuilder());
            }
            counts.put(t, counts.get(t) + 1);
            totals.put(t, totals.get(t).add(p.premium()));
            if (numbers.get(t).length() > 0) {
                numbers.get(t).append(", ");
            }
            numbers.get(t).append(p.number());
            grand = grand.add(p.premium());
        }
        List<String> lines = new ArrayList<String>();
        for (PolicyType t : PolicyType.values()) {             // enum order for a stable report
            if (counts.containsKey(t)) {
                lines.add(t + ": " + counts.get(t) + " policies, " + totals.get(t) + " [" + numbers.get(t) + "]");
            }
        }
        lines.add("TOTAL: " + SampleData.policies().size() + " policies, " + grand);
        return lines;
    }

    public static void main(String[] args) {
        summary().forEach(System.out::println);
    }
}
