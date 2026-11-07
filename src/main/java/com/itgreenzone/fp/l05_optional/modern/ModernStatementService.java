package com.itgreenzone.fp.l05_optional.modern;

import com.itgreenzone.fp.data.AccountType;
import com.itgreenzone.fp.data.Transaction;
import com.itgreenzone.fp.l05_optional.theory.BankRepository;

import java.util.List;
import java.util.Optional;

/**
 * Java 9-21 Optional API:
 * or [9] to fall back to another account type, stream [9] to drop empties,
 * ifPresentOrElse [9], isEmpty [11], orElseThrow() [10], records [16].
 */
public final class ModernStatementService {

    /** One line of the statement summary. [Java 16 record] */
    public record Activity(String customerId, String transactionId, java.math.BigDecimal amount) {
    }

    private ModernStatementService() {
    }

    /** Savings first; if the customer has no savings activity, try the current account (or [9]). */
    public static Optional<Transaction> latestSavingsOrCurrent(String customerId) {
        return latestOn(customerId, AccountType.SAVINGS)
                .or(() -> latestOn(customerId, AccountType.CURRENT));
    }

    private static Optional<Transaction> latestOn(String customerId, AccountType type) {
        return BankRepository.findAccount(customerId, type)
                .flatMap(a -> BankRepository.latestTransaction(a.number()));
    }

    /** Optional::stream [9] turns "maybe one" into "zero or one" and drops customers without activity. */
    public static List<Activity> summary(List<String> customerIds) {
        return customerIds.stream()
                .flatMap(id -> latestSavingsOrCurrent(id).stream()
                        .map(t -> new Activity(id, t.id(), t.amount())))
                .toList();
    }

    public static void main(String[] args) {
        summary(List.of("C001", "C003", "C009", "C999"))
                .forEach(System.out::println);
        latestSavingsOrCurrent("C009").ifPresentOrElse(
                t -> System.out.println("C009 has no SAVINGS, used CURRENT: " + t.id()),
                () -> System.out.println("C009 no activity"));
        System.out.println("C999 isEmpty: " + latestSavingsOrCurrent("C999").isEmpty());
        System.out.println("C001 orElseThrow(): " + latestSavingsOrCurrent("C001").orElseThrow().id());
    }
}
