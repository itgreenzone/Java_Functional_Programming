package com.itgreenzone.fp.l14_parallel.after;

import com.itgreenzone.fp.data.Category;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;
import com.itgreenzone.fp.data.TxnType;
import com.itgreenzone.fp.l14_parallel.before.LegacyFeeReport;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * AFTER (Java 8): a parallel stream that is SAFE because it has no shared mutable state:
 * a pure fee function + collect(groupingBy(..)) + associative BigDecimal reduction.
 * (For 43 debits parallel is not faster; the point is that it is correct either way.)
 */
public final class StreamFeeReport {

    private StreamFeeReport() {
    }

    public static List<String> report(boolean parallel) {
        List<Transaction> txns = SampleData.transactions();
        Map<Category, List<BigDecimal>> fees = (parallel ? txns.parallelStream() : txns.stream())
                .filter(t -> t.type() == TxnType.DEBIT && t.currency().equals("SGD"))
                .collect(Collectors.groupingBy(Transaction::category, () -> new EnumMap<>(Category.class),
                        Collectors.mapping(t -> LegacyFeeReport.fee(t.amount()), Collectors.toList())));
        List<String> lines = new ArrayList<>();
        fees.forEach((c, list) -> lines.add(c + ": " + list.size() + " debits, fees "
                + list.stream().reduce(BigDecimal.ZERO, BigDecimal::add)));
        lines.add("TOTAL FEES " + fees.values().stream().flatMap(List::stream).reduce(BigDecimal.ZERO, BigDecimal::add));
        return lines;
    }

    public static void main(String[] args) {
        report(true).forEach(System.out::println);
    }
}
