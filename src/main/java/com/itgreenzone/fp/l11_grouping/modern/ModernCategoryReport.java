package com.itgreenzone.fp.l11_grouping.modern;

import com.itgreenzone.fp.data.Category;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;
import com.itgreenzone.fp.data.TxnType;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * MODERN (Java 16-21): ONE groupingBy into an EnumMap whose downstream builds a CategoryStats record
 * (collectingAndThen(toList(), CategoryStats::of)), then sort the entries by the record's total.
 */
public final class ModernCategoryReport {

    public record CategoryStats(long count, BigDecimal total, Transaction largest) {
        static CategoryStats of(List<Transaction> txns) {
            return new CategoryStats(
                    txns.size(),
                    txns.stream().map(Transaction::amount).reduce(BigDecimal.ZERO, BigDecimal::add),
                    txns.stream().max(Comparator.comparing(Transaction::amount)).orElseThrow());
        }
    }

    private ModernCategoryReport() {
    }

    public static Map<Category, CategoryStats> statsByCategory(List<Transaction> txns) {
        return txns.stream()
                .filter(t -> t.type() == TxnType.DEBIT)
                .collect(Collectors.groupingBy(Transaction::category, () -> new EnumMap<>(Category.class),
                        Collectors.collectingAndThen(Collectors.toList(), CategoryStats::of)));
    }

    public static List<String> report() {
        return statsByCategory(SampleData.transactions()).entrySet().stream()
                .sorted(Map.Entry.comparingByValue(Comparator.comparing(CategoryStats::total).reversed()))
                .map(e -> e.getKey() + ": " + e.getValue().count() + " debits, total " + e.getValue().total()
                        + ", largest " + e.getValue().largest().id() + " " + e.getValue().largest().amount())
                .toList();
    }

    public static void main(String[] args) {
        report().forEach(System.out::println);
    }
}
