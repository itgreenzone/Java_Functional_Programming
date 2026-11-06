package com.itgreenzone.fp.testutil;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.lang.reflect.InvocationTargetException;
import java.nio.charset.StandardCharsets;

/** Test helper: captures what code prints to System.out. */
public final class StdOut {

    private StdOut() {
    }

    public static String capture(Runnable action) {
        PrintStream original = System.out;
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        try (PrintStream capture = new PrintStream(buffer, true, StandardCharsets.UTF_8)) {
            System.setOut(capture);
            action.run();
        } finally {
            System.setOut(original);
        }
        return buffer.toString(StandardCharsets.UTF_8).replace("\r\n", "\n");
    }

    /** Runs {@code public static void main(String[])} of the class and returns its output. */
    public static String captureMain(Class<?> mainClass) {
        return capture(() -> {
            try {
                mainClass.getMethod("main", String[].class).invoke(null, (Object) new String[0]);
            } catch (NoSuchMethodException | IllegalAccessException | InvocationTargetException e) {
                throw new IllegalStateException("Could not run main of " + mainClass.getName(), e);
            }
        });
    }
}
