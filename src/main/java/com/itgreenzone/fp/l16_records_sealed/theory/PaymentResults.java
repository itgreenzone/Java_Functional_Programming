package com.itgreenzone.fp.l16_records_sealed.theory;

import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.SampleData;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

/**
 * Sealed interface + records = an algebraic data type [17 sealed, 16 records]: a PaymentResult is EXACTLY one of
 * Approved | Declined | Pending | Refunded. The dataset has a REFUNDED status, so the type has a fourth case.
 * The compiler knows the full list, so a switch over it needs no default and breaks when a case is added.
 */
public final class PaymentResults {

    private PaymentResults() {
    }

    public sealed interface PaymentResult permits Approved, Declined, Pending, Refunded {
        String paymentId();
    }

    public record Approved(String paymentId, String method, BigDecimal amount) implements PaymentResult { }

    public record Declined(String paymentId, String method, String reason) implements PaymentResult { }

    public record Pending(String paymentId, Instant since) implements PaymentResult { }

    public record Refunded(String paymentId, BigDecimal amount) implements PaymentResult { }

    /** From the flat Payment record to the sealed type: a switch EXPRESSION [14] over the enum. */
    public static PaymentResult toResult(Payment p) {
        return switch (p.status()) {
            case SUCCESS -> new Approved(p.id(), p.method(), p.amount());
            case FAILED -> new Declined(p.id(), p.method(), "failed at gateway");
            case PENDING -> new Pending(p.id(), p.at());
            case REFUNDED -> new Refunded(p.id(), p.amount());
        };
    }

    public static List<PaymentResult> results() {
        return SampleData.payments().stream().map(PaymentResults::toResult).toList();
    }

    /** Pattern matching for switch with record patterns and guards [21]. Exhaustive: no default. */
    public static String describe(PaymentResult r) {
        return switch (r) {
            case Approved(var id, var method, var amount) when amount.compareTo(new BigDecimal("1000")) >= 0 ->
                    id + " APPROVED large " + method + " " + amount;
            case Approved(var id, var method, var amount) -> id + " APPROVED " + method + " " + amount;
            case Declined(var id, var method, var reason) -> id + " DECLINED " + method + " (" + reason + ")";
            case Pending(var id, var since) -> id + " PENDING since " + since;
            case Refunded(var id, var amount) -> id + " REFUNDED " + amount;
        };
    }

    /** Streams + switch: classify, then aggregate. */
    public static Map<String, Long> countByKind(List<PaymentResult> results) {
        return results.stream().collect(Collectors.groupingBy(
                r -> switch (r) {
                    case Approved a -> "APPROVED";
                    case Declined d -> "DECLINED";
                    case Pending p -> "PENDING";
                    case Refunded f -> "REFUNDED";
                }, TreeMap::new, Collectors.counting()));
    }

    /** Only Approved amounts count as settled money. */
    public static BigDecimal settled(List<PaymentResult> results) {
        return results.stream()
                .map(r -> r instanceof Approved a ? a.amount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public static void main(String[] args) {
        List<PaymentResult> results = results();
        results.stream().map(PaymentResults::describe).forEach(System.out::println);
        System.out.println("count by kind : " + countByKind(results));
        System.out.println("settled total : " + settled(results));
    }
}
