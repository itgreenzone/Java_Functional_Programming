package com.itgreenzone.fp.l03_lambdas.theory;

import java.math.BigDecimal;

/** A parser that throws a checked exception, like many real APIs (I/O, JDBC, parsing). */
public final class Amounts {

    private Amounts() {
    }

    public static BigDecimal parse(String raw) throws InvalidAmountException {
        try {
            BigDecimal amount = new BigDecimal(raw.strip());
            if (amount.signum() <= 0) {
                throw new InvalidAmountException("Amount must be positive: " + raw);
            }
            return amount.setScale(2, java.math.RoundingMode.HALF_UP);
        } catch (NumberFormatException e) {
            throw new InvalidAmountException("Invalid amount: " + raw);
        }
    }
}
