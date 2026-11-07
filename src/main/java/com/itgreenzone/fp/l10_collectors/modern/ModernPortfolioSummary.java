package com.itgreenzone.fp.l10_collectors.modern;

import com.itgreenzone.fp.data.Policy;
import com.itgreenzone.fp.data.PolicyType;
import com.itgreenzone.fp.data.SampleData;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * MODERN (Java 12-21): ONE toMap into an EnumMap whose value is an immutable record that knows how to merge
 * itself, plus teeing [12] to build the per-type map and the grand total in a single pass.
 */
public final class ModernPortfolioSummary {

    /** The summary of one or more policies. merge() is associative, so it is safe for parallel streams. */
    public record TypeSummary(long count, BigDecimal total, List<String> numbers) {
        static TypeSummary of(Policy p) {
            return new TypeSummary(1, p.premium(), List.of(p.number()));
        }

        TypeSummary merge(TypeSummary other) {
            List<String> all = new ArrayList<>(numbers);
            all.addAll(other.numbers);
            return new TypeSummary(count + other.count, total.add(other.total), List.copyOf(all));
        }

        @Override
        public String toString() {
            return count + " policies, " + total + " " + numbers;
        }
    }

    public record Portfolio(Map<PolicyType, TypeSummary> byType, TypeSummary grandTotal) {
        public List<String> lines() {
            List<String> lines = new ArrayList<>();
            byType.forEach((t, s) -> lines.add(t + ": " + s));
            lines.add("TOTAL: " + grandTotal.count() + " policies, " + grandTotal.total());
            return List.copyOf(lines);
        }
    }

    private ModernPortfolioSummary() {
    }

    public static Portfolio portfolio(List<Policy> policies) {
        return portfolio(policies.stream());
    }

    /** Works for sequential and parallel streams: merge is associative and the EnumMap keeps key order. */
    public static Portfolio portfolio(Stream<Policy> policies) {
        return policies.collect(Collectors.teeing(
                Collectors.toMap(Policy::type, TypeSummary::of, TypeSummary::merge,
                        () -> new EnumMap<>(PolicyType.class)),
                Collectors.reducing(new TypeSummary(0, BigDecimal.ZERO, List.of()), TypeSummary::of, TypeSummary::merge),
                Portfolio::new));
    }

    public static List<String> summary() {
        return portfolio(SampleData.policies()).lines();
    }

    public static void main(String[] args) {
        summary().forEach(System.out::println);
    }
}
