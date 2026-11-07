package com.itgreenzone.fp.l03_lambdas.exercise;

import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.l03_lambdas.before.PaymentValidation;

import java.util.Comparator;
import java.util.List;

/**
 * L03 EXERCISE (about 20 minutes).
 * Refactor {@link LegacyPaymentScreening} from anonymous classes to lambdas.
 * Rules: lambdas must be short; extract any rule with more than one condition into a named method;
 * no AtomicInteger or array counters. Then remove @Disabled in Exercise03Test.
 */
public final class Exercise03 {

    private Exercise03() {
    }

    public static List<PaymentValidation> rules() {
        // TODO 1: List.of(three lambdas) - same messages, same order
        throw new UnsupportedOperationException("TODO 1");
    }

    public static Comparator<Payment> byAmountHighestFirst() {
        // TODO 2: one lambda
        throw new UnsupportedOperationException("TODO 2");
    }

    public static List<String> screen(List<Payment> payments) {
        // TODO 3: a stream pipeline that returns "id: message" for every rule that fails
        throw new UnsupportedOperationException("TODO 3");
    }

    public static long flaggedCount(List<Payment> payments) {
        // TODO 4: count payments with at least one message, using filter + count (no captured counter)
        throw new UnsupportedOperationException("TODO 4");
    }
}
