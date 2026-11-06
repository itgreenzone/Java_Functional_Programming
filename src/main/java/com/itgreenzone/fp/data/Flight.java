package com.itgreenzone.fp.data;

import java.time.LocalDateTime;

/** A scheduled flight with capacity and bookings. [Java 16 record] */
public record Flight(String code, String from, String to, LocalDateTime departure, int seats, int booked) { }
