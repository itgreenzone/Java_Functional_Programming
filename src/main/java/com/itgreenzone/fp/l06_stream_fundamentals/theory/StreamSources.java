package com.itgreenzone.fp.l06_stream_fundamentals.theory;

import com.itgreenzone.fp.data.Customer;
import com.itgreenzone.fp.data.Flight;
import com.itgreenzone.fp.data.SampleData;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;

/** Where streams come from. Every source here is deterministic. */
public final class StreamSources {

    private StreamSources() {
    }

    /** Collection.stream() [8]. */
    public static long goldCustomers() {
        return SampleData.customers().stream()
                .filter(c -> c.tier() == com.itgreenzone.fp.data.Tier.GOLD)
                .count();
    }

    /** Stream.of(values...) [8]. */
    public static List<String> paymentMethods() {
        return Stream.of("CARD", "PAYNOW", "PAYPAL").toList();
    }

    /** Arrays.stream(array) [8]: an int[] gives an IntStream. */
    public static int totalSeats() {
        int[] seats = SampleData.flights().stream().mapToInt(Flight::seats).toArray();
        return Arrays.stream(seats).sum();
    }

    /** IntStream.range (end exclusive) and rangeClosed (end inclusive) [8]. */
    public static List<Integer> monthsOfQ4() {
        return IntStream.rangeClosed(10, 12).boxed().toList();
    }

    /** Stream.iterate(seed, next) + limit [8]: infinite, so it MUST be limited. */
    public static List<String> nextThreeStatementDates(LocalDate first) {
        return Stream.iterate(first, d -> d.plusMonths(1))
                .limit(3)
                .map(LocalDate::toString)
                .toList();
    }

    /** Stream.iterate(seed, hasNext, next) [9]: a for-loop as a stream, finite by itself. */
    public static List<LocalDate> weeklyReviewDates(LocalDate from, LocalDate to) {
        return Stream.iterate(from, d -> !d.isAfter(to), d -> d.plusWeeks(1)).toList();
    }

    /** Stream.generate(supplier) + limit [8]: also infinite. */
    public static List<String> initialStatuses(int count) {
        return Stream.generate(() -> "PENDING").limit(count).toList();
    }

    /** String.chars() [8]: an IntStream of UTF-16 char values. */
    public static long countOf(char ch, String text) {
        return text.chars().filter(c -> c == ch).count();
    }

    /** Stream.ofNullable(value) [9]: zero or one element. */
    public static long ofNullableCount(String maybeNull) {
        return Stream.ofNullable(maybeNull).count();
    }

    /** Map.entrySet().stream() [8]: use a sorted map for a deterministic order. */
    public static List<String> customersPerCity() {
        Map<String, Long> perCity = SampleData.customers().stream()
                .collect(Collectors.groupingBy(Customer::city, TreeMap::new, Collectors.counting()));
        return perCity.entrySet().stream()
                .map(e -> e.getKey() + "=" + e.getValue())
                .toList();
    }

    /** Files.lines(path) [8]: lazy, line by line. It holds a file handle, so ALWAYS try-with-resources. */
    public static long successLines(Path csv) {
        try (Stream<String> lines = Files.lines(csv, StandardCharsets.UTF_8)) {
            return lines.skip(1)                        // header
                    .filter(line -> line.endsWith(",SUCCESS"))
                    .count();
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    /** Writes the payments as a small CSV file, so Files.lines has a real file to read. */
    public static Path writePaymentsCsv() {
        try {
            Path file = Files.createTempFile("payments-", ".csv");
            List<String> lines = Stream.concat(
                    Stream.of("id,method,amount,status"),
                    SampleData.payments().stream()
                            .map(p -> p.id() + "," + p.method() + "," + p.amount() + "," + p.status()))
                    .toList();
            Files.write(file, lines, StandardCharsets.UTF_8);
            file.toFile().deleteOnExit();
            return file;
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    public static void main(String[] args) {
        System.out.println("list.stream()          : GOLD customers = " + goldCustomers());
        System.out.println("Stream.of              : " + paymentMethods());
        System.out.println("Arrays.stream(int[])   : total seats = " + totalSeats());
        System.out.println("IntStream.rangeClosed  : " + monthsOfQ4());
        System.out.println("iterate + limit [8]    : " + nextThreeStatementDates(LocalDate.of(2026, 11, 30)));
        System.out.println("iterate 3-arg [9]      : " + weeklyReviewDates(LocalDate.of(2026, 11, 2), LocalDate.of(2026, 11, 30)));
        System.out.println("generate + limit       : " + initialStatuses(3));
        System.out.println("\"PAYPAL\".chars()       : count of 'P' = " + countOf('P', "PAYPAL"));
        System.out.println("Stream.ofNullable [9]  : " + ofNullableCount(null) + " / " + ofNullableCount("SGD"));
        System.out.println("map.entrySet().stream(): " + customersPerCity());
        System.out.println("Files.lines            : SUCCESS rows = " + successLines(writePaymentsCsv()));
    }
}
