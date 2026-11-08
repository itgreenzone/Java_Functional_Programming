package com.itgreenzone.fp.l14_parallel.theory;

import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.SampleData;

import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.stream.IntStream;

/**
 * Java 21 context: virtual threads [21] are for many BLOCKING tasks (I/O), parallel streams [8] are for
 * CPU work on in-memory data. They solve different problems. Output is deterministic: booleans and results only.
 */
public final class VirtualThreadsContext {

    private VirtualThreadsContext() {
    }

    /** A fake remote call: blocks for a few milliseconds, then returns an enriched value. */
    static String enrich(Payment p) {
        try {
            Thread.sleep(5);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException(e);
        }
        return p.id() + ":" + (Thread.currentThread().isVirtual() ? "virtual" : "platform");
    }

    /** One virtual thread per task; try-with-resources waits for all tasks [ExecutorService is AutoCloseable since 19]. */
    public static List<String> enrichWithVirtualThreads(List<Payment> payments) {
        try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
            List<Future<String>> futures = payments.stream()
                    .map(p -> executor.submit(() -> enrich(p)))
                    .toList();                              // submit all first (toList is eager) ...
            return futures.stream().map(VirtualThreadsContext::join).toList();   // ... then wait, in order
        }
    }

    private static String join(Future<String> f) {
        try {
            return f.get();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException(e);
        } catch (ExecutionException e) {
            throw new IllegalStateException(e.getCause());
        }
    }

    /** Parallel stream workers are platform threads of the commonPool. */
    public static boolean parallelStreamUsesPlatformThreads() {
        return IntStream.range(0, 1_000).parallel().allMatch(i -> !Thread.currentThread().isVirtual());
    }

    public static void main(String[] args) {
        List<String> enriched = enrichWithVirtualThreads(SampleData.payments());
        System.out.println("enriched with virtual threads : " + enriched.size() + " results, in order="
                + enriched.get(0).startsWith("P001") + ", all virtual=" + enriched.stream().allMatch(s -> s.endsWith("virtual")));
        System.out.println("first two                    : " + enriched.subList(0, 2));
        System.out.println("parallel stream: platform    : " + parallelStreamUsesPlatformThreads());
    }
}
