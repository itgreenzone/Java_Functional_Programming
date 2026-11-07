package com.itgreenzone.fp.l10_collectors.solution;

import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.PaymentStatus;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.l10_collectors.exercise.Exercise10.MethodSummary;

import java.math.BigDecimal;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

/** Reference solution for Exercise10. */
public final class Solution10 {

    private Solution10() {
    }

    public static Map<String, Long> countByMethod() {
        return SampleData.payments().stream()
                .collect(Collectors.toMap(Payment::method, p -> 1L, Long::sum, TreeMap::new));
    }

    public static Map<String, BigDecimal> totalByMethod() {
        return SampleData.payments().stream()
                .collect(Collectors.toMap(Payment::method, Payment::amount, BigDecimal::add, TreeMap::new));
    }

    public static Map<String, MethodSummary> summaryByMethod() {
        return SampleData.payments().stream()
                .collect(Collectors.toMap(Payment::method, p -> new MethodSummary(1, p.amount()),
                        MethodSummary::merge, TreeMap::new));
    }

    public static Map<String, MethodSummary> successSummaryByMethod() {
        return SampleData.payments().stream()
                .filter(p -> p.status() == PaymentStatus.SUCCESS)
                .collect(Collectors.toMap(Payment::method, p -> new MethodSummary(1, p.amount()),
                        MethodSummary::merge, TreeMap::new));
    }

    public static String gatewayLine() {
        String totals = SampleData.payments().stream()
                .collect(Collectors.teeing(
                        Collectors.counting(),
                        Collectors.reducing(BigDecimal.ZERO, Payment::amount, BigDecimal::add),
                        (n, sum) -> n + " payments, " + sum + " total"));
        String failed = SampleData.payments().stream()
                .filter(p -> p.status() == PaymentStatus.FAILED)
                .map(Payment::id)
                .collect(Collectors.joining(", "));
        return totals + ", failed: " + failed;
    }

    public static void main(String[] args) {
        System.out.println("1 count by method   : " + countByMethod());
        System.out.println("2 total by method   : " + totalByMethod());
        System.out.println("3 summary by method : " + summaryByMethod());
        System.out.println("4 SUCCESS only      : " + successSummaryByMethod());
        System.out.println("5 gateway           : " + gatewayLine());
    }
}
