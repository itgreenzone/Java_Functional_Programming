package com.itgreenzone.fp.l04_method_references.modern;

import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.l04_method_references.theory.Fees;
import com.itgreenzone.fp.l04_method_references.theory.Receipt;
import com.itgreenzone.fp.l04_method_references.theory.ReceiptPrinter;

import java.util.Arrays;
import java.util.Comparator;
import java.util.List;

/**
 * The same report with method references: every step names the method it calls.
 * - Fees::isSuccessful              static
 * - Payment::amount                 unbound, record accessor [Java 16]
 * - Receipt::from                   static factory on a record
 * - printer::print                  bound
 * - String[]::new                   array constructor
 */
public final class MethodReferenceReport {

    private MethodReferenceReport() {
    }

    public static List<String> build(List<Payment> payments) {
        ReceiptPrinter printer = new ReceiptPrinter("SETTLED");
        payments.stream()
                .filter(Fees::isSuccessful)
                .sorted(Comparator.comparing(Payment::amount))
                .map(Receipt::from)
                .forEach(printer::print);
        return printer.lines();
    }

    public static String[] settledIds(List<Payment> payments) {
        return payments.stream()
                .filter(Fees::isSuccessful)
                .map(Payment::id)
                .toArray(String[]::new);
    }

    public static void main(String[] args) {
        build(SampleData.payments()).forEach(System.out::println);
        System.out.println("ids: " + Arrays.toString(settledIds(SampleData.payments())));
    }
}
