package com.itgreenzone.fp.l04_method_references.before;

import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.PaymentStatus;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.l04_method_references.theory.Receipt;
import com.itgreenzone.fp.l04_method_references.theory.ReceiptPrinter;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

/** Pre-Java-8 settlement report: loops, an anonymous Comparator, a temporary list. */
public final class LegacySettlementReport {

    private LegacySettlementReport() {
    }

    public static List<String> build(List<Payment> payments) {
        List<Payment> settled = new ArrayList<>();
        for (Payment p : payments) {
            if (p.status() == PaymentStatus.SUCCESS) {
                settled.add(p);
            }
        }
        Collections.sort(settled, new Comparator<Payment>() {
            @Override
            public int compare(Payment a, Payment b) {
                return a.amount().compareTo(b.amount());
            }
        });
        ReceiptPrinter printer = new ReceiptPrinter("SETTLED");
        for (Payment p : settled) {
            printer.print(new Receipt(p.id(), p.amount()));
        }
        return printer.lines();
    }

    public static void main(String[] args) {
        for (String line : build(SampleData.payments())) {
            System.out.println(line);
        }
    }
}
