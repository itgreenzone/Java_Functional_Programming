package com.itgreenzone.fp.l08_sorting.modern;

import com.itgreenzone.fp.data.Account;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Tier;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

/**
 * MODERN (Java 16-21): a record holds the sort keys, the Comparator is a named constant on the record,
 * ranks come from IntStream (no mutable counter), and reversed() [21] gives the bottom of the list as a view.
 */
public final class ModernCustomerRanking {

    public record Ranked(String id, String name, Tier tier, BigDecimal total) {
        public static final Comparator<Ranked> ORDER =
                Comparator.comparing(Ranked::tier, Comparator.reverseOrder())
                        .thenComparing(Ranked::total, Comparator.reverseOrder())
                        .thenComparing(Ranked::name);
    }

    private ModernCustomerRanking() {
    }

    public static List<Ranked> ranked() {
        Map<String, BigDecimal> totals = SampleData.accounts().stream()
                .collect(Collectors.toMap(Account::customerId, Account::balance, BigDecimal::add));
        return SampleData.customers().stream()
                .map(c -> new Ranked(c.id(), c.name(), c.tier(), totals.getOrDefault(c.id(), BigDecimal.ZERO)))
                .sorted(Ranked.ORDER)
                .toList();
    }

    public static List<String> ranking() {
        List<Ranked> r = ranked();
        return IntStream.range(0, r.size())
                .mapToObj(i -> (i + 1) + ". " + r.get(i).id() + " " + r.get(i).name() + " " + r.get(i).tier() + " " + r.get(i).total())
                .toList();
    }

    /** Java 21: the last 3 of the ranking, lowest first, without re-sorting. */
    public static List<String> bottomThree() {
        return ranked().reversed().stream().limit(3).map(Ranked::id).toList();
    }

    public static void main(String[] args) {
        ranking().forEach(System.out::println);
        System.out.println("bottom 3 via reversed() [21]: " + bottomThree());
    }
}
