package com.itgreenzone.fp.data;

import java.math.BigDecimal;

/** A bank account owned by one customer. Balance may be negative (overdrawn). [Java 16 record] */
public record Account(String number, String customerId, AccountType type, BigDecimal balance) { }
