package com.itgreenzone.fp.l02_functional_interfaces.theory;

import com.itgreenzone.fp.data.Customer;
import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.PaymentStatus;
import com.itgreenzone.fp.data.SampleData;

import java.io.File;
import java.io.FileFilter;
import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.Callable;

/**
 * Interfaces older than Java 8 that already had a single abstract method.
 * They became functional interfaces "for free", so lambdas work with them.
 */
public final class OlderSams {

    private OlderSams() {
    }

    /** Runnable [Java 1.0]: () -> void. No result, no checked exception. */
    public static Runnable endOfDayJob(StringBuilder log) {
        return () -> log.append("EOD job ran");
    }

    /** Callable&lt;V&gt; [Java 5]: () -> V, and call() may throw a checked Exception. */
    public static Callable<BigDecimal> settledTotal() {
        return () -> SampleData.payments().stream()
                .filter(p -> p.status() == PaymentStatus.SUCCESS)
                .map(Payment::amount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /** Comparator&lt;T&gt; [Java 1.2]: (T, T) -> int. Declares equals(Object), which does not count. */
    public static final Comparator<Customer> BY_NAME = (a, b) -> a.name().compareTo(b.name());

    /** FileFilter [Java 1.2]: File -> boolean. Only the name is checked; the disk is not touched. */
    public static final FileFilter CSV_ONLY = file -> file.getName().endsWith(".csv");

    public static List<String> csvFiles(List<File> files) {
        return files.stream()
                .filter(CSV_ONLY::accept)
                .map(File::getName)
                .toList();
    }

    public static void main(String[] args) throws Exception {
        StringBuilder log = new StringBuilder();
        endOfDayJob(log).run();
        System.out.println("Runnable   -> " + log);
        System.out.println("Callable   -> settled total " + settledTotal().call());
        System.out.println("Comparator -> first by name: "
                + SampleData.customers().stream().sorted(BY_NAME).map(Customer::name).findFirst().orElse("-"));
        List<File> files = List.of(new File("payments_2026-11-01.csv"), new File("readme.txt"), new File("gateway_2026-11-01.csv"));
        System.out.println("FileFilter -> " + csvFiles(files));
    }
}
