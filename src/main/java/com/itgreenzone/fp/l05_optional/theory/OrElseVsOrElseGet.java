package com.itgreenzone.fp.l05_optional.theory;

import com.itgreenzone.fp.data.Customer;

import java.util.Optional;

/**
 * orElse(value) vs orElseGet(supplier) [Java 8].
 * orElse's argument is an ordinary expression: it is evaluated BEFORE the call, even when a value is present.
 * orElseGet's supplier runs ONLY when the Optional is empty. Use it for anything expensive or with side effects.
 */
public final class OrElseVsOrElseGet {

    private OrElseVsOrElseGet() {
    }

    /** Pretend this is expensive: a database call, a REST call, a new object. It records each call. */
    static String defaultName(StringBuilder calls) {
        calls.append("default-called ");
        return "Walk-in customer";
    }

    public static String withOrElse(String id, StringBuilder calls) {
        return BankRepository.findCustomer(id)
                .map(Customer::name)
                .orElse(defaultName(calls));                 // eager: always called
    }

    public static String withOrElseGet(String id, StringBuilder calls) {
        return BankRepository.findCustomer(id)
                .map(Customer::name)
                .orElseGet(() -> defaultName(calls));        // lazy: only when empty
    }

    public static void main(String[] args) {
        StringBuilder calls = new StringBuilder();
        System.out.println("orElse(C001)     : " + withOrElse("C001", calls) + "   calls: " + calls);
        calls.setLength(0);
        System.out.println("orElseGet(C001)  : " + withOrElseGet("C001", calls) + "   calls: " + calls);
        calls.setLength(0);
        System.out.println("orElse(C999)     : " + withOrElse("C999", calls) + "   calls: " + calls);
        calls.setLength(0);
        System.out.println("orElseGet(C999)  : " + withOrElseGet("C999", calls) + "   calls: " + calls);
    }
}
