package com.itgreenzone.fp.l08_sorting;

import com.itgreenzone.fp.l08_sorting.after.StreamCustomerRanking;
import com.itgreenzone.fp.l08_sorting.before.LegacyCustomerRanking;
import com.itgreenzone.fp.l08_sorting.modern.ModernCustomerRanking;
import com.itgreenzone.fp.l08_sorting.solution.Solution08;
import com.itgreenzone.fp.l08_sorting.theory.ChainingAndReversed;
import com.itgreenzone.fp.l08_sorting.theory.ComparatorFactories;
import com.itgreenzone.fp.l08_sorting.theory.NaturalVsComparator;
import com.itgreenzone.fp.l08_sorting.theory.NullsAndStability;
import com.itgreenzone.fp.l08_sorting.theory.SortingMapsAndLists;
import com.itgreenzone.fp.testutil.StdOut;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** Golden-file tests: src/test/resources/l08/expected/&lt;ClassName&gt;.txt */
class MainOutputTest {

    @ParameterizedTest(name = "{0}")
    @ValueSource(classes = {
            NaturalVsComparator.class, ComparatorFactories.class, ChainingAndReversed.class, NullsAndStability.class,
            SortingMapsAndLists.class, LegacyCustomerRanking.class, StreamCustomerRanking.class,
            ModernCustomerRanking.class, Solution08.class})
    void mainPrintsTheDocumentedOutput(Class<?> mainClass) throws IOException {
        assertEquals(expected(mainClass), StdOut.captureMain(mainClass));
    }

    private static String expected(Class<?> mainClass) throws IOException {
        String path = "/l08/expected/" + mainClass.getSimpleName() + ".txt";
        try (InputStream in = MainOutputTest.class.getResourceAsStream(path)) {
            if (in == null) {
                throw new IOException("Missing golden file " + path);
            }
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
