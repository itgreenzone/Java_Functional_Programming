package com.itgreenzone.fp.l01_why_fp.after;

import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;
import com.itgreenzone.fp.l01_why_fp.HighValueRule;
import com.itgreenzone.fp.l01_why_fp.before.LegacyFilters;

import java.util.List;

/**
 * Step 3 [Java 8]: a lambda. The OLD TransactionFilter interface still works,
 * because it has a single abstract method: the lambda IS the matches(...) implementation.
 */
public final class LambdaDemo {

    private LambdaDemo() {
    }

    public static List<String> highValueIds(List<Transaction> txns) {
        return LegacyFilters.ids(LegacyFilters.filter(txns,
                t -> t.amount().compareTo(HighValueRule.THRESHOLD) > 0));
    }

    public static void main(String[] args) {
        List<String> ids = highValueIds(SampleData.transactions());
        System.out.println("Lambda:          " + ids.size() + " over 1000.00 " + ids);
    }
}
