package com.itgreenzone.fp.l03_lambdas.theory;

import java.util.function.Function;

/**
 * Pattern 2: a custom functional interface whose method DECLARES a checked exception.
 * Function.apply cannot throw checked exceptions; this one can.
 */
@FunctionalInterface
public interface ThrowingFunction<T, R, E extends Exception> {

    R apply(T value) throws E;

    /** Pattern 3: adapt to a normal Function by wrapping the checked exception in an unchecked one. */
    static <T, R, E extends Exception> Function<T, R> unchecked(ThrowingFunction<T, R, E> fn) {
        return value -> {
            try {
                return fn.apply(value);
            } catch (Exception e) {
                throw new WrappedCheckedException(e);
            }
        };
    }
}
