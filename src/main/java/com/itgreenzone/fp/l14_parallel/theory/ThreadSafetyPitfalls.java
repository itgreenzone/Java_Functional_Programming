package com.itgreenzone.fp.l14_parallel.theory;

import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.SampleData;

import java.math.BigDecimal;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.IntStream;

/**
 * What breaks in parallel, shown with results that are the same on every machine:
 * a non-associative reduce, a wrong identity, and the safe alternatives.
 * The shared-ArrayList race itself is non-deterministic, so it lives in RaceDemo (not in the golden-file test).
 */
public final class ThreadSafetyPitfalls {

    private ThreadSafetyPitfalls() {
    }

    /** Subtraction is not associative: (a - b) - c != a - (b - c). */
    public static int subtractSequential() {
        return IntStream.rangeClosed(1, 10).reduce(0, (a, b) -> a - b);
    }

    public static int subtractParallel() {
        return IntStream.rangeClosed(1, 10).parallel().reduce(0, (a, b) -> a - b);
    }

    /** The identity must be neutral (0 for +). A "starting value" of 10 is added once per chunk in parallel. */
    public static int wrongIdentitySequential() {
        return IntStream.rangeClosed(1, 10).reduce(10, Integer::sum);
    }

    public static int wrongIdentityParallel() {
        return IntStream.rangeClosed(1, 10).parallel().reduce(10, Integer::sum);
    }

    /** Correct: neutral identity, then add the starting value once. */
    public static int startingValueDoneRight(boolean parallel) {
        IntStream s = IntStream.rangeClosed(1, 10);
        return 10 + (parallel ? s.parallel() : s).sum();
    }

    /** BigDecimal addition is associative and exact: parallel and sequential totals are equal. */
    public static boolean bigDecimalTotalIsStable() {
        BigDecimal seq = SampleData.payments().stream().map(Payment::amount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal par = SampleData.payments().parallelStream().map(Payment::amount).reduce(BigDecimal.ZERO, BigDecimal::add);
        return seq.equals(par);
    }

    /** Safe collection: let collect() build the list (each thread fills its own, then they are merged in order). */
    public static List<Integer> collectSafely(int n) {
        return IntStream.range(0, n).parallel().boxed().toList();
    }

    /** A shared counter works with AtomicLong, but every thread fights over one value: count() is simpler and faster. */
    public static long countWithAtomic(int n) {
        AtomicLong counter = new AtomicLong();
        IntStream.range(0, n).parallel().filter(i -> i % 3 == 0).forEach(i -> counter.incrementAndGet());
        return counter.get();
    }

    public static long countWithCount(int n) {
        return IntStream.range(0, n).parallel().filter(i -> i % 3 == 0).count();
    }

    public static void main(String[] args) {
        System.out.println("reduce(0, a - b) sequential       : " + subtractSequential());
        System.out.println("parallel gives a different value  : " + (subtractParallel() != subtractSequential()));
        System.out.println("reduce(10, +) sequential          : " + wrongIdentitySequential());
        System.out.println("parallel adds 10 more than once   : " + (wrongIdentityParallel() > wrongIdentitySequential()));
        System.out.println("10 + sum(), sequential / parallel : " + startingValueDoneRight(false) + " / " + startingValueDoneRight(true));
        System.out.println("BigDecimal total stable           : " + bigDecimalTotalIsStable());
        System.out.println("toList() in parallel, 100000      : " + collectSafely(100_000).size()
                + " in order=" + collectSafely(100_000).equals(IntStream.range(0, 100_000).boxed().toList()));
        System.out.println("AtomicLong count / count()        : " + countWithAtomic(100_000) + " / " + countWithCount(100_000));
    }
}
