package com.itgreenzone.fp.l09_terminal_ops.after;

import com.itgreenzone.fp.data.Account;
import com.itgreenzone.fp.data.Policy;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;

/** AFTER (Java 8): one terminal operation per question: reduce, max, anyMatch, reduce + divide. */
public final class StreamDashboard {

    private StreamDashboard() {
    }

    public static List<String> dashboard() {
        BigDecimal total = SampleData.accounts().stream()
                .map(Account::balance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        String highest = SampleData.transactions().stream()
                .max(Comparator.comparing(Transaction::amount))
                .map(t -> t.id() + " " + t.amount())
                .orElse("none");
        boolean overdrawn = SampleData.accounts().stream().anyMatch(a -> a.balance().signum() < 0);
        BigDecimal avgPremium = SampleData.policies().stream()
                .map(Policy::premium)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(SampleData.policies().size()), 2, RoundingMode.HALF_UP);
        return Arrays.asList(
                "total balance   : " + total,
                "highest txn     : " + highest,
                "any overdrawn   : " + overdrawn,
                "average premium : " + avgPremium);
    }

    public static void main(String[] args) {
        dashboard().forEach(System.out::println);
    }
}
