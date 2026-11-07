package com.itgreenzone.fp.l07_filter_map_slice.theory;

import com.itgreenzone.fp.data.Customer;
import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.PaymentStatus;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Tier;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

/**
 * distinct() [Java 8] removes duplicates using equals/hashCode and keeps the FIRST occurrence (encounter order).
 * peek(Consumer) [Java 8] is for debugging only.
 */
public final class DistinctAndPeek {

    /** Records get equals/hashCode from their components [Java 16], so distinct works out of the box. */
    public record CityTier(String city, Tier tier) { }

    /** A plain class WITHOUT equals/hashCode: every instance is "different". */
    public static final class CityTierBean {
        private final String city;
        private final Tier tier;

        public CityTierBean(String city, Tier tier) {
            this.city = city;
            this.tier = tier;
        }

        @Override
        public String toString() {
            return city + "/" + tier;
        }
    }

    private DistinctAndPeek() {
    }

    /** Practice 4: distinct cities, in first-seen order. */
    public static List<String> distinctCities(List<Customer> customers) {
        return customers.stream().map(Customer::city).distinct().toList();
    }

    public static long distinctRecords(List<Customer> customers) {
        return customers.stream().map(c -> new CityTier(c.city(), c.tier())).distinct().count();
    }

    public static long distinctBeans(List<Customer> customers) {
        return customers.stream().map(c -> new CityTierBean(c.city(), c.tier())).distinct().count();
    }

    /** BigDecimal.equals compares scale: 1.0 and 1.00 are NOT duplicates for distinct. */
    public static long distinctBigDecimals() {
        return Stream.of(new BigDecimal("1.0"), new BigDecimal("1.00"), new BigDecimal("1.0")).distinct().count();
    }

    /** Fix: normalise first (setScale), then distinct. */
    public static long distinctBigDecimalsNormalised() {
        return Stream.of(new BigDecimal("1.0"), new BigDecimal("1.00"), new BigDecimal("1.0"))
                .map(b -> b.setScale(2))
                .distinct()
                .count();
    }

    /** peek to watch elements pass each stage. The log is returned so a test can check it. */
    public static List<String> peekTrace(List<Payment> payments) {
        List<String> log = new ArrayList<>();
        List<String> ids = payments.stream()
                .peek(p -> log.add("in " + p.id()))
                .filter(p -> p.status() == PaymentStatus.FAILED)
                .peek(p -> log.add("FAILED " + p.id()))
                .map(Payment::id)
                .toList();
        log.add("result " + ids);
        return log;
    }

    /**
     * Why peek is NOT for business logic: since Java 9, count() may compute the size straight from a SIZED
     * source and skip the pipeline, so the peek action never runs.
     */
    public static String peekSkippedByCount(List<Payment> payments) {
        List<String> seen = new ArrayList<>();
        long n = payments.stream().peek(p -> seen.add(p.id())).count();
        List<String> seenWithFilter = new ArrayList<>();
        long failed = payments.stream().peek(p -> seenWithFilter.add(p.id()))
                .filter(p -> p.status() == PaymentStatus.FAILED).count();
        return "count=" + n + " peeked=" + seen.size() + " | with filter: count=" + failed + " peeked=" + seenWithFilter.size();
    }

    public static void main(String[] args) {
        List<Customer> customers = SampleData.customers();
        System.out.println("distinct cities        : " + distinctCities(customers));
        System.out.println("distinct records       : " + distinctRecords(customers) + " of " + customers.size());
        System.out.println("distinct, no equals    : " + distinctBeans(customers) + " of " + customers.size());
        System.out.println("1.0, 1.00, 1.0         : " + distinctBigDecimals() + " distinct; after setScale(2): "
                + distinctBigDecimalsNormalised());
        System.out.println("peek trace (P001-P004) : " + peekTrace(SampleData.payments().subList(0, 4)));
        System.out.println("peek + count()         : " + peekSkippedByCount(SampleData.payments()));
    }
}
