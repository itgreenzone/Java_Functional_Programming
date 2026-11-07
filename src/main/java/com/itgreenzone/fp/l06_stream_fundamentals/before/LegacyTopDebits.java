package com.itgreenzone.fp.l06_stream_fundamentals.before;

import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;
import com.itgreenzone.fp.data.TxnType;

import java.time.Month;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

/** Pre-Java-8: top 3 October debits with loops, a temporary list, a sort and a manual limit. */
public final class LegacyTopDebits {

    private LegacyTopDebits() {
    }

    public static List<String> topOctoberDebits(List<Transaction> txns, int n) {
        List<Transaction> october = new ArrayList<>();
        for (Transaction t : txns) {
            if (t.type() == TxnType.DEBIT && t.date().getMonth() == Month.OCTOBER) {
                october.add(t);
            }
        }
        Collections.sort(october, new Comparator<Transaction>() {
            @Override
            public int compare(Transaction a, Transaction b) {
                return b.amount().compareTo(a.amount());
            }
        });
        List<String> result = new ArrayList<>();
        for (int i = 0; i < october.size() && i < n; i++) {
            Transaction t = october.get(i);
            result.add(t.id() + " " + t.category() + " " + t.amount());
        }
        return result;
    }

    public static void main(String[] args) {
        for (String line : topOctoberDebits(SampleData.transactions(), 3)) {
            System.out.println(line);
        }
    }
}
