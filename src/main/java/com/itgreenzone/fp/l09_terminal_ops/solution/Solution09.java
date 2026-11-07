package com.itgreenzone.fp.l09_terminal_ops.solution;

import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;
import com.itgreenzone.fp.data.TxnType;
import com.itgreenzone.fp.l09_terminal_ops.exercise.Exercise09;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

/** Reference solution for Exercise09: month-end totals in SGD. */
public final class Solution09 {

    private Solution09() {
    }

    static Stream<Transaction> of(YearMonth month, TxnType type) {
        return SampleData.transactions().stream()
                .filter(t -> YearMonth.from(t.date()).equals(month))
                .filter(t -> t.type() == type);
    }

    public static BigDecimal debitTotal(YearMonth month) {
        return of(month, TxnType.DEBIT).map(Exercise09::toSgd).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public static BigDecimal creditTotal(YearMonth month) {
        return of(month, TxnType.CREDIT).map(Exercise09::toSgd).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public static BigDecimal net(YearMonth month) {
        return creditTotal(month).subtract(debitTotal(month));
    }

    public static BigDecimal averageDebit(YearMonth month) {
        List<BigDecimal> debits = of(month, TxnType.DEBIT).map(Exercise09::toSgd).toList();
        if (debits.isEmpty()) {
            return BigDecimal.ZERO.setScale(2);
        }
        return debits.stream().reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(debits.size()), 2, RoundingMode.HALF_UP);
    }

    public static Optional<String> largestDebit(YearMonth month) {
        return of(month, TxnType.DEBIT)
                .max(Comparator.comparing(Exercise09::toSgd))
                .map(t -> t.id() + " " + Exercise09.toSgd(t));
    }

    public static List<String> monthEndReport() {
        return Exercise09.MONTHS.stream()
                .map(m -> m + " debits=" + debitTotal(m) + " credits=" + creditTotal(m) + " net=" + net(m)
                        + " avgDebit=" + averageDebit(m))
                .toList();
    }

    /** Why round per line: rounding once at the end gives a different total for the same USD transactions. */
    public static String perLineVsAtEnd() {
        List<Transaction> usd = SampleData.transactions().stream().filter(t -> t.currency().equals("USD")).toList();
        BigDecimal perLine = usd.stream().map(Exercise09::toSgd).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal atEnd = usd.stream().map(t -> t.amount().multiply(Exercise09.USD_SGD))
                .reduce(BigDecimal.ZERO, BigDecimal::add).setScale(2, RoundingMode.HALF_UP);
        return "USD lines " + usd.stream().map(Transaction::id).toList() + ": per line=" + perLine + ", at end=" + atEnd;
    }

    public static void main(String[] args) {
        monthEndReport().forEach(System.out::println);
        Exercise09.MONTHS.forEach(m -> System.out.println(m + " largest debit=" + largestDebit(m).orElse("none")));
        System.out.println("2026-11 (no data): debits=" + debitTotal(YearMonth.of(2026, 11)) + " avgDebit="
                + averageDebit(YearMonth.of(2026, 11)) + " largest=" + largestDebit(YearMonth.of(2026, 11)));
        System.out.println(perLineVsAtEnd());
    }
}
