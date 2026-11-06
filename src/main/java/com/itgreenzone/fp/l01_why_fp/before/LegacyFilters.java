package com.itgreenzone.fp.l01_why_fp.before;

import com.itgreenzone.fp.data.Transaction;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/** Pre-Java-8 filtering helpers. */
public final class LegacyFilters {

    private LegacyFilters() {
    }

    /** Step 0: the rule is hard-coded. A new rule means copying the whole loop. */
    public static List<Transaction> highValueHardCoded(List<Transaction> txns) {
        List<Transaction> result = new ArrayList<>();
        for (Transaction t : txns) {
            if (t.amount().compareTo(new BigDecimal("1000.00")) > 0) {
                result.add(t);
            }
        }
        return result;
    }

    /** Behaviour parameterisation: the loop is written once, the rule is passed in. */
    public static List<Transaction> filter(List<Transaction> txns, TransactionFilter rule) {
        List<Transaction> result = new ArrayList<>();
        for (Transaction t : txns) {
            if (rule.matches(t)) {
                result.add(t);
            }
        }
        return result;
    }

    /** Helper used by every demo: the transaction ids, in order. */
    public static List<String> ids(List<Transaction> txns) {
        List<String> ids = new ArrayList<>();
        for (Transaction t : txns) {
            ids.add(t.id());
        }
        return ids;
    }
}
