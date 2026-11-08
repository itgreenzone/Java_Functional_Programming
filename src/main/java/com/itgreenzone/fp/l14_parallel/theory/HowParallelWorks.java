package com.itgreenzone.fp.l14_parallel.theory;

import com.itgreenzone.fp.data.SampleData;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;
import java.util.Spliterator;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ForkJoinPool;
import java.util.stream.IntStream;
import java.util.stream.Stream;

/**
 * How a parallel stream works [Java 8]:
 * 1. the source's Spliterator is split (trySplit) into chunks,
 * 2. chunks run as tasks on ForkJoinPool.commonPool() (plus the calling thread),
 * 3. partial results are combined (the combiner / an associative reduce).
 * Output here is deterministic on any machine: we print facts, not thread counts or timings.
 */
public final class HowParallelWorks {

    private HowParallelWorks() {
    }

    /** Default commonPool parallelism is availableProcessors - 1 (at least 1), unless a system property changes it. */
    public static boolean commonPoolHasDefaultParallelism() {
        int cores = Runtime.getRuntime().availableProcessors();
        return ForkJoinPool.commonPool().getParallelism() == Math.max(1, cores - 1);
    }

    /** An ArrayList splits in half: perfect for parallel work. */
    public static String splitArrayList(int size) {
        List<Integer> list = new ArrayList<>(IntStream.range(0, size).boxed().toList());
        Spliterator<Integer> right = list.spliterator();
        Spliterator<Integer> left = right.trySplit();
        return left.estimateSize() + " + " + right.estimateSize();
    }

    /** A LinkedList cannot jump to the middle: its first split copies a batch (up to 1024) into an array. */
    public static String splitLinkedList(int size) {
        List<Integer> list = new LinkedList<>(IntStream.range(0, size).boxed().toList());
        Spliterator<Integer> right = list.spliterator();
        Spliterator<Integer> left = right.trySplit();
        return left.estimateSize() + " + " + right.estimateSize();
    }

    /** Characteristics tell the framework what it may assume. */
    public static String characteristics(Spliterator<?> s) {
        List<String> names = new ArrayList<>();
        if (s.hasCharacteristics(Spliterator.ORDERED)) {
            names.add("ORDERED");
        }
        if (s.hasCharacteristics(Spliterator.SIZED)) {
            names.add("SIZED");
        }
        if (s.hasCharacteristics(Spliterator.SUBSIZED)) {
            names.add("SUBSIZED");
        }
        if (s.hasCharacteristics(Spliterator.IMMUTABLE)) {
            names.add("IMMUTABLE");
        }
        return names.toString();
    }

    /** Stream.iterate has an unknown size (Long.MAX_VALUE): it splits badly. */
    public static boolean iterateHasUnknownSize() {
        return Stream.iterate(1, i -> i + 1).spliterator().estimateSize() == Long.MAX_VALUE;
    }

    /** parallel() / sequential() are flags for the WHOLE pipeline: the last call wins. */
    public static boolean lastCallWins() {
        return SampleData.payments().stream().parallel().filter(p -> true).sequential().isParallel();
    }

    /** Work runs on the caller thread and on commonPool workers, nothing else. */
    public static boolean onlyMainAndCommonPoolThreads() {
        Set<String> names = ConcurrentHashMap.newKeySet();
        IntStream.range(0, 10_000).parallel().forEach(i -> names.add(Thread.currentThread().getName()));
        String caller = Thread.currentThread().getName();
        return names.stream().allMatch(n -> n.equals(caller) || n.startsWith("ForkJoinPool.commonPool-worker-"));
    }

    public static void main(String[] args) {
        System.out.println("commonPool parallelism = cores - 1 : " + commonPoolHasDefaultParallelism());
        System.out.println("ArrayList(16).trySplit()            : " + splitArrayList(16));
        System.out.println("LinkedList(16).trySplit()           : " + splitLinkedList(16));
        System.out.println("ArrayList spliterator               : " + characteristics(new ArrayList<>(List.of(1, 2)).spliterator()));
        System.out.println("List.of spliterator                 : " + characteristics(List.of(1, 2).spliterator()));
        System.out.println("Stream.iterate size unknown         : " + iterateHasUnknownSize());
        System.out.println("parallel()..sequential() isParallel : " + lastCallWins());
        System.out.println("threads = caller + commonPool only  : " + onlyMainAndCommonPoolThreads());
    }
}
