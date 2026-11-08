package com.itgreenzone.fp.l14_parallel.exercise;

import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.PaymentStatus;
import com.itgreenzone.fp.data.SampleData;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * L14 EXERCISE (about 30 minutes): three BROKEN parallel pipelines. They compile and often look fine on a
 * laptop, but they are wrong. Find the bug in each, fix it (keep parallelStream()), then remove @Disabled in
 * Exercise14Test. Do not "fix" them by switching to stream(): the point is a pipeline that is correct in parallel.
 */
public final class Exercise14 {

    private Exercise14() {
    }

    /**
     * 1: settlement total = opening float + the sum of all 12 payment amounts.
     * Expected for settlementTotal(100.00): 4529.84
     * BROKEN: try it and compare with 100.00 + 4429.84.
     */
    public static BigDecimal settlementTotal(BigDecimal openingFloat) {
        return SampleData.payments().parallelStream()
                .map(Payment::amount)
                .reduce(openingFloat, BigDecimal::add);
    }

    /**
     * 2: the id of the FIRST payment (in list order) whose amount is over the limit.
     * Expected for firstPaymentOver(500.00): P005
     * BROKEN: sometimes right, sometimes P008 or P010.
     */
    public static String firstPaymentOver(BigDecimal limit) {
        return SampleData.payments().parallelStream()
                .filter(p -> p.amount().compareTo(limit) > 0)
                .findAny()
                .map(Payment::id)
                .orElse("none");
    }

    /**
     * 3: ids of all SUCCESS payments, in list order.
     * Expected: [P001, P002, P004, P005, P007, P009, P010, P011]
     * BROKEN: a shared ArrayList filled from several threads.
     */
    public static List<String> successfulIds() {
        List<String> ids = new ArrayList<>();
        SampleData.payments().parallelStream()
                .filter(p -> p.status() == PaymentStatus.SUCCESS)
                .forEach(p -> ids.add(p.id()));
        return ids;
    }
}
