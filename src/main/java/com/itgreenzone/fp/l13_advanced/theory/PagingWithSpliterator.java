package com.itgreenzone.fp.l13_advanced.theory;

import com.itgreenzone.fp.data.SampleData;
import com.itgreenzone.fp.data.Transaction;

import java.util.Iterator;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Spliterator;
import java.util.Spliterators;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;

/**
 * Streaming a large result set page by page. A Stream over an Iterator via
 * StreamSupport.stream(Spliterators.spliteratorUnknownSize(..), false) [8] fetches pages lazily,
 * so a short-circuiting terminal (findFirst, limit, anyMatch) stops fetching early.
 * Java 9 alternative: Stream.iterate(page, ..) + takeWhile.
 */
public final class PagingWithSpliterator {

    private PagingWithSpliterator() {
    }

    /** A fake repository: returns one page of transactions per call and counts the calls ("round trips"). */
    public static final class TransactionPages {
        private final List<Transaction> rows;
        private final int pageSize;
        private final AtomicInteger fetches = new AtomicInteger();

        public TransactionPages(List<Transaction> rows, int pageSize) {
            this.rows = rows;
            this.pageSize = pageSize;
        }

        public List<Transaction> fetch(int page) {
            fetches.incrementAndGet();
            int from = page * pageSize;
            return from >= rows.size() ? List.of() : rows.subList(from, Math.min(rows.size(), from + pageSize));
        }

        public int fetches() {
            return fetches.get();
        }
    }

    /** An Iterator over all rows that fetches the next page only when the current one is used up. */
    static Iterator<Transaction> iterator(TransactionPages pages) {
        return new Iterator<>() {
            private int page;
            private Iterator<Transaction> current = pages.fetch(0).iterator();

            @Override
            public boolean hasNext() {
                if (!current.hasNext()) {
                    List<Transaction> next = pages.fetch(++page);
                    current = next.iterator();
                }
                return current.hasNext();
            }

            @Override
            public Transaction next() {
                if (!hasNext()) {
                    throw new NoSuchElementException();
                }
                return current.next();
            }
        };
    }

    /** Iterator -> Spliterator -> Stream. ORDERED: rows come in page order. false = sequential. */
    public static Stream<Transaction> stream(TransactionPages pages) {
        return StreamSupport.stream(
                Spliterators.spliteratorUnknownSize(iterator(pages), Spliterator.ORDERED | Spliterator.NONNULL),
                false);
    }

    /** Java 9 alternative without writing an Iterator: page numbers, takeWhile non-empty, flatten. */
    public static Stream<Transaction> streamWithTakeWhile(TransactionPages pages) {
        return Stream.iterate(0, p -> p + 1)
                .map(pages::fetch)
                .takeWhile(page -> !page.isEmpty())
                .flatMap(List::stream);
    }

    public static void main(String[] args) {
        TransactionPages all = new TransactionPages(SampleData.transactions(), 25);
        System.out.println("count all rows          : " + stream(all).count() + " rows, fetches=" + all.fetches());

        TransactionPages first = new TransactionPages(SampleData.transactions(), 25);
        String id = stream(first).filter(t -> t.amount().signum() > 0).findFirst().map(Transaction::id).orElse("none");
        System.out.println("findFirst               : " + id + ", fetches=" + first.fetches());

        TransactionPages big = new TransactionPages(SampleData.transactions(), 25);
        long over1000 = stream(big).filter(t -> t.amount().compareTo(new java.math.BigDecimal("1000")) > 0).limit(2).count();
        System.out.println("first 2 over 1000.00    : " + over1000 + " found, fetches=" + big.fetches());

        TransactionPages tw = new TransactionPages(SampleData.transactions(), 25);
        System.out.println("iterate + takeWhile [9] : " + streamWithTakeWhile(tw).count() + " rows, fetches=" + tw.fetches());
    }
}
