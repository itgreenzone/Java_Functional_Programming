package com.itgreenzone.fp.l01_why_fp.before;

import com.itgreenzone.fp.data.Transaction;

/**
 * Pre-Java-8 strategy interface: "a rule that decides whether a transaction matches".
 * It has exactly one abstract method, so (from Java 8) it is also a functional interface.
 */
public interface TransactionFilter {
    boolean matches(Transaction txn);
}
