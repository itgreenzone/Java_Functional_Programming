package com.itgreenzone.fp.l07_filter_map_slice.solution;

import com.itgreenzone.fp.data.Account;
import com.itgreenzone.fp.data.Category;
import com.itgreenzone.fp.data.Flight;
import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.PaymentStatus;
import com.itgreenzone.fp.data.Policy;
import com.itgreenzone.fp.data.PolicyType;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Tier;
import com.itgreenzone.fp.data.Transaction;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.Month;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

/** Reference solution for Exercise07. */
public final class Solution07 {

    private static final BigDecimal TWENTY_THOUSAND = new BigDecimal("20000.00");

    private Solution07() {
    }

    public static List<String> failedPaymentIds() {
        return SampleData.payments().stream()
                .filter(p -> p.status() == PaymentStatus.FAILED)
                .map(Payment::id)
                .toList();
    }

    public static List<String> platinumNamesUpper() {
        return SampleData.customers().stream()
                .filter(c -> c.tier() == Tier.PLATINUM)
                .map(c -> c.name().toUpperCase(Locale.ROOT))
                .toList();
    }

    public static int totalSeatsLeft() {
        return SampleData.flights().stream().mapToInt(f -> f.seats() - f.booked()).sum();
    }

    public static List<String> travelPolicyNumbers() {
        return SampleData.policies().stream()
                .filter(p -> p.type() == PolicyType.TRAVEL)
                .map(Policy::number)
                .toList();
    }

    public static List<Category> categoriesOf(String accountNumber) {
        return SampleData.transactions().stream()
                .filter(t -> t.accountNumber().equals(accountNumber))
                .map(Transaction::category)
                .distinct()
                .toList();
    }

    public static List<String> singaporeAccountNumbers() {
        return SampleData.customers().stream()
                .filter(c -> c.city().equals("Singapore"))
                .flatMap(c -> SampleData.accounts().stream().filter(a -> a.customerId().equals(c.id())))
                .map(Account::number)
                .toList();
    }

    public static List<String> firstThreeOctober() {
        return SampleData.transactions().stream()
                .filter(t -> t.date().getMonth() == Month.OCTOBER)
                .sorted(Comparator.comparing(Transaction::date).thenComparing(Transaction::id))
                .limit(3)
                .map(Transaction::id)
                .toList();
    }

    public static List<String> paymentPage(int pageNo, int size) {
        return SampleData.payments().stream()
                .skip((long) (pageNo - 1) * size)
                .limit(size)
                .map(Payment::id)
                .toList();
    }

    public static List<String> morningFlights() {
        LocalDateTime noon = LocalDateTime.parse("2026-11-06T12:00");
        return SampleData.flights().stream()
                .sorted(Comparator.comparing(Flight::departure))
                .takeWhile(f -> f.departure().isBefore(noon))
                .map(Flight::code)
                .toList();
    }

    public static List<String> richAccounts() {
        return SampleData.customers().stream()
                .<String>mapMulti((c, down) -> {
                    for (Account a : SampleData.accounts()) {
                        if (a.customerId().equals(c.id()) && a.balance().compareTo(TWENTY_THOUSAND) > 0) {
                            down.accept(c.id() + " " + a.number());
                        }
                    }
                })
                .toList();
    }

    public static void main(String[] args) {
        System.out.println(" 1 failed payments     : " + failedPaymentIds());
        System.out.println(" 2 PLATINUM upper      : " + platinumNamesUpper());
        System.out.println(" 3 seats left          : " + totalSeatsLeft());
        System.out.println(" 4 TRAVEL policies     : " + travelPolicyNumbers());
        System.out.println(" 5 ACC-1012 categories : " + categoriesOf("ACC-1012"));
        System.out.println(" 6 Singapore accounts  : " + singaporeAccountNumbers());
        System.out.println(" 7 first 3 October     : " + firstThreeOctober());
        System.out.println(" 8 payments page 3/4   : " + paymentPage(3, 4));
        System.out.println(" 9 before 11-06 12:00  : " + morningFlights());
        System.out.println("10 balance > 20000.00  : " + richAccounts());
    }
}
