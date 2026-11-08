package com.itgreenzone.fp.l14_parallel.before;

import com.itgreenzone.fp.data.Category;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;
import com.itgreenzone.fp.data.TxnType;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/**
 * BEFORE: a sequential loop computing a processing fee per SGD debit (0.25%, minimum 0.50, HALF_UP)
 * and totalling it per category. Correct, single-threaded.
 */
public final class LegacyFeeReport {

    private LegacyFeeReport() {
    }

    public static BigDecimal fee(BigDecimal amount) {
        BigDecimal f = amount.multiply(new BigDecimal("0.0025")).setScale(2, RoundingMode.HALF_UP);
        return f.max(new BigDecimal("0.50"));
    }

    public static List<String> report() {
        Map<Category, BigDecimal> totals = new EnumMap<>(Category.class);
        Map<Category, Integer> counts = new EnumMap<>(Category.class);
        for (Transaction t : SampleData.transactions()) {
            if (t.type() != TxnType.DEBIT || !t.currency().equals("SGD")) {
                continue;
            }
            BigDecimal f = fee(t.amount());
            BigDecimal old = totals.get(t.category());
            totals.put(t.category(), old == null ? f : old.add(f));
            Integer n = counts.get(t.category());
            counts.put(t.category(), n == null ? 1 : n + 1);
        }
        List<String> lines = new ArrayList<>();
        BigDecimal grand = BigDecimal.ZERO;
        for (Map.Entry<Category, BigDecimal> e : totals.entrySet()) {
            lines.add(e.getKey() + ": " + counts.get(e.getKey()) + " debits, fees " + e.getValue());
            grand = grand.add(e.getValue());
        }
        lines.add("TOTAL FEES " + grand);
        return lines;
    }

    public static void main(String[] args) {
        report().forEach(System.out::println);
    }
}
