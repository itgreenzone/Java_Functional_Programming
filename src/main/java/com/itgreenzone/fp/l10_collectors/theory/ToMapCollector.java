package com.itgreenzone.fp.l10_collectors.theory;

import com.itgreenzone.fp.data.Account;
import com.itgreenzone.fp.data.Customer;
import com.itgreenzone.fp.data.SampleData;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * toMap [8] in four shapes:
 *   toMap(keyMapper, valueMapper)                              duplicate key -> IllegalStateException
 *   toMap(keyMapper, valueMapper, mergeFunction)               resolves duplicates
 *   toMap(keyMapper, valueMapper, mergeFunction, mapSupplier)  chooses the Map type (TreeMap, LinkedHashMap)
 *   toUnmodifiableMap(...) [10]
 */
public final class ToMapCollector {

    private ToMapCollector() {
    }

    /** Unique keys: id -> name. A TreeMap makes the printed order deterministic. */
    public static Map<String, String> namesById(List<Customer> customers) {
        return customers.stream()
                .collect(Collectors.toMap(Customer::id, Customer::name, (a, b) -> a, TreeMap::new));
    }

    /** Index by key: id -> the whole object (Function.identity()). */
    public static Map<String, Customer> byId(List<Customer> customers) {
        return customers.stream().collect(Collectors.toMap(Customer::id, Function.identity()));
    }

    /** Duplicate keys without a merge function: IllegalStateException. */
    public static String duplicateKey(List<Customer> customers) {
        try {
            customers.stream().collect(Collectors.toMap(Customer::city, Customer::name));
            return "no error";
        } catch (IllegalStateException e) {
            return "IllegalStateException: " + e.getMessage();
        }
    }

    /** Merge function: join names per city; TreeMap for sorted keys. */
    public static Map<String, String> namesPerCity(List<Customer> customers) {
        return customers.stream()
                .collect(Collectors.toMap(Customer::city, Customer::name, (a, b) -> a + ", " + b, TreeMap::new));
    }

    /** Merge function for money: total balance per customer. LinkedHashMap keeps first-seen order. */
    public static Map<String, BigDecimal> balancePerCustomer(List<Account> accounts) {
        return accounts.stream()
                .collect(Collectors.toMap(Account::customerId, Account::balance, BigDecimal::add, LinkedHashMap::new));
    }

    /**
     * toMap does not accept null VALUES (it uses Map.merge): NullPointerException.
     * Here a lookup of "relationship manager" returns null for customers without one (only Singapore has RMs).
     */
    public static String nullValue(List<Customer> customers) {
        try {
            customers.stream().collect(Collectors.toMap(Customer::id,
                    c -> c.city().equals("Singapore") ? "RM-SG" : null));
            return "no error";
        } catch (NullPointerException e) {
            return "NullPointerException";
        }
    }

    public static void main(String[] args) {
        List<Customer> customers = SampleData.customers();
        System.out.println("id -> name (TreeMap)    : " + namesById(customers));
        System.out.println("id -> Customer          : C004 = " + byId(customers).get("C004").name());
        System.out.println("city -> name, no merge  : " + duplicateKey(customers));
        System.out.println("city -> names (merge)   : " + namesPerCity(customers));
        System.out.println("balance per customer    : " + balancePerCustomer(SampleData.accounts()));
        System.out.println("null value              : " + nullValue(customers));
    }
}
