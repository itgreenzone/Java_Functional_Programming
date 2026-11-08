package com.itgreenzone.fp.l15_fp_principles.theory;

import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

/**
 * Immutability beyond "use a record":
 * - records are SHALLOWLY immutable: a List component can still change unless you copy it,
 * - Collections.unmodifiableList is a read-only VIEW (changes to the source show through),
 * - List.copyOf / List.of [9/10] are real immutable copies,
 * - "withers" return a new value instead of mutating.
 */
public final class ImmutabilityInDepth {

    private ImmutabilityInDepth() {
    }

    /** A naive record: it keeps the caller's list. */
    public record NaiveStatement(String account, List<String> txnIds) { }

    /** A safe record: the compact constructor validates and copies (List.copyOf also rejects nulls). */
    public record Statement(String account, List<String> txnIds, BigDecimal closing) {
        public Statement {
            Objects.requireNonNull(account, "account");
            txnIds = List.copyOf(txnIds);
            closing = closing.setScale(2);
        }

        /** A "wither": same statement with a different closing balance. The original is unchanged. */
        public Statement withClosing(BigDecimal newClosing) {
            return new Statement(account, txnIds, newClosing);
        }
    }

    public static String naiveRecordLeaks() {
        List<String> ids = new ArrayList<>(List.of("T009", "T012"));
        NaiveStatement s = new NaiveStatement("ACC-1001", ids);
        ids.add("T999");
        return s.txnIds().toString();
    }

    public static String safeRecordDoesNotLeak() {
        List<String> ids = new ArrayList<>(List.of("T009", "T012"));
        Statement s = new Statement("ACC-1001", ids, new BigDecimal("12500"));
        ids.add("T999");
        return s.txnIds().toString();
    }

    /** unmodifiableList is a view: you cannot change it, but the owner of the source can. */
    public static String unmodifiableViewChanges() {
        List<String> source = new ArrayList<>(List.of("A"));
        List<String> view = Collections.unmodifiableList(source);
        List<String> copy = List.copyOf(source);
        source.add("B");
        return "view=" + view + " copy=" + copy;
    }

    public static boolean copyOfRejectsChanges() {
        try {
            List.copyOf(SampleData.transactions()).add(SampleData.transactions().get(0));
            return false;
        } catch (UnsupportedOperationException e) {
            return true;
        }
    }

    /** List.copyOf of an already-immutable list returns the same instance: copying is cheap when it is not needed. */
    public static boolean copyOfIsFreeForImmutableLists() {
        List<Transaction> immutable = SampleData.transactions();
        return List.copyOf(immutable) == immutable;
    }

    public static String wither() {
        Statement original = new Statement("ACC-1001", List.of("T009"), new BigDecimal("12500.00"));
        Statement updated = original.withClosing(new BigDecimal("12000"));
        return "original " + original.closing() + ", updated " + updated.closing();
    }

    public static void main(String[] args) {
        System.out.println("naive record after caller adds : " + naiveRecordLeaks());
        System.out.println("safe record (List.copyOf)       : " + safeRecordDoesNotLeak());
        System.out.println("unmodifiable view vs copy       : " + unmodifiableViewChanges());
        System.out.println("List.copyOf rejects add         : " + copyOfRejectsChanges());
        System.out.println("copyOf of List.of: same object  : " + copyOfIsFreeForImmutableLists() + " (JDK behaviour, not a guarantee)");
        System.out.println("wither                          : " + wither());
    }
}
