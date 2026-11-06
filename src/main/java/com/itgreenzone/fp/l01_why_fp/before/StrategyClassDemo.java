package com.itgreenzone.fp.l01_why_fp.before;

import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;
import com.itgreenzone.fp.l01_why_fp.HighValueRule;

import java.util.List;

/** Step 1: pass a strategy object (a named class) to the generic filter. */
public final class StrategyClassDemo {

    private StrategyClassDemo() {
    }

    public static List<String> highValueIds(List<Transaction> txns) {
        return LegacyFilters.ids(LegacyFilters.filter(txns, new HighValueFilter(HighValueRule.THRESHOLD)));
    }

    public static void main(String[] args) {
        List<String> ids = highValueIds(SampleData.transactions());
        System.out.println("Strategy class:  " + ids.size() + " over 1000.00 " + ids);
    }
}
