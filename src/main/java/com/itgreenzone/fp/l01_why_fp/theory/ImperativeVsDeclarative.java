package com.itgreenzone.fp.l01_why_fp.theory;

import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;
import com.itgreenzone.fp.data.TxnType;

import java.math.BigDecimal;
import java.util.List;

/**
 * Imperative (HOW) vs declarative (WHAT): total of all DEBIT amounts.
 */
public final class ImperativeVsDeclarative {

    private ImperativeVsDeclarative() {
    }

    /** Imperative: we write the loop, the condition and the mutable accumulator ourselves. */
    public static BigDecimal totalDebitsImperative(List<Transaction> txns) {
        BigDecimal total = BigDecimal.ZERO;
        for (Transaction t : txns) {
            if (t.type() == TxnType.DEBIT) {
                total = total.add(t.amount());
            }
        }
        return total;
    }

    /** Declarative [Java 8]: we describe the result; the Stream library runs the loop. */
    public static BigDecimal totalDebitsDeclarative(List<Transaction> txns) {
        return txns.stream()
                .filter(t -> t.type() == TxnType.DEBIT)
                .map(Transaction::amount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public static void main(String[] args) {
        List<Transaction> txns = SampleData.transactions();
        System.out.println("Total debits (imperative):  " + totalDebitsImperative(txns));
        System.out.println("Total debits (declarative): " + totalDebitsDeclarative(txns));
    }
}
