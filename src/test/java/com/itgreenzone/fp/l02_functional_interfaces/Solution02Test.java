package com.itgreenzone.fp.l02_functional_interfaces;

import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;
import com.itgreenzone.fp.l02_functional_interfaces.solution.Solution02;
import com.itgreenzone.fp.l02_functional_interfaces.solution.FraudRule;
import com.itgreenzone.fp.l02_functional_interfaces.solution.TriFunction;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;


class Solution02Test {

    @Test
    void suspiciousTransactionsAreFlagged() {
        assertEquals(List.of("T003", "T010", "T023", "T036", "T042", "T050", "T057"),
                Solution02.flaggedIds(SampleData.transactions()));
    }

    @Test
    void individualRules() {
        assertEquals(7L, SampleData.transactions().stream().filter(Solution02.largeDebit()).count());
        assertEquals(2L, SampleData.transactions().stream().filter(Solution02.foreignCurrency()).count());
    }

    @Test
    void fraudRuleOrDefaultMethod() {
        FraudRule large = FraudRule.from(Solution02.largeDebit());
        FraudRule foreign = FraudRule.from(Solution02.foreignCurrency());
        List<Transaction> txns = SampleData.transactions();
        assertEquals(8L, txns.stream().filter(large.or(foreign)::flags).count());
    }

    @ParameterizedTest(name = "fee({0}, {1}%, min {2}) = {3}")
    @CsvSource({"2500.00, 0.5, 1.00, 12.50", "100.00, 0.5, 1.00, 1.00", "201.00, 0.5, 1.00, 1.01", "1221.40, 0.25, 2.00, 3.05"})
    void transferFeeTriFunction(BigDecimal amount, BigDecimal rate, BigDecimal min, BigDecimal expected) {
        assertEquals(expected, Solution02.transferFee().apply(amount, rate, min));
    }

    @Test
    void triFunctionAndThen() {
        TriFunction<BigDecimal, BigDecimal, BigDecimal, BigDecimal> fee = Solution02.transferFee();
        assertEquals("fee=1.00", fee.andThen(f -> "fee=" + f)
                .apply(new BigDecimal("100.00"), new BigDecimal("0.5"), new BigDecimal("1.00")));
    }
}
