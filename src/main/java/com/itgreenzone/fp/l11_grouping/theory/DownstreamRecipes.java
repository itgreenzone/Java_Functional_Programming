package com.itgreenzone.fp.l11_grouping.theory;

import com.itgreenzone.fp.data.Account;
import com.itgreenzone.fp.data.Customer;
import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.PaymentStatus;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Tier;
import com.itgreenzone.fp.data.Transaction;
import com.itgreenzone.fp.data.Category;

import java.math.BigDecimal;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

import static java.util.stream.Collectors.groupingBy;

/**
 * The downstream collectors that matter in real code:
 * filtering vs filter-before-group (empty groups!), flatMapping [9], teeing per group [12], BigDecimal reducing.
 */
public final class DownstreamRecipes {

    /** Per-group result built with teeing. [record: Java 16] */
    public record CountTotal(long count, BigDecimal total) {
        @Override
        public String toString() {
            return count + "/" + total;
        }
    }

    private DownstreamRecipes() {
    }

    /** filter BEFORE grouping: methods with no FAILED payment disappear (no CARD key). */
    public static Map<String, Long> failedPerMethodFilterFirst(List<Payment> payments) {
        return payments.stream()
                .filter(p -> p.status() == PaymentStatus.FAILED)
                .collect(groupingBy(Payment::method, TreeMap::new, Collectors.counting()));
    }

    /** filtering(...) [9] INSIDE the group: every method stays, with 0 where nothing matched. */
    public static Map<String, Long> failedPerMethodFiltering(List<Payment> payments) {
        return payments.stream()
                .collect(groupingBy(Payment::method, TreeMap::new,
                        Collectors.filtering(p -> p.status() == PaymentStatus.FAILED, Collectors.counting())));
    }

    /** flatMapping [9]: per tier, the account numbers of its customers (one customer -> many accounts). */
    public static Map<Tier, List<String>> accountsPerTier(List<Customer> customers, List<Account> accounts) {
        return customers.stream()
                .collect(groupingBy(Customer::tier, () -> new EnumMap<>(Tier.class),
                        Collectors.flatMapping(c -> accounts.stream()
                                        .filter(a -> a.customerId().equals(c.id()))
                                        .map(Account::number),
                                Collectors.toList())));
    }

    /** teeing [12] per group: count and BigDecimal total per method in one pass. */
    public static Map<String, CountTotal> countAndTotalPerMethod(List<Payment> payments) {
        return payments.stream()
                .collect(groupingBy(Payment::method, TreeMap::new,
                        Collectors.teeing(Collectors.counting(),
                                Collectors.reducing(BigDecimal.ZERO, Payment::amount, BigDecimal::add),
                                CountTotal::new)));
    }

    /** Practice: total amount per category (BigDecimal), EnumMap in Category order. */
    public static Map<Category, BigDecimal> totalPerCategory(List<Transaction> txns) {
        return txns.stream()
                .collect(groupingBy(Transaction::category, () -> new EnumMap<>(Category.class),
                        Collectors.reducing(BigDecimal.ZERO, Transaction::amount, BigDecimal::add)));
    }

    public static void main(String[] args) {
        List<Payment> payments = SampleData.payments();
        System.out.println("FAILED, filter first   : " + failedPerMethodFilterFirst(payments) + "  <- no CARD key!");
        System.out.println("FAILED, filtering [9]  : " + failedPerMethodFiltering(payments));
        System.out.println("accounts per tier [9]  : " + accountsPerTier(SampleData.customers(), SampleData.accounts()));
        System.out.println("teeing per method [12] : " + countAndTotalPerMethod(payments));
        System.out.println("total per category     : " + totalPerCategory(SampleData.transactions()));
    }
}
