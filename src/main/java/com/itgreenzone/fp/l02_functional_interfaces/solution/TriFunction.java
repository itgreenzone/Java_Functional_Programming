package com.itgreenzone.fp.l02_functional_interfaces.solution;

import java.util.Objects;
import java.util.function.Function;

/**
 * java.util.function stops at two parameters (BiFunction). For three, write your own.
 * Reference solution.
 */
@FunctionalInterface
public interface TriFunction<A, B, C, R> {

    R apply(A a, B b, C c);

    default <V> TriFunction<A, B, C, V> andThen(Function<? super R, ? extends V> after) {
        Objects.requireNonNull(after);
        return (a, b, c) -> after.apply(apply(a, b, c));
    }
}
