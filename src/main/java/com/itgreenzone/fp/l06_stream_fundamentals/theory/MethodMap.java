package com.itgreenzone.fp.l06_stream_fundamentals.theory;

import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

/**
 * The full Stream method map as data: every operation with its kind, whether it is stateful,
 * whether it can short-circuit, and the Java version it arrived in. Used by the slides and cheat sheet.
 */
public final class MethodMap {

    public enum Kind { INTERMEDIATE, TERMINAL }

    public record Op(String name, Kind kind, boolean stateful, boolean shortCircuit, int since, String note) {
    }

    public static final List<Op> OPS = List.of(
            // intermediate, stateless
            new Op("filter", Kind.INTERMEDIATE, false, false, 8, "keep matching elements"),
            new Op("map", Kind.INTERMEDIATE, false, false, 8, "transform each element"),
            new Op("mapToInt/Long/Double", Kind.INTERMEDIATE, false, false, 8, "to a primitive stream"),
            new Op("mapToObj / boxed", Kind.INTERMEDIATE, false, false, 8, "primitive back to objects"),
            new Op("flatMap", Kind.INTERMEDIATE, false, false, 8, "one-to-many, then flatten"),
            new Op("mapMulti", Kind.INTERMEDIATE, false, false, 16, "one-to-many with a consumer"),
            new Op("peek", Kind.INTERMEDIATE, false, false, 8, "debug only"),
            new Op("unordered / parallel / sequential / onClose", Kind.INTERMEDIATE, false, false, 8, "flags and hooks"),
            // intermediate, stateful
            new Op("distinct", Kind.INTERMEDIATE, true, false, 8, "uses equals/hashCode"),
            new Op("sorted", Kind.INTERMEDIATE, true, false, 8, "barrier: sees all elements"),
            new Op("skip", Kind.INTERMEDIATE, true, false, 8, "drop the first n"),
            new Op("limit", Kind.INTERMEDIATE, true, true, 8, "keep the first n"),
            new Op("takeWhile", Kind.INTERMEDIATE, true, true, 9, "keep while true (ordered input)"),
            new Op("dropWhile", Kind.INTERMEDIATE, true, false, 9, "drop while true (ordered input)"),
            // terminal
            new Op("forEach / forEachOrdered", Kind.TERMINAL, false, false, 8, "side effects at the end"),
            new Op("toArray", Kind.TERMINAL, false, false, 8, "toArray(String[]::new)"),
            new Op("reduce", Kind.TERMINAL, false, false, 8, "combine into one value"),
            new Op("collect", Kind.TERMINAL, false, false, 8, "with a Collector"),
            new Op("toList", Kind.TERMINAL, false, false, 16, "unmodifiable list"),
            new Op("count / min / max", Kind.TERMINAL, false, false, 8, "aggregates"),
            new Op("sum / average / summaryStatistics", Kind.TERMINAL, false, false, 8, "primitive streams only"),
            new Op("anyMatch / allMatch / noneMatch", Kind.TERMINAL, false, true, 8, "boolean answers"),
            new Op("findFirst / findAny", Kind.TERMINAL, false, true, 8, "Optional result"),
            new Op("iterator / spliterator", Kind.TERMINAL, false, false, 8, "escape hatches"));

    private MethodMap() {
    }

    public static Map<Kind, List<String>> namesByKind() {
        return OPS.stream()
                .collect(Collectors.groupingBy(Op::kind, TreeMap::new,
                        Collectors.mapping(Op::name, Collectors.toList())));
    }

    public static List<String> after(int version) {
        return OPS.stream()
                .filter(op -> op.since() > version)
                .map(op -> op.name() + " [" + op.since() + "]")
                .toList();
    }

    public static void main(String[] args) {
        for (Op op : OPS) {
            System.out.printf("%-12s %-44s stateful=%-5s shortCircuit=%-5s Java %d%n",
                    op.kind(), op.name(), op.stateful(), op.shortCircuit(), op.since());
        }
        System.out.println("after Java 8   : " + after(8));
        System.out.println("Beyond Java 21 : Stream.gather(Gatherer) - final in Java 24");
    }
}
