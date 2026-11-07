package com.itgreenzone.fp.l09_terminal_ops;

import com.itgreenzone.fp.l09_terminal_ops.after.StreamDashboard;
import com.itgreenzone.fp.l09_terminal_ops.before.LegacyDashboard;
import com.itgreenzone.fp.l09_terminal_ops.modern.ModernDashboard;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class DashboardRefactoringTest {

    static final List<String> EXPECTED = List.of(
            "total balance   : 300382.25",
            "highest txn     : T049 7721.99",
            "any overdrawn   : true",
            "average premium : 1082.65");

    @Test
    void allVersionsAgree() {
        assertEquals(EXPECTED, LegacyDashboard.dashboard());
        assertEquals(EXPECTED, StreamDashboard.dashboard());
        assertEquals(EXPECTED, ModernDashboard.dashboard());
    }

    @Test
    void modernIsEmptySafe() {
        assertEquals(List.of("total balance   : 0", "highest txn     : none", "any overdrawn   : false", "average premium : 0.00"),
                ModernDashboard.build(List.of(), List.of(), List.of()).lines());
    }
}
