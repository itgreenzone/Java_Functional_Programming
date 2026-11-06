package com.itgreenzone.fp.l01_why_fp.theory;

import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;
import com.itgreenzone.fp.l01_why_fp.HighValueRule;

import java.math.BigDecimal;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Stream;

/**
 * Laziness [Java 8]: intermediate operations do nothing until a terminal operation runs,
 * and elements flow through the pipeline one at a time ("loop fusion").
 * peek(...) is used here ONLY to make the flow visible; it is a debugging tool.
 */
public final class LazinessDemo {

    private static final BigDecimal TWO_HUNDRED = new BigDecimal("200.00");

    private LazinessDemo() {
    }

    /** Builds a pipeline with no terminal operation. Nothing is printed. */
    public static Stream<String> buildOnly(List<Transaction> txns) {
        return txns.stream()
                .peek(t -> System.out.println("  filter " + t.id()))
                .filter(t -> t.amount().compareTo(TWO_HUNDRED) > 0)
                .map(Transaction::id);
    }

    /** Runs filter + map on a few transactions so the one-at-a-time order is printed. */
    public static List<String> traceOverTwoHundred(List<Transaction> txns) {
        return txns.stream()
                .peek(t -> System.out.println("  filter " + t.id()))
                .filter(t -> t.amount().compareTo(TWO_HUNDRED) > 0)
                .peek(t -> System.out.println("  map    " + t.id()))
                .map(Transaction::id)
                .toList();
    }

    /**
     * Short-circuiting: limit(2) stops the pipeline as soon as two matches are found.
     * The AtomicInteger counter exists only for this demonstration; do not count like this in real code.
     */
    public static int inspectedToFindFirstTwoHighValue(List<Transaction> txns) {
        AtomicInteger inspected = new AtomicInteger();
        txns.stream()
                .peek(t -> inspected.incrementAndGet())
                .filter(HighValueRule::isHighValue)
                .limit(2)
                .forEach(t -> { });
        return inspected.get();
    }

    public static void main(String[] args) {
        List<Transaction> firstFour = SampleData.transactions().subList(0, 4);

        System.out.println("1) Pipeline built, no terminal operation:");
        Stream<String> notRun = buildOnly(firstFour);
        System.out.println("   (nothing printed above - the stream has not run)");

        System.out.println("2) Terminal operation toList() runs it:");
        System.out.println("   result = " + traceOverTwoHundred(firstFour));

        int inspected = inspectedToFindFirstTwoHighValue(SampleData.transactions());
        System.out.println("3) limit(2) over 60 transactions inspected only " + inspected);

        notRun.close();
    }
}
