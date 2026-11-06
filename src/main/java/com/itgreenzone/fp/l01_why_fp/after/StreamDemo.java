package com.itgreenzone.fp.l01_why_fp.after;

import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;
import com.itgreenzone.fp.l01_why_fp.HighValueRule;

import java.util.List;
import java.util.stream.Collectors;

/** Step 4 [Java 8]: no hand-written loop and no custom interface. The Stream API does it all. */
public final class StreamDemo {

    private StreamDemo() {
    }

    public static List<String> highValueIds(List<Transaction> txns) {
        return txns.stream()
                .filter(t -> t.amount().compareTo(HighValueRule.THRESHOLD) > 0)
                .map(Transaction::id)
                .collect(Collectors.toList());
    }

    public static void main(String[] args) {
        List<String> ids = highValueIds(SampleData.transactions());
        System.out.println("Stream (Java 8): " + ids.size() + " over 1000.00 " + ids);
    }
}
