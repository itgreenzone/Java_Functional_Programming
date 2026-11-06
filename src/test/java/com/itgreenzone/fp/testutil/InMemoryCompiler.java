package com.itgreenzone.fp.testutil;

import javax.tools.Diagnostic;
import javax.tools.DiagnosticCollector;
import javax.tools.JavaCompiler;
import javax.tools.JavaFileObject;
import javax.tools.SimpleJavaFileObject;
import javax.tools.ToolProvider;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Locale;

/** Test helper: compiles a Java source string and returns the compiler error messages (empty = compiled). */
public final class InMemoryCompiler {

    private InMemoryCompiler() {
    }

    public static List<String> errors(String className, String source) {
        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        if (compiler == null) {
            throw new IllegalStateException("Run the tests on a JDK, not a JRE");
        }
        JavaFileObject file = new SimpleJavaFileObject(
                URI.create("string:///" + className + ".java"), JavaFileObject.Kind.SOURCE) {
            @Override
            public CharSequence getCharContent(boolean ignoreEncodingErrors) {
                return source;
            }
        };
        DiagnosticCollector<JavaFileObject> diagnostics = new DiagnosticCollector<>();
        try {
            Path out = Files.createTempDirectory("fp-compile");
            compiler.getTask(null, null, diagnostics, List.of("--release", "21", "-d", out.toString()), null, List.of(file)).call();
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
        return diagnostics.getDiagnostics().stream()
                .filter(d -> d.getKind() == Diagnostic.Kind.ERROR)
                .map(d -> d.getMessage(Locale.ENGLISH))
                .toList();
    }
}
