package com.itgreenzone.fp.l09_terminal_ops.before;

import com.itgreenzone.fp.data.Account;
import com.itgreenzone.fp.data.Policy;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

/**
 * BEFORE (Java 7 style): the bank dashboard. Four loops, four accumulators, a null check for "no transactions",
 * and a boolean flag with a manual break.
 */
public final class LegacyDashboard {

    private LegacyDashboard() {
    }

    public static List<String> dashboard() {
        BigDecimal total = BigDecimal.ZERO;
        for (Account a : SampleData.accounts()) {
            total = total.add(a.balance());
        }
        Transaction highest = null;
        for (Transaction t : SampleData.transactions()) {
            if (highest == null || t.amount().compareTo(highest.amount()) > 0) {
                highest = t;
            }
        }
        boolean overdrawn = false;
        for (Account a : SampleData.accounts()) {
            if (a.balance().signum() < 0) {
                overdrawn = true;
                break;
            }
        }
        BigDecimal premiums = BigDecimal.ZERO;
        for (Policy p : SampleData.policies()) {
            premiums = premiums.add(p.premium());
        }
        BigDecimal avgPremium = premiums.divide(BigDecimal.valueOf(SampleData.policies().size()), 2, RoundingMode.HALF_UP);

        List<String> lines = new ArrayList<String>();
        lines.add("total balance   : " + total);
        lines.add("highest txn     : " + (highest == null ? "none" : highest.id() + " " + highest.amount()));
        lines.add("any overdrawn   : " + overdrawn);
        lines.add("average premium : " + avgPremium);
        return lines;
    }

    public static void main(String[] args) {
        dashboard().forEach(System.out::println);
    }
}
