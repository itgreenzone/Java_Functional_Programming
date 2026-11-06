package com.itgreenzone.fp.data;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * The one shared, deterministic dataset used by every lesson, slide, quiz and test.
 * All lists are immutable ({@code List.of} [Java 9]); records are immutable [Java 16].
 * 10 customers, 15 accounts, 60 transactions (Aug-Oct 2026), 10 policies, 8 flights, 12 payments.
 */
public final class SampleData {

    private static final List<Customer> CUSTOMERS = List.of(
            new Customer("C001", "Alice Tan", "Singapore", Tier.GOLD, LocalDate.parse("2015-03-12")),
            new Customer("C002", "Bala Kumar", "Kuala Lumpur", Tier.SILVER, LocalDate.parse("2018-07-01")),
            new Customer("C003", "Chen Wei", "Singapore", Tier.PLATINUM, LocalDate.parse("2012-11-20")),
            new Customer("C004", "Dewi Lestari", "Jakarta", Tier.GOLD, LocalDate.parse("2019-02-14")),
            new Customer("C005", "Ethan Lim", "Singapore", Tier.SILVER, LocalDate.parse("2021-05-30")),
            new Customer("C006", "Farah Aziz", "Kuala Lumpur", Tier.PLATINUM, LocalDate.parse("2014-09-09")),
            new Customer("C007", "Ganesh Perera", "Colombo", Tier.GOLD, LocalDate.parse("2017-01-25")),
            new Customer("C008", "Hana Sato", "Bangkok", Tier.SILVER, LocalDate.parse("2022-08-18")),
            new Customer("C009", "Irfan Hakim", "Jakarta", Tier.SILVER, LocalDate.parse("2020-12-03")),
            new Customer("C010", "Jasmine Ong", "Singapore", Tier.GOLD, LocalDate.parse("2016-04-22"))
    );

    private static final List<Account> ACCOUNTS = List.of(
            new Account("ACC-1001", "C001", AccountType.SAVINGS, new BigDecimal("12500.00")),
            new Account("ACC-1002", "C001", AccountType.CURRENT, new BigDecimal("3200.50")),
            new Account("ACC-1003", "C002", AccountType.SAVINGS, new BigDecimal("850.75")),
            new Account("ACC-1004", "C003", AccountType.SAVINGS, new BigDecimal("48200.00")),
            new Account("ACC-1005", "C003", AccountType.CURRENT, new BigDecimal("15750.25")),
            new Account("ACC-1006", "C003", AccountType.FIXED_DEPOSIT, new BigDecimal("100000.00")),
            new Account("ACC-1007", "C004", AccountType.SAVINGS, new BigDecimal("6400.00")),
            new Account("ACC-1008", "C005", AccountType.SAVINGS, new BigDecimal("1200.00")),
            new Account("ACC-1009", "C006", AccountType.SAVINGS, new BigDecimal("27300.40")),
            new Account("ACC-1010", "C006", AccountType.CURRENT, new BigDecimal("9100.00")),
            new Account("ACC-1011", "C007", AccountType.SAVINGS, new BigDecimal("4350.60")),
            new Account("ACC-1012", "C008", AccountType.SAVINGS, new BigDecimal("2780.00")),
            new Account("ACC-1013", "C009", AccountType.CURRENT, new BigDecimal("-150.25")),
            new Account("ACC-1014", "C010", AccountType.SAVINGS, new BigDecimal("18900.00")),
            new Account("ACC-1015", "C010", AccountType.FIXED_DEPOSIT, new BigDecimal("50000.00"))
    );

    private static final List<Transaction> TRANSACTIONS = List.of(
            txn("T001", "ACC-1014", "2026-08-02", TxnType.DEBIT, Category.GROCERIES, "150.39", "SGD"),
            txn("T002", "ACC-1011", "2026-08-12", TxnType.CREDIT, Category.TRANSFER, "75.62", "SGD"),
            txn("T003", "ACC-1008", "2026-08-13", TxnType.DEBIT, Category.TRANSFER, "1221.40", "SGD"),
            txn("T004", "ACC-1008", "2026-08-14", TxnType.DEBIT, Category.INSURANCE, "216.11", "SGD"),
            txn("T005", "ACC-1002", "2026-08-16", TxnType.DEBIT, Category.SHOPPING, "538.57", "SGD"),
            txn("T006", "ACC-1014", "2026-08-18", TxnType.CREDIT, Category.TRANSFER, "174.30", "SGD"),
            txn("T007", "ACC-1014", "2026-08-19", TxnType.CREDIT, Category.TRANSFER, "206.07", "SGD"),
            txn("T008", "ACC-1008", "2026-08-21", TxnType.DEBIT, Category.UTILITIES, "60.92", "SGD"),
            txn("T009", "ACC-1001", "2026-08-22", TxnType.DEBIT, Category.UTILITIES, "268.07", "SGD"),
            txn("T010", "ACC-1004", "2026-08-22", TxnType.DEBIT, Category.TRAVEL, "533.03", "USD"),
            txn("T011", "ACC-1003", "2026-08-24", TxnType.DEBIT, Category.DINING, "30.13", "SGD"),
            txn("T012", "ACC-1001", "2026-08-26", TxnType.DEBIT, Category.TRANSFER, "235.93", "SGD"),
            txn("T013", "ACC-1003", "2026-08-26", TxnType.DEBIT, Category.DINING, "149.21", "SGD"),
            txn("T014", "ACC-1007", "2026-08-30", TxnType.DEBIT, Category.UTILITIES, "302.05", "SGD"),
            txn("T015", "ACC-1004", "2026-08-31", TxnType.DEBIT, Category.GROCERIES, "141.58", "SGD"),
            txn("T016", "ACC-1014", "2026-09-01", TxnType.CREDIT, Category.TRANSFER, "136.04", "SGD"),
            txn("T017", "ACC-1001", "2026-09-03", TxnType.DEBIT, Category.GROCERIES, "157.47", "SGD"),
            txn("T018", "ACC-1001", "2026-09-03", TxnType.DEBIT, Category.INSURANCE, "447.37", "SGD"),
            txn("T019", "ACC-1007", "2026-09-04", TxnType.CREDIT, Category.SALARY, "3988.96", "SGD"),
            txn("T020", "ACC-1002", "2026-09-06", TxnType.DEBIT, Category.DINING, "170.53", "SGD"),
            txn("T021", "ACC-1012", "2026-09-06", TxnType.CREDIT, Category.TRANSFER, "756.03", "SGD"),
            txn("T022", "ACC-1004", "2026-09-07", TxnType.DEBIT, Category.UTILITIES, "224.31", "SGD"),
            txn("T023", "ACC-1013", "2026-09-11", TxnType.DEBIT, Category.TRAVEL, "914.46", "USD"),
            txn("T024", "ACC-1013", "2026-09-12", TxnType.DEBIT, Category.SHOPPING, "431.88", "SGD"),
            txn("T025", "ACC-1004", "2026-09-15", TxnType.CREDIT, Category.SALARY, "6949.60", "SGD"),
            txn("T026", "ACC-1004", "2026-09-16", TxnType.DEBIT, Category.TRAVEL, "1726.41", "SGD"),
            txn("T027", "ACC-1010", "2026-09-17", TxnType.CREDIT, Category.SALARY, "7385.08", "SGD"),
            txn("T028", "ACC-1004", "2026-09-19", TxnType.DEBIT, Category.TRANSFER, "823.39", "SGD"),
            txn("T029", "ACC-1005", "2026-09-19", TxnType.DEBIT, Category.UTILITIES, "186.67", "SGD"),
            txn("T030", "ACC-1007", "2026-09-20", TxnType.DEBIT, Category.DINING, "69.42", "SGD"),
            txn("T031", "ACC-1013", "2026-09-21", TxnType.DEBIT, Category.DINING, "27.16", "SGD"),
            txn("T032", "ACC-1008", "2026-09-22", TxnType.DEBIT, Category.GROCERIES, "127.78", "SGD"),
            txn("T033", "ACC-1011", "2026-09-23", TxnType.DEBIT, Category.UTILITIES, "306.29", "SGD"),
            txn("T034", "ACC-1003", "2026-09-24", TxnType.DEBIT, Category.INSURANCE, "168.09", "SGD"),
            txn("T035", "ACC-1012", "2026-09-27", TxnType.DEBIT, Category.GROCERIES, "242.78", "SGD"),
            txn("T036", "ACC-1012", "2026-09-28", TxnType.DEBIT, Category.TRANSFER, "948.94", "SGD"),
            txn("T037", "ACC-1014", "2026-09-30", TxnType.DEBIT, Category.DINING, "39.45", "SGD"),
            txn("T038", "ACC-1008", "2026-10-01", TxnType.CREDIT, Category.SALARY, "5009.84", "SGD"),
            txn("T039", "ACC-1013", "2026-10-01", TxnType.CREDIT, Category.SALARY, "4231.84", "SGD"),
            txn("T040", "ACC-1009", "2026-10-02", TxnType.CREDIT, Category.TRANSFER, "835.61", "SGD"),
            txn("T041", "ACC-1009", "2026-10-04", TxnType.DEBIT, Category.DINING, "95.56", "SGD"),
            txn("T042", "ACC-1003", "2026-10-05", TxnType.DEBIT, Category.TRANSFER, "1432.93", "SGD"),
            txn("T043", "ACC-1010", "2026-10-06", TxnType.DEBIT, Category.SHOPPING, "447.64", "SGD"),
            txn("T044", "ACC-1012", "2026-10-06", TxnType.DEBIT, Category.DINING, "148.37", "SGD"),
            txn("T045", "ACC-1012", "2026-10-07", TxnType.DEBIT, Category.UTILITIES, "69.27", "SGD"),
            txn("T046", "ACC-1003", "2026-10-08", TxnType.DEBIT, Category.DINING, "18.35", "SGD"),
            txn("T047", "ACC-1009", "2026-10-09", TxnType.DEBIT, Category.GROCERIES, "232.60", "SGD"),
            txn("T048", "ACC-1010", "2026-10-10", TxnType.DEBIT, Category.SHOPPING, "159.18", "SGD"),
            txn("T049", "ACC-1003", "2026-10-11", TxnType.CREDIT, Category.SALARY, "7721.99", "SGD"),
            txn("T050", "ACC-1010", "2026-10-11", TxnType.DEBIT, Category.TRANSFER, "903.91", "SGD"),
            txn("T051", "ACC-1011", "2026-10-11", TxnType.DEBIT, Category.GROCERIES, "79.20", "SGD"),
            txn("T052", "ACC-1014", "2026-10-12", TxnType.DEBIT, Category.TRANSFER, "661.62", "SGD"),
            txn("T053", "ACC-1005", "2026-10-14", TxnType.DEBIT, Category.DINING, "91.10", "SGD"),
            txn("T054", "ACC-1009", "2026-10-14", TxnType.DEBIT, Category.UTILITIES, "160.91", "SGD"),
            txn("T055", "ACC-1003", "2026-10-15", TxnType.CREDIT, Category.SALARY, "5317.23", "SGD"),
            txn("T056", "ACC-1010", "2026-10-16", TxnType.CREDIT, Category.SALARY, "6618.27", "SGD"),
            txn("T057", "ACC-1012", "2026-10-25", TxnType.DEBIT, Category.TRANSFER, "962.80", "SGD"),
            txn("T058", "ACC-1008", "2026-10-27", TxnType.CREDIT, Category.TRANSFER, "988.06", "SGD"),
            txn("T059", "ACC-1005", "2026-10-29", TxnType.DEBIT, Category.INSURANCE, "174.93", "SGD"),
            txn("T060", "ACC-1011", "2026-10-30", TxnType.DEBIT, Category.INSURANCE, "194.28", "SGD")
    );

    private static final List<Policy> POLICIES = List.of(
            new Policy("POL-501", "C001", PolicyType.LIFE, new BigDecimal("1850.00"), LocalDate.parse("2027-03-31")),
            new Policy("POL-502", "C001", PolicyType.MOTOR, new BigDecimal("1240.50"), LocalDate.parse("2026-11-30")),
            new Policy("POL-503", "C002", PolicyType.HEALTH, new BigDecimal("960.00"), LocalDate.parse("2026-12-15")),
            new Policy("POL-504", "C003", PolicyType.HOME, new BigDecimal("720.00"), LocalDate.parse("2027-06-30")),
            new Policy("POL-505", "C003", PolicyType.TRAVEL, new BigDecimal("185.00"), LocalDate.parse("2026-11-20")),
            new Policy("POL-506", "C004", PolicyType.HEALTH, new BigDecimal("1105.75"), LocalDate.parse("2027-01-31")),
            new Policy("POL-507", "C006", PolicyType.LIFE, new BigDecimal("2400.00"), LocalDate.parse("2028-09-01")),
            new Policy("POL-508", "C007", PolicyType.MOTOR, new BigDecimal("1310.00"), LocalDate.parse("2026-12-05")),
            new Policy("POL-509", "C008", PolicyType.TRAVEL, new BigDecimal("210.00"), LocalDate.parse("2026-11-12")),
            new Policy("POL-510", "C010", PolicyType.HOME, new BigDecimal("845.25"), LocalDate.parse("2027-02-28"))
    );

    private static final List<Flight> FLIGHTS = List.of(
            new Flight("SQ318", "SIN", "LHR", LocalDateTime.parse("2026-11-06T23:35"), 471, 455),
            new Flight("SQ12", "SIN", "NRT", LocalDateTime.parse("2026-11-06T09:10"), 264, 201),
            new Flight("TR808", "SIN", "BKK", LocalDateTime.parse("2026-11-06T07:15"), 335, 329),
            new Flight("MH602", "SIN", "KUL", LocalDateTime.parse("2026-11-06T18:40"), 160, 98),
            new Flight("SQ938", "SIN", "CGK", LocalDateTime.parse("2026-11-07T08:20"), 303, 276),
            new Flight("UL309", "SIN", "CMB", LocalDateTime.parse("2026-11-06T21:55"), 222, 170),
            new Flight("SQ21", "SIN", "EWR", LocalDateTime.parse("2026-11-07T22:40"), 161, 159),
            new Flight("GA827", "CGK", "SIN", LocalDateTime.parse("2026-11-06T12:30"), 162, 120)
    );

    private static final List<Payment> PAYMENTS = List.of(
            new Payment("P001", "CARD", new BigDecimal("120.00"), PaymentStatus.SUCCESS, Instant.parse("2026-11-01T02:15:00Z")),
            new Payment("P002", "PAYNOW", new BigDecimal("45.50"), PaymentStatus.SUCCESS, Instant.parse("2026-11-01T03:40:00Z")),
            new Payment("P003", "PAYPAL", new BigDecimal("310.25"), PaymentStatus.FAILED, Instant.parse("2026-11-01T05:05:00Z")),
            new Payment("P004", "CARD", new BigDecimal("89.90"), PaymentStatus.SUCCESS, Instant.parse("2026-11-02T01:00:00Z")),
            new Payment("P005", "PAYNOW", new BigDecimal("1500.00"), PaymentStatus.SUCCESS, Instant.parse("2026-11-02T06:30:00Z")),
            new Payment("P006", "CARD", new BigDecimal("220.00"), PaymentStatus.REFUNDED, Instant.parse("2026-11-02T09:45:00Z")),
            new Payment("P007", "PAYPAL", new BigDecimal("75.00"), PaymentStatus.SUCCESS, Instant.parse("2026-11-03T04:10:00Z")),
            new Payment("P008", "CARD", new BigDecimal("640.40"), PaymentStatus.PENDING, Instant.parse("2026-11-03T07:20:00Z")),
            new Payment("P009", "PAYNOW", new BigDecimal("18.80"), PaymentStatus.SUCCESS, Instant.parse("2026-11-03T11:55:00Z")),
            new Payment("P010", "CARD", new BigDecimal("999.99"), PaymentStatus.SUCCESS, Instant.parse("2026-11-04T02:05:00Z")),
            new Payment("P011", "PAYPAL", new BigDecimal("150.00"), PaymentStatus.SUCCESS, Instant.parse("2026-11-04T08:35:00Z")),
            new Payment("P012", "PAYNOW", new BigDecimal("260.00"), PaymentStatus.FAILED, Instant.parse("2026-11-04T10:00:00Z"))
    );

    private SampleData() {
    }

    public static List<Customer> customers() {
        return CUSTOMERS;
    }

    public static List<Account> accounts() {
        return ACCOUNTS;
    }

    public static List<Transaction> transactions() {
        return TRANSACTIONS;
    }

    public static List<Policy> policies() {
        return POLICIES;
    }

    public static List<Flight> flights() {
        return FLIGHTS;
    }

    public static List<Payment> payments() {
        return PAYMENTS;
    }

    private static Transaction txn(String id, String account, String date, TxnType type,
                                   Category category, String amount, String currency) {
        return new Transaction(id, account, LocalDate.parse(date), type, category,
                new BigDecimal(amount), currency);
    }
}
