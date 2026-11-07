package com.itgreenzone.fp.l03_lambdas.before;

import com.itgreenzone.fp.data.Payment;

/** One validation rule: returns an error message, or null when the payment is valid (legacy style). */
@FunctionalInterface
public interface PaymentValidation {
    String check(Payment payment);
}
