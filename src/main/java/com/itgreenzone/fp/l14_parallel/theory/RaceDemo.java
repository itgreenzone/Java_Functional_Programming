package com.itgreenzone.fp.l14_parallel.theory;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.IntStream;

/**
 * NON-DETERMINISTIC DEMO (run it a few times; it is deliberately excluded from the golden-file test).
 * Adding to a shared ArrayList from a parallel forEach is a data race: elements get lost, or an
 * ArrayIndexOutOfBoundsException is thrown while the list resizes. The result changes from run to run.
 */
public final class RaceDemo {

    private RaceDemo() {
    }

    /** Returns the size reached, or -1 if the race threw an exception. Never use this pattern. */
    public static int sharedListSize(int n) {
        List<Integer> shared = new ArrayList<>();
        try {
            IntStream.range(0, n).parallel().forEach(shared::add);
            return shared.size();
        } catch (RuntimeException e) {
            return -1;
        }
    }

    public static void main(String[] args) {
        for (int run = 1; run <= 3; run++) {
            int size = sharedListSize(100_000);
            System.out.println("run " + run + ": " + (size < 0 ? "exception during resize" : size + " of 100000 elements"));
        }
        System.out.println("safe: IntStream.range(0, 100000).parallel().boxed().toList() always has 100000");
    }
}
