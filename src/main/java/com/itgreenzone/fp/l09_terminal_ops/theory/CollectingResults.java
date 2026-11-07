package com.itgreenzone.fp.l09_terminal_ops.theory;

import com.itgreenzone.fp.data.Flight;
import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.SampleData;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Terminal operations that hand back the elements:
 * forEach / forEachOrdered [8], collect [8], toList() [16], toArray(IntFunction) [8].
 */
public final class CollectingResults {

    private CollectingResults() {
    }

    /** forEachOrdered keeps encounter order even on a parallel stream. */
    public static List<String> forEachOrderedParallel() {
        List<String> out = new ArrayList<>();
        SampleData.flights().parallelStream().map(Flight::code).forEachOrdered(out::add);   // one thread at a time
        return out;
    }

    /** forEach on a parallel stream: no order guarantee, and it runs on several threads (needs a thread-safe target). */
    public static Set<String> forEachParallel() {
        Set<String> out = ConcurrentHashMap.newKeySet();
        SampleData.flights().parallelStream().map(Flight::code).forEach(out::add);
        return new TreeSet<>(out);
    }

    /** Stream.toList() [16] is unmodifiable. */
    public static String toListIsUnmodifiable() {
        List<String> ids = SampleData.payments().stream().map(Payment::id).toList();
        try {
            ids.add("P013");
            return "added";
        } catch (UnsupportedOperationException e) {
            return "toList().add -> UnsupportedOperationException";
        }
    }

    /** Collectors.toList() [8] returns an ArrayList today (mutable), but the type is not guaranteed by the spec. */
    public static String collectorsToListToday() {
        List<String> ids = SampleData.payments().stream().map(Payment::id).collect(Collectors.toList());
        ids.add("P013");
        return ids.getClass().getSimpleName() + " size " + ids.size();
    }

    /** toList() accepts null elements; Collectors.toUnmodifiableList() [10] rejects them. */
    public static String nullsInLists() {
        List<String> a = Stream.of("SQ12", null).toList();
        String b;
        try {
            Stream.of("SQ12", null).collect(Collectors.toUnmodifiableList());
            b = "ok";
        } catch (NullPointerException e) {
            b = "NullPointerException";
        }
        return "toList()=" + a + ", toUnmodifiableList()=" + b;
    }

    /** toArray(String[]::new): a typed array instead of Object[]. */
    public static String toArrayTyped() {
        String[] codes = SampleData.flights().stream().map(Flight::code).toArray(String[]::new);
        Object[] raw = SampleData.flights().stream().map(Flight::code).toArray();
        return codes.getClass().getSimpleName() + " " + Arrays.toString(Arrays.copyOf(codes, 3))
                + " vs " + raw.getClass().getSimpleName();
    }

    public static void main(String[] args) {
        System.out.println("forEachOrdered (parallel): " + forEachOrderedParallel());
        System.out.println("forEach (parallel), sorted: " + forEachParallel());
        System.out.println("Stream.toList() [16]      : " + toListIsUnmodifiable());
        System.out.println("Collectors.toList()       : " + collectorsToListToday());
        System.out.println("nulls                     : " + nullsInLists());
        System.out.println("toArray                   : " + toArrayTyped());
    }
}
