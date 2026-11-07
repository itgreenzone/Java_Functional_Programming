package com.itgreenzone.fp.l05_optional.theory;

import com.itgreenzone.fp.data.Customer;
import com.itgreenzone.fp.data.Policy;

import java.math.BigDecimal;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

/**
 * Getting the value out, or acting on it:
 * ifPresent [8], ifPresentOrElse [9], orElseThrow(supplier) [8], orElseThrow() [10],
 * or [9], stream [9], isEmpty [11].
 */
public final class ConsumingOptionals {

    private ConsumingOptionals() {
    }

    /** ifPresentOrElse [9]: one action for a value, another for empty. */
    public static String greet(String id) {
        StringBuilder out = new StringBuilder();
        BankRepository.findCustomer(id).ifPresentOrElse(
                c -> out.append("Hello ").append(c.name()),
                () -> out.append("Customer ").append(id).append(" not found"));
        return out.toString();
    }

    /** orElseThrow(Supplier) [8]: a meaningful domain exception instead of a null check. */
    public static Customer requireCustomer(String id) {
        return BankRepository.findCustomer(id)
                .orElseThrow(() -> new IllegalArgumentException("Unknown customer " + id));
    }

    /** orElseThrow() [10]: same as get(), but the name says it can throw. */
    public static String noArgOrElseThrowMessage() {
        try {
            BankRepository.findCustomer("C999").orElseThrow();
            return "found";
        } catch (NoSuchElementException e) {
            return e.getClass().getSimpleName() + ": " + e.getMessage();
        }
    }

    /** or [9]: try a second source lazily, still returning an Optional. */
    public static Optional<String> nameFromPrimaryOrBackup(String primaryId, String backupId) {
        return BankRepository.findCustomer(primaryId)
                .or(() -> BankRepository.findCustomer(backupId))
                .map(Customer::name);
    }

    /** stream [9]: 0 or 1 element, so flatMap(Optional::stream) drops the empties. */
    public static List<String> existingPolicies(List<String> numbers) {
        return numbers.stream()
                .map(BankRepository::findPolicy)
                .flatMap(Optional::stream)
                .map(Policy::number)
                .toList();
    }

    /** isEmpty [11]: the opposite of isPresent, easier to read than !isPresent(). */
    public static boolean unknown(String id) {
        return BankRepository.findCustomer(id).isEmpty();
    }

    public static BigDecimal premiumOrZero(String policyNumber) {
        return BankRepository.findPolicy(policyNumber)
                .map(Policy::premium)
                .orElse(BigDecimal.ZERO);                  // a constant: orElse is fine
    }

    public static void main(String[] args) {
        BankRepository.findCustomer("C002").ifPresent(c -> System.out.println("ifPresent         : " + c.name()));
        System.out.println("ifPresentOrElse   : " + greet("C002") + " | " + greet("C999"));
        try {
            requireCustomer("C999");
        } catch (IllegalArgumentException e) {
            System.out.println("orElseThrow(sup)  : " + e.getMessage());
        }
        System.out.println("orElseThrow()     : " + noArgOrElseThrowMessage());
        System.out.println("or                : " + nameFromPrimaryOrBackup("C999", "C010"));
        System.out.println("stream            : " + existingPolicies(List.of("POL-502", "POL-999", "POL-509")));
        System.out.println("isEmpty           : " + unknown("C999") + " / " + unknown("C001"));
        System.out.println("premiumOrZero     : " + premiumOrZero("POL-506") + " / " + premiumOrZero("POL-999"));
    }
}
