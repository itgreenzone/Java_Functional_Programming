package com.itgreenzone.fp.l03_lambdas.theory;

import java.util.function.Supplier;

/**
 * How they are compiled (high level):
 * - An anonymous class is a real class: javac writes LambdaVsAnonymous$1.class, and every
 *   evaluation creates a new object.
 * - A lambda writes no extra .class file. javac emits an invokedynamic instruction plus a private
 *   method holding the body; at run time the JVM creates a hidden class [Java 15] for it.
 */
public final class LambdaVsAnonymous {

    private LambdaVsAnonymous() {
    }

    public static Supplier<String> anonymous() {
        return new Supplier<>() {
            @Override
            public String get() {
                return "anonymous";
            }
        };
    }

    public static Supplier<String> lambda() {
        return () -> "lambda";
    }

    public static String describe(Supplier<String> s) {
        Class<?> type = s.getClass();
        return s.get() + ": anonymousClass=" + type.isAnonymousClass() + ", hidden=" + type.isHidden();
    }

    public static void main(String[] args) {
        System.out.println(describe(anonymous()));
        System.out.println(describe(lambda()));
        System.out.println("anonymous class file: " + anonymous().getClass().getName());
        System.out.println("new object each call: " + (anonymous() != anonymous()));
    }
}
