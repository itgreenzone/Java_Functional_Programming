package com.itgreenzone.fp.l07_filter_map_slice.theory;

import com.itgreenzone.fp.data.Account;
import com.itgreenzone.fp.data.Customer;
import com.itgreenzone.fp.data.Flight;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Tier;
import com.itgreenzone.fp.data.Transaction;

import java.util.List;
import java.util.function.Consumer;
import java.util.stream.Stream;

/**
 * flatMap(Function&lt;T, Stream&lt;R&gt;&gt;) [Java 8]: one element in, zero or more out, flattened into one stream.
 * mapMulti(BiConsumer&lt;T, Consumer&lt;R&gt;&gt;) [Java 16]: the same idea, but you push results into a consumer
 * instead of returning a stream.
 */
public final class FlatMapping {

    private FlatMapping() {
    }

    public static List<Account> accountsOf(Customer c) {
        return SampleData.accounts().stream().filter(a -> a.customerId().equals(c.id())).toList();
    }

    public static List<Transaction> transactionsOf(Account a) {
        return SampleData.transactions().stream().filter(t -> t.accountNumber().equals(a.number())).toList();
    }

    /** map would give Stream&lt;List&lt;Account&gt;&gt;; flatMap gives Stream&lt;Account&gt;. */
    public static long mapVersusFlatMap(List<Customer> customers) {
        return customers.stream().map(FlatMapping::accountsOf).count();
    }

    /** Practice 3: all transactions of GOLD customers. Customer -> accounts -> transactions. */
    public static List<String> goldTransactions(List<Customer> customers) {
        return customers.stream()
                .filter(c -> c.tier() == Tier.GOLD)
                .flatMap(c -> accountsOf(c).stream())
                .flatMap(a -> transactionsOf(a).stream())
                .map(Transaction::id)
                .toList();
    }

    /** The same with mapMulti [Java 16]: push each transaction into the downstream consumer. */
    public static List<String> goldTransactionsMapMulti(List<Customer> customers) {
        return customers.stream()
                .filter(c -> c.tier() == Tier.GOLD)
                .<Account>mapMulti((c, down) -> accountsOf(c).forEach(down))
                .<String>mapMulti((a, down) -> {
                    for (Transaction t : transactionsOf(a)) {
                        down.accept(t.id());
                    }
                })
                .toList();
    }

    /** Nested lists: List&lt;List&lt;String&gt;&gt; -> one flat list. */
    public static List<String> flattenItineraries(List<List<String>> itineraries) {
        return itineraries.stream().flatMap(List::stream).toList();
    }

    /** One element -> exactly two: each flight contributes its two airports. */
    public static List<String> airports(List<Flight> flights) {
        return flights.stream()
                .flatMap(f -> Stream.of(f.from(), f.to()))
                .distinct()
                .sorted()
                .toList();
    }

    /** mapMulti shines for "0 or 1" without creating a Stream per element. */
    public static List<String> nearlyFullFlights(List<Flight> flights) {
        return flights.stream()
                .<String>mapMulti((f, down) -> emitIfNearlyFull(f, down))
                .toList();
    }

    private static void emitIfNearlyFull(Flight f, Consumer<String> down) {
        if (f.booked() * 100 >= f.seats() * 95) {
            down.accept(f.code());
        }
    }

    public static void main(String[] args) {
        List<Customer> customers = SampleData.customers();
        System.out.println("map(accountsOf).count : " + mapVersusFlatMap(customers) + " lists (Stream<List<Account>>)");
        System.out.println("GOLD txns (flatMap)   : " + goldTransactions(customers));
        System.out.println("GOLD txns (mapMulti)  : " + goldTransactionsMapMulti(customers));
        System.out.println("flatten itineraries   : "
                + flattenItineraries(List.of(List.of("SIN", "NRT"), List.of("SIN", "LHR", "SIN"), List.of())));
        System.out.println("airports              : " + airports(SampleData.flights()));
        System.out.println(">= 95% full (mapMulti): " + nearlyFullFlights(SampleData.flights()));
    }
}
