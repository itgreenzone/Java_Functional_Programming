package com.itgreenzone.fp.l16_records_sealed.modern;

import com.itgreenzone.fp.l16_records_sealed.theory.PaymentResults;
import com.itgreenzone.fp.l16_records_sealed.theory.PaymentResults.PaymentResult;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * MODERN (Java 21): data as records, the set of outcomes closed with a sealed interface, behaviour as
 * exhaustive pattern switches (PaymentResults.describe / countByKind / settled). A new outcome type makes every
 * switch fail to compile until it is handled.
 */
public final class SealedOutcomeReport {

    private SealedOutcomeReport() {
    }

    public static List<String> report() {
        List<PaymentResult> results = PaymentResults.results();
        String summary = PaymentResults.countByKind(results).entrySet().stream()
                .map(e -> e.getKey() + "=" + e.getValue())
                .collect(Collectors.joining(" ")) + " settled=" + PaymentResults.settled(results);
        return Stream.concat(results.stream().map(PaymentResults::describe), Stream.of(summary)).toList();
    }

    public static void main(String[] args) {
        report().forEach(System.out::println);
    }
}
