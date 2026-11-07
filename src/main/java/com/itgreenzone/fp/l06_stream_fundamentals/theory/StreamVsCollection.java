package com.itgreenzone.fp.l06_stream_fundamentals.theory;

import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.PaymentStatus;
import com.itgreenzone.fp.data.SampleData;

import java.util.List;
import java.util.stream.Stream;

/**
 * A stream is NOT a collection [Java 8]:
 * - it stores nothing; it describes a computation over a source,
 * - it never changes its source,
 * - it can be consumed only once.
 * Pipeline = source + zero or more intermediate operations + exactly one terminal operation.
 */
public final class StreamVsCollection {

    private StreamVsCollection() {
    }

    /** Source -> intermediate -> intermediate -> terminal. */
    public static List<String> failedPaymentIds(List<Payment> payments) {
        return payments.stream()                                   // source:       Stream<Payment>
                .filter(p -> p.status() == PaymentStatus.FAILED)   // intermediate: Stream<Payment>
                .map(Payment::id)                                  // intermediate: Stream<String>
                .toList();                                         // terminal:     List<String>
    }

    /** The source is untouched: filtering produces a new result, it does not remove anything. */
    public static int sourceSizeAfterFiltering(List<Payment> payments) {
        failedPaymentIds(payments);
        return payments.size();
    }

    /** A stream can be consumed only once. */
    public static String reuseMessage() {
        Stream<Payment> stream = SampleData.payments().stream();
        stream.count();
        try {
            stream.count();
            return "no exception";
        } catch (IllegalStateException e) {
            return "IllegalStateException: " + e.getMessage();
        }
    }

    public static void main(String[] args) {
        List<Payment> payments = SampleData.payments();
        System.out.println("failed payments     : " + failedPaymentIds(payments));
        System.out.println("source size after   : " + sourceSizeAfterFiltering(payments) + " (unchanged)");
        System.out.println("reuse a stream      : " + reuseMessage());
    }
}
