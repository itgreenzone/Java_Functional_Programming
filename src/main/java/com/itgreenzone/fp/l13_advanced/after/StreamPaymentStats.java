package com.itgreenzone.fp.l13_advanced.after;

import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.SampleData;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.TreeMap;
import java.util.stream.Collectors;

import static java.util.Comparator.comparing;

/** AFTER (Java 8): four groupingBy passes with built-in collectors, combined by key. */
public final class StreamPaymentStats {

    private StreamPaymentStats() {
    }

    public static List<String> report() {
        List<Payment> payments = SampleData.payments();
        Map<String, Long> count = payments.stream()
                .collect(Collectors.groupingBy(Payment::method, TreeMap::new, Collectors.counting()));
        Map<String, BigDecimal> sum = payments.stream().collect(Collectors.groupingBy(Payment::method,
                Collectors.reducing(BigDecimal.ZERO, Payment::amount, BigDecimal::add)));
        Map<String, Optional<Payment>> min = payments.stream()
                .collect(Collectors.groupingBy(Payment::method, Collectors.minBy(comparing(Payment::amount))));
        Map<String, Optional<Payment>> max = payments.stream()
                .collect(Collectors.groupingBy(Payment::method, Collectors.maxBy(comparing(Payment::amount))));
        return count.keySet().stream()
                .map(m -> m + ": count=" + count.get(m) + " sum=" + sum.get(m)
                        + " min=" + min.get(m).orElseThrow().amount() + " max=" + max.get(m).orElseThrow().amount()
                        + " avg=" + sum.get(m).divide(BigDecimal.valueOf(count.get(m)), 2, RoundingMode.HALF_UP))
                .toList();
    }

    public static void main(String[] args) {
        report().forEach(System.out::println);
    }
}
