package com.itgreenzone.fp.l05_optional.exercise;

import com.itgreenzone.fp.data.Customer;
import com.itgreenzone.fp.data.Policy;
import com.itgreenzone.fp.data.SampleData;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * EXERCISE INPUT - a policy lookup service full of null checks.
 * Rewrite it with Optional in {@link Exercise05}. Do not change this file.
 */
public final class LegacyPolicyService {

    private LegacyPolicyService() {
    }

    public static Policy findPolicy(String number) {
        for (Policy p : SampleData.policies()) {
            if (p.number().equals(number)) {
                return p;
            }
        }
        return null;
    }

    public static Customer findCustomer(String id) {
        for (Customer c : SampleData.customers()) {
            if (c.id().equals(id)) {
                return c;
            }
        }
        return null;
    }

    /** The policy holder's name, or "UNKNOWN". */
    public static String holderName(String policyNumber) {
        Policy p = findPolicy(policyNumber);
        if (p != null) {
            Customer c = findCustomer(p.customerId());
            if (c != null) {
                return c.name();
            }
        }
        return "UNKNOWN";
    }

    /** The premium, or 0 when the policy does not exist. */
    public static BigDecimal premiumOrZero(String policyNumber) {
        Policy p = findPolicy(policyNumber);
        return p != null ? p.premium() : BigDecimal.ZERO;
    }

    /** The expiry date if the policy exists and has not expired on 'today'; otherwise null. */
    public static LocalDate activeExpiry(String policyNumber, LocalDate today) {
        Policy p = findPolicy(policyNumber);
        if (p != null && !p.expiry().isBefore(today)) {
            return p.expiry();
        }
        return null;
    }

    /** Reminders for policies (from the given numbers) that exist and expire within 30 days of 'today'. */
    public static List<String> renewalReminders(List<String> numbers, LocalDate today) {
        List<String> reminders = new ArrayList<>();
        for (String n : numbers) {
            Policy p = findPolicy(n);
            if (p != null && !p.expiry().isBefore(today) && !p.expiry().isAfter(today.plusDays(30))) {
                String name = holderName(n);
                reminders.add(p.number() + " " + p.type() + " expires " + p.expiry() + " - remind " + name);
            }
        }
        return reminders;
    }
}
