package com.itgreenzone.fp.l03_lambdas.theory;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.function.Function;

/**
 * Checked exceptions and lambdas.
 * PROBLEM: raw.stream().map(s -> Amounts.parse(s)) does not compile:
 * "unreported exception InvalidAmountException; must be caught or declared to be thrown",
 * because Function.apply does not declare 'throws'.
 */
public final class CheckedExceptions {

    private CheckedExceptions() {
    }

    /** Pattern 1: try/catch inside the lambda. Works, but the lambda is no longer short. */
    public static List<BigDecimal> parseWithTryCatch(List<String> raw) {
        return raw.stream()
                .map(s -> {
                    try {
                        return Amounts.parse(s);
                    } catch (InvalidAmountException e) {
                        throw new IllegalArgumentException(e.getMessage(), e);
                    }
                })
                .toList();
    }

    /** Pattern 2: a custom interface that declares the exception; the caller handles it. */
    public static List<BigDecimal> parseAll(List<String> raw,
                                            ThrowingFunction<String, BigDecimal, InvalidAmountException> parser)
            throws InvalidAmountException {
        List<BigDecimal> result = new ArrayList<>();
        for (String s : raw) {
            result.add(parser.apply(s));
        }
        return List.copyOf(result);
    }

    /** Pattern 3: wrap once with a helper, keep the pipeline clean, unwrap at the edge. */
    public static List<BigDecimal> parseWithWrapper(List<String> raw) {
        Function<String, BigDecimal> parse = ThrowingFunction.unchecked(Amounts::parse);
        return raw.stream()
                .map(parse)
                .toList();
    }

    /** Pattern 4: turn failure into a value (Optional here; a Result type in L17). Bad input is skipped. */
    public static Optional<BigDecimal> parseOrEmpty(String raw) {
        try {
            return Optional.of(Amounts.parse(raw));
        } catch (InvalidAmountException e) {
            return Optional.empty();
        }
    }

    public static List<BigDecimal> parseValidOnly(List<String> raw) {
        return raw.stream()
                .map(CheckedExceptions::parseOrEmpty)
                .flatMap(Optional::stream)
                .toList();
    }

    public static void main(String[] args) {
        List<String> good = List.of("120.00", " 45.5 ", "999.99");
        List<String> mixed = List.of("120.00", "abc", "-10.00", "75");

        System.out.println("1 try/catch      : " + parseWithTryCatch(good));
        try {
            System.out.println("2 custom SAM     : " + parseAll(good, Amounts::parse));
            parseAll(mixed, Amounts::parse);
        } catch (InvalidAmountException e) {
            System.out.println("2 caught checked : " + e.getMessage());
        }
        try {
            parseWithWrapper(mixed);
        } catch (WrappedCheckedException e) {
            System.out.println("3 unwrapped cause: " + e.getCause().getClass().getSimpleName() + " - " + e.getCause().getMessage());
        }
        System.out.println("4 skip invalid   : " + parseValidOnly(mixed));
    }
}
