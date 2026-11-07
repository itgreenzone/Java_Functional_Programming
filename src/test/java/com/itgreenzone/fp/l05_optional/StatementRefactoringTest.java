package com.itgreenzone.fp.l05_optional;

import com.itgreenzone.fp.data.AccountType;
import com.itgreenzone.fp.l05_optional.after.OptionalStatementService;
import com.itgreenzone.fp.l05_optional.before.LegacyStatementService;
import com.itgreenzone.fp.l05_optional.modern.ModernStatementService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class StatementRefactoringTest {

    @ParameterizedTest(name = "{0} {1}")
    @CsvSource({"C001, SAVINGS", "C003, FIXED_DEPOSIT", "C005, CURRENT", "C999, SAVINGS", "C009, CURRENT", "C010, FIXED_DEPOSIT"})
    void nullChecksAndOptionalChainAgree(String customerId, AccountType type) {
        assertEquals(LegacyStatementService.latestActivity(customerId, type),
                OptionalStatementService.latestActivity(customerId, type));
    }

    @Test
    void documentedResults() {
        assertEquals("C001 SAVINGS -> T018 447.37", OptionalStatementService.latestActivity("C001", AccountType.SAVINGS));
        assertEquals("C999 SAVINGS -> no data", OptionalStatementService.latestActivity("C999", AccountType.SAVINGS));
    }

    @Test
    void modernSummaryFallsBackAndDropsEmpties() {
        assertEquals(List.of(
                        new ModernStatementService.Activity("C001", "T018", new BigDecimal("447.37")),
                        new ModernStatementService.Activity("C003", "T028", new BigDecimal("823.39")),
                        new ModernStatementService.Activity("C009", "T039", new BigDecimal("4231.84"))),
                ModernStatementService.summary(List.of("C001", "C003", "C009", "C999")));
    }
}
