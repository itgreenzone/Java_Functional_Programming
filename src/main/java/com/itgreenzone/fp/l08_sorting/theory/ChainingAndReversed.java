package com.itgreenzone.fp.l08_sorting.theory;

import com.itgreenzone.fp.data.Account;
import com.itgreenzone.fp.data.Customer;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Tier;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

/**
 * thenComparing [Java 8] adds a tie-breaker. reversed() [Java 8] reverses EVERYTHING before it in the chain:
 * the most common Comparator bug.
 */
public final class ChainingAndReversed {

    /** A customer with the total balance of all their accounts. [record: Java 16] */
    public record CustomerView(String id, String name, Tier tier, BigDecimal total) {
        @Override
        public String toString() {
            return id + " " + tier + " " + total;
        }
    }

    private ChainingAndReversed() {
    }

    public static List<CustomerView> views() {
        return SampleData.customers().stream().map(ChainingAndReversed::view).toList();
    }

    static CustomerView view(Customer c) {
        BigDecimal total = SampleData.accounts().stream()
                .filter(a -> a.customerId().equals(c.id()))
                .map(Account::balance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);   // L09
        return new CustomerView(c.id(), c.name(), c.tier(), total);
    }

    /** tier ASC, then name ASC. */
    public static final Comparator<CustomerView> TIER_THEN_NAME =
            Comparator.comparing(CustomerView::tier).thenComparing(CustomerView::name);

    /** GOTCHA: reversed() at the end reverses tier AND name. */
    public static final Comparator<CustomerView> WRONG_TIER_DESC_NAME_ASC = TIER_THEN_NAME.reversed();

    /** RIGHT: reverse only the key that should be descending. */
    public static final Comparator<CustomerView> TIER_DESC_NAME_ASC =
            Comparator.comparing(CustomerView::tier, Comparator.reverseOrder()).thenComparing(CustomerView::name);

    /** The ranking rule: tier DESC, total balance DESC, name ASC. */
    public static final Comparator<CustomerView> RANKING =
            Comparator.comparing(CustomerView::tier, Comparator.reverseOrder())
                    .thenComparing(CustomerView::total, Comparator.reverseOrder())
                    .thenComparing(CustomerView::name);

    public static List<String> sortedIds(Comparator<CustomerView> order) {
        return views().stream().sorted(order).map(CustomerView::id).toList();
    }

    public static void main(String[] args) {
        System.out.println("tier, name             : " + sortedIds(TIER_THEN_NAME));
        System.out.println("(tier, name).reversed(): " + sortedIds(WRONG_TIER_DESC_NAME_ASC) + "  <- names reversed too");
        System.out.println("tier DESC, name ASC    : " + sortedIds(TIER_DESC_NAME_ASC));
        System.out.println("ranking (tier DESC, total DESC, name ASC):");
        views().stream().sorted(RANKING).forEach(v -> System.out.println("  " + v));
    }
}
