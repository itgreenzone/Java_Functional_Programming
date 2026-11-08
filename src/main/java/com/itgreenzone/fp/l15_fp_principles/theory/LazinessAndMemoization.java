package com.itgreenzone.fp.l15_fp_principles.theory;

import java.math.BigDecimal;
import java.util.ConcurrentModificationException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Function;
import java.util.function.Supplier;

/**
 * Laziness with Supplier: compute only when (and if) the value is needed.
 * Memoization: cache results of a PURE function. Caveats: only for pure functions, unbounded caches grow,
 * and computeIfAbsent must not modify the same map recursively.
 */
public final class LazinessAndMemoization {

    private LazinessAndMemoization() {
    }

    /** orElse evaluates its argument ALWAYS; orElseGet only when the Optional is empty. */
    public static String orElseVsOrElseGet() {
        AtomicInteger calls = new AtomicInteger();
        Supplier<String> expensiveDefault = () -> "DEFAULT-" + calls.incrementAndGet();
        Optional<String> present = Optional.of("SQ12");
        present.orElse(expensiveDefault.get());
        int afterOrElse = calls.get();
        present.orElseGet(expensiveDefault);
        return "orElse evaluated=" + afterOrElse + ", orElseGet evaluated=" + (calls.get() - afterOrElse);
    }

    /** A lazy log message: the string is only built when the level is enabled. */
    public static int lazyLog(boolean debugEnabled, Supplier<String> message) {
        return debugEnabled ? message.get().length() : 0;
    }

    /** Memoize a Supplier: compute once, then return the cached value (thread-safe with double-checked locking). */
    public static <T> Supplier<T> memoize(Supplier<T> supplier) {
        return new Supplier<>() {
            private volatile T value;

            @Override
            public T get() {
                T v = value;
                if (v == null) {
                    synchronized (this) {
                        v = value;
                        if (v == null) {
                            v = supplier.get();
                            value = v;
                        }
                    }
                }
                return v;
            }
        };
    }

    /** Memoize a pure Function with a ConcurrentHashMap (fine when f does not call the memoized function itself). */
    public static <K, V> Function<K, V> memoize(Function<K, V> f) {
        Map<K, V> cache = new ConcurrentHashMap<>();
        return key -> cache.computeIfAbsent(key, f);
    }

    /** An "expensive" pure lookup, counted. */
    public static String fxLookups() {
        AtomicInteger lookups = new AtomicInteger();
        Function<String, BigDecimal> rateToSgd = ccy -> {
            lookups.incrementAndGet();
            return ccy.equals("USD") ? new BigDecimal("1.3456") : BigDecimal.ONE;
        };
        Function<String, BigDecimal> cached = memoize(rateToSgd);
        String[] currencies = {"SGD", "USD", "SGD", "USD", "SGD", "SGD", "USD", "SGD", "SGD", "SGD", "SGD", "USD"};
        for (String c : currencies) {
            cached.apply(c);
        }
        return currencies.length + " calls, " + lookups.get() + " real lookups";
    }

    /** CAVEAT: recursive memoization with computeIfAbsent modifies the map inside its own mapping function. */
    public static String recursiveComputeIfAbsent() {
        Map<Integer, Long> cache = new HashMap<>();
        try {
            return "fib(30) = " + fibBroken(30, cache);
        } catch (ConcurrentModificationException e) {
            return "HashMap.computeIfAbsent -> ConcurrentModificationException";
        }
    }

    private static long fibBroken(int n, Map<Integer, Long> cache) {
        if (n < 2) {
            return n;
        }
        return cache.computeIfAbsent(n, k -> fibBroken(k - 1, cache) + fibBroken(k - 2, cache));
    }

    /** The fix: check, compute OUTSIDE the map operation, then put. */
    public static long fib(int n, Map<Integer, Long> cache) {
        if (n < 2) {
            return n;
        }
        Long known = cache.get(n);
        if (known != null) {
            return known;
        }
        long value = fib(n - 1, cache) + fib(n - 2, cache);
        cache.put(n, value);
        return value;
    }

    public static void main(String[] args) {
        System.out.println("Optional.of(\"SQ12\")             : " + orElseVsOrElseGet());
        AtomicInteger built = new AtomicInteger();
        lazyLog(false, () -> "statement " + built.incrementAndGet());
        lazyLog(true, () -> "statement " + built.incrementAndGet());
        System.out.println("lazy log, debug off then on      : message built " + built.get() + " time");
        AtomicInteger loads = new AtomicInteger();
        Supplier<String> config = memoize(() -> "rates-v" + loads.incrementAndGet());
        System.out.println("memoized supplier x3             : " + config.get() + ", " + config.get() + ", " + config.get()
                + " (loaded " + loads.get() + "x)");
        System.out.println("memoized FX rate                 : " + fxLookups());
        System.out.println("recursive computeIfAbsent        : " + recursiveComputeIfAbsent());
        System.out.println("fixed memoized fib(90)           : " + fib(90, new HashMap<>()));
    }
}
