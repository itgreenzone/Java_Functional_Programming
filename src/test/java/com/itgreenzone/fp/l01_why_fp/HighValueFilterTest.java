package com.itgreenzone.fp.l01_why_fp;

import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;
import com.itgreenzone.fp.l01_why_fp.after.LambdaDemo;
import com.itgreenzone.fp.l01_why_fp.after.StreamDemo;
import com.itgreenzone.fp.l01_why_fp.before.AnonymousClassDemo;
import com.itgreenzone.fp.l01_why_fp.before.LegacyFilters;
import com.itgreenzone.fp.l01_why_fp.before.StrategyClassDemo;
import com.itgreenzone.fp.l01_why_fp.modern.ModernDemo;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** Behaviour parameterisation: every step of the evolution returns exactly the same result. */
class HighValueFilterTest {

    static final List<String> EXPECTED = List.of(
            "T003", "T019", "T025", "T026", "T027", "T038", "T039", "T042", "T049", "T055", "T056");

    static Stream<Arguments> approaches() {
        Function<List<Transaction>, List<String>> hardCoded =
                txns -> LegacyFilters.ids(LegacyFilters.highValueHardCoded(txns));
        Function<List<Transaction>, List<String>> strategy = StrategyClassDemo::highValueIds;
        Function<List<Transaction>, List<String>> anonymous = AnonymousClassDemo::highValueIds;
        Function<List<Transaction>, List<String>> lambda = LambdaDemo::highValueIds;
        Function<List<Transaction>, List<String>> stream = StreamDemo::highValueIds;
        Function<List<Transaction>, List<String>> modern = ModernDemo::highValueIds;
        Function<List<Transaction>, List<String>> modernVar = ModernDemo::highValueIdsWithVar;
        return Stream.of(
                Arguments.of("0 hard-coded loop", hardCoded),
                Arguments.of("1 strategy class", strategy),
                Arguments.of("2 anonymous class", anonymous),
                Arguments.of("3 lambda", lambda),
                Arguments.of("4 stream Java 8", stream),
                Arguments.of("5 modern Java 16", modern),
                Arguments.of("5b var in lambda Java 11", modernVar));
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("approaches")
    void everyApproachFindsTheSameElevenTransactions(String step, Function<List<Transaction>, List<String>> approach) {
        assertEquals(EXPECTED, approach.apply(SampleData.transactions()), step);
    }

    @ParameterizedTest(name = "{0} on empty input")
    @MethodSource("approaches")
    void everyApproachHandlesEmptyInput(String step, Function<List<Transaction>, List<String>> approach) {
        assertEquals(List.of(), approach.apply(List.of()), step);
    }
}
