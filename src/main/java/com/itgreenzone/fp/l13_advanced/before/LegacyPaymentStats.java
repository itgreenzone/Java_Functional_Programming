package com.itgreenzone.fp.l13_advanced.before;

import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.SampleData;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeSet;

/** BEFORE: four hand-synced maps (count, sum, min, max) per payment method, then a second loop to print. */
public final class LegacyPaymentStats {

    private LegacyPaymentStats() {
    }

    public static List<String> report() {
        Map<String, Integer> count = new HashMap<>();
        Map<String, BigDecimal> sum = new HashMap<>();
        Map<String, BigDecimal> min = new HashMap<>();
        Map<String, BigDecimal> max = new HashMap<>();
        for (Payment p : SampleData.payments()) {
            String m = p.method();
            count.put(m, count.containsKey(m) ? count.get(m) + 1 : 1);
            sum.put(m, sum.containsKey(m) ? sum.get(m).add(p.amount()) : p.amount());
            if (!min.containsKey(m) || p.amount().compareTo(min.get(m)) < 0) {
                min.put(m, p.amount());
            }
            if (!max.containsKey(m) || p.amount().compareTo(max.get(m)) > 0) {
                max.put(m, p.amount());
            }
        }
        List<String> lines = new ArrayList<>();
        for (String m : new TreeSet<>(count.keySet())) {
            BigDecimal avg = sum.get(m).divide(BigDecimal.valueOf(count.get(m)), 2, RoundingMode.HALF_UP);
            lines.add(m + ": count=" + count.get(m) + " sum=" + sum.get(m) + " min=" + min.get(m)
                    + " max=" + max.get(m) + " avg=" + avg);
        }
        return lines;
    }

    public static void main(String[] args) {
        report().forEach(System.out::println);
    }
}
