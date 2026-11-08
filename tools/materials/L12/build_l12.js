// L12 slide deck generator - ITGreenZone Java Functional Programming
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa");
const { applyTheme } = require("/root/.claude/skills/synced/2eb53c35-a0c8-4343-9257-776fcd7fed67_dd7dcff0-93ee-4601-a8ce-12573fa09cd9/pptx/scripts/apply_theme.js");

const OUT = process.argv[2] || "L12_PrimitiveStreams_Slides.pptx";
const LESSON = "12";
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
pres.title = "L12 Primitive Streams & Numeric Work";
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
  let s = newSlide("DARK_TITLE", "Introduction", "Primitive Streams & Numeric Work");
  s.addText("LESSON 12  ·  MODULE 2", { x: 0.5, y: 0.6, w: 5.5, h: 0.35, fontSize: 12, bold: true, color: C.accent2, charSpacing: 2, margin: 0, isTextBox: true, objectName: "kicker" });
  s.addText("IntStream · LongStream · DoubleStream · boxing · double vs BigDecimal · chars() · random streams", { x: 0.5, y: 2.95, w: 5.0, h: 0.8, fontSize: 15, italic: true, color: C.background2, margin: 0, isTextBox: true, objectName: "subtitle" });
  card(s, 6.0, 0.6, 3.5, 4.3, "143F32", "objectives card");
  s.addText("You will be able to", { x: 6.25, y: 0.75, w: 3.1, h: 0.35, fontSize: 14, bold: true, color: C.accent2, margin: 0, isTextBox: true, objectName: "objectives heading" });
  ["Create and use Int/Long/DoubleStream", "Use sum, average, summaryStatistics", "Convert with mapToInt, boxed, mapToObj", "Explain why double is wrong for money", "Count characters with chars()"].forEach((o, i) => {
    const y = 1.2 + i * 0.72;
    s.addText(String(i + 1), { shape: pres.shapes.OVAL, x: 6.25, y: y + 0.05, w: 0.36, h: 0.36, fill: { color: C.accent1 }, line: { color: C.accent1 }, fontSize: 12, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "objective number " + (i + 1) });
    s.addText(o, { x: 6.75, y, w: 2.6, h: 0.62, fontSize: 12.5, color: C.background1, valign: "middle", margin: 0, isTextBox: true, objectName: "objective " + (i + 1) });
  });
  s.addNotes("~2 min. So far our streams carried objects: customers, transactions, flights. When the data is numbers, Java gives us three specialised streams, IntStream, LongStream and DoubleStream, which hold primitive values directly. They avoid creating an Integer object for every element and add numeric operations such as sum, average and summaryStatistics. This lesson also answers a question every banking developer must get right: why double is the wrong type for money, shown with real output, and which BigDecimal patterns to use instead. We finish with characters and random numbers as streams. The exercise computes seat occupancy per flight and character frequencies of a PNR list. DEMO: open package l12_primitive_streams. Question: where in your code do you sum numbers in a loop today?");

  // ===== 2 Problem =====
  pres.addSection({ title: "Primitive streams" });
  s = newSlide("CONTENT", "Primitive streams", "The problem: boxed numbers, manual statistics");
  codeBlock(s, `List<Integer> emptySeats = new ArrayList<>();
Integer totalSeats = 0;           // boxed!
for (Flight f : flights) {
  emptySeats.add(f.seats() - f.booked());
  totalSeats += f.seats();        // unbox+box
}
int min = Integer.MAX_VALUE, max = ..
for (Integer e : emptySeats) {
  if (e < min) min = e;
  if (e > max) max = e;
  sum += e;
}`, 0.5, 1.05, 4.6, 3.3, { label: "BEFORE  ·  before/LegacyLoadReport", fontSize: 9.5, name: "legacy code" });
  codeBlock(s, `int seats = flights.stream()
    .mapToInt(Flight::seats)
    .sum();

IntSummaryStatistics empty =
  flights.stream()
    .mapToInt(f -> f.seats()
                 - f.booked())
    .summaryStatistics();`, 5.3, 1.05, 4.2, 3.3, { label: "AFTER  ·  no boxing, one pass", fontSize: 10, name: "stream code" });
  outputBox(s, "All 3 versions: TOTAL 1808/2078 booked, load 87.01% · EMPTY SEATS min=2 max=63 avg=33.75", 0.5, 4.5, 9.0, 0.5, "problem output");
  s.addNotes("~3 min. The business question: a load report for our eight flights, with each flight's booked percentage, the overall load factor, and statistics on empty seats. The legacy version stores numbers in a List of Integer and even keeps the total in an Integer variable, so every plus-equals unboxes the value, adds, and boxes a new object. Then it finds the minimum, maximum and sum with a hand-written loop starting from Integer.MAX_VALUE. The stream version uses mapToInt to get an IntStream, which holds plain ints, and summaryStatistics computes count, sum, minimum, maximum and average in one pass. All three versions in the repo print the same ten lines, and a test checks it. DEMO: run LegacyLoadReport. Question: how many Integer objects does the legacy loop create?");

  // ===== 3 Three types + creation =====
  s = newSlide("CONTENT", "Primitive streams", "Three primitive streams and how to create them");
  tbl(s, ["Stream", "Holds", "Optional type", "Statistics type"], [
    ["IntStream  [8]", "int", "OptionalInt", "IntSummaryStatistics"],
    ["LongStream  [8]", "long", "OptionalLong", "LongSummaryStatistics"],
    ["DoubleStream  [8]", "double", "OptionalDouble", "DoubleSummaryStatistics"],
  ], 0.5, 1.0, 9.0, [2.4, 1.4, 2.4, 2.8], 0.36, "types table", [0, 2, 3], 11);
  tbl(s, ["Create", "Real result (theory/PrimitiveBasics)"], [
    ["IntStream.range(1, 5).sum()", "10   (5 excluded: half-open)"],
    ["IntStream.rangeClosed(1, 5).sum()", "15"],
    ["IntStream.iterate(1, n -> n * 2).limit(8)", "[1, 2, 4, 8, 16, 32, 64, 128]"],
    ["IntStream.iterate(1, r -> r <= 42, r -> r + 10)  [9]", "[1, 11, 21, 31, 41]"],
    ["flights.stream().mapToInt(Flight::seats)", "471, 264, 335, 160, 303, 222, 161, 162"],
    ["\"SIN\".chars()  ·  new Random(42).ints(..)", "see slides 9 and 10"],
  ], 0.5, 2.6, 9.0, [5.2, 3.8], 0.36, "create table", [0], 10.5);
  s.addNotes("~3 min. There are exactly three primitive streams: IntStream, LongStream and DoubleStream, all from Java 8. There is no CharStream, ByteStream or FloatStream; characters arrive as an IntStream. Each has its own Optional type and its own summary statistics type. To create one: range gives a half-open range, so range one to five sums one to four, which is ten; rangeClosed includes the end and gives fifteen. iterate with a seed and a step is infinite, so limit it. Java 9 added iterate with a condition, which reads like a for loop. Most often you get one from an object stream with mapToInt, mapToLong or mapToDouble. DEMO: run PrimitiveBasics, lines 1, 2, 9 and 10. Question: why is there no CharStream?");

  // ===== 4 Terminals =====
  s = newSlide("CONTENT", "Primitive streams", "Numeric terminals and summaryStatistics");
  codeBlock(s, `IntStream seats = flights.stream().mapToInt(Flight::seats);

seats.sum()                 // 2078   (empty stream: 0)
seats.average()             // OptionalDouble[259.75]
                            // empty: OptionalDouble.empty
mapToInt(Flight::booked).max()   // OptionalInt[455]
seats.summaryStatistics()   // one pass, 5 answers

String.format(Locale.ROOT,
  "count=%d sum=%d min=%d max=%d avg=%.2f", ..)
// count=8 sum=2078 min=160 max=471 avg=259.75`, 0.5, 1.05, 6.0, 3.4, { label: "theory/PrimitiveBasics  (each line on a fresh stream)", fontSize: 10, name: "terminal code" });
  card(s, 6.7, 1.05, 2.8, 3.4, C.background2, "rules card");
  s.addText([{ text: "Rules", options: { bold: true, color: C.text2, fontSize: 15, breakLine: true } },
    { text: "sum() of nothing is 0", options: { bullet: true, breakLine: true } },
    { text: "average/min/max of nothing is an empty Optional, never 0", options: { bullet: true, breakLine: true } },
    { text: "getAsDouble() on empty → NoSuchElementException", options: { bullet: true, breakLine: true } },
    { text: "statistics toString uses your locale: format with Locale.ROOT", options: { bullet: true } }],
    { x: 6.85, y: 1.15, w: 2.55, h: 3.2, fontSize: 12, color: C.text1, margin: 0, valign: "top", paraSpaceAfter: 6, isTextBox: true, objectName: "rules text" });
  note(s, "A stream is single-use: in real code call mapToInt again (or use summaryStatistics) for each answer.", 4.6, C.text2, "terminal note");
  s.addNotes("~3 min. The numeric terminals. sum returns a plain number, and the sum of an empty stream is zero, which is mathematically right. average, min and max return OptionalDouble or OptionalInt, because an empty stream has no average; that is much safer than dividing by a zero count. Calling getAsDouble on an empty Optional throws NoSuchElementException, so use orElse or isPresent. summaryStatistics gives count, sum, min, max and average in one pass, which is what the empty-seat line of our report needs. One portability trap from L09: its toString formats the average with the default locale, so in Germany you get a comma; format the fields yourself with Locale.ROOT. DEMO: run PrimitiveBasics. Question: what is the right average of zero flights?");

  // ===== 5 Conversions =====
  s = newSlide("CONTENT", "Primitive streams", "Converting between object and primitive streams");
  box(s, 0.6, 1.35, 2.4, 1.0, "Stream<Flight>", "objects", C.text2, "obj box");
  box(s, 3.9, 1.35, 2.2, 1.0, "IntStream", "int values", C.accent1, "int box");
  box(s, 7.0, 1.35, 2.4, 1.0, "Stream<Integer>", "boxed", C.accent3, "boxed box");
  box(s, 3.9, 3.05, 2.2, 0.9, "DoubleStream", "asDoubleStream()", C.accent5, "double box");
  arrow(s, 3.0, 1.62, 3.9, 1.62, "mapToInt", "a1", true);
  arrow(s, 6.1, 1.62, 7.0, 1.62, "boxed()", "a2", true);
  arrow(s, 3.9, 2.12, 3.0, 2.12, "mapToObj", "a3", false);
  arrow(s, 5.0, 2.35, 5.0, 3.05, "", "a4", false);
  tbl(s, ["Call", "Real result (theory/BoxingAndConversions)"], [
    ["\"ABCDEF\".chars().mapToObj(c -> row + (char) c)", "[1A, 1B, 1C, 1D, 1E, 1F]"],
    ["rangeClosed(1, 6).boxed().collect(partitioningBy(..))", "{false=[1, 3, 5], true=[2, 4, 6]}"],
    ["range(0, n).boxed().collect(toMap(i -> i + 1, flights::get..))", "{1=SQ318, 2=SQ12, … 8=GA827}"],
  ], 0.5, 4.05, 9.0, [5.4, 3.6], 0.3, "conv table", [0], 9.5);
  s.addNotes("~3 min. Moving between the two worlds. mapToInt, mapToLong and mapToDouble take you from objects to primitives. boxed turns an IntStream back into a Stream of Integer, and mapToObj turns each int into any object you like. asLongStream and asDoubleStream widen without casts. Why box at all? IntStream has no collect method that accepts a Collector, so to use partitioningBy, groupingBy or toMap you box first. mapToObj is handy for building labels, such as seat labels one A to one F from the characters of a string. And range over the indexes, boxed, is the classic way to zip a list with its positions, here numbering our eight flights. DEMO: run BoxingAndConversions. Question: why does IntStream not accept a Collector?");

  // ===== 6 Boxing cost =====
  s = newSlide("CONTENT", "Primitive streams", "The cost of boxing, and the Integer cache trap");
  codeBlock(s, `flights.stream().map(Flight::booked)
    .reduce(0, Integer::sum) // 1808, boxed

flights.stream().mapToInt(Flight::booked)
    .sum()                   // 1808, no objects`, 0.5, 1.05, 4.5, 1.9, { label: "same answer, different work", fontSize: 10, name: "boxing code" });
  codeBlock(s, `List<Integer> a = IntStream.of(1000, 1000)
    .boxed().toList();
a.get(0) == a.get(1)        // false
a.get(0).equals(a.get(1))   // true

// IntStream.of(100, 100): == is true
// Integer.valueOf caches -128..127`, 5.2, 1.05, 4.3, 1.9, { label: "theory/BoxingAndConversions", fontSize: 10, name: "cache code" });
  tbl(s, ["Boxing costs", "Why it matters"], [
    ["An Integer object per element (typically 16 bytes vs 4)", "more memory, more garbage collection"],
    ["Unbox + rebox at each reduce step", "slower inner loops"],
    ["== compares references, not values", "works for 100, fails for 1000"],
  ], 0.5, 3.15, 9.0, [5.0, 4.0], 0.36, "cost table", [], 11);
  s.addNotes("~3 min. Both pipelines return 1,808 booked seats. The first maps to Integer objects and reduces with Integer::sum, so each step unboxes two values and boxes the result. The second never creates an object. For eight flights you will not notice, but for millions of elements boxing costs memory and garbage collection; we discuss measuring properly with JMH in L14, so no timing claims here. The second trap is correctness. Boxed values are objects, so double-equals compares references. Integer.valueOf caches the values from minus 128 to 127, so double-equals happens to work for 100 and fails for 1,000. Always use equals, or stay primitive. DEMO: run BoxingAndConversions, last two lines. Question: why can a test that uses small numbers hide this bug?");

  // ===== 7 double =====
  pres.addSection({ title: "Money and numbers" });
  s = newSlide("CONTENT", "Money and numbers", "Why NOT double for money (real output)");
  tbl(s, ["Code (theory/MoneyAndDoubles)", "Prints"], [
    ["0.1 + 0.2", "0.30000000000000004"],
    ["for loop: total += 0.1  (10 times)", "0.9999999999999999"],
    ["DoubleStream.generate(() -> 0.1).limit(10).reduce(0, Double::sum)", "0.9999999999999999"],
    ["DoubleStream.generate(() -> 0.1).limit(10).sum()", "1.0"],
    ["DoubleStream.of(0.1, 0.2, 0.3).reduce(0, Double::sum)", "0.6000000000000001"],
    ["DoubleStream.of(0.3, 0.2, 0.1).reduce(0, Double::sum)", "0.6"],
    ["Stream.generate(() -> new BigDecimal(\"0.10\")).limit(10)\n    .reduce(ZERO, BigDecimal::add)", "1.00"],
  ], 0.5, 1.0, 9.0, [6.3, 2.7], 0.42, "double table", [0, 1], 10.5);
  note(s, "0.1 has no exact binary form. Results depend on the order of addition and even on sum() vs reduce(): unacceptable for money.", 4.55, C.accent4, "double note");
  s.addNotes("~3 min. Every number on this slide is real output from MoneyAndDoubles. 0.1 has no exact binary representation, so 0.1 plus 0.2 prints 0.30000000000000004. Adding ten cents ten times in a loop gives 0.9999999999999999, and reduce with Double::sum gives the same. DoubleStream.sum gives 1.0, because it uses compensated summation, but that is a different algorithm, not exact arithmetic. Addition of doubles is not even associative: summing 0.1, 0.2, 0.3 forward gives 0.6000000000000001, backwards gives 0.6. That matters for parallel streams, which add in an unpredictable order. BigDecimal adds exactly and keeps the scale: 1.00. In banking that difference is an audit finding. DEMO: run MoneyAndDoubles. Question: which line would a parallel stream make unpredictable?");

  // ===== 8 BigDecimal patterns =====
  s = newSlide("CONTENT", "Money and numbers", "BigDecimal patterns for money streams");
  codeBlock(s, `// 1 · total: there is no BigDecimalStream
payments.stream().map(Payment::amount)
    .reduce(BigDecimal.ZERO, BigDecimal::add);          // 4429.84

// 2 · average: always give a scale and a rounding mode
total.divide(BigDecimal.valueOf(payments.size()),
             2, RoundingMode.HALF_UP);                   // 369.15

// 3 · integer cents in a LongStream, convert at the edge
long cents = payments.stream()
    .mapToLong(p -> p.amount().movePointRight(2).longValueExact())
    .sum();                                              // 442984
BigDecimal.valueOf(cents, 2);                            // 4429.84`, 0.5, 1.05, 9.0, 3.4, { label: "theory/MoneyAndDoubles", fontSize: 10.5, name: "bd code" });
  note(s, "divide() without a scale throws ArithmeticException for 1/3. longValueExact() throws instead of silently losing digits.", 4.6, C.text2, "bd note");
  s.addNotes("~3 min. Three patterns we use for money throughout the course. First, totals: there is no BigDecimal stream, so map to the amount and reduce with BigDecimal.ZERO and add, which gives 4,429.84 for our twelve payments. Second, averages: always divide with an explicit scale and rounding mode; the course rule is scale two, HALF_UP, giving 369.15. Without a scale, divide throws ArithmeticException for a non-terminating result such as one third. Third, for high-volume work you can hold money as long cents in a LongStream, which is exact and fast, and convert back to BigDecimal at the edge. longValueExact throws if a fraction of a cent would be lost, instead of silently truncating. DEMO: run MoneyAndDoubles, last lines. Question: what does BigDecimal.valueOf(442984, 2) print?");

  // ===== 9 chars =====
  pres.addSection({ title: "Characters and random" });
  s = newSlide("CONTENT", "Characters and random", "chars() and codePoints(): text as an IntStream");
  codeBlock(s, `"SIN".chars().boxed().toList()           // [83, 73, 78]  ints!
"SIN".chars().mapToObj(c -> (char) c)
     .toList()                           // [S, I, N]

codes.stream()                            // 8 flight codes
  .flatMapToInt(String::chars)
  .mapToObj(c -> (char) c)
  .collect(groupingBy(identity(), TreeMap::new, counting()));
// {0=3, 1=3, 2=4, 3=3, 6=1, 7=1, 8=5, 9=2, A=1, … Q=4, R=1, S=4, …}`, 0.5, 1.05, 9.0, 2.65, { label: "theory/CharsAndRandom", fontSize: 10.5, name: "chars code" });
  tbl(s, ["More", "Real result"], [
    ["flatMapToInt(String::chars).filter(Character::isDigit).count()", "22 digits, 16 letters"],
    ["first non-repeated char in \"SINGAPORE AIRLINES\" (LinkedHashMap)", "G"],
    ["\"Pay \" + card emoji: chars().count() vs codePoints().count()", "chars=6 codePoints=5"],
  ], 0.5, 3.85, 9.0, [6.3, 2.7], 0.33, "chars table", [0], 10);
  s.addNotes("~3 min. String.chars returns an IntStream of UTF-16 code units, so printing it boxed shows numbers: 83, 73, 78 for S, I, N. Cast back with mapToObj to see characters. To count characters across many strings, flatMapToInt with String::chars, cast to Character, then groupingBy with identity, a TreeMap and counting: our flight codes contain the digit eight five times. Character::isDigit and isLetter work directly as IntPredicates. For the first non-repeated character, group into a LinkedHashMap to keep encounter order: in SINGAPORE AIRLINES it is G. One warning: chars counts UTF-16 units, so an emoji outside the basic plane counts as two. codePoints counts real characters. DEMO: run CharsAndRandom. Question: why does the first-non-repeated solution need a LinkedHashMap?");

  // ===== 10 Random =====
  s = newSlide("CONTENT", "Characters and random", "Random numbers as streams");
  codeBlock(s, `new Random(42).ints(6, 1, 7).boxed().toList()
// [3, 4, 1, 3, 1, 2]   same seed → same sequence, every run

new Random(7).ints(1, flight.seats() + 1)   // infinite
    .distinct().limit(5).sorted().boxed().toList()
// MH602: [45, 46, 77, 101, 125]   5 distinct seat numbers`, 0.5, 1.05, 9.0, 2.0, { label: "theory/CharsAndRandom", fontSize: 10.5, name: "random code" });
  tbl(s, ["Source", "Use it for", "Since"], [
    ["new Random(seed).ints/longs/doubles", "repeatable tests and demos", "Java 8"],
    ["ThreadLocalRandom.current().ints(..)", "fast, unseeded, multi-threaded code", "Java 8"],
    ["SplittableRandom", "parallel streams of random numbers", "Java 8"],
    ["RandomGenerator.of(\"L64X128MixRandom\")", "modern algorithms behind one interface", "Java 17"],
    ["SecureRandom", "tokens, OTPs, passwords (never Random)", "Java 1.1"],
  ], 0.5, 3.2, 9.0, [3.9, 3.8, 1.3], 0.31, "random table", [0], 10);
  s.addNotes("~2 min. Random can produce streams: ints, longs and doubles, with a count and a range. The bound is exclusive, so one to seven gives dice values one to six. With a fixed seed the sequence is the same on every run, because the algorithm of java.util.Random is specified; that is how our golden-file tests can check it. Infinite random streams combine nicely with distinct and limit, here to pick five different seat numbers on MH602. In production code, prefer ThreadLocalRandom for speed, SplittableRandom inside parallel streams, the Java 17 RandomGenerator interface for modern algorithms, and SecureRandom whenever the value protects something, such as a one-time password. DEMO: run CharsAndRandom, last lines. Question: what could go wrong with distinct().limit(5) if the range had only three values?");

  // ===== 11 Worked example =====
  pres.addSection({ title: "Worked example" });
  s = newSlide("CONTENT", "Worked example", "Refactor: flight load report, three ways");
  codeBlock(s, `flights.stream()
  .sorted(comparingDouble(
      StreamLoadReport::load).reversed())
  .map(f -> String.format(Locale.ROOT,
      "%-6s %s-%s %3d/%3d %6.2f%%", ..,
      load(f) * 100))
  ..
int seats  = ..mapToInt(Flight::seats).sum();
int booked = ..mapToInt(Flight::booked).sum();
IntSummaryStatistics empty = ..
  .mapToInt(f -> f.seats() - f.booked())
  .summaryStatistics();`, 0.5, 1.05, 4.5, 3.4, { label: "AFTER  ·  Java 8  ·  still double %", fontSize: 9.5, name: "after code" });
  codeBlock(s, `record FlightLoad(String code,
    String route, int booked, int seats) {
  BigDecimal percent() {   // HALF_UP, 2
    return percent(booked, seats);
  }
  static final Comparator<FlightLoad>
    BY_LOAD_DESC = (a, b) -> Long.compare(
      (long) b.booked * a.seats,
      (long) a.booked * b.seats);
}
Stream.concat(perFlight, footer)
      .toList();             // [16]`, 5.2, 1.05, 4.3, 3.4, { label: "MODERN  ·  record, exact, no double", fontSize: 9.5, name: "modern code" });
  outputBox(s, "All 3: SQ21 SIN-EWR 159/161 98.76% · TR808 98.21% · SQ318 96.60% … MH602 61.25% · TOTAL 1808/2078 87.01% · EMPTY min=2 max=63 avg=33.75", 0.5, 4.55, 9.0, 0.5, "ba output");
  s.addNotes("~3 min. The worked example three ways. The Java 8 version replaces the boxed lists and the min-max loop with mapToInt, sum and summaryStatistics, but it still sorts and formats with double ratios. The modern version introduces a FlightLoad record. Its percentage is a BigDecimal computed with scale two and HALF_UP, and its comparator compares the exact fractions by cross-multiplying booked and seats as longs, so no floating point is involved at all. Stream.concat joins the per-flight lines and the two footer lines, and Stream.toList from Java 16 collects them. SQ21 is the fullest flight at 98.76 percent. LoadReportRefactoringTest checks that all three print the same ten lines. DEMO: run ModernLoadReport. Question: why cast to long before multiplying?");

  // ===== 12 Pitfalls =====
  s = newSlide("CONTENT", "Worked example", "Pitfalls and best practices");
  const pits = [["double / averagingDouble for money", "Rounding errors, order-dependent results."], ["average().getAsDouble() on empty", "NoSuchElementException; use orElse."], ["== on boxed Integers", "True for 100, false for 1000."], ["map(..).reduce(0, Integer::sum)", "Boxing for nothing; use mapToInt().sum()."], ["printing chars() directly", "You get numbers: [83, 73, 78]."]];
  pits.forEach(([h, d], i) => {
    const y = 1.0 + i * 0.8;
    card(s, 0.5, y, 4.6, 0.7, "FBECEC", "pit " + i);
    iconCircle(s, I.bug, 0.6, y + 0.14, 0.42, C.accent4, "pit icon " + i);
    s.addText([{ text: h, options: { bold: true, color: C.accent4, breakLine: true } }, { text: d, options: { fontSize: 11, color: C.text1 } }], { x: 1.12, y: y + 0.02, w: 3.9, h: 0.66, fontSize: 12.5, margin: 0, valign: "middle", isTextBox: true, objectName: "pit text " + i });
  });
  const dos = ["mapToInt/Long/Double for numeric work", "summaryStatistics for several answers", "BigDecimal or long cents for money", "Explicit scale + HALF_UP when dividing", "Format statistics with Locale.ROOT", "Seed Random in tests; SecureRandom for secrets"];
  card(s, 5.3, 1.0, 4.2, 3.9, C.background2, "do card");
  iconCircle(s, I.check, 5.45, 1.12, 0.45, C.accent1, "do icon");
  s.addText("Best practices", { x: 6.05, y: 1.12, w: 3.3, h: 0.45, fontSize: 15, bold: true, color: C.accent1, margin: 0, valign: "middle", isTextBox: true, objectName: "do title" });
  s.addText(bullets(dos, 12.5).map(r => { r.options.paraSpaceAfter = 7; return r; }), { x: 5.5, y: 1.7, w: 3.9, h: 3.1, margin: 0, valign: "top", isTextBox: true, objectName: "do list" });
  s.addNotes("~3 min. Five pitfalls. Using double or averagingDouble for money gives rounding errors that depend on the order of addition. Calling getAsDouble on the average of an empty stream throws NoSuchElementException. Comparing boxed Integers with double-equals works for small numbers and fails for large ones. Mapping to Integer and reducing with Integer::sum boxes every value for no benefit. And printing the result of chars directly shows numbers rather than letters. On the right, the habits: switch to a primitive stream for numeric work, use summaryStatistics when you need several answers, keep money in BigDecimal or long cents, always give a scale and HALF_UP when dividing, format statistics with Locale.ROOT, and seed Random only in tests. DEMO: run PrimitiveStreamsTest. Question: which pitfall would only show up in production?");

  // ===== 13 Interview =====
  pres.addSection({ title: "Practice" });
  s = newSlide("CONTENT", "Practice", "Interview questions");
  const qa = [
    ["Why do primitive streams exist?", "No boxing, and numeric terminals: sum, average, summaryStatistics."],
    ["range vs rangeClosed?", "range(1, 5) is 1..4; rangeClosed(1, 5) is 1..5."],
    ["Average of an empty IntStream?", "OptionalDouble.empty, not 0 and not an exception."],
    ["Why not double for money?", "Binary fractions: 0.1 + 0.2 = 0.30000000000000004; order-dependent."],
    ["Count each character of a String?", "s.chars().mapToObj(c -> (char) c).collect(groupingBy(identity(), TreeMap::new, counting()))."],
  ];
  qa.forEach(([q, a], i) => {
    const colI = i % 2, row = Math.floor(i / 2);
    const x = i === 4 ? 0.5 : 0.5 + colI * 4.6, y = 1.0 + row * 1.38, w = i === 4 ? 9.0 : 4.4;
    card(s, x, y, w, 1.22, C.background2, "qa card " + i);
    s.addText("Q" + (i + 1), { shape: pres.shapes.OVAL, x: x + 0.12, y: y + 0.14, w: 0.42, h: 0.42, fill: { color: C.text2 }, line: { color: C.text2 }, fontSize: 11, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "q badge " + i });
    s.addText([{ text: q, options: { bold: true, color: C.text2, breakLine: true } }, { text: a, options: { color: C.text1, fontSize: 12 } }], { x: x + 0.65, y: y + 0.06, w: w - 0.8, h: 1.1, fontSize: 13.5, margin: 0, valign: "middle", isTextBox: true, objectName: "qa text " + i });
  });
  s.addNotes("~3 min. Five questions that come up often. The first checks that the candidate knows about boxing and the numeric terminals. The second is a classic off-by-one check. The third is subtle: the average of nothing is an empty OptionalDouble, not zero and not an exception, while the sum of nothing is zero. The fourth is essential in any finance team; a strong answer mentions binary fractions, order dependence, and BigDecimal with an explicit rounding mode. The fifth is a very common live-coding task; a good follow-up is the first non-repeated character, which needs a LinkedHashMap, and a senior follow-up asks about emoji and codePoints. DEMO: run QuizAnswersTest. Question: which of these would you give as a live-coding task?");

  // ===== 14 Pros/cons =====
  s = newSlide("CONTENT", "Practice", "Pros and cons of primitive streams");
  const pros = ["No boxing: less memory and garbage", "sum/average/statistics built in", "Empty-safe: Optional for average/min/max", "range/iterate replace counting loops", "chars()/codePoints() for text analysis", "Random streams for tests and simulations"];
  const consL = ["Only int, long and double", "No collect(Collector): box first", "No BigDecimal stream for money", "double results are inexact", "chars() counts UTF-16 units, not characters", "Switching types adds mapToX/boxed noise"];
  [[pros, "Pros", C.accent1, I.plus, 0.5, C.background2], [consL, "Cons / limitations", C.accent4, I.minus, 5.1, "FBECEC"]].forEach(([list, h, colr, ic, x, bg]) => {
    card(s, x, 1.0, 4.4, 3.65, bg, h + " card");
    iconCircle(s, ic, x + 0.2, 1.15, 0.5, colr, h);
    s.addText(h, { x: x + 0.85, y: 1.15, w: 3.3, h: 0.5, fontSize: 18, bold: true, color: colr, margin: 0, valign: "middle", isTextBox: true, objectName: h + " heading" });
    s.addText(bullets(list, 14).map(r => { r.options.paraSpaceAfter = 8; return r; }), { x: x + 0.25, y: 1.85, w: 3.95, h: 2.7, margin: 0, valign: "top", isTextBox: true, objectName: h + " list" });
  });
  s.addNotes("~2 min. A balanced view. On the plus side: no boxing, so less memory and less garbage; sum, average and summary statistics built in; empty-safe Optional results for average, min and max; range and iterate replace counting loops; chars and codePoints for text analysis; and seeded random streams for tests and simulations. On the minus side: only three element types exist; there is no collect that takes a Collector, so you must box first to group; there is no BigDecimal stream, so money still uses Stream of BigDecimal or long cents; double results are inexact; chars counts UTF-16 units rather than characters; and switching between object and primitive streams adds some noise. DEMO: none. Question: in your code, which loops would become a range or a mapToInt?");

  // ===== 15 Summary =====
  pres.addSection({ title: "Wrap-up" });
  s = newSlide("DARK_TITLE", "Wrap-up", "Summary");
  const sum = ["IntStream, LongStream, DoubleStream [8]: primitives, no boxing", "range is half-open; iterate with a predicate [9]", "sum, average (Optional), summaryStatistics", "mapToInt ⇄ boxed / mapToObj", "Money: BigDecimal or long cents, never double", "chars()/codePoints() and seeded Random streams"];
  s.addText(bullets(sum, 14, C.background1), { x: 0.5, y: 2.1, w: 5.2, h: 2.9, margin: 0, valign: "top", isTextBox: true, objectName: "summary bullets" });
  card(s, 6.0, 0.6, 3.5, 2.05, "143F32", "exercise card");
  iconCircle(s, I.code, 6.2, 0.78, 0.45, C.accent2, "exercise");
  s.addText([{ text: "Exercise (~40 min)", options: { bold: true, color: C.accent2, breakLine: true } }, { text: "12 problems in Exercise12: seat occupancy per flight and character frequency of a PNR list.", options: { color: C.background1, fontSize: 12 } }],
    { x: 6.75, y: 0.75, w: 2.65, h: 1.8, fontSize: 14, margin: 0, valign: "top", isTextBox: true, objectName: "exercise text" });
  card(s, 6.0, 2.85, 3.5, 2.05, "143F32", "next card");
  iconCircle(s, I.rocket, 6.2, 3.03, 0.45, C.accent1, "next");
  s.addText([{ text: "Next: Lesson 13", options: { bold: true, color: C.accent2, breakLine: true } }, { text: "Advanced Stream Operations: custom collectors, iterate/generate, batching, running totals.", options: { color: C.background1, fontSize: 12 } }],
    { x: 6.75, y: 3.0, w: 2.65, h: 1.8, fontSize: 14, margin: 0, valign: "top", isTextBox: true, objectName: "next text" });
  s.addNotes("~3 min. Recap: the three primitive streams hold primitives and avoid boxing; range is half-open and iterate with a predicate reads like a for loop; sum, average with an Optional result, and summaryStatistics do the numeric work; mapToInt goes in, boxed and mapToObj come back out; money is BigDecimal or long cents, never double; and chars, codePoints and seeded random streams cover text and simulations. The exercise has twelve problems: total seats and bookings, occupancy percentage per flight as BigDecimal, the fullest flight compared exactly, flights at least ninety percent booked, and character statistics for a fixed list of eight PNRs. Remove @Disabled in Exercise12Test. DEMO: run Solution12. Question: which problem needs integer arithmetic to avoid double?");

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
})();
