package com.itgreenzone.fp.l06_stream_fundamentals.modern;

import com.itgreenzone.fp.data.Category;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;
import com.itgreenzone.fp.data.TxnType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Month;
import java.util.Comparator;
import java.util.List;
import java.util.function.Predicate;
import java.util.stream.Stream;

/**
 * Java 9-21 style: named predicates, a record result [16], toList() [16],
 * and Stream.iterate with a condition [9] to build the week boundaries of October.
 */
public final class ModernTopDebits {

    /** One line of the report. [Java 16 record] */
    public record DebitLine(String id, Category category, BigDecimal amount) {
        @Override
        public String toString() {
            return id + " " + category + " " + amount;
        }
    }

    static final Predicate<Transaction> IS_DEBIT = t -> t.type() == TxnType.DEBIT;
    static final Predicate<Transaction> IN_OCTOBER = t -> t.date().getMonth() == Month.OCTOBER;

    private ModernTopDebits() {
    }

    public static List<DebitLine> topOctoberDebits(List<Transaction> txns, int n) {
        return txns.stream()
                .filter(IS_DEBIT.and(IN_OCTOBER))
                .sorted(Comparator.comparing(Transaction::amount).reversed())
                .limit(n)
                .map(t -> new DebitLine(t.id(), t.category(), t.amount()))
                .toList();
    }

    /** Debit count per week of October 2026, weeks starting on the 1st, 8th, 15th, 22nd, 29th. */
    public static List<String> octoberDebitsPerWeek(List<Transaction> txns) {
        LocalDate start = LocalDate.of(2026, 10, 1);
        LocalDate end = LocalDate.of(2026, 10, 31);
        return Stream.iterate(start, d -> !d.isAfter(end), d -> d.plusWeeks(1))
                .map(weekStart -> weekStart + ": " + txns.stream()
                        .filter(IS_DEBIT)
                        .filter(t -> !t.date().isBefore(weekStart) && t.date().isBefore(weekStart.plusWeeks(1)))
                        .filter(t -> !t.date().isAfter(end))
                        .count())
                .toList();
    }

    public static void main(String[] args) {
        topOctoberDebits(SampleData.transactions(), 3).forEach(System.out::println);
        System.out.println("debits per week: " + octoberDebitsPerWeek(SampleData.transactions()));
    }
}
