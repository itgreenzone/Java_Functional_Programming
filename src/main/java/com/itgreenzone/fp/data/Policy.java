package com.itgreenzone.fp.data;

import java.math.BigDecimal;
import java.time.LocalDate;

/** An insurance policy. Premium is annual. [Java 16 record] */
public record Policy(String number, String customerId, PolicyType type, BigDecimal premium, LocalDate expiry) { }
