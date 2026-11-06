package com.itgreenzone.fp.data;

import java.time.LocalDate;

/** A bank customer. [Java 16 record] */
public record Customer(String id, String name, String city, Tier tier, LocalDate joined) { }
