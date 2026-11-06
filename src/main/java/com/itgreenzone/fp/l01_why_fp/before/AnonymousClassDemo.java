package com.itgreenzone.fp.l01_why_fp.before;

import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;
import com.itgreenzone.fp.l01_why_fp.HighValueRule;

import java.util.List;

/** Step 2 (Java 1.1+): an anonymous class. No extra file, but 5 lines of ceremony for 1 line of logic. */
public final class AnonymousClassDemo {

    private AnonymousClassDemo() {
    }

    public static List<String> highValueIds(List<Transaction> txns) {
        List<Transaction> matches = LegacyFilters.filter(txns, new TransactionFilter() {
            @Override
            public boolean matches(Transaction txn) {
                return txn.amount().compareTo(HighValueRule.THRESHOLD) > 0;
            }
        });
        return LegacyFilters.ids(matches);
    }

    public static void main(String[] args) {
        List<String> ids = highValueIds(SampleData.transactions());
        System.out.println("Anonymous class: " + ids.size() + " over 1000.00 " + ids);
    }
}
