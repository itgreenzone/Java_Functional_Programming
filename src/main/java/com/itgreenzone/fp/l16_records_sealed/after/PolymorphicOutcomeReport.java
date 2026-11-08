package com.itgreenzone.fp.l16_records_sealed.after;

import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.SampleData;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * AFTER (Java 8 OO style): an abstract class with one subclass per outcome; behaviour lives in the classes
 * (describe, settledAmount, kind). Adding an operation means editing every subclass; the hierarchy is open,
 * so nothing guarantees that all outcomes are known.
 */
public final class PolymorphicOutcomeReport {

    private PolymorphicOutcomeReport() {
    }

    abstract static class Outcome {
        final Payment p;

        Outcome(Payment p) {
            this.p = p;
        }

        abstract String kind();

        abstract String describe();

        BigDecimal settledAmount() {
            return BigDecimal.ZERO;
        }

        static Outcome of(Payment p) {
            switch (p.status()) {
                case SUCCESS:
                    return new ApprovedOutcome(p);
                case FAILED:
                    return new DeclinedOutcome(p);
                case PENDING:
                    return new PendingOutcome(p);
                default:
                    return new RefundedOutcome(p);
            }
        }
    }

    static final class ApprovedOutcome extends Outcome {
        ApprovedOutcome(Payment p) {
            super(p);
        }

        String kind() {
            return "APPROVED";
        }

        String describe() {
            String size = p.amount().compareTo(new BigDecimal("1000")) >= 0 ? " APPROVED large " : " APPROVED ";
            return p.id() + size + p.method() + " " + p.amount();
        }

        @Override
        BigDecimal settledAmount() {
            return p.amount();
        }
    }

    static final class DeclinedOutcome extends Outcome {
        DeclinedOutcome(Payment p) {
            super(p);
        }

        String kind() {
            return "DECLINED";
        }

        String describe() {
            return p.id() + " DECLINED " + p.method() + " (failed at gateway)";
        }
    }

    static final class PendingOutcome extends Outcome {
        PendingOutcome(Payment p) {
            super(p);
        }

        String kind() {
            return "PENDING";
        }

        String describe() {
            return p.id() + " PENDING since " + p.at();
        }
    }

    static final class RefundedOutcome extends Outcome {
        RefundedOutcome(Payment p) {
            super(p);
        }

        String kind() {
            return "REFUNDED";
        }

        String describe() {
            return p.id() + " REFUNDED " + p.amount();
        }
    }

    public static List<String> report() {
        List<Outcome> outcomes = SampleData.payments().stream().map(Outcome::of).toList();
        Map<String, Long> counts = outcomes.stream()
                .collect(Collectors.groupingBy(Outcome::kind, TreeMap::new, Collectors.counting()));
        BigDecimal settled = outcomes.stream().map(Outcome::settledAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        String summary = counts.entrySet().stream().map(e -> e.getKey() + "=" + e.getValue())
                .collect(Collectors.joining(" ")) + " settled=" + settled;
        return Stream.concat(outcomes.stream().map(Outcome::describe), Stream.of(summary)).toList();
    }

    public static void main(String[] args) {
        report().forEach(System.out::println);
    }
}
