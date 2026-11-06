package com.itgreenzone.fp.data;

import java.math.BigDecimal;
import java.time.LocalDate;

/** One posted transaction. Amount is always positive; {@link TxnType} gives the direction. [Java 16 record] */
public record Transaction(String id, String accountNumber, LocalDate date, TxnType type,
                          Category category, BigDecimal amount, String currency) { }
