package com.itgreenzone.fp.l15_fp_principles.before;

import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;
import com.itgreenzone.fp.data.TxnType;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

/**
 * BEFORE: an object with mutable state and one long method of if/else. The running total is a field,
 * so calling calculate() twice doubles it, and no rule can be reused or tested on its own.
 * Fee rules (course rules for this lesson): 0.25% base, minimum 0.50, +1.00% FX surcharge for non-SGD, cap 10.00.
 * A fee is charged in the transaction's currency, so totals are kept per currency.
 */
public final class LegacyFeeCalculator {

    private final Map<String, BigDecimal> totalFees = new TreeMap<>();
    private final List<String> lines = new ArrayList<>();

    public BigDecimal calculate(Transaction t) {
        BigDecimal fee = t.amount().multiply(new BigDecimal("0.0025")).setScale(2, RoundingMode.HALF_UP);
        if (fee.compareTo(new BigDecimal("0.50")) < 0) {
            fee = new BigDecimal("0.50");
        }
        if (!"SGD".equals(t.currency())) {
            fee = fee.add(t.amount().multiply(new BigDecimal("0.01")).setScale(2, RoundingMode.HALF_UP));
        }
        if (fee.compareTo(new BigDecimal("10.00")) > 0) {
            fee = new BigDecimal("10.00");
        }
        BigDecimal old = totalFees.get(t.currency());
        totalFees.put(t.currency(), old == null ? fee : old.add(fee));
        lines.add(t.id() + " " + t.amount() + " " + t.currency() + " -> fee " + fee);
        return fee;
    }

    public static List<String> report() {
        LegacyFeeCalculator calc = new LegacyFeeCalculator();
        for (Transaction t : SampleData.transactions()) {
            if (t.type() == TxnType.DEBIT) {
                calc.calculate(t);
            }
        }
        List<String> out = new ArrayList<>();
        for (String l : calc.lines) {
            if (l.startsWith("T010") || l.startsWith("T023") || l.startsWith("T001") || l.startsWith("T042")) {
                out.add(l);
            }
        }
        out.add("TOTAL FEES " + calc.totalFees + " on " + calc.lines.size() + " debits");
        return out;
    }

    public static void main(String[] args) {
        report().forEach(System.out::println);
    }
}
