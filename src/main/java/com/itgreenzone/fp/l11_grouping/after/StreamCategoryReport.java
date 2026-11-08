package com.itgreenzone.fp.l11_grouping.after;

import com.itgreenzone.fp.data.Category;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;
import com.itgreenzone.fp.data.TxnType;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/** AFTER (Java 8): three groupingBy passes with counting, reducing and maxBy, then sort the keys by total. */
public final class StreamCategoryReport {

    private StreamCategoryReport() {
    }

    public static List<String> report() {
        List<Transaction> debits = SampleData.transactions().stream()
                .filter(t -> t.type() == TxnType.DEBIT)
                .collect(Collectors.toList());
        Map<Category, Long> counts = debits.stream()
                .collect(Collectors.groupingBy(Transaction::category, Collectors.counting()));
        Map<Category, BigDecimal> totals = debits.stream()
                .collect(Collectors.groupingBy(Transaction::category,
                        Collectors.reducing(BigDecimal.ZERO, Transaction::amount, BigDecimal::add)));
        Map<Category, Transaction> largest = debits.stream()
                .collect(Collectors.groupingBy(Transaction::category,
                        Collectors.collectingAndThen(Collectors.maxBy(Comparator.comparing(Transaction::amount)),
                                o -> o.get())));
        return totals.keySet().stream()
                .sorted(Comparator.comparing((Category c) -> totals.get(c)).reversed())
                .map(c -> c + ": " + counts.get(c) + " debits, total " + totals.get(c)
                        + ", largest " + largest.get(c).id() + " " + largest.get(c).amount())
                .collect(Collectors.toList());
    }

    public static void main(String[] args) {
        report().forEach(System.out::println);
    }
}
