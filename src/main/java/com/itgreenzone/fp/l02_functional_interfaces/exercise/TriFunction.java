package com.itgreenzone.fp.l02_functional_interfaces.exercise;

import java.util.function.Function;

/**
 * java.util.function stops at two parameters (BiFunction). For three, write your own.
 * EXERCISE: complete the default method.
 */
@FunctionalInterface
public interface TriFunction<A, B, C, R> {

    R apply(A a, B b, C c);

    default <V> TriFunction<A, B, C, V> andThen(Function<? super R, ? extends V> after) {
        // TODO 5: return a TriFunction that applies this, then "after" to the result
        throw new UnsupportedOperationException("TODO 5");
    }
}
