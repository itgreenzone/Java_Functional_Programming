// L06 slide deck generator - ITGreenZone Java Functional Programming
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa");
const { applyTheme } = require("/root/.claude/skills/synced/2eb53c35-a0c8-4343-9257-776fcd7fed67_dd7dcff0-93ee-4601-a8ce-12573fa09cd9/pptx/scripts/apply_theme.js");

const OUT = process.argv[2] || "L06_StreamFundamentals_Slides.pptx";
const LESSON = "06";
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
pres.title = "L06 Stream Fundamentals";
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
    check: await icon(fa.FaCheck), times: await icon(fa.FaTimes), code: await icon(fa.FaCode),
    plus: await icon(fa.FaThumbsUp), minus: await icon(fa.FaExclamationTriangle), rocket: await icon(fa.FaRocket),
    bug: await icon(fa.FaBug), db: await icon(fa.FaDatabase), stream: await icon(fa.FaStream),
  };

  // ===== 1 Title =====
  pres.addSection({ title: "Introduction" });
  let s = newSlide("DARK_TITLE", "Introduction", "Stream Fundamentals");
  s.addText("LESSON 06  ·  MODULE 2 STREAM API", { x: 0.5, y: 0.6, w: 5.5, h: 0.35, fontSize: 12, bold: true, color: C.accent2, charSpacing: 2, margin: 0, isTextBox: true, objectName: "kicker" });
  s.addText("Pipelines, laziness, sources and the full method map", { x: 0.5, y: 2.2, w: 5.0, h: 0.8, fontSize: 16, italic: true, color: C.background2, margin: 0, isTextBox: true, objectName: "subtitle" });
  card(s, 6.0, 0.6, 3.5, 4.3, "143F32", "objectives card");
  s.addText("You will be able to", { x: 6.25, y: 0.75, w: 3.1, h: 0.35, fontSize: 14, bold: true, color: C.accent2, margin: 0, isTextBox: true, objectName: "objectives heading" });
  ["Explain what a stream is, and is not", "Predict execution order: laziness and loop fusion", "Create streams from 10 different sources", "Name the properties: one-shot, stateful, short-circuit", "Place every operation on the method map"].forEach((o, i) => {
    const y = 1.2 + i * 0.72;
    s.addText(String(i + 1), { shape: pres.shapes.OVAL, x: 6.25, y: y + 0.05, w: 0.36, h: 0.36, fill: { color: C.accent1 }, line: { color: C.accent1 }, fontSize: 12, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "objective number " + (i + 1) });
    s.addText(o, { x: 6.75, y, w: 2.6, h: 0.62, fontSize: 12.5, color: C.background1, valign: "middle", margin: 0, isTextBox: true, objectName: "objective " + (i + 1) });
  });
  s.addNotes("~3 min. Welcome to Module 2, the Stream API, the heart of the course. Module 1 gave us the building blocks: lambdas, functional interfaces, method references and Optional. Now we put them to work. This lesson is about how streams behave rather than individual operations: what a stream really is, why nothing happens until a terminal operation runs, the order in which elements move through a pipeline, where streams come from, and the properties every developer must know: one-shot, stateful versus stateless, short-circuiting, encounter order and the parallel flag. We finish with the full method map, which is the reference for lessons 7 to 14. The exercise is a tracing exercise: you will predict printed output before running it, which is exactly what interviews test. Question to ask: in one sentence, what do you think a stream is?");

  // ===== 2 Problem =====
  pres.addSection({ title: "Theory" });
  s = newSlide("CONTENT", "Theory", "The problem: temporary lists and manual loops");
  codeBlock(s, `List<Transaction> october = new ArrayList<>();
for (Transaction t : txns)
    if (t.type() == DEBIT && t.date().getMonth() == OCTOBER)
        october.add(t);
Collections.sort(october, new Comparator<>() { ... });
List<String> result = new ArrayList<>();
for (int i = 0; i < october.size() && i < n; i++)
    result.add(october.get(i).id() + ...);`, 0.5, 1.05, 5.3, 2.9, { label: "BEFORE  ·  before/LegacyTopDebits", fontSize: 10, name: "legacy code" });
  codeBlock(s, `txns.stream()
    .filter(IS_DEBIT.and(IN_OCTOBER))
    .sorted(comparing(
        Transaction::amount)
        .reversed())
    .limit(n)
    .map(t -> new DebitLine(...))
    .toList();`, 6.0, 1.05, 3.5, 2.9, { label: "AFTER  ·  modern/ModernTopDebits", fontSize: 10, name: "stream code" });
  outputBox(s, "Top 3 October debits, all versions: T042 1432.93 · T057 962.80 · T050 903.91", 0.5, 4.1, 9.0, 0.45, "problem output");
  s.addText("Two temporary lists, an index loop and a manual limit become one readable pipeline: what, not how.", { x: 0.5, y: 4.65, w: 9, h: 0.4, fontSize: 13, italic: true, color: C.text2, margin: 0, isTextBox: true, objectName: "problem note" });
  s.addNotes("~3 min. The business question: what were the three largest debit transactions in October 2026? The legacy version builds a temporary list, filters into it, sorts it with an anonymous Comparator, then copies the first n into a second list with an index loop that has to guard against both the size and n. The stream version states the same requirement as a pipeline: debits in October, largest first, take n, turn each into a report line. Both produce T042 for 1,432.93, T057 for 962.80 and T050 for 903.91; TopDebitsRefactoringTest checks every version for n of 0, 1, 3, 10 and 100. But to use streams well you must know exactly what this pipeline does at run time. For example, does sorted run before or after the filter has seen every element? That is today's topic. Question: how many places in the legacy code could hide an off-by-one bug?");

  // ===== 3 What a stream is =====
  s = newSlide("CONTENT", "Theory", "What a stream is: a pipeline, not a container");
  const parts = [["SOURCE", "list.stream()", "Stream<Payment>", C.text2], ["INTERMEDIATE", ".filter(FAILED)", "Stream<Payment>", C.accent1], ["INTERMEDIATE", ".map(Payment::id)", "Stream<String>", C.accent1], ["TERMINAL", ".toList()", "List<String>", C.accent2]];
  parts.forEach(([h, c, t, col], i) => {
    const x = 0.5 + i * 2.32;
    s.addText([{ text: h, options: { bold: true, fontSize: 11, breakLine: true, charSpacing: 1 } }, { text: c, options: { fontFace: MONO, fontSize: 12, bold: true, breakLine: true } }, { text: t, options: { fontFace: MONO, fontSize: 10 } }],
      { shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.08, x, y: 1.05, w: 2.05, h: 1.05, fill: { color: col }, line: { color: col }, color: col === C.accent2 ? C.text1 : C.background1, align: "center", valign: "middle", margin: 3, isTextBox: true, objectName: "part " + i });
    if (i < 3) s.addShape(pres.shapes.RIGHT_ARROW, { x: x + 2.08, y: 1.45, w: 0.22, h: 0.26, fill: { color: C.accent5 }, line: { color: C.accent5 }, objectName: "part arrow " + i });
  });
  s.addText("exactly 1 source · 0..n intermediate operations (lazy, return a Stream) · exactly 1 terminal operation (runs it)", { x: 0.5, y: 2.2, w: 9, h: 0.35, fontSize: 12, italic: true, color: C.text2, margin: 0, isTextBox: true, objectName: "anatomy note" });
  const facts = [[I.db, "Stores nothing", "It describes a computation over a source."], [I.check, "Never changes its source", "12 payments before, 12 after filtering."], [I.times, "One-shot", "A second terminal op throws IllegalStateException."], [I.stream, "Possibly infinite", "iterate / generate need limit or a condition."]];
  facts.forEach(([ic, h, d], i) => {
    const x = 0.5 + i * 2.3;
    card(s, x, 2.7, 2.1, 1.75, C.background2, "fact " + h);
    iconCircle(s, ic, x + 0.15, 2.85, 0.45, C.accent1, h);
    s.addText([{ text: h, options: { bold: true, color: C.text2, breakLine: true } }, { text: d, options: { fontSize: 11.5 } }], { x: x + 0.15, y: 3.35, w: 1.85, h: 1.05, fontSize: 13, color: C.text1, margin: 0, valign: "top", isTextBox: true, objectName: "fact text " + i });
  });
  outputBox(s, "failed: [P003, P012] · source still has 12 · reuse → IllegalStateException", 0.5, 4.6, 9.0, 0.45, "what output");
  s.addNotes("~3 min. A stream is not a collection. A collection stores elements; a stream stores nothing. It is a description of a computation over a source, which can be a collection, an array, a file, a generator function or a range of numbers. Every pipeline has exactly one source, zero or more intermediate operations and exactly one terminal operation. Intermediate operations are lazy and return another stream, which is why the types change along the way: Stream of Payment, then Stream of String. The terminal operation runs the pipeline and produces a result or a side effect. Four facts with real output from StreamVsCollection: nothing is stored, the source is never modified, so our list still has 12 payments, a stream is one-shot, and a stream may be infinite. Question: what is the type after map(Payment::id), and why does it change?");

  // ===== 4 Laziness & fusion =====
  s = newSlide("CONTENT", "Theory", "Laziness and loop fusion: one element at a time");
  codeBlock(s, `payments.subList(0, 5).stream()
    .peek(p -> trace.add("filter " + p.id()))
    .filter(p -> p.amount().compareTo(HUNDRED) >= 0)
    .peek(p -> trace.add("map " + p.id()))
    .map(Payment::id)
    .limit(2)
    .toList();`, 0.5, 1.05, 5.4, 2.4, { label: "theory/LazinessAndFusion", fontSize: 10.5, name: "lazy code" });
  const tr = [["filter P001", true], ["map P001", false], ["filter P002", true], ["filter P003", true], ["map P003", false]];
  tr.forEach(([t, isF], i) => {
    s.addText(t, { shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.06, x: 6.2 + (isF ? 0 : 0.6), y: 1.05 + i * 0.47, w: 2.4, h: 0.38, fill: { color: isF ? C.background2 : C.accent1 }, line: { color: C.accent1 }, fontFace: MONO, fontSize: 12, bold: true, color: isF ? C.text1 : C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "trace " + i });
  });
  s.addText("stop: limit(2) reached → [P001, P003]", { x: 6.2, y: 3.45, w: 3.3, h: 0.35, fontSize: 12, bold: true, color: C.accent4, margin: 0, isTextBox: true, objectName: "trace stop" });
  card(s, 0.5, 3.6, 5.4, 1.45, C.background2, "lazy facts");
  s.addText(bullets([[{ text: "Lazy: ", options: { bold: true } }, { text: "without toList(), the trace is []." }], [{ text: "Vertical: ", options: { bold: true } }, { text: "each element goes through every step before the next starts." }], [{ text: "Short-circuit: ", options: { bold: true } }, { text: "P004 and P005 are never examined." }]], 12.5), { x: 0.65, y: 3.68, w: 5.15, h: 1.3, margin: 0, valign: "top", isTextBox: true, objectName: "lazy bullets" });
  s.addText("peek() is used only to make the flow visible: it is a debugging tool.", { x: 6.2, y: 4.0, w: 3.3, h: 0.9, fontSize: 11.5, italic: true, color: C.accent5, margin: 0, valign: "top", isTextBox: true, objectName: "peek note" });
  s.addNotes("~4 min. This is the most important behaviour to understand. Read the trace on the right from the real run. P001 is filtered and, because it passes, goes straight to map before P002 is even looked at. P002 fails the filter, so it never reaches map. P003 passes and is mapped, and now limit has its two elements, so the pipeline stops: P004 and P005 are never examined at all. This is called loop fusion: the JDK runs all the stateless steps in one pass, element by element, which we call vertical order. Laziness is the other half: if you remove toList, nothing runs and the trace stays empty, because intermediate operations only build the pipeline. DEMO: run LazinessAndFusion and compare lines 1 and 2. Question: if limit(2) became limit(5), how many 'map' lines would we see?");

  // ===== 5 Sorted barrier =====
  s = newSlide("CONTENT", "Theory", "Stateful operations are barriers");
  codeBlock(s, `payments.subList(0, 5).stream()
    .peek(p -> trace.add("filter " + p.id()))
    .filter(p -> p.amount().compareTo(HUNDRED) >= 0)
    .sorted(Comparator.comparing(Payment::amount))
    .peek(p -> trace.add("map " + p.id()))
    .map(Payment::id)
    .toList();`, 0.5, 1.05, 5.4, 2.4, { label: "theory/LazinessAndFusion · sortedIsABarrier", fontSize: 10.5, name: "barrier code" });
  const tr2 = ["filter P001", "filter P002", "filter P003", "filter P004", "filter P005"];
  tr2.forEach((t, i) => s.addText(t, { shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.06, x: 6.2, y: 1.05 + i * 0.38, w: 1.55, h: 0.32, fill: { color: C.background2 }, line: { color: C.accent1 }, fontFace: MONO, fontSize: 10.5, bold: true, color: C.text1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "f " + i }));
  s.addShape(pres.shapes.RECTANGLE, { x: 7.85, y: 1.05, w: 0.12, h: 1.85, fill: { color: C.accent2 }, line: { color: C.accent2 }, objectName: "barrier" });
  s.addText("sorted()", { x: 7.55, y: 2.95, w: 0.75, h: 0.3, fontSize: 10, bold: true, fontFace: MONO, color: C.accent2, margin: 0, align: "center", isTextBox: true, objectName: "barrier label" });
  ["map P001", "map P003", "map P005"].forEach((t, i) => s.addText(t, { shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.06, x: 8.1, y: 1.05 + i * 0.45, w: 1.4, h: 0.36, fill: { color: C.accent1 }, line: { color: C.accent1 }, fontFace: MONO, fontSize: 10.5, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "m " + i }));
  card(s, 0.5, 3.6, 9.0, 1.45, "FFF4E0", "stateful card");
  s.addText([{ text: "Stateful = must remember elements: ", options: { bold: true, color: C.accent2 } }, { text: "sorted, distinct, skip, limit, takeWhile, dropWhile. sorted() and distinct() buffer elements, so they cost memory and cannot work on an infinite stream. ", options: {} }, { text: "Stateless = one element at a time: ", options: { bold: true, color: C.accent1 } }, { text: "filter, map, flatMap, peek, mapMulti.", options: {} }],
    { x: 0.65, y: 3.65, w: 8.7, h: 1.35, fontSize: 13, color: C.text1, margin: 0, valign: "middle", isTextBox: true, objectName: "stateful text" });
  s.addNotes("~3 min. Now add sorted between filter and map and run it again. The trace changes completely: all five filter lines come first, then the three map lines. Why? sorted cannot hand out the smallest element until it has seen every element, so it acts as a barrier: everything before it runs to completion, then everything after it runs on the sorted result. That is what stateful means: the operation must remember elements it has already seen. sorted and distinct buffer elements, which costs memory and makes them useless on an infinite stream. skip, limit, takeWhile and dropWhile keep a small amount of state, such as a counter. Stateless operations, filter, map, flatMap, peek and mapMulti, look at one element at a time. Practical rule: filter before you sort, so the barrier has less to buffer. DEMO: run LazinessAndFusion line 3. Question: why is filtering before sorting faster?");

  // ===== 6 Sources 1 =====
  pres.addSection({ title: "Sources" });
  s = newSlide("CONTENT", "Sources", "Sources (1): collections, values, arrays, ranges");
  const sh = ["Source", "Example", "Real result", "Since"].map(t => ({ text: t, options: { bold: true, color: C.background1, fill: { color: C.text2 } } }));
  const sr = [
    ["Collection.stream()", "customers.stream().filter(GOLD).count()", "4", "8"],
    ["Stream.of(...)", "Stream.of(\"CARD\", \"PAYNOW\", \"PAYPAL\")", "[CARD, PAYNOW, PAYPAL]", "8"],
    ["Arrays.stream(int[])", "Arrays.stream(seats).sum()", "2078", "8"],
    ["IntStream.rangeClosed", "IntStream.rangeClosed(10, 12)", "[10, 11, 12]", "8"],
    ["IntStream.range", "IntStream.range(1, 5).sum()", "10 (end exclusive)", "8"],
    ["String.chars()", "\"PAYPAL\".chars().filter(c -> c == 'P')", "2", "8"],
    ["Map.entrySet().stream()", "treeMap.entrySet().stream()", "[Bangkok=1, …, Singapore=4]", "8"],
  ].map((r, i) => r.map((c, j) => ({ text: j === 3 ? "Java " + c : c, options: Object.assign({ fill: { color: i % 2 ? C.background1 : C.background2 }, color: C.text1, fontSize: 10.5 }, j < 2 ? { fontFace: MONO, fontSize: j ? 9.5 : 10.5, bold: j === 0 } : {}, j === 2 ? { fontFace: MONO, fontSize: 9.5, color: C.accent1, bold: true } : {}, j === 3 ? { bold: true, color: C.accent1 } : {}) })));
  s.addTable([sh, ...sr], { x: 0.5, y: 1.0, w: 9.0, colW: [2.1, 3.65, 2.35, 0.9], rowH: 0.42, border: { type: "solid", pt: 0.5, color: "D5E3DA" }, valign: "middle", margin: [2, 5, 2, 5], objectName: "sources table 1" });
  s.addText("A HashMap's entry order is not defined. Use TreeMap or LinkedHashMap when the order of the output matters.", { x: 0.5, y: 4.55, w: 9, h: 0.5, fontSize: 12.5, italic: true, color: C.accent4, margin: 0, isTextBox: true, objectName: "map note" });
  s.addNotes("~3 min. Streams can be created from many sources, and the first group covers almost all day-to-day code. Any Collection has stream; there are four GOLD customers. Stream.of creates a stream from a few values. Arrays.stream on an int array gives an IntStream, which can sum directly: 2,078 seats across our eight flights. IntStream.range excludes the end and rangeClosed includes it, a classic interview trap: range from 1 to 5 sums to 10, rangeClosed from 1 to 5 sums to 15. String.chars gives an IntStream of character values. A Map is not a Collection, so you stream its entrySet, keySet or values. Important for reports: a HashMap's iteration order is not defined, so for deterministic output use a TreeMap or a LinkedHashMap, as our example does. DEMO: run StreamSources, first half. Question: why does a Map not have a stream() method?");

  // ===== 7 Sources 2 =====
  s = newSlide("CONTENT", "Sources", "Sources (2): generated, nullable and files");
  codeBlock(s, `Stream.iterate(first, d -> d.plusMonths(1)).limit(3) // [8]
// [2026-11-30, 2026-12-30, 2027-01-30]
Stream.iterate(from, d -> !d.isAfter(to),
               d -> d.plusWeeks(1))               // [9]
// [2026-11-02, -09, -16, -23, -30]
Stream.generate(() -> "PENDING").limit(3)       // [8]
Stream.ofNullable(null).count()                 // [9] 0
try (Stream<String> lines = Files.lines(csv)) {  // [8]
    return lines.skip(1)
                .filter(l -> l.endsWith(",SUCCESS"))
                .count();                       // 8
}`, 0.5, 1.05, 6.1, 3.4, { label: "theory/StreamSources", fontSize: 10, name: "sources2 code" });
  const warn = [["iterate / generate are infinite", "Add limit, takeWhile, or use the 3-arg iterate [9]."], ["Files.lines holds a file handle", "Always close it: try-with-resources."], ["Stream.ofNullable [9]", "0 or 1 element: handy inside flatMap."]];
  warn.forEach(([h, d], i) => {
    const y = 1.05 + i * 1.15;
    card(s, 6.8, y, 2.7, 1.0, i === 1 ? "FBECEC" : C.background2, "warn " + i);
    s.addText([{ text: h, options: { bold: true, color: i === 1 ? C.accent4 : C.text2, breakLine: true } }, { text: d, options: { fontSize: 11.5 } }], { x: 6.95, y: y + 0.05, w: 2.45, h: 0.9, fontSize: 12.5, color: C.text1, margin: 0, valign: "middle", isTextBox: true, objectName: "warn text " + i });
  });
  outputBox(s, "plusMonths from Nov 30: Dec 30, Jan 30 (each step sees only the previous value)", 0.5, 4.6, 9.0, 0.45, "sources2 output");
  s.addNotes("~3 min. The second group creates streams that are not backed by a collection. Stream.iterate with a seed and a function is infinite, so it must be limited; Java 9 added a three-argument version with a condition, which reads like a for loop and stops by itself, here giving the five Mondays in November. Stream.generate repeats a supplier and is also infinite. Stream.ofNullable, Java 9, gives zero or one element. Files.lines reads a file lazily, line by line, which is ideal for large files, but it holds an open file handle, so it must always be closed with try-with-resources; skipping that leaks file handles in long-running servers. Our example counts the eight SUCCESS rows in a CSV file. Note the date drift at the bottom. Question: how would you generate the last day of each month instead?");

  // ===== 8 Properties =====
  s = newSlide("CONTENT", "Sources", "Stream properties you must know");
  const props = [["One-shot", "a second terminal op on the same stream", "IllegalStateException: stream has already been operated upon or closed"], ["Stateless / stateful", "filter, map vs sorted, distinct, limit…", "distinct().sorted() → [CARD, PAYNOW, PAYPAL]"], ["Short-circuiting", "anyMatch, findFirst, limit, takeWhile…", "anyMatch(FAILED) inspected 3 of 12"], ["Infinite + short-circuit", "iterate(1, n -> n*2).filter(> 1000).limit(3)", "[1024, 2048, 4096]"], ["Encounter order", "comes from the source", "List ORDERED=true, HashSet ORDERED=false"], ["Parallel flag", "one flag for the whole pipeline; last call wins", "parallel().sequential() → isParallel()=false"]];
  const ph = ["Property", "Meaning", "Real result"].map(t => ({ text: t, options: { bold: true, color: C.background1, fill: { color: C.text2 } } }));
  s.addTable([ph, ...props.map((r, i) => r.map((c, j) => ({ text: c, options: { fontFace: j === 2 ? MONO : THEME.bodyFontFace, fontSize: j === 2 ? 9.5 : 11.5, bold: j === 0, color: j === 0 ? C.text2 : (j === 2 ? C.accent1 : C.text1), fill: { color: i % 2 ? C.background1 : C.background2 } } })))], { x: 0.5, y: 1.0, w: 9.0, colW: [1.9, 3.1, 4.0], rowH: 0.55, border: { type: "solid", pt: 0.5, color: "D5E3DA" }, valign: "middle", margin: [2, 5, 2, 5], objectName: "props table" });
  s.addText("Parallel streams in depth: L14.", { x: 0.5, y: 4.95, w: 9, h: 0.28, fontSize: 11.5, italic: true, color: C.accent5, margin: 0, isTextBox: true, objectName: "props note" });
  s.addNotes("~4 min. Six properties with real results from StreamProperties. One-shot: calling a second terminal operation on the same stream throws IllegalStateException with the message shown; if you need the data twice, keep the collection, or a Supplier of Stream. Stateless versus stateful from slide 5. Short-circuiting operations can finish without seeing every element: anyMatch found the first FAILED payment after inspecting only 3 of 12. That is also what makes infinite streams usable: the powers of two filtered above 1,000 and limited to three. Encounter order comes from the source; a List is ordered, a HashSet is not, and operations like findFirst and limit respect it. Finally, sequential or parallel is a single flag for the whole pipeline, and the last call wins, so parallel followed by sequential runs sequentially. L14 covers parallel streams properly. Question: what does findFirst return on a HashSet?");

  // ===== 9 Method map diagram =====
  pres.addSection({ title: "Method map" });
  s = newSlide("CONTENT", "Method map", "The full method map");
  const col = (x, w, title, fill, items, tcol) => {
    card(s, x, 1.0, w, 4.05, fill, title + " card");
    s.addText(title, { x: x + 0.12, y: 1.05, w: w - 0.24, h: 0.38, fontSize: 13.5, bold: true, color: tcol, margin: 0, isTextBox: true, objectName: title + " title" });
    s.addText(items.map((it, i) => ({ text: it[0], options: { fontFace: MONO, fontSize: 10.5, color: it[1] || C.text1, bold: !!it[1], breakLine: i < items.length - 1 } })), { x: x + 0.12, y: 1.45, w: w - 0.24, h: 3.5, margin: 0, valign: "top", paraSpaceAfter: 3, isTextBox: true, objectName: title + " list" });
  };
  col(0.5, 2.85, "Intermediate · stateless", C.background2, [["filter"], ["map"], ["mapToInt/Long/Double"], ["mapToObj / boxed"], ["flatMap"], ["mapMulti  [16]", C.accent4], ["peek  (debug)"], ["unordered / parallel"], ["sequential / onClose"]], C.accent1);
  col(3.5, 2.85, "Intermediate · stateful", "FFF4E0", [["distinct"], ["sorted"], ["skip"], ["limit  ✂", C.accent3], ["takeWhile  ✂ [9]", C.accent4], ["dropWhile  [9]", C.accent4]], C.accent2);
  col(6.5, 3.0, "Terminal", "EAF0FB", [["forEach / forEachOrdered"], ["toArray"], ["reduce"], ["collect"], ["toList  [16]", C.accent4], ["count / min / max"], ["sum / average  (primitive)"], ["any/all/noneMatch  ✂", C.accent3], ["findFirst / findAny  ✂", C.accent3], ["iterator / spliterator"]], C.accent3);
  s.addText("✂ = short-circuiting · red = after Java 8 · Beyond Java 21: gather(Gatherer) [24]", { x: 3.5, y: 4.5, w: 2.85, h: 0.5, fontSize: 10.5, italic: true, color: C.accent5, margin: 0, isTextBox: true, objectName: "map legend" });
  s.addNotes("~3 min. This is the map for the whole of Module 2, also on the cheat sheet and generated from the MethodMap class so it stays in sync with the code. Three columns. Stateless intermediate operations transform or filter one element at a time. Stateful intermediate operations must remember something: distinct, sorted, skip, limit, takeWhile and dropWhile. Terminal operations run the pipeline and produce a result: forEach for side effects, toArray, reduce, collect and toList for results, the aggregates, and the matching and finding operations. The scissors mark short-circuiting operations, which may stop early: limit and takeWhile among intermediates, and the match and find operations among terminals. Red items arrived after Java 8. Stream Gatherers, custom intermediate operations, are final only in Java 24; L13 previews them. Question: which terminal operation would you use to check that every payment is positive?");

  // ===== 10 Method table =====
  s = newSlide("CONTENT", "Method map", "Method table: kind, state, short-circuit, version");
  const mh = ["Operation", "Kind", "Stateful", "Short-circuit", "Since", "Lesson"].map(t => ({ text: t, options: { bold: true, color: C.background1, fill: { color: C.text2 } } }));
  const mr = [
    ["filter / map / flatMap", "intermediate", "no", "no", "8", "L07"],
    ["mapMulti", "intermediate", "no", "no", "16", "L07"],
    ["distinct / sorted", "intermediate", "yes", "no", "8", "L07, L08"],
    ["limit / skip", "intermediate", "yes", "limit: yes", "8", "L07"],
    ["takeWhile / dropWhile", "intermediate", "yes", "takeWhile: yes", "9", "L07"],
    ["forEach / forEachOrdered", "terminal", "–", "no", "8", "L09"],
    ["reduce / count / min / max", "terminal", "–", "no", "8", "L09"],
    ["collect(Collector)", "terminal", "–", "no", "8", "L10, L11"],
    ["toList()", "terminal", "–", "no", "16", "L09"],
    ["any/all/noneMatch, findFirst/Any", "terminal", "–", "yes", "8", "L09"],
    ["sum / average / summaryStatistics", "terminal (primitive)", "–", "no", "8", "L12"],
  ].map((r, i) => r.map((c, j) => ({ text: j === 4 ? "Java " + c : c, options: Object.assign({ fill: { color: i % 2 ? C.background1 : C.background2 }, color: C.text1, fontSize: 10.5 }, j === 0 ? { fontFace: MONO, bold: true, fontSize: 10 } : {}, j === 4 ? { bold: true, color: Number(c) > 8 ? C.accent4 : C.accent1 } : {}, (j === 2 && c === "yes") || (j === 3 && c !== "no") ? { bold: true, color: C.accent2 } : {}) })));
  s.addTable([mh, ...mr], { x: 0.5, y: 1.0, w: 9.0, colW: [3.0, 1.65, 0.85, 1.35, 0.95, 1.2], rowH: 0.31, border: { type: "solid", pt: 0.5, color: "D5E3DA" }, valign: "middle", margin: [2, 5, 2, 5], objectName: "method table" });
  s.addText("Full list with notes: theory/MethodMap (24 entries, checked by StreamBasicsTest).", { x: 0.5, y: 4.92, w: 9, h: 0.28, fontSize: 11, italic: true, color: C.accent5, margin: 0, isTextBox: true, objectName: "method note" });
  s.addNotes("~2 min. The same map as a table, grouped the way you will meet the operations in the next lessons, with the lesson number in the last column. Use it as a reading guide for Module 2: L07 covers filtering, mapping and slicing, L08 sorting, L09 terminal operations and reduction, L10 and L11 collectors and grouping, and L12 primitive streams. Note the after-Java-8 additions in red: mapMulti and toList in 16, takeWhile and dropWhile in 9. The stateful and short-circuit columns are highlighted because those two properties determine performance and whether an operation is safe on an infinite stream. The complete version with 24 entries and a note per operation lives in the MethodMap class, and a test checks facts such as 'exactly four entries short-circuit'. Question: which stateful operation is also short-circuiting?");

  // ===== 11 Before/after/modern =====
  pres.addSection({ title: "Worked example" });
  s = newSlide("CONTENT", "Worked example", "Refactor: top October debits, three ways");
  codeBlock(s, `return txns.stream()
    .filter(t -> t.type() == DEBIT
              && t.date().getMonth() == OCTOBER)
    .sorted(Comparator.comparing(
            Transaction::amount).reversed())
    .limit(n)
    .map(t -> t.id() + " " + t.category()
              + " " + t.amount())
    .collect(Collectors.toList());`, 0.5, 1.05, 4.5, 3.25, { label: "AFTER  ·  Java 8  ·  after/StreamTopDebits", fontSize: 10, name: "after code" });
  codeBlock(s, `record DebitLine(String id, Category c,
                 BigDecimal amount) { } // [16]
txns.stream()
    .filter(IS_DEBIT.and(IN_OCTOBER))
    .sorted(comparing(Transaction::amount)
            .reversed())
    .limit(n)
    .map(t -> new DebitLine(t.id(), ...))
    .toList();                       // [16]
// weeks [9]: Stream.iterate(start,
//   d -> !d.isAfter(end),
//   d -> d.plusWeeks(1))`, 5.2, 1.05, 4.3, 3.25, { label: "MODERN  ·  modern/ModernTopDebits", fontSize: 10, name: "modern code" });
  outputBox(s, "T042 TRANSFER 1432.93 · T057 TRANSFER 962.80 · T050 TRANSFER 903.91\ndebits per week: [10-01: 5, 10-08: 8, 10-15: 0, 10-22: 1, 10-29: 2]", 0.5, 4.42, 9.0, 0.63, "ba output");
  s.addNotes("~3 min. The worked example in its three versions. The Java 8 stream version on the left is a direct translation of the requirement: filter debits in October, sort by amount in reverse, limit to n, map to a line, collect. Notice that filter comes before sorted, so the sort barrier only buffers the October debits rather than all 60 transactions. The modern version names the predicates, combines them with and, returns a DebitLine record instead of a formatted string, and ends with toList. It also uses the three-argument Stream.iterate from Java 9 to build the weekly buckets of October, a small preview of grouping in L11. TopDebitsRefactoringTest checks all three versions for five values of n. DEMO: run the three classes. Question: what would change in the output if we called limit before sorted? Why is that wrong?");

  // ===== 12 Pitfalls & best practices =====
  s = newSlide("CONTENT", "Worked example", "Pitfalls and best practices");
  const pits = [["Reusing a stream", "IllegalStateException. Keep the list, or a Supplier<Stream<T>>."], ["Infinite stream, no limit", "iterate / generate without limit or a condition never ends."], ["limit before sorted", "Takes the first n by position, not the top n."], ["Modifying the source inside the pipeline", "ConcurrentModificationException or wrong results."], ["Not closing Files.lines", "Leaks file handles: use try-with-resources."]];
  pits.forEach(([h, d], i) => {
    const y = 1.0 + i * 0.8;
    card(s, 0.5, y, 4.6, 0.7, "FBECEC", "pit " + i);
    iconCircle(s, I.bug, 0.6, y + 0.14, 0.42, C.accent4, "pit icon " + i);
    s.addText([{ text: h, options: { bold: true, color: C.accent4, breakLine: true } }, { text: d, options: { fontSize: 11, color: C.text1 } }], { x: 1.12, y: y + 0.02, w: 3.9, h: 0.66, fontSize: 12.5, margin: 0, valign: "middle", isTextBox: true, objectName: "pit text " + i });
  });
  const dos = ["Filter early, sort late: less to buffer", "Short-circuit early: findFirst, anyMatch, limit", "One operation per line; name the predicates", "Use peek only for debugging", "Sorted maps (TreeMap) for deterministic output", "Sequential by default; parallel only after measuring (L14)"];
  card(s, 5.3, 1.0, 4.2, 3.9, C.background2, "do card");
  iconCircle(s, I.check, 5.45, 1.12, 0.45, C.accent1, "do icon");
  s.addText("Best practices", { x: 6.05, y: 1.12, w: 3.3, h: 0.45, fontSize: 15, bold: true, color: C.accent1, margin: 0, valign: "middle", isTextBox: true, objectName: "do title" });
  s.addText(bullets(dos, 12.5).map(r => { r.options.paraSpaceAfter = 7; return r; }), { x: 5.5, y: 1.7, w: 3.9, h: 3.1, margin: 0, valign: "top", isTextBox: true, objectName: "do list" });
  s.addNotes("~3 min. Five pitfalls from real code reviews. Reusing a stream, for example storing it in a field and calling it twice, throws IllegalStateException; keep the collection, or pass a Supplier that creates a fresh stream each time. An infinite stream without limit or a condition simply never finishes, which in a server looks like a hang. Putting limit before sorted gives the first n elements by position, not the top n, a silent wrong answer. Modifying the source collection inside the pipeline causes ConcurrentModificationException or undefined results. And forgetting to close Files.lines leaks file handles. On the right, the habits that prevent these problems and keep pipelines fast: filter early and sort late, short-circuit as early as possible, one operation per line, peek only for debugging, sorted maps for reports, and sequential unless measurements say otherwise. Question: which pitfall would a unit test most likely miss?");

  // ===== 13 Interview =====
  pres.addSection({ title: "Practice" });
  s = newSlide("CONTENT", "Practice", "Interview questions");
  const qa = [
    ["Collection vs stream?", "A collection stores data. A stream stores nothing: it is a lazy, one-shot computation over a source."],
    ["What does lazy evaluation mean?", "Intermediate ops only build the pipeline; nothing runs until a terminal op asks for elements."],
    ["Stateless vs stateful operation?", "Stateless sees one element at a time (map). Stateful must remember elements (sorted, distinct)."],
    ["What is short-circuiting?", "An op that can finish early: limit, takeWhile, anyMatch, findFirst. Makes infinite streams usable."],
    ["Why does limit before sorted give a wrong 'top n'?", "limit keeps the first n by encounter order; sorting afterwards only sorts those n."],
  ];
  qa.forEach(([q, a], i) => {
    const colI = i % 2, row = Math.floor(i / 2);
    const x = i === 4 ? 0.5 : 0.5 + colI * 4.6, y = 1.0 + row * 1.38, w = i === 4 ? 9.0 : 4.4;
    card(s, x, y, w, 1.22, C.background2, "qa card " + i);
    s.addText("Q" + (i + 1), { shape: pres.shapes.OVAL, x: x + 0.12, y: y + 0.14, w: 0.42, h: 0.42, fill: { color: C.text2 }, line: { color: C.text2 }, fontSize: 11, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "q badge " + i });
    s.addText([{ text: q, options: { bold: true, color: C.text2, breakLine: true } }, { text: a, options: { color: C.text1, fontSize: 12 } }], { x: x + 0.65, y: y + 0.06, w: w - 0.8, h: 1.1, fontSize: 13.5, margin: 0, valign: "middle", isTextBox: true, objectName: "qa text " + i });
  });
  s.addNotes("~3 min. Five interview questions on stream fundamentals. These are asked at almost every level, and a confident answer here sets the tone for the rest of a technical interview. For question 1, listen for three words: stores nothing, lazy and one-shot. For question 2, a strong candidate can walk through a trace like slide 4. For question 3, ask for two examples of each and why sorted is a barrier. For question 4, ask how anyMatch can work on an infinite stream. Question 5 is a practical bug that interviewers like because it compiles and runs; the candidate should explain encounter order. A senior follow-up: what exactly happens if you call a terminal operation twice on the same stream object? Answer: IllegalStateException, 'stream has already been operated upon or closed'. Question: which of these would you ask a junior developer first?");

  // ===== 14 Pros/cons =====
  s = newSlide("CONTENT", "Practice", "Pros and cons of streams");
  const pros = ["Declarative: the pipeline reads like the requirement", "Lazy: no work until a result is needed", "Loop fusion: one pass for stateless steps", "Short-circuiting: stop as soon as possible", "Works on files and infinite sources", "Parallelism is a one-word change (with care)"];
  const consL = ["One-shot: cannot be reused", "Stateful ops buffer data (sorted, distinct)", "Debugging and stack traces are harder", "Easy to misuse: limit/sort order, side effects", "Small overhead for tiny collections", "Index-based or early-exit logic is awkward"];
  [[pros, "Pros", C.accent1, I.plus, 0.5, C.background2], [consL, "Cons / limitations", C.accent4, I.minus, 5.1, "FBECEC"]].forEach(([list, h, colr, ic, x, bg]) => {
    card(s, x, 1.0, 4.4, 3.65, bg, h + " card");
    iconCircle(s, ic, x + 0.2, 1.15, 0.5, colr, h);
    s.addText(h, { x: x + 0.85, y: 1.15, w: 3.3, h: 0.5, fontSize: 18, bold: true, color: colr, margin: 0, valign: "middle", isTextBox: true, objectName: h + " heading" });
    s.addText(bullets(list, 14).map(r => { r.options.paraSpaceAfter = 8; return r; }), { x: x + 0.25, y: 1.85, w: 3.95, h: 2.7, margin: 0, valign: "top", isTextBox: true, objectName: h + " list" });
  });
  s.addNotes("~2 min. A balanced view of streams as a whole. On the plus side: pipelines read like the requirement, laziness avoids unnecessary work, loop fusion means one pass for all stateless steps rather than one loop per step, short-circuiting stops as early as possible, streams work naturally with files and generated or infinite sources, and switching to parallel is a one-word change, though it must be measured, as L14 shows. On the minus side: a stream cannot be reused, stateful operations buffer data, debugging is harder than stepping through a loop, it is easy to misuse, for example the order of limit and sorted or side effects in map, there is a small overhead that only matters for tiny collections in hot paths, and index-heavy or early-exit logic is often clearer as a loop (L18). Question: which con have you personally hit?");

  // ===== 15 Summary =====
  pres.addSection({ title: "Wrap-up" });
  s = newSlide("DARK_TITLE", "Wrap-up", "Summary");
  const sum = ["A stream stores nothing: source → intermediate* → terminal", "Lazy: nothing runs until the terminal operation", "Vertical order; stateful ops (sorted) are barriers", "Many sources: collections, ranges, iterate, files…", "One-shot, short-circuit, encounter order, parallel flag"];
  s.addText(bullets(sum, 14, C.background1), { x: 0.5, y: 2.1, w: 5.2, h: 2.9, margin: 0, valign: "top", isTextBox: true, objectName: "summary bullets" });
  card(s, 6.0, 0.6, 3.5, 2.05, "143F32", "exercise card");
  iconCircle(s, I.code, 6.2, 0.78, 0.45, C.accent2, "exercise");
  s.addText([{ text: "Exercise (~20 min)", options: { bold: true, color: C.accent2, breakLine: true } }, { text: "Trace 4 pipelines in Exercise06 WITHOUT running them. Write the printed output in EXPECTED_1..4, then remove @Disabled.", options: { color: C.background1, fontSize: 12 } }],
    { x: 6.75, y: 0.75, w: 2.65, h: 1.8, fontSize: 14, margin: 0, valign: "top", isTextBox: true, objectName: "exercise text" });
  card(s, 6.0, 2.85, 3.5, 2.05, "143F32", "next card");
  iconCircle(s, I.rocket, 6.2, 3.03, 0.45, C.accent1, "next");
  s.addText([{ text: "Next: Lesson 07", options: { bold: true, color: C.accent2, breakLine: true } }, { text: "Filtering, Mapping and Slicing: filter, map, flatMap, mapMulti, distinct, takeWhile…", options: { color: C.background1, fontSize: 12 } }],
    { x: 6.75, y: 3.0, w: 2.65, h: 1.8, fontSize: 14, margin: 0, valign: "top", isTextBox: true, objectName: "next text" });
  s.addNotes("~3 min. Recap the five points. Then the exercise, which is about prediction rather than coding. Exercise06 contains four pipelines over the first five payments, each printing labels with peek. Learners must not run them first. They write what each prints into the EXPECTED constants, then remove @Disabled and run Exercise06Test to check. Pipeline 1 combines stateless steps with limit; pipeline 2 puts a sorted barrier in the middle; pipeline 3 ends with a short-circuiting anyMatch; pipeline 4 has no terminal operation at all. The solution class explains each answer. This trains exactly the mental model we built today, and it is the most common style of stream question in interviews. Give 20 minutes, then discuss the answers one by one. Next lesson: the individual operations, starting with filter, map and flatMap. Question: which pipeline do you think will surprise people most?");

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
})();
