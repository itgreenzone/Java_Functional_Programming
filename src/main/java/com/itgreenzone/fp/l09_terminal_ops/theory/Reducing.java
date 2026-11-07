package com.itgreenzone.fp.l09_terminal_ops.theory;

import com.itgreenzone.fp.data.Account;
import com.itgreenzone.fp.data.Flight;
import com.itgreenzone.fp.data.Policy;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;
import java.util.stream.IntStream;

/**
 * reduce [Java 8] in three forms:
 *   T reduce(T identity, BinaryOperator&lt;T&gt;)                        identity form
 *   Optional&lt;T&gt; reduce(BinaryOperator&lt;T&gt;)                         no identity: empty stream -> Optional.empty
 *   U reduce(U identity, BiFunction&lt;U,T,U&gt;, BinaryOperator&lt;U&gt;)    accumulator + combiner (type change, parallel)
 * Rules: the operator must be ASSOCIATIVE and the identity must be a true identity (x op id == x).
 */
public final class Reducing {

    private Reducing() {
    }

    /** Practice: total balance of all accounts. Money: BigDecimal.ZERO + BigDecimal::add. */
    public static BigDecimal totalBalance(List<Account> accounts) {
        return accounts.stream().map(Account::balance).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /** Optional form: no identity, so an empty stream gives Optional.empty. */
    public static Optional<BigDecimal> largestAmount(List<Transaction> txns) {
        return txns.stream().map(Transaction::amount).reduce(BigDecimal::max);
    }

    /** 3-arg form: Flight -> int without mapToInt. The combiner merges partial sums (used in parallel). */
    public static int totalSeats(List<Flight> flights) {
        return flights.stream().reduce(0, (sum, f) -> sum + f.seats(), Integer::sum);
    }

    /** The idiomatic alternative for numbers. */
    public static int totalSeatsMapToInt(List<Flight> flights) {
        return flights.stream().mapToInt(Flight::seats).sum();
    }

    /** Practice: average premium. BigDecimal has no average(): sum, then divide with an explicit scale and rounding. */
    public static BigDecimal averagePremium(List<Policy> policies) {
        BigDecimal total = policies.stream().map(Policy::premium).reduce(BigDecimal.ZERO, BigDecimal::add);
        return total.divide(BigDecimal.valueOf(policies.size()), 2, RoundingMode.HALF_UP);
    }

    /** Associativity: subtraction is NOT associative, so a parallel reduce gives a different answer. */
    public static String nonAssociative() {
        int seq = IntStream.rangeClosed(1, 10).reduce(0, (a, b) -> a - b);
        int par = IntStream.rangeClosed(1, 10).parallel().reduce(0, (a, b) -> a - b);
        return "sequential=" + seq + ", parallel differs=" + (par != seq);
    }

    /** Identity: 100 is not an identity for +, so every parallel chunk adds it again. */
    public static String wrongIdentity() {
        int seq = IntStream.rangeClosed(1, 10).reduce(100, Integer::sum);
        int par = IntStream.rangeClosed(1, 10).parallel().reduce(100, Integer::sum);
        return "sequential=" + seq + ", parallel bigger=" + (par > seq);
    }

    /** Empty stream: identity form returns the identity; Optional form returns empty. */
    public static String emptyStreams() {
        BigDecimal withId = List.<BigDecimal>of().stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        Optional<BigDecimal> without = List.<BigDecimal>of().stream().reduce(BigDecimal::add);
        return "identity form=" + withId + ", optional form=" + without;
    }

    public static void main(String[] args) {
        System.out.println("total balance (reduce)   : " + totalBalance(SampleData.accounts()));
        System.out.println("largest amount (Optional): " + largestAmount(SampleData.transactions()));
        System.out.println("total seats (3-arg)      : " + totalSeats(SampleData.flights())
                + " = mapToInt.sum " + totalSeatsMapToInt(SampleData.flights()));
        System.out.println("average premium          : " + averagePremium(SampleData.policies()));
        System.out.println("a - b                    : " + nonAssociative());
        System.out.println("identity 100             : " + wrongIdentity());
        System.out.println("empty stream             : " + emptyStreams());
    }
}
