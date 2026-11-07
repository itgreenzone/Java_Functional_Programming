package com.itgreenzone.fp.l07_filter_map_slice.before;

import com.itgreenzone.fp.data.Account;
import com.itgreenzone.fp.data.Customer;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Tier;
import com.itgreenzone.fp.data.Transaction;
import com.itgreenzone.fp.data.TxnType;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

/**
 * BEFORE (Java 7 style): "GOLD customers' debits over 100.00, newest first, page N".
 * Three nested loops, a temporary list, an anonymous Comparator and hand-written paging arithmetic.
 */
public final class LegacyGoldStatement {

    private static final BigDecimal HUNDRED = new BigDecimal("100.00");

    private LegacyGoldStatement() {
    }

    public static List<String> page(int pageNo, int size) {
        List<Transaction> matches = new ArrayList<Transaction>();
        for (Customer c : SampleData.customers()) {
            if (c.tier() != Tier.GOLD) {
                continue;
            }
            for (Account a : SampleData.accounts()) {
                if (!a.customerId().equals(c.id())) {
                    continue;
                }
                for (Transaction t : SampleData.transactions()) {
                    if (t.accountNumber().equals(a.number())
                            && t.type() == TxnType.DEBIT
                            && t.amount().compareTo(HUNDRED) > 0) {
                        matches.add(t);
                    }
                }
            }
        }
        Collections.sort(matches, new Comparator<Transaction>() {
            @Override
            public int compare(Transaction x, Transaction y) {
                int byDate = y.date().compareTo(x.date());
                return byDate != 0 ? byDate : x.id().compareTo(y.id());
            }
        });
        List<String> lines = new ArrayList<String>();
        int from = (pageNo - 1) * size;
        int to = Math.min(from + size, matches.size());
        for (int i = from; i < to; i++) {
            Transaction t = matches.get(i);
            lines.add(t.date() + " " + t.id() + " " + t.accountNumber() + " " + t.category() + " " + t.amount());
        }
        return lines;
    }

    public static void main(String[] args) {
        for (int p = 1; p <= 3; p++) {
            System.out.println("page " + p + ": " + page(p, 5));
        }
    }
}
