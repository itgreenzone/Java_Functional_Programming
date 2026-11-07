package com.itgreenzone.fp.l04_method_references.theory;

import java.util.ArrayList;
import java.util.List;

/** An object with state. Its instance methods are targets for BOUND method references. */
public final class ReceiptPrinter {

    private final String header;
    private final List<String> lines = new ArrayList<>();

    public ReceiptPrinter(String header) {
        this.header = header;
    }

    public void print(Receipt receipt) {
        lines.add(header + " | " + receipt.line());
    }

    public List<String> lines() {
        return List.copyOf(lines);
    }
}
