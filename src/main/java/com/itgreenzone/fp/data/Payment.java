package com.itgreenzone.fp.data;

import java.math.BigDecimal;
import java.time.Instant;

/** A payment processed by the gateway. Method is CARD, PAYNOW or PAYPAL. [Java 16 record] */
public record Payment(String id, String method, BigDecimal amount, PaymentStatus status, Instant at) { }
