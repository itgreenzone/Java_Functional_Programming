package com.itgreenzone.fp.l02_functional_interfaces.theory;

import java.io.FileFilter;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.function.BinaryOperator;
import java.util.function.Predicate;
import java.util.function.UnaryOperator;

/**
 * Uses reflection to list the abstract methods that COUNT for the SAM rule:
 * abstract, and not one of the public methods of java.lang.Object.
 */
public final class SamInspector {

    private SamInspector() {
    }

    public static List<String> countedAbstractMethods(Class<?> type) {
        return Arrays.stream(type.getMethods())
                .filter(m -> Modifier.isAbstract(m.getModifiers()))
                .filter(m -> !isPublicObjectMethod(m))
                .map(Method::getName)
                .sorted()
                .toList();
    }

    public static boolean isFunctionalInterface(Class<?> type) {
        return type.isInterface() && countedAbstractMethods(type).size() == 1;
    }

    private static boolean isPublicObjectMethod(Method method) {
        try {
            Object.class.getMethod(method.getName(), method.getParameterTypes());
            return true;
        } catch (NoSuchMethodException notAnObjectMethod) {
            return false;
        }
    }

    public static void main(String[] args) {
        List<Class<?>> types = List.of(SamRules.FeeRule.class, Comparator.class, Runnable.class,
                Callable.class, FileFilter.class, Predicate.class, UnaryOperator.class,
                BinaryOperator.class, List.class);
        for (Class<?> type : types) {
            System.out.printf("%-14s functional=%-5s counted=%s%n",
                    type.getSimpleName(), isFunctionalInterface(type), countedAbstractMethods(type).stream().distinct().limit(3).toList());
        }
    }
}
