package com.itgreenzone.fp.l10_collectors.after;

import com.itgreenzone.fp.data.Policy;
import com.itgreenzone.fp.data.PolicyType;
import com.itgreenzone.fp.data.SampleData;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

/**
 * AFTER (Java 8): three toMap collectors with merge functions and TreeMap (enum keys sort by declaration order),
 * plus reducing for the grand total. Still three passes over the data.
 */
public final class StreamPortfolioSummary {

    private StreamPortfolioSummary() {
    }

    public static List<String> summary() {
        List<Policy> policies = SampleData.policies();
        Map<PolicyType, Long> counts = policies.stream()
                .collect(Collectors.toMap(Policy::type, p -> 1L, Long::sum, TreeMap::new));
        Map<PolicyType, BigDecimal> totals = policies.stream()
                .collect(Collectors.toMap(Policy::type, Policy::premium, BigDecimal::add, TreeMap::new));
        Map<PolicyType, String> numbers = policies.stream()
                .collect(Collectors.toMap(Policy::type, Policy::number, (a, b) -> a + ", " + b, TreeMap::new));
        BigDecimal grand = policies.stream().collect(Collectors.reducing(BigDecimal.ZERO, Policy::premium, BigDecimal::add));

        List<String> lines = counts.keySet().stream()
                .map(t -> t + ": " + counts.get(t) + " policies, " + totals.get(t) + " [" + numbers.get(t) + "]")
                .collect(Collectors.toCollection(ArrayList::new));
        lines.add("TOTAL: " + policies.size() + " policies, " + grand);
        return lines;
    }

    public static void main(String[] args) {
        summary().forEach(System.out::println);
    }
}
