package com.itgreenzone.fp.l05_optional;

import com.itgreenzone.fp.data.Policy;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.l05_optional.exercise.LegacyPolicyService;
import com.itgreenzone.fp.l05_optional.solution.Solution05;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** The Optional version must return exactly what the null-check version returns. */

class Solution05Test {

    static final LocalDate TODAY = LocalDate.of(2026, 11, 7);

    static List<String> numbersWithUnknown() {
        List<String> numbers = new ArrayList<>(SampleData.policies().stream().map(Policy::number).toList());
        numbers.add(2, "POL-999");
        return numbers;
    }

    @Test
    void lookupsMatchTheLegacyService() {
        for (String n : numbersWithUnknown()) {
            assertEquals(Optional.ofNullable(LegacyPolicyService.findPolicy(n)), Solution05.findPolicy(n), n);
            assertEquals(LegacyPolicyService.holderName(n), Solution05.holderName(n), n);
            assertEquals(LegacyPolicyService.premiumOrZero(n), Solution05.premiumOrZero(n), n);
            for (LocalDate day : List.of(TODAY, LocalDate.of(2026, 12, 1), LocalDate.of(2027, 6, 30))) {
                assertEquals(Optional.ofNullable(LegacyPolicyService.activeExpiry(n, day)), Solution05.activeExpiry(n, day), n + " " + day);
            }
        }
        assertEquals(Optional.empty(), Solution05.findCustomer("C999"));
    }

    @Test
    void renewalRemindersMatch() {
        List<String> expected = List.of(
                "POL-502 MOTOR expires 2026-11-30 - remind Alice Tan",
                "POL-505 TRAVEL expires 2026-11-20 - remind Chen Wei",
                "POL-508 MOTOR expires 2026-12-05 - remind Ganesh Perera",
                "POL-509 TRAVEL expires 2026-11-12 - remind Hana Sato");
        assertEquals(expected, LegacyPolicyService.renewalReminders(numbersWithUnknown(), TODAY));
        assertEquals(expected, Solution05.renewalReminders(numbersWithUnknown(), TODAY));
    }
}
