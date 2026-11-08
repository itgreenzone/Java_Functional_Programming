package com.itgreenzone.fp.l14_parallel.theory;

import java.util.ArrayList;
import java.util.List;

/**
 * "Should this stream be parallel?" as a pure, testable checklist. It encodes the usual guidance
 * (Doug Lea's NQ model: N elements x Q cost per element must be large; easily splittable source;
 * no blocking I/O; no ordering-heavy operations). It does NOT replace measuring with JMH on real data.
 */
public final class ParallelDecision {

    /** How well a source splits. */
    public enum Source { ARRAY_OR_ARRAYLIST, RANGE, HASH_SET_OR_MAP, LINKED_LIST, ITERATE_OR_IO }

    /** One pipeline to judge. costPerElement: rough work per element (1 = an addition, 1000 = heavy maths). */
    public record Pipeline(long elements, int costPerElement, Source source, boolean blockingIo,
                           boolean orderSensitive, boolean sharedMutableState) { }

    private ParallelDecision() {
    }

    /** Threshold for N x Q below which the overhead of splitting and merging dominates (rule of thumb). */
    static final long NQ_THRESHOLD = 10_000;

    public static List<String> reasonsAgainst(Pipeline p) {
        List<String> reasons = new ArrayList<>();
        if (p.sharedMutableState()) {
            reasons.add("shared mutable state: incorrect, fix this first");
        }
        if (p.blockingIo()) {
            reasons.add("blocking I/O: use virtual threads / an executor, not the commonPool");
        }
        if (p.elements() * p.costPerElement() < NQ_THRESHOLD) {
            reasons.add("N x Q = " + p.elements() * p.costPerElement() + " is too small");
        }
        if (p.source() == Source.LINKED_LIST || p.source() == Source.ITERATE_OR_IO) {
            reasons.add("source splits badly: " + p.source());
        }
        if (p.orderSensitive()) {
            reasons.add("order-sensitive operations (limit/findFirst/forEachOrdered/sorted) cost extra");
        }
        return reasons;
    }

    public static String verdict(Pipeline p) {
        List<String> against = reasonsAgainst(p);
        return against.isEmpty() ? "CANDIDATE: measure with JMH, then decide" : "NOT parallel(): " + against;
    }

    public static void main(String[] args) {
        System.out.println("12 payments, simple sum     : "
                + verdict(new Pipeline(12, 1, Source.ARRAY_OR_ARRAYLIST, false, false, false)));
        System.out.println("5M prices, risk maths       : "
                + verdict(new Pipeline(5_000_000, 200, Source.ARRAY_OR_ARRAYLIST, false, false, false)));
        System.out.println("10k REST enrichment calls   : "
                + verdict(new Pipeline(10_000, 1, Source.ARRAY_OR_ARRAYLIST, true, false, false)));
        System.out.println("1M rows from a LinkedList   : "
                + verdict(new Pipeline(1_000_000, 50, Source.LINKED_LIST, false, true, false)));
        System.out.println("forEach into shared HashMap : "
                + verdict(new Pipeline(1_000_000, 50, Source.ARRAY_OR_ARRAYLIST, false, false, true)));
    }
}
