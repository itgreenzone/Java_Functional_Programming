package com.itgreenzone.fp.l11_grouping.solution;

import com.itgreenzone.fp.data.Account;
import com.itgreenzone.fp.data.Category;
import com.itgreenzone.fp.data.Customer;
import com.itgreenzone.fp.data.Flight;
import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.PaymentStatus;
import com.itgreenzone.fp.data.Policy;
import com.itgreenzone.fp.data.PolicyType;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Tier;
import com.itgreenzone.fp.data.Transaction;
import com.itgreenzone.fp.data.TxnType;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

import static java.util.Comparator.comparing;
import static java.util.stream.Collectors.collectingAndThen;
import static java.util.stream.Collectors.counting;
import static java.util.stream.Collectors.groupingBy;
import static java.util.stream.Collectors.mapping;
import static java.util.stream.Collectors.partitioningBy;
import static java.util.stream.Collectors.reducing;
import static java.util.stream.Collectors.toList;

/** Reference solution for Exercise11: 12 grouping problems. */
public final class Solution11 {

    private Solution11() {
    }

    public static Map<String, Long> customersPerCity() {
        return SampleData.customers().stream().collect(groupingBy(Customer::city, TreeMap::new, counting()));
    }

    public static Map<Tier, List<String>> namesPerTier() {
        return SampleData.customers().stream()
                .collect(groupingBy(Customer::tier, () -> new EnumMap<>(Tier.class), mapping(Customer::name, toList())));
    }

    public static Map<Category, BigDecimal> debitTotalPerCategory() {
        return SampleData.transactions().stream()
                .filter(t -> t.type() == TxnType.DEBIT)
                .collect(groupingBy(Transaction::category, () -> new EnumMap<>(Category.class),
                        reducing(BigDecimal.ZERO, Transaction::amount, BigDecimal::add)));
    }

    public static Map<PolicyType, BigDecimal> averagePremiumPerType() {
        return SampleData.policies().stream()
                .collect(groupingBy(Policy::type, () -> new EnumMap<>(PolicyType.class),
                        collectingAndThen(toList(), ps -> ps.stream().map(Policy::premium)
                                .reduce(BigDecimal.ZERO, BigDecimal::add)
                                .divide(BigDecimal.valueOf(ps.size()), 2, RoundingMode.HALF_UP))));
    }

    public static Map<String, String> largestTxnPerAccount() {
        return SampleData.transactions().stream()
                .collect(groupingBy(Transaction::accountNumber, TreeMap::new,
                        collectingAndThen(Collectors.maxBy(comparing(Transaction::amount)), o -> o.orElseThrow().id())));
    }

    public static Map<String, List<String>> top3PerAccount() {
        return SampleData.transactions().stream()
                .collect(groupingBy(Transaction::accountNumber, TreeMap::new,
                        collectingAndThen(toList(), l -> l.stream()
                                .sorted(comparing(Transaction::amount).reversed().thenComparing(Transaction::id))
                                .limit(3).map(Transaction::id).toList())));
    }

    public static Map<String, Map<Tier, Long>> cityTierCount() {
        return SampleData.customers().stream()
                .collect(groupingBy(Customer::city, TreeMap::new,
                        groupingBy(Customer::tier, () -> new EnumMap<>(Tier.class), counting())));
    }

    public static Map<String, Long> failedPerMethodWithZeros() {
        return SampleData.payments().stream()
                .collect(groupingBy(Payment::method, TreeMap::new,
                        Collectors.filtering(p -> p.status() == PaymentStatus.FAILED, counting())));
    }

    public static Map<Boolean, BigDecimal> successPartitionTotals() {
        return SampleData.payments().stream()
                .collect(partitioningBy(p -> p.status() == PaymentStatus.SUCCESS,
                        reducing(BigDecimal.ZERO, Payment::amount, BigDecimal::add)));
    }

    public static Map<YearMonth, List<String>> policiesByExpiryMonth() {
        return SampleData.policies().stream()
                .collect(groupingBy(p -> YearMonth.from(p.expiry()), TreeMap::new, mapping(Policy::number, toList())));
    }

    public static List<String> topCategoriesByCount(int n) {
        return SampleData.transactions().stream()
                .collect(groupingBy(Transaction::category, counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<Category, Long>comparingByValue(Comparator.reverseOrder())
                        .thenComparing(Map.Entry.comparingByKey()))
                .limit(n)
                .map(e -> e.getKey() + "=" + e.getValue())
                .toList();
    }

    public static Map<String, String> richestAccountPerCustomer() {
        return SampleData.accounts().stream()
                .collect(groupingBy(Account::customerId, TreeMap::new,
                        collectingAndThen(Collectors.maxBy(comparing(Account::balance)), o -> o.orElseThrow().number())));
    }

    /** Bonus used in the lesson: flights per origin. */
    public static Map<String, Long> flightsPerOrigin() {
        return SampleData.flights().stream().collect(groupingBy(Flight::from, TreeMap::new, counting()));
    }

    public static void main(String[] args) {
        System.out.println(" 1 customers per city      : " + customersPerCity());
        System.out.println(" 2 names per tier          : " + namesPerTier());
        System.out.println(" 3 debit total per category: " + debitTotalPerCategory());
        System.out.println(" 4 avg premium per type    : " + averagePremiumPerType());
        System.out.println(" 5 largest txn per account : " + largestTxnPerAccount());
        System.out.println(" 6 top-3 per account       : " + top3PerAccount());
        System.out.println(" 7 city -> tier -> count   : " + cityTierCount());
        System.out.println(" 8 FAILED per method (0s)  : " + failedPerMethodWithZeros());
        System.out.println(" 9 SUCCESS partition totals: " + successPartitionTotals());
        System.out.println("10 policies by expiry month: " + policiesByExpiryMonth());
        System.out.println("11 top 3 categories        : " + topCategoriesByCount(3));
        System.out.println("12 richest account per cust: " + richestAccountPerCustomer());
    }
}
