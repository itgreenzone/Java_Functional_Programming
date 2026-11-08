package com.itgreenzone.fp.l16_records_sealed.before;

import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.PaymentStatus;
import com.itgreenzone.fp.data.SampleData;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * BEFORE: one loop of if/else on the status enum, with string building and four counters.
 * Nothing stops a new status from silently falling into the last else.
 */
public final class LegacyOutcomeReport {

    private LegacyOutcomeReport() {
    }

    public static List<String> report() {
        List<String> lines = new ArrayList<>();
        int approved = 0;
        int declined = 0;
        int pending = 0;
        int refunded = 0;
        BigDecimal settled = BigDecimal.ZERO;
        for (Payment p : SampleData.payments()) {
            if (p.status() == PaymentStatus.SUCCESS) {
                approved++;
                settled = settled.add(p.amount());
                if (p.amount().compareTo(new BigDecimal("1000")) >= 0) {
                    lines.add(p.id() + " APPROVED large " + p.method() + " " + p.amount());
                } else {
                    lines.add(p.id() + " APPROVED " + p.method() + " " + p.amount());
                }
            } else if (p.status() == PaymentStatus.FAILED) {
                declined++;
                lines.add(p.id() + " DECLINED " + p.method() + " (failed at gateway)");
            } else if (p.status() == PaymentStatus.PENDING) {
                pending++;
                lines.add(p.id() + " PENDING since " + p.at());
            } else {
                refunded++;
                lines.add(p.id() + " REFUNDED " + p.amount());
            }
        }
        lines.add("APPROVED=" + approved + " DECLINED=" + declined + " PENDING=" + pending + " REFUNDED=" + refunded
                + " settled=" + settled);
        return lines;
    }

    public static void main(String[] args) {
        report().forEach(System.out::println);
    }
}
