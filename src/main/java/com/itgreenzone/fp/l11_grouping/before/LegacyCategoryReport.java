package com.itgreenzone.fp.l11_grouping.before;

import com.itgreenzone.fp.data.Category;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;
import com.itgreenzone.fp.data.TxnType;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * BEFORE (Java 7 style): spending report per category, debits only: count, total and largest transaction,
 * sorted by total descending. Three maps, get-or-init logic, and a hand-written comparator over map entries.
 */
public final class LegacyCategoryReport {

    private LegacyCategoryReport() {
    }

    public static List<String> report() {
        final Map<Category, Integer> counts = new HashMap<Category, Integer>();
        final Map<Category, BigDecimal> totals = new HashMap<Category, BigDecimal>();
        final Map<Category, Transaction> largest = new HashMap<Category, Transaction>();
        for (Transaction t : SampleData.transactions()) {
            if (t.type() != TxnType.DEBIT) {
                continue;
            }
            Category c = t.category();
            Integer n = counts.get(c);
            counts.put(c, n == null ? 1 : n + 1);
            BigDecimal sum = totals.get(c);
            totals.put(c, sum == null ? t.amount() : sum.add(t.amount()));
            Transaction max = largest.get(c);
            if (max == null || t.amount().compareTo(max.amount()) > 0) {
                largest.put(c, t);
            }
        }
        List<Category> order = new ArrayList<Category>(totals.keySet());
        Collections.sort(order, new Comparator<Category>() {
            @Override
            public int compare(Category a, Category b) {
                return totals.get(b).compareTo(totals.get(a));
            }
        });
        List<String> lines = new ArrayList<String>();
        for (Category c : order) {
            Transaction max = largest.get(c);
            lines.add(c + ": " + counts.get(c) + " debits, total " + totals.get(c)
                    + ", largest " + max.id() + " " + max.amount());
        }
        return lines;
    }

    public static void main(String[] args) {
        report().forEach(System.out::println);
    }
}
