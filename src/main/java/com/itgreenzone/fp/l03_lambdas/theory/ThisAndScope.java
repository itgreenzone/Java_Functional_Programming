package com.itgreenzone.fp.l03_lambdas.theory;

import java.util.function.Supplier;

/**
 * Scope rules.
 * - In a lambda, 'this' means the ENCLOSING instance. A lambda does not create a new scope for names.
 * - In an anonymous class, 'this' means the anonymous object itself; it is a new scope.
 * - A lambda parameter cannot reuse the name of a local variable in the enclosing method:
 *   "variable id is already defined in method ...". An anonymous class method parameter can shadow it.
 */
public final class ThisAndScope {

    private final String name;

    public ThisAndScope(String name) {
        this.name = name;
    }

    public Supplier<String> lambdaThis() {
        return () -> this.name;                     // the enclosing ThisAndScope
    }

    public Supplier<String> anonymousThis() {
        return new Supplier<>() {
            private final String name = "anonymous object";

            @Override
            public String get() {
                return this.name;                   // the anonymous Supplier
            }
        };
    }

    public Supplier<String> lambdaToString() {
        return () -> toString();                    // calls ThisAndScope.toString()
    }

    public Supplier<String> anonymousToString() {
        return new Supplier<>() {
            @Override
            public String get() {
                return toString();                  // calls the anonymous class's toString()
            }

            @Override
            public String toString() {
                return "anonymous.toString()";
            }
        };
    }

    @Override
    public String toString() {
        return "ThisAndScope(" + name + ")";
    }

    public static void main(String[] args) {
        ThisAndScope service = new ThisAndScope("payment-service");
        System.out.println("lambda this.name       : " + service.lambdaThis().get());
        System.out.println("anonymous this.name    : " + service.anonymousThis().get());
        System.out.println("lambda toString()      : " + service.lambdaToString().get());
        System.out.println("anonymous toString()   : " + service.anonymousToString().get());
    }
}
