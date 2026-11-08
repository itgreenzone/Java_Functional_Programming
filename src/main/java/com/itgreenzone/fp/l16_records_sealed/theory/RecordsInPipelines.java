package com.itgreenzone.fp.l16_records_sealed.theory;

import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;
import com.itgreenzone.fp.data.TxnType;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.TreeMap;
import java.util.stream.Collectors;

/**
 * Records [16] as immutable data carriers in pipelines:
 * compact constructors for validation and normalisation, static factories, records as map keys,
 * and local records for intermediate results.
 */
public final class RecordsInPipelines {

    private RecordsInPipelines() {
    }

    /** Money with a currency. The compact constructor validates and normalises (scale 2, HALF_UP). */
    public record Money(String currency, BigDecimal amount) {
        public Money {
            Objects.requireNonNull(currency, "currency");
            Objects.requireNonNull(amount, "amount");
            if (!currency.matches("[A-Z]{3}")) {
                throw new IllegalArgumentException("currency must be 3 capital letters: " + currency);
            }
            amount = amount.setScale(2, RoundingMode.HALF_UP);
        }

        public static Money of(String currency, String amount) {
            return new Money(currency, new BigDecimal(amount));
        }

        public static Money of(Transaction t) {
            return new Money(t.currency(), t.amount());
        }

        /** Adding different currencies is a bug, so the record refuses it. */
        public Money plus(Money other) {
            if (!currency.equals(other.currency)) {
                throw new IllegalArgumentException("currency mismatch: " + currency + " vs " + other.currency);
            }
            return new Money(currency, amount.add(other.amount));
        }

        @Override
        public String toString() {
            return currency + " " + amount;
        }
    }

    /** A record as a composite map key: equals/hashCode are generated from the components. */
    public record AccountMonth(String account, java.time.YearMonth month) { }

    public static Map<String, Money> debitTotalPerCurrency(List<Transaction> txns) {
        return txns.stream().filter(t -> t.type() == TxnType.DEBIT)
                .collect(Collectors.toMap(Transaction::currency, Money::of, Money::plus, TreeMap::new));
    }

    public static long distinctAccountMonths(List<Transaction> txns) {
        Set<AccountMonth> keys = txns.stream()
                .map(t -> new AccountMonth(t.accountNumber(), java.time.YearMonth.from(t.date())))
                .collect(Collectors.toSet());
        return keys.size();
    }

    /** A LOCAL record [16]: a named intermediate result that exists only inside this method. */
    public static List<String> topSpenders(List<Transaction> txns, int n) {
        record AccountTotal(String account, BigDecimal total) { }
        return txns.stream()
                .filter(t -> t.type() == TxnType.DEBIT && t.currency().equals("SGD"))
                .collect(Collectors.groupingBy(Transaction::accountNumber,
                        Collectors.reducing(BigDecimal.ZERO, Transaction::amount, BigDecimal::add)))
                .entrySet().stream()
                .map(e -> new AccountTotal(e.getKey(), e.getValue()))
                .sorted(Comparator.comparing(AccountTotal::total).reversed().thenComparing(AccountTotal::account))
                .limit(n)
                .map(a -> a.account() + "=" + a.total())
                .toList();
    }

    public static String validationExamples() {
        StringBuilder sb = new StringBuilder();
        sb.append(Money.of("SGD", "10.005")).append(" | ");
        try {
            Money.of("sgd", "1");
        } catch (IllegalArgumentException e) {
            sb.append(e.getMessage()).append(" | ");
        }
        try {
            Money.of("SGD", "1").plus(Money.of("USD", "1"));
        } catch (IllegalArgumentException e) {
            sb.append(e.getMessage());
        }
        return sb.toString();
    }

    public static void main(String[] args) {
        List<Transaction> txns = SampleData.transactions();
        System.out.println("validation              : " + validationExamples());
        System.out.println("debit total per currency: " + debitTotalPerCurrency(txns));
        System.out.println("record keys (acct+month): " + distinctAccountMonths(txns) + " distinct");
        System.out.println("top 3 SGD spenders      : " + topSpenders(txns, 3));
        System.out.println("records are equal by value: " + Money.of("SGD", "5").equals(Money.of("SGD", "5.00")));
    }
}
