package com.itgreenzone.fp.l14_parallel.modern;

import com.itgreenzone.fp.data.Category;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;
import com.itgreenzone.fp.data.TxnType;
import com.itgreenzone.fp.l14_parallel.before.LegacyFeeReport;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentMap;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * MODERN: unordered() + groupingByConcurrent (one shared ConcurrentMap, no per-thread maps to merge)
 * with teeing [12] for count and total; a record carries each line; the output is sorted at the edge,
 * so the report is deterministic even though the work order is not.
 */
public final class ModernFeeReport {

    /** [Java 16 record] */
    public record CategoryFees(Category category, long debits, BigDecimal fees) {
        String line() {
            return category + ": " + debits + " debits, fees " + fees;
        }
    }

    private ModernFeeReport() {
    }

    public static List<String> report() {
        ConcurrentMap<Category, CategoryFees> byCategory = SampleData.transactions().parallelStream()
                .unordered()
                .filter(t -> t.type() == TxnType.DEBIT && t.currency().equals("SGD"))
                .collect(Collectors.groupingByConcurrent(Transaction::category,
                        Collectors.teeing(
                                Collectors.counting(),
                                Collectors.reducing(BigDecimal.ZERO, (Transaction t) -> LegacyFeeReport.fee(t.amount()),
                                        BigDecimal::add),
                                (n, total) -> new CategoryFees(null, n, total))));
        List<CategoryFees> sorted = byCategory.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> new CategoryFees(e.getKey(), e.getValue().debits(), e.getValue().fees()))
                .toList();
        BigDecimal grand = sorted.stream().map(CategoryFees::fees).reduce(BigDecimal.ZERO, BigDecimal::add);
        return Stream.concat(sorted.stream().map(CategoryFees::line), Stream.of("TOTAL FEES " + grand)).toList();
    }

    public static void main(String[] args) {
        report().forEach(System.out::println);
    }
}
