package com.itgreenzone.fp.l08_sorting.theory;

import com.itgreenzone.fp.data.Account;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

/**
 * nullsFirst / nullsLast [Java 8] wrap a comparator so null KEYS (or elements) do not throw NullPointerException.
 * Stream.sorted on an ordered stream and List.sort are STABLE: equal elements keep their input order.
 */
public final class NullsAndStability {

    /** An account and the date of its latest transaction; null when it has none. */
    public record Activity(String account, LocalDate last) {
        @Override
        public String toString() {
            return account + "=" + last;
        }
    }

    private NullsAndStability() {
    }

    public static List<Activity> activities() {
        return SampleData.accounts().stream()
                .map(Account::number)
                .map(n -> new Activity(n, SampleData.transactions().stream()
                        .filter(t -> t.accountNumber().equals(n))
                        .map(Transaction::date)
                        .max(Comparator.naturalOrder())
                        .orElse(null)))   // null on purpose: a legacy-style nullable field
                .toList();
    }

    /** comparing(last) on a null key throws NullPointerException. */
    public static String withoutNullHandling() {
        try {
            activities().stream().sorted(Comparator.comparing(Activity::last)).toList();
            return "no error";
        } catch (NullPointerException e) {
            return "NullPointerException";
        }
    }

    /** Most recent first, dormant accounts (null) last. */
    public static List<Activity> recentFirstNullsLast() {
        return activities().stream()
                .sorted(Comparator.comparing(Activity::last, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(Activity::account))
                .toList();
    }

    public static List<String> dormantFirst() {
        return activities().stream()
                .sorted(Comparator.comparing(Activity::last, Comparator.nullsFirst(Comparator.naturalOrder())))
                .map(Activity::account)
                .limit(4)
                .toList();
    }

    /** Stable sort: same-date transactions keep their id order (T009 before T010, T012 before T013). */
    public static List<String> augustByDateStable() {
        return SampleData.transactions().stream()
                .filter(t -> t.date().getMonthValue() == 8)
                .sorted(Comparator.comparing(Transaction::date).reversed())
                .map(t -> t.date().getDayOfMonth() + ":" + t.id())
                .toList();
    }

    public static void main(String[] args) {
        System.out.println("comparing(null key)   : " + withoutNullHandling());
        System.out.println("recent first, nulls last:");
        recentFirstNullsLast().forEach(a -> System.out.println("  " + a));
        System.out.println("nullsFirst (first 4)  : " + dormantFirst());
        System.out.println("stable, August desc   : " + augustByDateStable());
    }
}
