package com.itgreenzone.fp.l01_why_fp;

import com.itgreenzone.fp.data.Account;
import com.itgreenzone.fp.data.Customer;
import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.l01_why_fp.exercise.LegacyBatchJobs;
import com.itgreenzone.fp.l01_why_fp.solution.Solution01;
import com.itgreenzone.fp.testutil.StdOut;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** The lambda versions must behave exactly like the legacy anonymous classes. */

class Solution01Test {

    @Test
    void customersSortByJoinedDateLikeTheLegacyComparator() {
        List<String> legacy = SampleData.customers().stream()
                .sorted(LegacyBatchJobs.byJoinedDateOldestFirst()).map(Customer::id).toList();
        List<String> lambda = SampleData.customers().stream()
                .sorted(Solution01.byJoinedDateOldestFirst()).map(Customer::id).toList();
        assertEquals(List.of("C003", "C006", "C001", "C010", "C007", "C002", "C004", "C009", "C005", "C008"), lambda);
        assertEquals(legacy, lambda);
    }

    @Test
    void accountsSortByBalanceHighestFirst() {
        List<String> lambda = SampleData.accounts().stream()
                .sorted(Solution01.byBalanceHighestFirst()).map(Account::number).toList();
        List<String> legacy = SampleData.accounts().stream()
                .sorted(LegacyBatchJobs.byBalanceHighestFirst()).map(Account::number).toList();
        assertEquals("ACC-1006", lambda.get(0));
        assertEquals("ACC-1013", lambda.get(lambda.size() - 1));
        assertEquals(legacy, lambda);
    }

    @Test
    void monthEndJobPrintsTheSameBanner() {
        String legacy = StdOut.capture(LegacyBatchJobs.monthEndJob(SampleData.accounts()));
        String lambda = StdOut.capture(Solution01.monthEndJob(SampleData.accounts()));
        assertEquals("Month-end job: 15 accounts, total balance 300382.25\n", lambda);
        assertEquals(legacy, lambda);
    }
}
