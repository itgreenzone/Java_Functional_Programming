package com.itgreenzone.fp.l03_lambdas.theory;

import java.io.Serial;

/** Unchecked wrapper that keeps the original checked exception as its cause. */
public class WrappedCheckedException extends RuntimeException {

    @Serial
    private static final long serialVersionUID = 1L;

    public WrappedCheckedException(Exception cause) {
        super(cause.getMessage(), cause);
    }
}
