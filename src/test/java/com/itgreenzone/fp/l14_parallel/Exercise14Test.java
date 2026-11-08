package com.itgreenzone.fp.l14_parallel;

import com.itgreenzone.fp.l14_parallel.exercise.Exercise14;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** Remove @Disabled when you have fixed Exercise14. The fixed pipelines must give the right answer on EVERY run, so each check is repeated. */
@Disabled("Remove this line when you have fixed the three pipelines in Exercise14")
class Exercise14Test {

    private static final int RUNS = 50;

    @Test
    void pipeline1SettlementTotal() {
        for (int i = 0; i < RUNS; i++) {
            assertEquals(new BigDecimal("4529.84"), Exercise14.settlementTotal(new BigDecimal("100.00")));
        }
    }

    @Test
    void pipeline2FirstPaymentOverLimit() {
        for (int i = 0; i < RUNS; i++) {
            assertEquals("P005", Exercise14.firstPaymentOver(new BigDecimal("500.00")));
        }
    }

    @Test
    void pipeline3SuccessfulIdsInOrder() {
        for (int i = 0; i < RUNS; i++) {
            assertEquals(List.of("P001", "P002", "P004", "P005", "P007", "P009", "P010", "P011"), Exercise14.successfulIds());
        }
    }
}
