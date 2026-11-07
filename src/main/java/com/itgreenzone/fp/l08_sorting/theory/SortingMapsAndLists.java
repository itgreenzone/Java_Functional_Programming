package com.itgreenzone.fp.l08_sorting.theory;

import com.itgreenzone.fp.data.Flight;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

/**
 * Sorting a map by value with Map.Entry.comparingByValue / comparingByKey [Java 8];
 * List.sort (in place) vs stream sorted (new list); List.reversed() [Java 21, SequencedCollection].
 */
public final class SortingMapsAndLists {

    private SortingMapsAndLists() {
    }

    /** Number of transactions per account (TreeMap: sorted by KEY). */
    public static Map<String, Long> txnCountPerAccount() {
        return SampleData.transactions().stream()
                .collect(Collectors.groupingBy(Transaction::accountNumber, TreeMap::new, Collectors.counting())); // L11
    }

    /** Sort the entries by VALUE descending, then by key: the busiest 3 accounts. */
    public static List<String> busiestAccounts(int n) {
        return txnCountPerAccount().entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue(Comparator.reverseOrder())
                        .thenComparing(Map.Entry.comparingByKey()))
                .limit(n)
                .map(e -> e.getKey() + "=" + e.getValue())
                .toList();
    }

    /** List.sort sorts IN PLACE: it needs a mutable list. */
    public static List<String> listSortInPlace() {
        List<Flight> copy = new ArrayList<>(SampleData.flights());
        copy.sort(Comparator.comparing(Flight::code));
        return copy.stream().map(Flight::code).toList();
    }

    /** List.of(...) is unmodifiable: List.sort throws. */
    public static String listSortOnImmutable() {
        try {
            SampleData.flights().sort(Comparator.comparing(Flight::code));
            return "sorted";
        } catch (UnsupportedOperationException e) {
            return "UnsupportedOperationException";
        }
    }

    /** stream().sorted() leaves the source unchanged. */
    public static String streamSortedLeavesSource() {
        List<String> sorted = SampleData.flights().stream().map(Flight::code).sorted().toList();
        return "first in source=" + SampleData.flights().get(0).code() + ", first sorted=" + sorted.get(0);
    }

    /** Java 21: reversed() is a reverse-ordered VIEW of any SequencedCollection, no copy and no comparator. */
    public static List<String> reversedView() {
        return listSortInPlace().reversed();
    }

    public static void main(String[] args) {
        System.out.println("count per account     : " + txnCountPerAccount());
        System.out.println("busiest 3 (by value)  : " + busiestAccounts(3));
        System.out.println("List.sort (copy)      : " + listSortInPlace());
        System.out.println("List.sort (List.of)   : " + listSortOnImmutable());
        System.out.println("stream sorted         : " + streamSortedLeavesSource());
        System.out.println("reversed() [21]       : " + reversedView());
    }
}
