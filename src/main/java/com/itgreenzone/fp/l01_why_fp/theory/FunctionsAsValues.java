package com.itgreenzone.fp.l01_why_fp.theory;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.function.Function;

/**
 * Functions as values [Java 8]: store a function in a variable, pass it to a method,
 * and return it from a method.
 */
public final class FunctionsAsValues {

    /** Singapore GST is 9% (2024 onwards): amount x 1.09. */
    private static final BigDecimal GST_MULTIPLIER = new BigDecimal("1.09");

    /** 1) A function stored in a variable. */
    public static final Function<BigDecimal, BigDecimal> ADD_GST =
            amount -> amount.multiply(GST_MULTIPLIER).setScale(2, RoundingMode.HALF_UP);

    private FunctionsAsValues() {
    }

    /** 2) A method that takes a function as a parameter (a higher-order function). */
    public static List<BigDecimal> applyToAll(List<BigDecimal> amounts,
                                              Function<BigDecimal, BigDecimal> rule) {
        return amounts.stream()
                .map(rule)
                .toList();
    }

    /** 3) A method that returns a function: a discount rule for a given percentage. */
    public static Function<BigDecimal, BigDecimal> discountOf(int percent) {
        BigDecimal factor = BigDecimal.valueOf(100L - percent).movePointLeft(2);
        return amount -> amount.multiply(factor).setScale(2, RoundingMode.HALF_UP);
    }

    public static void main(String[] args) {
        List<BigDecimal> prices = List.of(new BigDecimal("100.00"), new BigDecimal("59.90"));
        System.out.println("With GST:        " + applyToAll(prices, ADD_GST));
        System.out.println("10% discount:    " + applyToAll(prices, discountOf(10)));
        System.out.println("Discount + GST:  " + applyToAll(prices, discountOf(10).andThen(ADD_GST)));
    }
}
