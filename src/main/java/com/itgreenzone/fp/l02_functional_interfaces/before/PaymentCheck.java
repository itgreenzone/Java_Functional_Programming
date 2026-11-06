package com.itgreenzone.fp.l02_functional_interfaces.before;

import com.itgreenzone.fp.data.Payment;

/** Pre-Java-8: every project invented its own one-method interface for each "shape". */
public interface PaymentCheck {
    boolean passes(Payment payment);
}
