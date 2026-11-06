package com.itgreenzone.fp.l01_why_fp.theory;

import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

/**
 * The Java 8 to Java 21 timeline of functional features, itself built with a stream:
 * groupingBy into a TreeMap so versions print in order.
 */
public final class FeatureTimeline {

    /** One feature and the Java version it became final (standard) in. */
    public record Feature(int version, String name) {
    }

    public static final List<Feature> FEATURES = List.of(
            new Feature(8, "Lambdas"),
            new Feature(8, "java.util.function"),
            new Feature(8, "Method references"),
            new Feature(8, "Stream API"),
            new Feature(8, "Optional"),
            new Feature(8, "Default and static interface methods"),
            new Feature(9, "takeWhile / dropWhile / ofNullable"),
            new Feature(9, "List.of / Set.of / Map.of"),
            new Feature(9, "Optional.or / ifPresentOrElse / stream"),
            new Feature(9, "Private interface methods"),
            new Feature(10, "var for local variables"),
            new Feature(10, "Optional.orElseThrow()"),
            new Feature(10, "Collectors.toUnmodifiableList"),
            new Feature(11, "var in lambda parameters"),
            new Feature(11, "Predicate.not"),
            new Feature(11, "Optional.isEmpty"),
            new Feature(12, "Collectors.teeing"),
            new Feature(14, "Switch expressions"),
            new Feature(16, "Records"),
            new Feature(16, "Stream.toList()"),
            new Feature(16, "Stream.mapMulti"),
            new Feature(16, "Pattern matching for instanceof"),
            new Feature(17, "Sealed classes"),
            new Feature(21, "Pattern matching for switch"),
            new Feature(21, "Record patterns"),
            new Feature(21, "Sequenced collections"),
            new Feature(21, "Virtual threads")
    );

    private FeatureTimeline() {
    }

    /** Version -> feature names, versions in ascending order. */
    public static Map<Integer, List<String>> byVersion() {
        return FEATURES.stream()
                .collect(Collectors.groupingBy(
                        Feature::version,
                        TreeMap::new,
                        Collectors.mapping(Feature::name, Collectors.toList())));
    }

    public static void main(String[] args) {
        byVersion().forEach((version, names) ->
                System.out.printf("Java %-2d %s%n", version, String.join(", ", names)));
        System.out.println("Beyond Java 21: unnamed variables _ (Java 22), Stream Gatherers (Java 24)");
    }
}
