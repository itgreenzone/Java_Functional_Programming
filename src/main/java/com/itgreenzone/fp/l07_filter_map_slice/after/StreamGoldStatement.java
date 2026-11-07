package com.itgreenzone.fp.l07_filter_map_slice.after;

import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Tier;
import com.itgreenzone.fp.data.Transaction;
import com.itgreenzone.fp.data.TxnType;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/** AFTER (Java 8): filter + flatMap + flatMap + filter + sorted + skip + limit + map. */
public final class StreamGoldStatement {

    private static final BigDecimal HUNDRED = new BigDecimal("100.00");

    private StreamGoldStatement() {
    }

    public static List<String> page(int pageNo, int size) {
        return SampleData.customers().stream()
                .filter(c -> c.tier() == Tier.GOLD)
                .flatMap(c -> SampleData.accounts().stream().filter(a -> a.customerId().equals(c.id())))
                .flatMap(a -> SampleData.transactions().stream().filter(t -> t.accountNumber().equals(a.number())))
                .filter(t -> t.type() == TxnType.DEBIT && t.amount().compareTo(HUNDRED) > 0)
                .sorted(Comparator.comparing(Transaction::date).reversed().thenComparing(Transaction::id))
                .skip((long) (pageNo - 1) * size)
                .limit(size)
                .map(t -> t.date() + " " + t.id() + " " + t.accountNumber() + " " + t.category() + " " + t.amount())
                .collect(Collectors.toList());
    }

    public static void main(String[] args) {
        for (int p = 1; p <= 3; p++) {
            System.out.println("page " + p + ": " + page(p, 5));
        }
    }
}
