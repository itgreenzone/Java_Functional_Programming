package com.itgreenzone.fp.l01_why_fp.modern;

import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;
import com.itgreenzone.fp.l01_why_fp.HighValueRule;

import java.util.List;
import java.util.function.Predicate;

/**
 * Step 5 (Java 9-21): the same filter in modern Java.
 * - method reference to a named rule [Java 8]
 * - Stream.toList() [Java 16] returns an unmodifiable list
 * - Predicate.not [Java 11]
 * - var in lambda parameters [Java 11], useful when you need an annotation or final
 * - Transaction is a record [Java 16]: accessors like Transaction::amount
 */
public final class ModernDemo {

    private ModernDemo() {
    }

    public static List<String> highValueIds(List<Transaction> txns) {
        return txns.stream()
                .filter(HighValueRule::isHighValue)
                .map(Transaction::id)
                .toList();
    }

    public static long countNotHighValue(List<Transaction> txns) {
        return txns.stream()
                .filter(Predicate.not(HighValueRule::isHighValue))
                .count();
    }

    public static List<String> highValueIdsWithVar(List<Transaction> txns) {
        return txns.stream()
                .filter((final var t) -> HighValueRule.isHighValue(t))
                .map(Transaction::id)
                .toList();
    }

    public static void main(String[] args) {
        List<Transaction> txns = SampleData.transactions();
        List<String> ids = highValueIds(txns);
        System.out.println("Modern (Java 16): " + ids.size() + " over 1000.00 " + ids);
        System.out.println("Not high value (Predicate.not): " + countNotHighValue(txns));
        System.out.println("Same result with var in lambda: " + ids.equals(highValueIdsWithVar(txns)));
    }
}
