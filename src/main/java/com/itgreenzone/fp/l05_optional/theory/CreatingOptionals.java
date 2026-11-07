package com.itgreenzone.fp.l05_optional.theory;

import com.itgreenzone.fp.data.Customer;

import java.util.Optional;

/**
 * Three ways to create an Optional [Java 8]:
 * of(value) - value must not be null (NPE otherwise) · ofNullable(value) - null becomes empty · empty().
 */
public final class CreatingOptionals {

    private CreatingOptionals() {
    }

    /** A legacy method that returns null when nothing is found. */
    public static String legacyNickname(String customerId) {
        return "C001".equals(customerId) ? "Ali" : null;
    }

    public static Optional<String> nickname(String customerId) {
        return Optional.ofNullable(legacyNickname(customerId));     // adapt a null-returning API
    }

    public static String describeOfNull() {
        try {
            Optional.of(legacyNickname("C002"));
            return "no exception";
        } catch (NullPointerException e) {
            return "Optional.of(null) -> NullPointerException";
        }
    }

    public static void main(String[] args) {
        Optional<Customer> alice = BankRepository.findCustomer("C001");
        System.out.println("findCustomer(C001)  : " + alice.map(Customer::name));
        System.out.println("findCustomer(C999)  : " + BankRepository.findCustomer("C999"));
        System.out.println("Optional.of(\"SGD\")  : " + Optional.of("SGD"));
        System.out.println("Optional.empty()    : " + Optional.empty());
        System.out.println("ofNullable(C001)    : " + nickname("C001"));
        System.out.println("ofNullable(C002)    : " + nickname("C002"));
        System.out.println(describeOfNull());
    }
}
