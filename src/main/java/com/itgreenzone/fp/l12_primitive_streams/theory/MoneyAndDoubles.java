package com.itgreenzone.fp.l12_primitive_streams.theory;

import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.SampleData;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.DoubleStream;
import java.util.stream.Stream;

/**
 * Why NOT double for money, and the BigDecimal stream patterns used in this course.
 * double is binary floating point: 0.1 has no exact representation, errors appear and depend on the order of addition.
 * There is no BigDecimalStream: use Stream&lt;BigDecimal&gt; with reduce, or integer cents with LongStream.
 */
public final class MoneyAndDoubles {

    private MoneyAndDoubles() {
    }

    /** The classic: 0.1 + 0.2 is not 0.3 in binary floating point. */
    public static double pointOnePlusPointTwo() {
        return 0.1 + 0.2;
    }

    /** Ten times 0.1 with a plain loop. */
    public static double tenTimesTenCentsLoop() {
        double total = 0;
        for (int i = 0; i < 10; i++) {
            total += 0.1;
        }
        return total;
    }

    /** The same with reduce(0, Double::sum): the same rounding errors as the loop. */
    public static double tenTimesTenCentsReduce() {
        return DoubleStream.generate(() -> 0.1).limit(10).reduce(0, Double::sum);
    }

    /** DoubleStream.sum() uses compensated (Kahan) summation, so it can differ from a loop or reduce. */
    public static double tenTimesTenCentsSum() {
        return DoubleStream.generate(() -> 0.1).limit(10).sum();
    }

    /** double addition is not associative: the order changes the result (it matters for parallel streams). */
    public static String orderMatters() {
        double forward = DoubleStream.of(0.1, 0.2, 0.3).reduce(0, Double::sum);
        double backward = DoubleStream.of(0.3, 0.2, 0.1).reduce(0, Double::sum);
        return forward + " vs " + backward;
    }

    /** BigDecimal: exact decimal arithmetic. */
    public static BigDecimal tenTimesTenCentsExact() {
        return Stream.generate(() -> new BigDecimal("0.10")).limit(10).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /** Pattern 1: reduce(ZERO, add) on a Stream&lt;BigDecimal&gt;. */
    public static BigDecimal total(List<Payment> payments) {
        return payments.stream().map(Payment::amount).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /** Pattern 2: average = total / count with an explicit scale and rounding (never divide without them). */
    public static BigDecimal average(List<Payment> payments) {
        if (payments.isEmpty()) {
            return BigDecimal.ZERO.setScale(2);
        }
        return total(payments).divide(BigDecimal.valueOf(payments.size()), 2, RoundingMode.HALF_UP);
    }

    /** Pattern 3: integer cents in a LongStream (exact, fast); convert back at the edge. */
    public static long totalCents(List<Payment> payments) {
        return payments.stream().mapToLong(p -> p.amount().movePointRight(2).longValueExact()).sum();
    }

    public static BigDecimal fromCents(long cents) {
        return BigDecimal.valueOf(cents, 2);
    }

    /** The double version of the payment total, for comparison only. */
    public static double totalAsDouble(List<Payment> payments) {
        return payments.stream().mapToDouble(p -> p.amount().doubleValue()).sum();
    }

    public static void main(String[] args) {
        List<Payment> payments = SampleData.payments();
        System.out.println("0.1 + 0.2                : " + pointOnePlusPointTwo());
        System.out.println("10 x 0.1, for loop       : " + tenTimesTenCentsLoop());
        System.out.println("10 x 0.1, reduce         : " + tenTimesTenCentsReduce());
        System.out.println("10 x 0.1, DoubleStream.sum: " + tenTimesTenCentsSum());
        System.out.println("order matters (reduce)   : " + orderMatters());
        System.out.println("10 x 0.10, BigDecimal    : " + tenTimesTenCentsExact());
        System.out.println("payments total (reduce)  : " + total(payments));
        System.out.println("payments average         : " + average(payments));
        System.out.println("payments total (cents)   : " + totalCents(payments) + " -> " + fromCents(totalCents(payments)));
        System.out.println("payments total (double)  : " + totalAsDouble(payments) + "  (correct here by luck; 10 x 0.1 was not)");
    }
}
