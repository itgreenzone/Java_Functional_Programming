package com.itgreenzone.fp.l13_advanced.theory;

import com.itgreenzone.fp.data.Account;
import com.itgreenzone.fp.data.SampleData;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

/**
 * Map transforms: Map.merge / compute / computeIfAbsent [8] for updating a map in place,
 * versus entrySet().stream() for building a NEW map.
 */
public final class MapTransforms {

    private MapTransforms() {
    }

    /** merge [8]: put the value, or combine it with the existing one. The classic loop-based total per key. */
    public static Map<String, BigDecimal> balancePerCustomerWithMerge(List<Account> accounts) {
        Map<String, BigDecimal> totals = new TreeMap<>();
        for (Account a : accounts) {
            totals.merge(a.customerId(), a.balance(), BigDecimal::add);
        }
        return totals;
    }

    /** The same with a stream: toMap with a merge function. */
    public static Map<String, BigDecimal> balancePerCustomerWithStream(List<Account> accounts) {
        return accounts.stream().collect(Collectors.toMap(Account::customerId, Account::balance,
                BigDecimal::add, TreeMap::new));
    }

    /** computeIfAbsent [8]: a multimap without the get-null-put dance. */
    public static Map<String, List<String>> accountsPerCustomer(List<Account> accounts) {
        Map<String, List<String>> map = new TreeMap<>();
        for (Account a : accounts) {
            map.computeIfAbsent(a.customerId(), k -> new ArrayList<>()).add(a.number());
        }
        return map;
    }

    /** compute [8]: recompute one entry from its old value (null when absent). Here: count accounts per type. */
    public static Map<String, Integer> countPerType(List<Account> accounts) {
        Map<String, Integer> map = new TreeMap<>();
        for (Account a : accounts) {
            map.compute(a.type().name(), (k, old) -> old == null ? 1 : old + 1);
        }
        return map;
    }

    /** Transform values into a NEW map: entrySet stream + toMap. The source map is unchanged. */
    public static Map<String, String> balanceBands(Map<String, BigDecimal> totals) {
        return totals.entrySet().stream().collect(Collectors.toMap(Map.Entry::getKey,
                e -> e.getValue().compareTo(new BigDecimal("50000")) >= 0 ? "HIGH" : "STANDARD",
                (a, b) -> a, TreeMap::new));
    }

    /** Filter entries and sort a map by value (desc), then by key: LinkedHashMap keeps that order. */
    public static Map<String, BigDecimal> topBalances(Map<String, BigDecimal> totals, int n) {
        return totals.entrySet().stream()
                .sorted(Map.Entry.<String, BigDecimal>comparingByValue(Comparator.reverseOrder())
                        .thenComparing(Map.Entry.comparingByKey()))
                .limit(n)
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (a, b) -> a, LinkedHashMap::new));
    }

    /** replaceAll [8]: update every value in place (the map must be mutable). */
    public static Map<String, BigDecimal> withInterestCredited(Map<String, BigDecimal> totals, BigDecimal rate) {
        Map<String, BigDecimal> copy = new TreeMap<>(totals);
        copy.replaceAll((k, v) -> v.signum() > 0
                ? v.add(v.multiply(rate)).setScale(2, RoundingMode.HALF_UP) : v);
        return copy;
    }

    public static void main(String[] args) {
        List<Account> accounts = SampleData.accounts();
        Map<String, BigDecimal> totals = balancePerCustomerWithMerge(accounts);
        System.out.println("merge loop          : " + totals);
        System.out.println("toMap, same result  : " + totals.equals(balancePerCustomerWithStream(accounts)));
        System.out.println("computeIfAbsent     : " + accountsPerCustomer(accounts));
        System.out.println("compute             : " + countPerType(accounts));
        System.out.println("bands (new map)     : " + balanceBands(totals));
        System.out.println("top 3 by balance    : " + topBalances(totals, 3));
        Map<String, BigDecimal> credited = withInterestCredited(totals, new BigDecimal("0.01"));
        System.out.println("replaceAll +1%      : C001 " + credited.get("C001") + ", C009 " + credited.get("C009")
                + " (negative: unchanged)");
    }
}
