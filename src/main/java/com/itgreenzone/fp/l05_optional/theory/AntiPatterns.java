package com.itgreenzone.fp.l05_optional.theory;

import com.itgreenzone.fp.data.Customer;
import com.itgreenzone.fp.data.Policy;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

/**
 * Optional anti-patterns, each next to the fix. The BAD methods compile and run;
 * that is exactly why they slip through code review.
 */
public final class AntiPatterns {

    private AntiPatterns() {
    }

    // 1 BAD: isPresent() + get() is a null check with extra steps.
    public static String nameBad(String id) {
        Optional<Customer> c = BankRepository.findCustomer(id);
        if (c.isPresent()) {
            return c.get().name();
        }
        return "UNKNOWN";
    }

    // 1 GOOD
    public static String nameGood(String id) {
        return BankRepository.findCustomer(id)
                .map(Customer::name)
                .orElse("UNKNOWN");
    }

    // 2 BAD: get() without a check throws NoSuchElementException("No value present").
    public static String getWithoutCheck(String id) {
        try {
            return BankRepository.findCustomer(id).get().name();
        } catch (NoSuchElementException e) {
            return "get() on empty -> " + e.getMessage();
        }
    }

    // 3 BAD: Optional as a field. Not Serializable, adds a wrapper per object, and blurs intent.
    public static final class CustomerProfileBad {
        private final Optional<String> nickname;

        public CustomerProfileBad(Optional<String> nickname) {   // 4 BAD: Optional as a parameter too
            this.nickname = nickname;
        }

        public Optional<String> nickname() {
            return nickname;
        }
    }

    // 3 GOOD: a nullable field, exposed through an Optional-returning getter.
    public static final class CustomerProfile {
        private final String nickname;                      // may be null

        public CustomerProfile(String nickname) {
            this.nickname = nickname;
        }

        public Optional<String> nickname() {
            return Optional.ofNullable(nickname);
        }
    }

    // 5 BAD: Optional<List<...>>. Two ways to say "nothing": empty Optional and empty list.
    public static Optional<List<Policy>> policiesBad(String customerId) {
        List<Policy> found = com.itgreenzone.fp.data.SampleData.policies().stream()
                .filter(p -> p.customerId().equals(customerId))
                .toList();
        return found.isEmpty() ? Optional.empty() : Optional.of(found);
    }

    // 5 GOOD: an empty collection already means "none".
    public static List<Policy> policies(String customerId) {
        return com.itgreenzone.fp.data.SampleData.policies().stream()
                .filter(p -> p.customerId().equals(customerId))
                .toList();
    }

    // 6 BAD: returning null from a method declared to return Optional. Callers will not check.
    @SuppressWarnings("unused")
    private static Optional<String> neverDoThis() {
        return null;
    }

    // 7 BAD: Optional.of on something that may be null -> NPE. Use ofNullable.
    public static Optional<String> nicknameOf(String maybeNull) {
        return Optional.ofNullable(maybeNull);
    }

    public static void main(String[] args) {
        System.out.println("1 isPresent+get  : " + nameBad("C003") + " | good: " + nameGood("C003") + " / " + nameGood("C999"));
        System.out.println("2 get() no check : " + getWithoutCheck("C999"));
        System.out.println("3 field          : bad=" + new CustomerProfileBad(Optional.empty()).nickname()
                + " good=" + new CustomerProfile(null).nickname());
        System.out.println("5 Optional<List> : bad=" + policiesBad("C005") + " good=" + policies("C005"));
        System.out.println("5 C003 policies  : " + policies("C003").stream().map(Policy::number).toList());
        System.out.println("7 ofNullable     : " + nicknameOf(null));
    }
}
