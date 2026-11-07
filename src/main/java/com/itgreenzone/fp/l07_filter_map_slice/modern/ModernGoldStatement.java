package com.itgreenzone.fp.l07_filter_map_slice.modern;

import com.itgreenzone.fp.data.Account;
import com.itgreenzone.fp.data.Category;
import com.itgreenzone.fp.data.Customer;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Tier;
import com.itgreenzone.fp.data.Transaction;
import com.itgreenzone.fp.data.TxnType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Predicate;
import java.util.stream.Collectors;

/**
 * MODERN (Java 16-21): indexes built once (no nested scans), mapMulti [16] for the one-to-many steps,
 * named predicates, a record [16] for the result line, and toList() [16].
 */
public final class ModernGoldStatement {

    /** One statement line. toString keeps the same text as the before/after versions. */
    public record StatementLine(LocalDate date, String txnId, String account, Category category, BigDecimal amount) {
        static StatementLine of(Transaction t) {
            return new StatementLine(t.date(), t.id(), t.accountNumber(), t.category(), t.amount());
        }

        @Override
        public String toString() {
            return date + " " + txnId + " " + account + " " + category + " " + amount;
        }
    }

    private static final BigDecimal HUNDRED = new BigDecimal("100.00");
    private static final Predicate<Customer> GOLD = c -> c.tier() == Tier.GOLD;
    private static final Predicate<Transaction> DEBIT = t -> t.type() == TxnType.DEBIT;
    private static final Predicate<Transaction> OVER_100 = t -> t.amount().compareTo(HUNDRED) > 0;
    private static final Comparator<Transaction> NEWEST_FIRST =
            Comparator.comparing(Transaction::date).reversed().thenComparing(Transaction::id);

    /** customerId -> accounts and accountNumber -> transactions: one pass each, instead of a scan per element. */
    private static final Map<String, List<Account>> ACCOUNTS_BY_CUSTOMER =
            SampleData.accounts().stream().collect(Collectors.groupingBy(Account::customerId));
    private static final Map<String, List<Transaction>> TXNS_BY_ACCOUNT =
            SampleData.transactions().stream().collect(Collectors.groupingBy(Transaction::accountNumber));

    private ModernGoldStatement() {
    }

    public static List<StatementLine> page(int pageNo, int size) {
        if (pageNo < 1 || size < 1) {
            throw new IllegalArgumentException("pageNo and size must be >= 1");
        }
        return SampleData.customers().stream()
                .filter(GOLD)
                .<Account>mapMulti((c, down) -> ACCOUNTS_BY_CUSTOMER.getOrDefault(c.id(), List.of()).forEach(down))
                .<Transaction>mapMulti((a, down) -> TXNS_BY_ACCOUNT.getOrDefault(a.number(), List.of()).forEach(down))
                .filter(DEBIT.and(OVER_100))
                .sorted(NEWEST_FIRST)
                .skip((long) (pageNo - 1) * size)
                .limit(size)
                .map(StatementLine::of)
                .toList();
    }

    public static void main(String[] args) {
        for (int p = 1; p <= 3; p++) {
            System.out.println("page " + p + ": " + page(p, 5));
        }
    }
}
