package com.itgreenzone.fp.l08_sorting.before;

import com.itgreenzone.fp.data.Account;
import com.itgreenzone.fp.data.Customer;
import com.itgreenzone.fp.data.SampleData;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * BEFORE (Java 7 style): customer ranking, tier DESC, total balance DESC, name ASC.
 * A hand-written compare method with three nested comparisons: easy to get a sign wrong.
 */
public final class LegacyCustomerRanking {

    private LegacyCustomerRanking() {
    }

    public static List<String> ranking() {
        final Map<String, BigDecimal> totals = new HashMap<String, BigDecimal>();
        for (Account a : SampleData.accounts()) {
            BigDecimal t = totals.get(a.customerId());
            totals.put(a.customerId(), t == null ? a.balance() : t.add(a.balance()));
        }
        List<Customer> customers = new ArrayList<Customer>(SampleData.customers());
        Collections.sort(customers, new Comparator<Customer>() {
            @Override
            public int compare(Customer x, Customer y) {
                int byTier = y.tier().compareTo(x.tier());              // DESC: y before x
                if (byTier != 0) {
                    return byTier;
                }
                int byTotal = totals.get(y.id()).compareTo(totals.get(x.id()));   // DESC
                if (byTotal != 0) {
                    return byTotal;
                }
                return x.name().compareTo(y.name());                   // ASC
            }
        });
        List<String> lines = new ArrayList<String>();
        for (int i = 0; i < customers.size(); i++) {
            Customer c = customers.get(i);
            lines.add((i + 1) + ". " + c.id() + " " + c.name() + " " + c.tier() + " " + totals.get(c.id()));
        }
        return lines;
    }

    public static void main(String[] args) {
        ranking().forEach(System.out::println);
    }
}
