package com.itgreenzone.fp.l04_method_references.theory;

import com.itgreenzone.fp.data.Customer;
import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Tier;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.TreeSet;
import java.util.function.BiFunction;
import java.util.function.Function;
import java.util.function.IntFunction;
import java.util.function.Supplier;
import java.util.stream.Collectors;

/**
 * Kind 4: CONSTRUCTOR reference [Java 8]   ClassName::new
 * Kind 5: ARRAY constructor reference      Type[]::new
 * The lambda parameters become the constructor arguments.
 */
public final class ConstructorReferences {

    /** java.util.function stops at two parameters; Customer has five, so we declare our own SAM. */
    @FunctionalInterface
    public interface CustomerFactory {
        Customer create(String id, String name, String city, Tier tier, LocalDate joined);
    }

    public static final Supplier<List<Payment>> NEW_LIST = ArrayList::new;                    // () -> new ArrayList<>()
    public static final Function<String, BigDecimal> TO_AMOUNT = BigDecimal::new;              // s -> new BigDecimal(s)
    public static final BiFunction<String, BigDecimal, Receipt> NEW_RECEIPT = Receipt::new;   // (id, a) -> new Receipt(id, a)
    public static final CustomerFactory NEW_CUSTOMER = Customer::new;                         // 5 args -> new Customer(...)
    public static final IntFunction<String[]> NEW_STRING_ARRAY = String[]::new;               // n -> new String[n]
    public static final IntFunction<int[]> NEW_INT_ARRAY = int[]::new;                        // n -> new int[n]

    private ConstructorReferences() {
    }

    public static String[] paymentIds(List<Payment> payments) {
        return payments.stream()
                .map(Payment::id)
                .toArray(String[]::new);
    }

    public static TreeSet<String> methodsSorted(List<Payment> payments) {
        return payments.stream()
                .map(Payment::method)
                .collect(Collectors.toCollection(TreeSet::new));
    }

    public static void main(String[] args) {
        List<Payment> list = NEW_LIST.get();
        list.add(SampleData.payments().get(0));
        System.out.println("ArrayList::new          : size " + list.size());
        System.out.println("BigDecimal::new(\"59.90\") : " + TO_AMOUNT.apply("59.90"));
        System.out.println("Receipt::new            : " + NEW_RECEIPT.apply("P005", new BigDecimal("1500.00")));
        Customer k = NEW_CUSTOMER.create("C011", "Kumar Raj", "Singapore", Tier.SILVER, LocalDate.of(2026, 11, 1));
        System.out.println("Customer::new           : " + k.id() + " " + k.name() + " " + k.tier());
        System.out.println("String[]::new(3)        : length " + NEW_STRING_ARRAY.apply(3).length);
        System.out.println("int[]::new(8)           : " + Arrays.toString(NEW_INT_ARRAY.apply(8)));
        System.out.println("toArray(String[]::new)  : " + Arrays.toString(paymentIds(SampleData.payments().subList(0, 4))));
        System.out.println("toCollection(TreeSet::new): " + methodsSorted(SampleData.payments()));
    }
}
