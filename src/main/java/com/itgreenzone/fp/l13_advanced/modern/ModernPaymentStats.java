package com.itgreenzone.fp.l13_advanced.modern;

import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.l13_advanced.theory.CustomCollectors;

import java.util.List;
import java.util.TreeMap;
import java.util.stream.Collectors;

/**
 * MODERN: one pass, one reusable custom collector (CustomCollectors.moneyStats(), built with Collector.of)
 * used as the downstream of groupingBy. The MoneyStats record formats itself.
 */
public final class ModernPaymentStats {

    private ModernPaymentStats() {
    }

    public static List<String> report() {
        return SampleData.payments().stream()
                .collect(Collectors.groupingBy(Payment::method, TreeMap::new,
                        Collectors.mapping(Payment::amount, CustomCollectors.moneyStats())))
                .entrySet().stream()
                .map(e -> e.getKey() + ": " + e.getValue())
                .toList();
    }

    public static void main(String[] args) {
        report().forEach(System.out::println);
    }
}
