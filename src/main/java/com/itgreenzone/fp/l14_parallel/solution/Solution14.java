package com.itgreenzone.fp.l14_parallel.solution;

import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.PaymentStatus;
import com.itgreenzone.fp.data.SampleData;

import java.math.BigDecimal;
import java.util.List;

/** L14 reference solution: the three parallel pipelines from Exercise14, fixed. */
public final class Solution14 {

    private Solution14() {
    }

    /**
     * 1 FIXED: the identity of reduce must be neutral (ZERO). Add the opening float once, outside the reduce.
     * Broken version: reduce(openingFloat, add) adds the float once per parallel chunk.
     */
    public static BigDecimal settlementTotal(BigDecimal openingFloat) {
        return openingFloat.add(SampleData.payments().parallelStream()
                .map(Payment::amount)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
    }

    /**
     * 2 FIXED: "the FIRST payment over the limit" needs findFirst (deterministic). findAny may return any match.
     */
    public static String firstPaymentOver(BigDecimal limit) {
        return SampleData.payments().parallelStream()
                .filter(p -> p.amount().compareTo(limit) > 0)
                .findFirst()
                .map(Payment::id)
                .orElse("none");
    }

    /**
     * 3 FIXED: no shared ArrayList. Let the stream build the list: filter + map + toList keeps encounter order
     * and is thread-safe. Broken version: forEach(ids::add) on a shared ArrayList loses elements and order.
     */
    public static List<String> successfulIds() {
        return SampleData.payments().parallelStream()
                .filter(p -> p.status() == PaymentStatus.SUCCESS)
                .map(Payment::id)
                .toList();
    }

    public static void main(String[] args) {
        System.out.println("1 settlement total, float 100.00 : " + settlementTotal(new BigDecimal("100.00")));
        System.out.println("2 first payment over 500.00      : " + firstPaymentOver(new BigDecimal("500.00")));
        System.out.println("3 successful ids                 : " + successfulIds());
    }
}
