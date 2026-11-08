package com.itgreenzone.fp.l11_grouping;

import com.itgreenzone.fp.l11_grouping.after.StreamCategoryReport;
import com.itgreenzone.fp.l11_grouping.before.LegacyCategoryReport;
import com.itgreenzone.fp.l11_grouping.modern.ModernCategoryReport;
import com.itgreenzone.fp.l11_grouping.solution.Solution11;
import com.itgreenzone.fp.l11_grouping.theory.ClassicTasks;
import com.itgreenzone.fp.l11_grouping.theory.DownstreamRecipes;
import com.itgreenzone.fp.l11_grouping.theory.GroupingBasics;
import com.itgreenzone.fp.l11_grouping.theory.MultiLevelAndPartitioning;
import com.itgreenzone.fp.testutil.StdOut;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** Golden-file tests: src/test/resources/l11/expected/&lt;ClassName&gt;.txt */
class MainOutputTest {

    @ParameterizedTest(name = "{0}")
    @ValueSource(classes = {
            GroupingBasics.class, DownstreamRecipes.class, MultiLevelAndPartitioning.class, ClassicTasks.class,
            LegacyCategoryReport.class, StreamCategoryReport.class, ModernCategoryReport.class, Solution11.class})
    void mainPrintsTheDocumentedOutput(Class<?> mainClass) throws IOException {
        assertEquals(expected(mainClass), StdOut.captureMain(mainClass));
    }

    private static String expected(Class<?> mainClass) throws IOException {
        String path = "/l11/expected/" + mainClass.getSimpleName() + ".txt";
        try (InputStream in = MainOutputTest.class.getResourceAsStream(path)) {
            if (in == null) {
                throw new IOException("Missing golden file " + path);
            }
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
