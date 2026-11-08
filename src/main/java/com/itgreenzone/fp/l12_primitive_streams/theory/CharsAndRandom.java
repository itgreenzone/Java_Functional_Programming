package com.itgreenzone.fp.l12_primitive_streams.theory;

import com.itgreenzone.fp.data.Flight;
import com.itgreenzone.fp.data.SampleData;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.TreeMap;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * String.chars() [Java 8] gives an IntStream of UTF-16 code units; codePoints() [Java 8] gives real characters.
 * Random.ints / doubles [Java 8] give random primitive streams; a fixed seed makes them repeatable for tests.
 */
public final class CharsAndRandom {

    /** U+1F4B3 CREDIT CARD, written as its UTF-16 surrogate pair so the source stays ASCII. */
    static final String CARD_EMOJI = "\uD83D\uDCB3";

    private CharsAndRandom() {
    }

    /** chars() gives ints: print them and you see numbers, not letters. */
    public static List<Integer> rawChars(String s) {
        return s.chars().boxed().toList();
    }

    /** mapToObj(c -&gt; (char) c) turns them back into Characters. */
    public static List<Character> letters(String s) {
        return s.chars().mapToObj(c -> (char) c).toList();
    }

    /** Character frequency of all flight codes, sorted by character. */
    public static Map<Character, Long> charFrequency(List<String> words) {
        return words.stream()
                .flatMapToInt(String::chars)
                .mapToObj(c -> (char) c)
                .collect(Collectors.groupingBy(Function.identity(), TreeMap::new, Collectors.counting()));
    }

    /** Count digits vs letters with IntStream.filter and Character predicates. */
    public static String digitsAndLetters(List<String> words) {
        long digits = words.stream().flatMapToInt(String::chars).filter(Character::isDigit).count();
        long letters = words.stream().flatMapToInt(String::chars).filter(Character::isLetter).count();
        return digits + " digits, " + letters + " letters";
    }

    /** First non-repeated character, keeping encounter order with a LinkedHashMap. */
    public static String firstNonRepeated(String s) {
        return s.chars().mapToObj(c -> (char) c)
                .collect(Collectors.groupingBy(Function.identity(), LinkedHashMap::new, Collectors.counting()))
                .entrySet().stream()
                .filter(e -> e.getValue() == 1)
                .map(e -> String.valueOf(e.getKey()))
                .findFirst().orElse("none");
    }

    /** chars() counts UTF-16 units: an emoji outside the BMP is 2 chars but 1 code point. */
    public static String charsVsCodePoints(String s) {
        return "chars=" + s.chars().count() + " codePoints=" + s.codePoints().count();
    }

    /** Seeded Random: the same seed always gives the same sequence (the algorithm is specified). */
    public static List<Integer> diceRolls(long seed, int count) {
        return new Random(seed).ints(count, 1, 7).boxed().toList();
    }

    /** Simulated seat choice: 5 random seat numbers on a flight, without repeats. */
    public static List<Integer> randomDistinctSeats(long seed, Flight flight, int count) {
        return new Random(seed).ints(1, flight.seats() + 1).distinct().limit(count).sorted().boxed().toList();
    }

    public static void main(String[] args) {
        List<String> codes = SampleData.flights().stream().map(Flight::code).toList();
        System.out.println("\"SIN\".chars() boxed    : " + rawChars("SIN"));
        System.out.println("\"SIN\" as characters    : " + letters("SIN"));
        System.out.println("flight codes           : " + codes);
        System.out.println("char frequency         : " + charFrequency(codes));
        System.out.println("digits / letters       : " + digitsAndLetters(codes));
        System.out.println("first non-repeated     : " + firstNonRepeated("SINGAPORE AIRLINES") + "  (in SINGAPORE AIRLINES)");
        System.out.println("\"Pay \" + card emoji    : " + charsVsCodePoints("Pay " + CARD_EMOJI));
        System.out.println("dice, seed 42          : " + diceRolls(42, 6));
        System.out.println("dice, seed 42 again    : " + diceRolls(42, 6));
        System.out.println("5 seats on MH602 (seed 7): " + randomDistinctSeats(7, SampleData.flights().get(3), 5));
    }
}
