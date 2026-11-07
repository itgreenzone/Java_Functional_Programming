package com.itgreenzone.fp.l06_stream_fundamentals.after;

import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;
import com.itgreenzone.fp.data.TxnType;

import java.time.Month;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/** Java 8: one pipeline. Source -> filter -> sorted -> limit -> map -> collect. */
public final class StreamTopDebits {

    private StreamTopDebits() {
    }

    public static List<String> topOctoberDebits(List<Transaction> txns, int n) {
        return txns.stream()
                .filter(t -> t.type() == TxnType.DEBIT && t.date().getMonth() == Month.OCTOBER)
                .sorted(Comparator.comparing(Transaction::amount).reversed())
                .limit(n)
                .map(t -> t.id() + " " + t.category() + " " + t.amount())
                .collect(Collectors.toList());
    }

    public static void main(String[] args) {
        topOctoberDebits(SampleData.transactions(), 3).forEach(System.out::println);
    }
}
