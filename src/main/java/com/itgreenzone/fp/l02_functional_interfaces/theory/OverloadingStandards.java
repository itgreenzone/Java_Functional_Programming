package com.itgreenzone.fp.l02_functional_interfaces.theory;

import com.itgreenzone.fp.data.Transaction;

import java.util.concurrent.Callable;
import java.util.function.Supplier;
import java.util.function.ToIntFunction;
import java.util.function.Function;

/**
 * Standard: never overload a method with different functional-interface parameters of the same
 * shape. A call such as {@code run(() -> "x")} with run(Supplier) AND run(Callable) does not
 * compile: "reference to run is ambiguous" (proved by AmbiguityCompileTest).
 * Fix: give the methods different names.
 */
public final class OverloadingStandards {

    private OverloadingStandards() {
    }

    // GOOD: distinct names, so every lambda has exactly one target type.
    public static String runSupplier(Supplier<String> task) {
        return task.get();
    }

    public static String runCallable(Callable<String> task) throws Exception {
        return task.call();
    }

    public static String describe(Transaction txn, Function<Transaction, String> formatter) {
        return formatter.apply(txn);
    }

    public static int score(Transaction txn, ToIntFunction<Transaction> scorer) {
        return scorer.applyAsInt(txn);
    }

    public static void main(String[] args) throws Exception {
        System.out.println(runSupplier(() -> "supplier ran"));
        System.out.println(runCallable(() -> "callable ran"));
    }
}
