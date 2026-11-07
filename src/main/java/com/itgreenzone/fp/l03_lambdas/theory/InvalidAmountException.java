package com.itgreenzone.fp.l03_lambdas.theory;

import java.io.Serial;

/** A CHECKED exception: callers must catch it or declare it. */
public class InvalidAmountException extends Exception {

    @Serial
    private static final long serialVersionUID = 1L;

    public InvalidAmountException(String message) {
        super(message);
    }
}
