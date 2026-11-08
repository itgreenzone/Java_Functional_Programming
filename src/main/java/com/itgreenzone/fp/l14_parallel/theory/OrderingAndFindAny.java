package com.itgreenzone.fp.l14_parallel.theory;

import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.PaymentStatus;
import com.itgreenzone.fp.data.SampleData;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;

/**
 * Encounter order in parallel: collect/toList keep it, forEach does not, forEachOrdered restores it (at a cost).
 * findFirst must return the first element; findAny may return any match (cheaper in parallel).
 */
public final class OrderingAndFindAny {

    private static final BigDecimal LARGE = new BigDecimal("500");

    private OrderingAndFindAny() {
    }

    public static List<String> ids() {
        return SampleData.payments().stream().map(Payment::id).toList();
    }

    /** toList() / collect keep encounter order even in parallel. */
    public static boolean toListKeepsOrder() {
        return SampleData.payments().parallelStream().map(Payment::id).toList().equals(ids());
    }

    /** forEach in parallel: same elements, order NOT guaranteed (so we compare as sets). */
    public static boolean forEachSameElements() {
        List<String> seen = Collections.synchronizedList(new ArrayList<>());
        SampleData.payments().parallelStream().map(Payment::id).forEach(seen::add);
        Set<String> sorted = new TreeSet<>(seen);
        return sorted.equals(new TreeSet<>(ids())) && seen.size() == ids().size();
    }

    /** forEachOrdered: encounter order, even in parallel. */
    public static boolean forEachOrderedKeepsOrder() {
        List<String> seen = Collections.synchronizedList(new ArrayList<>());
        SampleData.payments().parallelStream().map(Payment::id).forEachOrdered(seen::add);
        return seen.equals(ids());
    }

    /** findFirst is deterministic: the first payment over 500.00 is P005. */
    public static String firstLarge() {
        return SampleData.payments().parallelStream()
                .filter(p -> p.amount().compareTo(LARGE) > 0)
                .findFirst().map(Payment::id).orElse("none");
    }

    /** findAny may return P005, P008 or P010: we only check it is one of the matches. */
    public static boolean anyLargeIsAMatch() {
        Set<String> matches = SampleData.payments().stream()
                .filter(p -> p.amount().compareTo(LARGE) > 0).map(Payment::id).collect(Collectors.toSet());
        String any = SampleData.payments().parallelStream()
                .filter(p -> p.amount().compareTo(LARGE) > 0)
                .findAny().map(Payment::id).orElse("none");
        return matches.contains(any);
    }

    public static List<String> largeMatches() {
        return SampleData.payments().stream().filter(p -> p.amount().compareTo(LARGE) > 0).map(Payment::id).toList();
    }

    /** unordered() lets limit/distinct take ANY n elements: the size is fixed, the members are not. */
    public static boolean unorderedLimitTakesSomeSuccesses() {
        List<String> three = SampleData.payments().parallelStream().unordered()
                .filter(p -> p.status() == PaymentStatus.SUCCESS).limit(3).map(Payment::id).toList();
        Set<String> successes = SampleData.payments().stream()
                .filter(p -> p.status() == PaymentStatus.SUCCESS).map(Payment::id).collect(Collectors.toSet());
        return three.size() == 3 && successes.containsAll(three);
    }

    public static void main(String[] args) {
        System.out.println("toList() keeps order            : " + toListKeepsOrder());
        System.out.println("forEach: same 12 ids (any order): " + forEachSameElements());
        System.out.println("forEachOrdered keeps order      : " + forEachOrderedKeepsOrder());
        System.out.println("matches over 500.00             : " + largeMatches());
        System.out.println("findFirst (parallel)            : " + firstLarge());
        System.out.println("findAny is one of the matches   : " + anyLargeIsAMatch());
        System.out.println("unordered().limit(3) is valid   : " + unorderedLimitTakesSomeSuccesses());
    }
}
