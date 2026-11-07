package com.itgreenzone.fp.l04_method_references.after;

import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.PaymentStatus;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.l04_method_references.theory.Receipt;
import com.itgreenzone.fp.l04_method_references.theory.ReceiptPrinter;

import java.util.List;

/** Java 8 with lambdas only: every lambda just forwards to one method. */
public final class LambdaSettlementReport {

    private LambdaSettlementReport() {
    }

    public static List<String> build(List<Payment> payments) {
        ReceiptPrinter printer = new ReceiptPrinter("SETTLED");
        payments.stream()
                .filter(p -> p.status() == PaymentStatus.SUCCESS)
                .sorted((a, b) -> a.amount().compareTo(b.amount()))
                .map(p -> new Receipt(p.id(), p.amount()))
                .forEach(r -> printer.print(r));
        return printer.lines();
    }

    public static void main(String[] args) {
        build(SampleData.payments()).forEach(line -> System.out.println(line));
    }
}
