package com.itgreenzone.fp.l04_method_references.theory;

import com.itgreenzone.fp.data.Payment;
import com.itgreenzone.fp.data.SampleData;

import java.util.List;
import java.util.function.Consumer;
import java.util.function.Predicate;
import java.util.function.Supplier;

/**
 * Kind 2: BOUND instance method reference [Java 8]   expression::instanceMethod
 * The receiver object is fixed (bound) when the reference is CREATED.
 * The lambda parameters become the method's arguments.
 */
public final class BoundReferences {

    private BoundReferences() {
    }

    /** printer::print  ==  r -> printer.print(r) */
    public static List<String> printSuccessful(List<Payment> payments) {
        ReceiptPrinter printer = new ReceiptPrinter("SETTLED");
        payments.stream()
                .filter(Fees::isSuccessful)
                .map(Receipt::from)
                .limit(3)
                .forEach(printer::print);
        return printer.lines();
    }

    /** "SGD"::equals  ==  s -> "SGD".equals(s) */
    public static final Predicate<String> IS_SGD = "SGD"::equals;

    /**
     * The receiver expression of a bound reference is evaluated ONCE, when the reference is created.
     * A lambda evaluates it on EVERY call.
     */
    public static String receiverEvaluation() {
        StringBuilder log = new StringBuilder();
        Supplier<ReceiptPrinter> newPrinter = () -> {
            log.append("new ");
            return new ReceiptPrinter("X");
        };
        Receipt r = new Receipt("P001", SampleData.payments().get(0).amount());

        log.append("creating both: ");
        Consumer<Receipt> reference = newPrinter.get()::print;      // newPrinter runs now, once
        Consumer<Receipt> lambda = x -> newPrinter.get().print(x);  // newPrinter runs on each call
        log.append("| 2 reference calls: ");
        reference.accept(r);
        reference.accept(r);
        log.append("| 2 lambda calls: ");
        lambda.accept(r);
        lambda.accept(r);
        return log.toString().strip();
    }

    /** A null receiver fails at CREATION for a method reference, but only at CALL time for a lambda. */
    public static String nullReceiver() {
        String code = null;
        StringBuilder log = new StringBuilder();
        Supplier<Integer> lambda = () -> code.length();
        log.append("lambda created; ");
        try {
            Supplier<Integer> reference = code::length;
            log.append("reference created ").append(reference);
        } catch (NullPointerException e) {
            log.append("reference: NPE at creation; ");
        }
        try {
            lambda.get();
        } catch (NullPointerException e) {
            log.append("lambda: NPE at call");
        }
        return log.toString();
    }

    public static void main(String[] args) {
        printSuccessful(SampleData.payments()).forEach(System.out::println);   // System.out::println is bound too
        System.out.println("\"SGD\"::equals(\"USD\")   : " + IS_SGD.test("USD"));
        System.out.println("receiver evaluation    : " + receiverEvaluation());
        System.out.println("null receiver          : " + nullReceiver());
    }
}
