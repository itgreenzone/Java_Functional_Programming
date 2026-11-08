// L14 slide deck generator - ITGreenZone Java Functional Programming
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa");
const { applyTheme } = require("/root/.claude/skills/synced/2eb53c35-a0c8-4343-9257-776fcd7fed67_dd7dcff0-93ee-4601-a8ce-12573fa09cd9/pptx/scripts/apply_theme.js");

const OUT = process.argv[2] || "L14_ParallelStreams_Slides.pptx";
const LESSON = "14";
const FOOTER = `ITGreenZone · Java Functional Programming · Lesson ${LESSON}`;

const THEME = {
  name: "ITGreenZone FP",
  headFontFace: "Cambria",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "1A2421", lt1: "FFFFFF", dk2: "0E3B2E", lt2: "EAF4EE",
    accent1: "1E8E5A", accent2: "F2A93B", accent3: "2D6CDF", accent4: "C93C3C",
    accent5: "6B7D76", accent6: "15211C", hlink: "1E8E5A", folHlink: "0E3B2E",
  },
};
const HEX = THEME.colors;
const MONO = "Courier New";

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9"; // 10 x 5.625
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = "L14 Parallel Streams & Performance";
pres.author = "ITGreenZone";
pres.company = "ITGreenZone";
const C = pres.SchemeColor;

// ---------- layouts ----------
pres.defineSlideMaster({
  title: "DARK_TITLE",
  background: { color: C.text2 },
  objects: [
    { text: { text: FOOTER, options: { x: 0.5, y: 5.2, w: 7, h: 0.3, fontSize: 10, color: C.background2 } } },
    { placeholder: { options: { name: "title", type: "title", x: 0.5, y: 1.2, w: 5.2, h: 1.6, fontSize: 38, bold: true, color: C.background1, fontFace: THEME.headFontFace, valign: "top", align: "left", margin: 0 }, text: "" } },
  ],
});
pres.defineSlideMaster({
  title: "CONTENT",
  background: { color: C.background1 },
  objects: [
    { text: { text: FOOTER, options: { x: 0.5, y: 5.25, w: 6.5, h: 0.28, fontSize: 9, color: C.accent5 } } },
    { placeholder: { options: { name: "title", type: "title", x: 0.5, y: 0.25, w: 9, h: 0.65, fontSize: 28, bold: true, color: C.text2, fontFace: THEME.headFontFace, valign: "middle", align: "left", margin: 0 }, text: "" } },
  ],
  slideNumber: { x: 9.0, y: 5.25, w: 0.5, h: 0.28, fontSize: 9, color: C.accent5, align: "right" },
});

// ---------- helpers ----------
async function icon(Comp, color = "FFFFFF") {
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Comp, { color: "#" + color, size: 256 }));
  const png = await sharp(Buffer.from(svg)).resize(256, 256).png().toBuffer();
  return "image/png;base64," + png.toString("base64");
}
function iconCircle(slide, data, x, y, d, fill, name) {
  slide.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill }, line: { color: fill }, objectName: name + " circle" });
  const p = d * 0.25;
  slide.addImage({ data, x: x + p, y: y + p, w: d - 2 * p, h: d - 2 * p, objectName: name + " icon" });
}
function badge(slide, text, x, y, opts = {}) {
  const w = opts.w || 0.62;
  slide.addText(text, {
    shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.08, x, y, w, h: 0.24,
    fill: { color: opts.fill || C.accent2 }, line: { color: opts.fill || C.accent2 },
    fontSize: 9, bold: true, color: opts.color || C.text1, align: "center", valign: "middle", margin: 0,
    isTextBox: true, objectName: "badge " + text,
  });
}
function card(slide, x, y, w, h, fill, name) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color: fill }, line: { color: fill },
    shadow: { type: "outer", color: "000000", opacity: 0.12, blur: 4, offset: 1.5, angle: 90 }, objectName: name });
}

// Tiny Java highlighter -> pptxgenjs text runs
const KW = new Set("abstract boolean break case catch class default do double else enum extends final for if implements import int interface long new private protected public record return static switch this throw throws try var void while".split(" "));
const COL = { kw: "F78C6C", str: "C3E88D", com: "8FA89D", num: "F2C46D", meth: "82AAFF", type: "FFCB6B", def: "E8EFEB", ann: "C792EA" };
function highlight(code, fontSize = 11) {
  const lines = code.replace(/\n$/, "").split("\n");
  const runs = [];
  const re = /(\/\/.*$)|("(?:[^"\\]|\\.)*")|(@\w+)|(\b\d[\d.]*\b)|(\b[A-Za-z_]\w*\b)|(\s+)|(.)/g;
  lines.forEach((line, i) => {
    let m; const lineRuns = [];
    re.lastIndex = 0;
    while ((m = re.exec(line)) !== null) {
      let color = COL.def, italic = false;
      const t = m[0];
      if (m[1]) { color = COL.com; italic = true; }
      else if (m[2]) color = COL.str;
      else if (m[3]) color = COL.ann;
      else if (m[4]) color = COL.num;
      else if (m[5]) {
        const after = line.slice(re.lastIndex);
        if (KW.has(t)) color = COL.kw;
        else if (/^[A-Z]/.test(t)) color = COL.type;
        else if (/^\s*\(/.test(after) || line.slice(m.index - 2, m.index) === "::") color = COL.meth;
      }
      lineRuns.push({ text: t, options: { color, italic, fontFace: MONO, fontSize } });
    }
    if (lineRuns.length === 0) lineRuns.push({ text: " ", options: { fontFace: MONO, fontSize } });
    if (i < lines.length - 1) lineRuns[lineRuns.length - 1].options.breakLine = true;
    runs.push(...lineRuns);
  });
  return runs;
}
function codeBlock(slide, code, x, y, w, h, opts = {}) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.06, fill: { color: C.accent6 }, line: { color: C.accent6 }, objectName: (opts.name || "code") + " background" });
  if (opts.label) {
    slide.addText(opts.label, { x: x + 0.15, y: y + 0.06, w: w - 0.3, h: 0.26, fontSize: 10, bold: true, color: C.accent2, margin: 0, isTextBox: true, objectName: (opts.name || "code") + " label" });
  }
  const top = opts.label ? 0.34 : 0.1;
  slide.addText(highlight(code, opts.fontSize || 11), { x: x + 0.15, y: y + top, w: w - 0.3, h: h - top - 0.08, valign: "top", margin: 0, paraSpaceAfter: 0, lineSpacingMultiple: 1.0, isTextBox: true, objectName: (opts.name || "code") + " text" });
}
function outputBox(slide, text, x, y, w, h, name = "output") {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.05, fill: { color: C.background2 }, line: { color: C.accent1, width: 1 }, objectName: name + " background" });
  slide.addText([{ text: "OUTPUT  ", options: { bold: true, color: C.accent1, fontFace: THEME.bodyFontFace, fontSize: 10 } },
    { text, options: { fontFace: MONO, fontSize: 10.5, color: C.text1 } }],
    { x: x + 0.12, y, w: w - 0.24, h, valign: "middle", margin: 0, isTextBox: true, objectName: name + " text" });
}
function bullets(items, size = 14, color) {
  return items.map((it, i) => {
    const runs = Array.isArray(it) ? it : [{ text: it }];
    return runs.map((r, j) => ({ text: r.text, options: Object.assign({ fontSize: size, color: color || C.text1, bullet: j === 0 ? true : undefined, paraSpaceAfter: 6, breakLine: j === runs.length - 1 && i < items.length - 1 }, r.options || {}) }));
  }).flat();
}

const notes = [];
function newSlide(master, section, title) {
  const s = pres.addSlide({ masterName: master, sectionTitle: section });
  if (title) s.addText(title, { placeholder: "title" });
  return s;
}

(async () => {
  const I = {
    check: await icon(fa.FaCheck), code: await icon(fa.FaCode), plus: await icon(fa.FaThumbsUp),
    minus: await icon(fa.FaExclamationTriangle), rocket: await icon(fa.FaRocket), bug: await icon(fa.FaBug),
  };
  const tbl = (s, head, rows, x, y, w, colW, rowH, name, monoCols = [0], fs = 10.5) => {
    const h = head.map(t => ({ text: t, options: { bold: true, color: C.background1, fill: { color: C.text2 } } }));
    const r = rows.map((row, i) => row.map((c, j) => ({ text: c, options: Object.assign({ fill: { color: i % 2 ? C.background1 : C.background2 }, color: C.text1, fontSize: fs }, monoCols.includes(j) ? { fontFace: MONO, fontSize: fs - 0.5, bold: j === 0 } : {}) })));
    s.addTable([h, ...r], { x, y, w, colW, rowH, border: { type: "solid", pt: 0.5, color: "D5E3DA" }, valign: "middle", margin: [2, 5, 2, 5], objectName: name });
  };
  const note = (s, text, y, color, name) => s.addText(text, { x: 0.5, y, w: 9, h: 0.4, fontSize: 12.5, italic: true, color: color || C.text2, margin: 0, isTextBox: true, objectName: name });
  const box = (s, x, y, w, h, title, sub, fill, name) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color: fill }, line: { color: fill }, objectName: name });
    s.addText([{ text: title, options: { bold: true, fontSize: 13, breakLine: true } }, { text: sub, options: { fontSize: 10, fontFace: MONO } }], { x, y, w, h, color: C.background1, align: "center", valign: "middle", margin: 2, isTextBox: true, objectName: name + " text" });
  };
  const arrow = (s, x1, y1, x2, y2, label, name, up) => {
    s.addShape(pres.shapes.LINE, { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1) || 0.01, h: Math.abs(y2 - y1) || 0.01, flipH: x2 < x1, flipV: y2 < y1, line: { color: C.text2, width: 1.5, endArrowType: "triangle" }, objectName: name });
    s.addText(label, { x: Math.min(x1, x2), y: (up ? Math.min(y1, y2) - 0.3 : Math.max(y1, y2) + 0.02), w: Math.abs(x2 - x1), h: 0.28, fontSize: 9.5, fontFace: MONO, color: C.text2, align: "center", margin: 0, isTextBox: true, objectName: name + " label" });
  };


  // ===== 1 Title =====
  pres.addSection({ title: "Introduction" });
  let s = newSlide("DARK_TITLE", "Introduction", "Parallel Streams & Performance");
  s.addText("LESSON 14  ·  MODULE 2", { x: 0.5, y: 0.6, w: 5.5, h: 0.35, fontSize: 12, bold: true, color: C.accent2, charSpacing: 2, margin: 0, isTextBox: true, objectName: "kicker" });
  s.addText("Spliterator · commonPool · when parallel helps or hurts · thread-safety · findAny · measuring · virtual threads", { x: 0.5, y: 2.95, w: 5.0, h: 0.8, fontSize: 15, italic: true, color: C.background2, margin: 0, isTextBox: true, objectName: "subtitle" });
  card(s, 6.0, 0.6, 3.5, 4.3, "143F32", "objectives card");
  s.addText("You will be able to", { x: 6.25, y: 0.75, w: 3.1, h: 0.35, fontSize: 14, bold: true, color: C.accent2, margin: 0, isTextBox: true, objectName: "objectives heading" });
  ["Explain split, run, combine", "Decide when parallel can help", "Spot and fix thread-safety bugs", "Choose findFirst/findAny, forEachOrdered", "Measure properly; know virtual threads"].forEach((o, i) => {
    const y = 1.2 + i * 0.72;
    s.addText(String(i + 1), { shape: pres.shapes.OVAL, x: 6.25, y: y + 0.05, w: 0.36, h: 0.36, fill: { color: C.accent1 }, line: { color: C.accent1 }, fontSize: 12, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "objective number " + (i + 1) });
    s.addText(o, { x: 6.75, y, w: 2.6, h: 0.62, fontSize: 12.5, color: C.background1, valign: "middle", margin: 0, isTextBox: true, objectName: "objective " + (i + 1) });
  });
  s.addNotes("~2 min. Parallel streams look like a free speed-up: add one word and use every core. In practice they are often slower for small data, and they turn some innocent-looking code into wrong code. This lesson explains how parallel streams work, splitting, running on the common fork-join pool, and combining; when they can help and when they hurt; the thread-safety pitfalls; ordering, findFirst and findAny; and how to measure without fooling yourself. We finish with Java 21 context: virtual threads are for blocking I/O, not a replacement for parallel streams. Every printed result in this lesson is deterministic, except one demo that is meant to show a race. The exercise asks you to fix three broken parallel pipelines. DEMO: open package l14_parallel. Question: have you ever added parallel() and measured the result?");

  // ===== 2 Problem =====
  pres.addSection({ title: "How it works" });
  s = newSlide("CONTENT", "How it works", "The problem: \"just add parallel()\"");
  codeBlock(s, `payments.parallelStream().map(Payment::amount)
  .reduce(new BigDecimal("100.00"), BigDecimal::add);

payments.parallelStream()
  .filter(p -> p.amount().compareTo(LIMIT) > 0)
  .findAny().map(Payment::id);

List<String> ids = new ArrayList<>();
payments.parallelStream().filter(SUCCESS)
  .forEach(p -> ids.add(p.id()));`, 0.5, 1.05, 5.3, 3.3, { label: "exercise/Exercise14  ·  3 broken pipelines", fontSize: 10, name: "broken code" });
  tbl(s, ["Pipeline", "Expected", "One real run (2 cores)"], [
    ["float + total", "4529.84", "4829.84"],
    ["first over 500", "P005", "P008"],
    ["SUCCESS ids", "[P001, P002, P004, …]", "[P007, P009, P010, …]"],
  ], 6.0, 1.05, 3.5, [1.1, 1.1, 1.3], 0.75, "broken table", [], 10);
  note(s, "They compile, run, and look plausible. On another machine the wrong values may differ, which is worse.", 4.5, C.accent4, "broken note");
  s.addNotes("~3 min. Three pipelines from the exercise. The first adds an opening float of one hundred to the payment total by using it as the identity of reduce. The second wants the first payment over five hundred but uses findAny. The third fills a shared ArrayList from forEach. On a two-core sandbox one real run printed 4,829.84 instead of 4,529.84, P008 instead of P005, and the right ids in the wrong order. The third can also lose elements or throw. Nothing failed to compile, nothing threw, and every value looks plausible, which is why these bugs reach production. On another machine the wrong values may be different, or even right by luck in a test. DEMO: run Exercise14 a few times. Question: which of the three would a code reviewer spot first?");

  // ===== 3 Split-run-combine =====
  s = newSlide("CONTENT", "How it works", "Split, run, combine");
  box(s, 0.5, 1.3, 1.9, 0.9, "Source", "Spliterator", C.text2, "src box");
  box(s, 2.9, 1.1, 1.4, 0.55, "chunk 1", "", C.accent1, "c1");
  box(s, 2.9, 1.75, 1.4, 0.55, "chunk 2", "", C.accent1, "c2");
  box(s, 4.8, 1.3, 2.0, 0.9, "commonPool", "+ caller thread", C.accent3, "pool box");
  box(s, 7.3, 1.3, 2.2, 0.9, "Combine", "combiner / reduce", C.accent5, "comb box");
  arrow(s, 2.4, 1.75, 2.9, 1.75, "", "a1", true);
  arrow(s, 4.3, 1.75, 4.8, 1.75, "", "a2", true);
  arrow(s, 6.8, 1.75, 7.3, 1.75, "", "a3", true);
  tbl(s, ["Fact (theory/HowParallelWorks)", "Real result"], [
    ["new ArrayList<>(16 items).spliterator().trySplit()", "8 + 8   (splits in half)"],
    ["new LinkedList<>(16 items).spliterator().trySplit()", "16 + 0  (copies a batch: no real split)"],
    ["ArrayList / List.of spliterator characteristics", "[ORDERED, SIZED, SUBSIZED]"],
    ["Stream.iterate(..).spliterator().estimateSize()", "Long.MAX_VALUE (unknown size)"],
  ], 0.5, 2.55, 9.0, [5.0, 4.0], 0.42, "facts table", [0], 10.5);
  s.addNotes("~3 min. A parallel stream does three things. First, it asks the source's Spliterator to split itself, again and again, into chunks. Second, it runs the chunks as tasks on the common ForkJoinPool, and the calling thread joins in. Third, it combines partial results, using the combiner of a collector or the operator of reduce. Splitting quality decides a lot. An ArrayList of sixteen elements splits exactly in half, eight and eight. A LinkedList cannot jump to its middle, so its first split copies a batch into an array, here all sixteen, leaving nothing on the other side. Stream.iterate has an unknown size, which splits poorly. SIZED and SUBSIZED characteristics let the framework split precisely. DEMO: run HowParallelWorks. Question: why are arrays and ArrayLists the best sources?");

  // ===== 4 commonPool & control =====
  s = newSlide("CONTENT", "How it works", "The common pool and the parallel flag");
  tbl(s, ["Fact", "Real result"], [
    ["ForkJoinPool.commonPool().getParallelism() == max(1, cores - 1)", "true (default)"],
    ["payments.stream().parallel().filter(..).sequential().isParallel()", "false: last call wins"],
    ["threads seen by a parallel forEach", "caller + ForkJoinPool.commonPool-worker-* only"],
    ["parallel stream worker isVirtual()", "false: platform threads"],
  ], 0.5, 1.0, 9.0, [5.6, 3.4], 0.45, "pool table", [0], 10.5);
  card(s, 0.5, 3.4, 9.0, 1.45, C.background2, "pool card");
  s.addText([{ text: "One pool for the whole JVM. ", options: { bold: true, color: C.accent4 } },
    { text: "Every parallel stream in your application, and CompletableFuture's async methods without an executor, share commonPool. A blocking call inside a parallel stream (HTTP, JDBC, sleep) parks a worker that everybody else needs. Size it with -Djava.util.concurrent.ForkJoinPool.common.parallelism only after measuring." }],
    { x: 0.7, y: 3.45, w: 8.6, h: 1.35, fontSize: 12.5, color: C.text1, margin: 0, valign: "middle", isTextBox: true, objectName: "pool text" });
  s.addNotes("~3 min. Four facts, all printed by the code. The common pool's parallelism defaults to the number of cores minus one, because the calling thread also works. parallel and sequential are not per-operation switches: they set one flag for the whole pipeline, and the last call wins, so a pipeline that says parallel, filter, sequential runs entirely sequentially. The work runs only on the caller and the common-pool workers, which are ordinary platform threads. The important consequence: there is one common pool per JVM, shared by every parallel stream and by CompletableFuture's async methods without an executor. A blocking call inside a parallel stream parks a worker that the whole application needs. DEMO: run HowParallelWorks, last lines. Question: what happens to other requests if one parallel stream calls a slow REST API?");

  // ===== 5 When it helps =====
  pres.addSection({ title: "When to use it" });
  s = newSlide("CONTENT", "When to use it", "When parallel can help, and when it hurts");
  tbl(s, ["Helps when…", "Hurts when…"], [
    ["N × Q is large (many elements × real work each)", "small data: splitting and merging cost more than the work"],
    ["source splits well: arrays, ArrayList, ranges", "LinkedList, Stream.iterate, I/O lines"],
    ["pure functions, no shared mutable state", "shared state: wrong results, or locks that serialise"],
    ["CPU-bound work (maths, parsing in memory)", "blocking I/O: HTTP, JDBC, files"],
    ["unordered or cheap-to-combine results", "limit, findFirst, sorted, forEachOrdered on big data"],
    ["primitive streams (no boxing)", "boxing Integer/Double in hot loops"],
  ], 0.5, 1.0, 9.0, [4.5, 4.5], 0.4, "help table", [], 11);
  codeBlock(s, `verdict(new Pipeline(12, 1, ARRAY_OR_ARRAYLIST, ..))         // NOT parallel(): [N x Q = 12 is too small]
verdict(new Pipeline(5_000_000, 200, ARRAY_OR_ARRAYLIST, ..)) // CANDIDATE: measure with JMH, then decide`, 0.5, 3.95, 9.0, 0.95, { label: "theory/ParallelDecision  ·  a checklist, not a benchmark", fontSize: 9, name: "decision code" });
  s.addNotes("~3 min. The usual guidance in one table. Parallel can help when the number of elements times the cost per element is large, Doug Lea's N times Q model; when the source splits well, like arrays, ArrayLists and ranges; when functions are pure with no shared state; for CPU-bound work; when results combine cheaply; and with primitive streams. It hurts with small data, poorly splitting sources such as LinkedList or iterate, shared state, blocking I/O, order-sensitive operations like limit or findFirst on large data, and boxing. ParallelDecision encodes this as a small, testable checklist: twelve payments are too small; five million prices with real maths are only a candidate, to be measured. It is a checklist, not a benchmark. DEMO: run ParallelDecision. Question: where would your largest in-memory calculation land?");

  // ===== 6 Ordering =====
  s = newSlide("CONTENT", "When to use it", "Ordering, findFirst vs findAny, unordered()");
  tbl(s, ["Operation in parallel (theory/OrderingAndFindAny)", "Real result", "Guarantee"], [
    ["parallelStream().map(id).toList()", "equals the list order: true", "encounter order kept"],
    ["parallelStream().forEach(seen::add)", "same 12 ids, any order: true", "no order"],
    ["parallelStream().forEachOrdered(seen::add)", "list order: true", "order, but serialises the action"],
    ["filter(> 500).findFirst()", "P005 (always)", "first in encounter order"],
    ["filter(> 500).findAny()", "one of [P005, P008, P010]", "any match: cheaper"],
    ["unordered().filter(SUCCESS).limit(3)", "3 SUCCESS ids: true", "any 3, not the first 3"],
  ], 0.5, 1.0, 9.0, [3.9, 2.6, 2.5], 0.45, "order table", [0], 10);
  note(s, "Order is kept by collect/toList and findFirst. Ask for less (findAny, unordered) only when the business rule allows it.", 4.3, C.text2, "order note");
  s.addNotes("~3 min. Ordering rules in parallel. Collect and toList always keep encounter order, even in parallel, because each chunk's result is placed in order when combined. forEach makes no ordering promise: the same twelve ids arrive, in any order. forEachOrdered restores encounter order but runs the action one element at a time, which throws away much of the parallelism. findFirst must return the first match in encounter order, so it is always P005 here, and it may wait for earlier chunks. findAny may return any match, which is cheaper, but the business rule must allow it. unordered tells the framework that order does not matter, so limit and distinct can take any elements. DEMO: run OrderingAndFindAny. Question: does 'the first payment over 500' allow findAny?");

  // ===== 7 Shared state race =====
  pres.addSection({ title: "Thread safety" });
  s = newSlide("CONTENT", "Thread safety", "Shared mutable state: a real race");
  codeBlock(s, `List<Integer> shared = new ArrayList<>();
IntStream.range(0, 100_000).parallel()
    .forEach(shared::add);         // DATA RACE
shared.size();`, 0.5, 1.05, 4.5, 1.6, { label: "theory/RaceDemo  ·  non-deterministic on purpose", fontSize: 10, name: "race code" });
  outputBox(s, "run 1: 95301 · run 2: 94292 · run 3: 100000   (of 100000)", 0.5, 2.8, 4.5, 0.55, "race output");
  codeBlock(s, `List<Integer> safe = IntStream.range(0, 100_000)
    .parallel()
    .boxed()
    .toList();
// always 100000, in order`, 5.2, 1.05, 4.3, 1.6, { label: "SAFE  ·  let collect build it", fontSize: 10, name: "safe code" });
  outputBox(s, "toList() in parallel, 100000 : 100000 in order=true", 5.2, 2.8, 4.3, 0.55, "safe output");
  tbl(s, ["Do not", "Instead"], [
    ["forEach(list::add) / map.put from many threads", "collect / toList / groupingBy"],
    ["Collections.synchronizedList + forEach", "collect (no lock contention)"],
    ["++ on a field or array slot in a lambda", "count(), sum(), reduce with an identity"],
  ], 0.5, 3.55, 9.0, [4.8, 4.2], 0.36, "race table", [0, 1], 10);
  s.addNotes("~3 min. Here is the race for real. One hundred thousand numbers added to a shared ArrayList from a parallel forEach. Three runs on the sandbox printed 95,301, then 94,292, then 100,000. Elements are lost when two threads write the same slot, and sometimes an ArrayIndexOutOfBoundsException appears while the list resizes. That third run is the dangerous one: a test can pass by luck. Because the output changes every run, RaceDemo is the one class excluded from the golden-file test. The fix is not a synchronized list, which is correct but makes threads queue for a lock. Let the stream build the result: toList, collect or groupingBy give each thread its own container and merge them in order. DEMO: run RaceDemo three times. Question: why can the third run be correct?");

  // ===== 8 Reduce rules =====
  s = newSlide("CONTENT", "Thread safety", "reduce in parallel: associativity and identity");
  tbl(s, ["Code (theory/ThreadSafetyPitfalls)", "Sequential", "Parallel"], [
    ["IntStream.rangeClosed(1, 10).reduce(0, (a, b) -> a - b)", "-55", "different (not associative)"],
    ["IntStream.rangeClosed(1, 10).reduce(10, Integer::sum)", "65", "more than 65 (10 added per chunk)"],
    ["10 + IntStream.rangeClosed(1, 10).sum()", "65", "65"],
    ["payments.map(amount).reduce(ZERO, BigDecimal::add)", "4429.84", "equal: true"],
  ], 0.5, 1.0, 9.0, [5.0, 1.4, 2.6], 0.48, "reduce table", [0], 10.5);
  card(s, 0.5, 3.5, 4.4, 1.35, C.background2, "rule card");
  s.addText([{ text: "The two rules", options: { bold: true, color: C.text2, breakLine: true } },
    { text: "op is associative: (a op b) op c == a op (b op c)", options: { bullet: true, breakLine: true } },
    { text: "identity is neutral: identity op x == x", options: { bullet: true } }],
    { x: 0.65, y: 3.55, w: 4.15, h: 1.25, fontSize: 12, color: C.text1, margin: 0, valign: "middle", isTextBox: true, objectName: "rule text" });
  card(s, 5.1, 3.5, 4.4, 1.35, "FBECEC", "double card");
  s.addText([{ text: "double sums", options: { bold: true, color: C.accent4, breakLine: true } },
    { text: "Floating-point + is not exactly associative (L12: 0.6000000000000001 vs 0.6), so parallel double sums can change in the last digits." }],
    { x: 5.25, y: 3.55, w: 4.15, h: 1.25, fontSize: 12, color: C.text1, margin: 0, valign: "middle", isTextBox: true, objectName: "double text" });
  s.addNotes("~3 min. reduce in parallel computes partial results per chunk and then combines them, so the operator must be associative and the identity must be neutral. Subtraction is not associative: sequentially one to ten gives minus fifty-five, in parallel a different number. Using a starting value of ten as the identity gives sixty-five sequentially, but in parallel ten is added once per chunk, so the result is larger. The fix is a neutral identity and adding the starting value once: sixty-five both ways. BigDecimal addition is exact and associative, so the payment total is equal in parallel. Doubles are the trap in between: addition is almost associative, so parallel sums can differ in the last digits, as L12 showed. DEMO: run ThreadSafetyPitfalls. Question: is string concatenation associative?");

  // ===== 9 Measuring =====
  pres.addSection({ title: "Measuring" });
  s = newSlide("CONTENT", "Measuring", "Measuring properly: JMH, not nanoTime");
  codeBlock(s, `@BenchmarkMode(Mode.AverageTime)
@Warmup(iterations = 5) @Measurement(iterations = 10)
@Fork(2) @State(Scope.Benchmark)
public class FeeBenchmark {
  List<BigDecimal> amounts;     // realistic size
  @Setup public void load() { amounts = ..; }

  @Benchmark public BigDecimal sequential() {
    return amounts.stream().map(Fees::fee)
        .reduce(ZERO, BigDecimal::add);
  }
  @Benchmark public BigDecimal parallel() {
    return amounts.parallelStream().map(Fees::fee)
        .reduce(ZERO, BigDecimal::add);
  }
}`, 0.5, 1.05, 5.9, 3.5, { label: "JMH sketch  ·  not part of this repo's build", fontSize: 9.5, name: "jmh code" });
  card(s, 6.6, 1.05, 2.9, 3.5, C.background2, "measure card");
  s.addText([{ text: "Why not nanoTime once?", options: { bold: true, color: C.text2, fontSize: 14, breakLine: true } },
    { text: "JIT warm-up changes speed", options: { bullet: true, breakLine: true } },
    { text: "dead-code elimination", options: { bullet: true, breakLine: true } },
    { text: "GC and other processes", options: { bullet: true, breakLine: true } },
    { text: "core count differs in prod", options: { bullet: true, breakLine: true } },
    { text: "Return results; use realistic data; compare on the target machine.", options: { breakLine: true } }],
    { x: 6.75, y: 1.15, w: 2.65, h: 3.3, fontSize: 12, color: C.text1, margin: 0, valign: "top", paraSpaceAfter: 5, isTextBox: true, objectName: "measure text" });
  s.addNotes("~3 min. This course makes no timing claims, on purpose. A single System.nanoTime measurement around a stream mostly measures JIT warm-up, garbage collection and whatever else the machine is doing; the JIT may even remove work whose result is never used. The Java Microbenchmark Harness, JMH, handles warm-up iterations, multiple forks, and blackholes, and reports averages with error margins. The sketch shows the shape of a benchmark comparing a sequential and a parallel fee total; it is not part of this repository's build, because our sandbox cannot download JMH. Rules: return the result, use realistic data sizes, run on hardware like production, and decide from numbers, not intuition. DEMO: none; show the JMH sketch. Question: why must a benchmark method return its result?");

  // ===== 10 Virtual threads =====
  s = newSlide("CONTENT", "Measuring", "Java 21 context: virtual threads are for I/O [21]");
  codeBlock(s, `try (ExecutorService ex = Executors.newVirtualThreadPerTaskExecutor()) {
  List<Future<String>> futures = payments.stream()
      .map(p -> ex.submit(() -> enrich(p)))    // blocking call (sleeps 5 ms)
      .toList();                               // submit all first ...
  return futures.stream().map(this::join).toList();   // ... then wait, in order
}
// 12 results, in order=true, all virtual=true · parallel stream workers: platform`, 0.5, 1.05, 9.0, 2.0, { label: "theory/VirtualThreadsContext", fontSize: 10, name: "vt code" });
  tbl(s, ["", "Parallel stream [8]", "Virtual threads [21]"], [
    ["Best for", "CPU work on in-memory data", "many blocking tasks (HTTP, JDBC)"],
    ["Threads", "few platform threads (commonPool)", "one cheap virtual thread per task"],
    ["Blocking inside", "starves the shared pool", "fine: the carrier thread is released"],
    ["Speeds up", "computation, if N × Q is large", "throughput of waiting tasks"],
  ], 0.5, 3.2, 9.0, [1.6, 3.7, 3.7], 0.36, "vt table", [], 10.5);
  s.addNotes("~3 min. Java 21 made virtual threads final, and people ask whether they replace parallel streams. They do not; they solve a different problem. Virtual threads make blocking cheap: each task gets its own virtual thread, and while it waits for I/O the carrier thread runs something else. The example enriches the twelve payments with a fake remote call that sleeps five milliseconds: all twelve results come back in order and all ran on virtual threads. Note the two steps: submit every task first, since toList is eager, then wait for each future. Parallel streams use a few platform threads for CPU work on data already in memory; blocking inside them starves the shared pool. DEMO: run VirtualThreadsContext. Question: which would you use to call a pricing API for ten thousand trades?");

  // ===== 11 Worked example =====
  pres.addSection({ title: "Worked example" });
  s = newSlide("CONTENT", "Worked example", "Refactor: fee report that is correct in parallel");
  codeBlock(s, `txns.parallelStream()
  .filter(t -> t.type() == DEBIT
            && t.currency().equals("SGD"))
  .collect(groupingBy(
      Transaction::category,
      () -> new EnumMap<>(Category.class),
      mapping(t -> fee(t.amount()),
              toList())));
// pure fee(), no shared state:
// safe in parallel`, 0.5, 1.05, 4.5, 3.4, { label: "AFTER  ·  Java 8  ·  parallel collect", fontSize: 9.5, name: "after code" });
  codeBlock(s, `txns.parallelStream().unordered()
  .filter(..SGD debits..)
  .collect(groupingByConcurrent(
      Transaction::category,
      teeing(counting(),
             reducing(ZERO, t -> fee(..),
                      BigDecimal::add),
             (n, total) -> ..)))
  .entrySet().stream()
  .sorted(comparingByKey())   // order
  .map(..CategoryFees::line)  // at the edge`, 5.2, 1.05, 4.3, 3.4, { label: "MODERN  ·  groupingByConcurrent + teeing", fontSize: 9.5, name: "modern code" });
  outputBox(s, "All 3, every run: TRANSFER: 8 debits, fees 17.97 · GROCERIES: 7, 3.69 · DINING: 10, 5.00 … INSURANCE: 5, 3.16 · TOTAL FEES 42.95", 0.5, 4.55, 9.0, 0.5, "ba output");
  s.addNotes("~3 min. The worked example: a processing fee of 0.25 percent, minimum fifty cents, on every SGD debit, totalled per category. The before version is a plain loop. The Java 8 version runs in parallel safely because nothing is shared: the fee function is pure, and collect with groupingBy gives each thread its own map and merges them. The modern version says unordered, then uses groupingByConcurrent, which fills one ConcurrentMap instead of merging many, with teeing for the count and the total. Because a concurrent map has no order, it sorts at the edge, just before printing. For forty-three debits none of this is faster; the point is that it is correct. The test runs both parallel versions twenty times and compares them with the loop. DEMO: run ModernFeeReport. Question: why sort only at the end?");

  // ===== 12 Pitfalls =====
  s = newSlide("CONTENT", "Worked example", "Pitfalls and best practices");
  const pits = [["parallel() by default", "Slower for small data; shares one pool."], ["Shared ArrayList / HashMap in forEach", "Lost elements, exceptions, flaky tests."], ["reduce with a starting value as identity", "Added once per chunk."], ["findAny where the first is required", "Different answer per run."], ["Blocking I/O in a parallel stream", "Starves commonPool for the whole app."]];
  pits.forEach(([h, d], i) => {
    const y = 1.0 + i * 0.8;
    card(s, 0.5, y, 4.6, 0.7, "FBECEC", "pit " + i);
    iconCircle(s, I.bug, 0.6, y + 0.14, 0.42, C.accent4, "pit icon " + i);
    s.addText([{ text: h, options: { bold: true, color: C.accent4, breakLine: true } }, { text: d, options: { fontSize: 11, color: C.text1 } }], { x: 1.12, y: y + 0.02, w: 3.9, h: 0.66, fontSize: 12.5, margin: 0, valign: "middle", isTextBox: true, objectName: "pit text " + i });
  });
  const dos = ["Sequential by default; parallel by evidence", "Pure functions, no shared mutable state", "collect / toList / groupingBy, not forEach", "Associative op + neutral identity", "findFirst when order matters", "JMH on realistic data; virtual threads for I/O"];
  card(s, 5.3, 1.0, 4.2, 3.9, C.background2, "do card");
  iconCircle(s, I.check, 5.45, 1.12, 0.45, C.accent1, "do icon");
  s.addText("Best practices", { x: 6.05, y: 1.12, w: 3.3, h: 0.45, fontSize: 15, bold: true, color: C.accent1, margin: 0, valign: "middle", isTextBox: true, objectName: "do title" });
  s.addText(bullets(dos, 12.5).map(r => { r.options.paraSpaceAfter = 7; return r; }), { x: 5.5, y: 1.7, w: 3.9, h: 3.1, margin: 0, valign: "top", isTextBox: true, objectName: "do list" });
  s.addNotes("~3 min. Five pitfalls. Making streams parallel by default slows down small workloads and puts load on the one shared pool. Shared lists or maps filled from forEach lose elements and make tests flaky. A starting value passed as the identity of reduce is added once per chunk. findAny where the business needs the first gives a different answer per run. Blocking I/O inside a parallel stream starves the common pool for the whole application. The habits: sequential by default and parallel only with evidence; pure functions with no shared mutable state; let collect, toList and groupingBy build results; an associative operator with a neutral identity; findFirst when order matters; and JMH on realistic data, with virtual threads for I/O. DEMO: run ParallelTest. Question: which pitfall does a unit test catch least reliably?");

  // ===== 13 Interview =====
  pres.addSection({ title: "Practice" });
  s = newSlide("CONTENT", "Practice", "Interview questions");
  const qa = [
    ["Which thread pool do parallel streams use?", "ForkJoinPool.commonPool(), plus the calling thread."],
    ["Why can parallel be slower?", "Split/merge overhead, poor splitting, boxing, ordering, small N × Q."],
    ["What must a reduce operator satisfy?", "Associative, stateless, non-interfering; identity must be neutral."],
    ["findFirst vs findAny?", "findFirst respects encounter order; findAny may return any match (cheaper)."],
    ["Parallel streams or virtual threads?", "CPU-bound in-memory data → parallel streams; many blocking I/O tasks → virtual threads [21]."],
  ];
  qa.forEach(([q, a], i) => {
    const colI = i % 2, row = Math.floor(i / 2);
    const x = i === 4 ? 0.5 : 0.5 + colI * 4.6, y = 1.0 + row * 1.38, w = i === 4 ? 9.0 : 4.4;
    card(s, x, y, w, 1.22, C.background2, "qa card " + i);
    s.addText("Q" + (i + 1), { shape: pres.shapes.OVAL, x: x + 0.12, y: y + 0.14, w: 0.42, h: 0.42, fill: { color: C.text2 }, line: { color: C.text2 }, fontSize: 11, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "q badge " + i });
    s.addText([{ text: q, options: { bold: true, color: C.text2, breakLine: true } }, { text: a, options: { color: C.text1, fontSize: 12 } }], { x: x + 0.65, y: y + 0.06, w: w - 0.8, h: 1.1, fontSize: 13.5, margin: 0, valign: "middle", isTextBox: true, objectName: "qa text " + i });
  });
  s.addNotes("~3 min. Five common questions. For the first, a strong answer mentions that the calling thread participates and that the pool is shared JVM-wide. For the second, listen for concrete reasons rather than 'threads are expensive': split and merge overhead, poorly splitting sources, boxing, order-sensitive operations, small workloads. The third checks the reduce contract: associative, stateless, non-interfering, with a neutral identity; ask for a counter-example such as subtraction. The fourth is about semantics, not speed. The fifth is the modern question; a senior answer explains that blocking inside a parallel stream starves the common pool, and that virtual threads make waiting cheap but do not add CPU. DEMO: run QuizAnswersTest. Question: which answer would you expect from a junior developer?");

  // ===== 14 Pros/cons =====
  s = newSlide("CONTENT", "Practice", "Pros and cons of parallel streams");
  const pros = ["One word to use all cores", "Same pipeline code as sequential", "Good for large CPU-bound data", "collect/reduce merge results safely", "Arrays and ranges split well", "No manual thread management"];
  const consL = ["Overhead dominates small data", "One shared pool for the whole JVM", "Shared state gives wrong results", "Order-sensitive ops cost extra", "Blocking I/O starves the pool", "Needs real measurement (JMH)"];
  [[pros, "Pros", C.accent1, I.plus, 0.5, C.background2], [consL, "Cons / limitations", C.accent4, I.minus, 5.1, "FBECEC"]].forEach(([list, h, colr, ic, x, bg]) => {
    card(s, x, 1.0, 4.4, 3.65, bg, h + " card");
    iconCircle(s, ic, x + 0.2, 1.15, 0.5, colr, h);
    s.addText(h, { x: x + 0.85, y: 1.15, w: 3.3, h: 0.5, fontSize: 18, bold: true, color: colr, margin: 0, valign: "middle", isTextBox: true, objectName: h + " heading" });
    s.addText(bullets(list, 14).map(r => { r.options.paraSpaceAfter = 8; return r; }), { x: x + 0.25, y: 1.85, w: 3.95, h: 2.7, margin: 0, valign: "top", isTextBox: true, objectName: h + " list" });
  });
  s.addNotes("~2 min. A balanced view. On the plus side: one word can use all cores; the pipeline code stays the same as the sequential version; large CPU-bound workloads can genuinely speed up; collect and reduce merge partial results safely when the rules are followed; arrays and ranges split well; and there is no manual thread management. On the minus side: overhead dominates small data; one shared pool serves the whole JVM; shared mutable state gives wrong results; order-sensitive operations cost extra; blocking I/O starves the pool; and every decision needs real measurement. In most business applications the honest default is sequential, with parallel used in a few measured hot spots. DEMO: none. Question: where in your system is there a measured hot spot?");

  // ===== 15 Summary =====
  pres.addSection({ title: "Wrap-up" });
  s = newSlide("DARK_TITLE", "Wrap-up", "Summary");
  const sum = ["Split (Spliterator), run (commonPool), combine", "Helps: large N × Q, good source, pure CPU work", "Never share mutable state; let collect build results", "reduce: associative op, neutral identity", "findFirst/forEachOrdered keep order; findAny may not", "Measure with JMH; virtual threads [21] for I/O"];
  s.addText(bullets(sum, 14, C.background1), { x: 0.5, y: 2.1, w: 5.2, h: 2.9, margin: 0, valign: "top", isTextBox: true, objectName: "summary bullets" });
  card(s, 6.0, 0.6, 3.5, 2.05, "143F32", "exercise card");
  iconCircle(s, I.code, 6.2, 0.78, 0.45, C.accent2, "exercise");
  s.addText([{ text: "Exercise (~30 min)", options: { bold: true, color: C.accent2, breakLine: true } }, { text: "Exercise14: fix three broken parallel pipelines. Keep parallelStream(); the tests repeat 50 times.", options: { color: C.background1, fontSize: 12 } }],
    { x: 6.75, y: 0.75, w: 2.65, h: 1.8, fontSize: 14, margin: 0, valign: "top", isTextBox: true, objectName: "exercise text" });
  card(s, 6.0, 2.85, 3.5, 2.05, "143F32", "next card");
  iconCircle(s, I.rocket, 6.2, 3.03, 0.45, C.accent1, "next");
  s.addText([{ text: "Next: Lesson 15 (Module 3)", options: { bold: true, color: C.accent2, breakLine: true } }, { text: "Functional Programming Principles: pure functions, immutability, currying, composition.", options: { color: C.background1, fontSize: 12 } }],
    { x: 6.75, y: 3.0, w: 2.65, h: 1.8, fontSize: 14, margin: 0, valign: "top", isTextBox: true, objectName: "next text" });
  s.addNotes("~3 min. Recap: a parallel stream splits its source, runs chunks on the common pool and combines the results; it can help only with large CPU-bound workloads on well-splitting sources; shared mutable state is never acceptable, so let collect build results; reduce needs an associative operator and a neutral identity; findFirst and forEachOrdered keep order while findAny may not; and decisions come from JMH measurements, with virtual threads for blocking I/O. That closes Module 2. The exercise gives you three broken pipelines to fix while keeping parallelStream; the tests repeat each check fifty times, because a parallel bug can pass once by luck. Next, Module 3 starts with functional programming principles. DEMO: run Solution14. Question: which of the three bugs is the hardest to see in review?");

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
})();
