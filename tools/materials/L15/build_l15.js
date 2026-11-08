// L15 slide deck generator - ITGreenZone Java Functional Programming
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa");
const { applyTheme } = require("/root/.claude/skills/synced/2eb53c35-a0c8-4343-9257-776fcd7fed67_dd7dcff0-93ee-4601-a8ce-12573fa09cd9/pptx/scripts/apply_theme.js");

const OUT = process.argv[2] || "L15_FPPrinciples_Slides.pptx";
const LESSON = "15";
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
pres.title = "L15 Functional Programming Principles in Java";
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
  let s = newSlide("DARK_TITLE", "Introduction", "Functional Programming Principles in Java");
  s.addText("LESSON 15  ·  MODULE 3  ·  FUNCTIONAL DESIGN", { x: 0.5, y: 0.6, w: 5.5, h: 0.35, fontSize: 12, bold: true, color: C.accent2, charSpacing: 2, margin: 0, isTextBox: true, objectName: "kicker" });
  s.addText("purity · edges · immutability · higher-order functions · currying · composition · laziness · memoization", { x: 0.5, y: 3.15, w: 5.0, h: 0.8, fontSize: 15, italic: true, color: C.background2, margin: 0, isTextBox: true, objectName: "subtitle" });
  card(s, 6.0, 0.6, 3.5, 4.3, "143F32", "objectives card");
  s.addText("You will be able to", { x: 6.25, y: 0.75, w: 3.1, h: 0.35, fontSize: 14, bold: true, color: C.accent2, margin: 0, isTextBox: true, objectName: "objectives heading" });
  ["Keep side effects at the edges", "Make records truly immutable", "Curry and partially apply functions", "Compose pipelines from small steps", "Use laziness and memoize safely"].forEach((o, i) => {
    const y = 1.2 + i * 0.72;
    s.addText(String(i + 1), { shape: pres.shapes.OVAL, x: 6.25, y: y + 0.05, w: 0.36, h: 0.36, fill: { color: C.accent1 }, line: { color: C.accent1 }, fontSize: 12, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "objective number " + (i + 1) });
    s.addText(o, { x: 6.75, y, w: 2.6, h: 0.62, fontSize: 12.5, color: C.background1, valign: "middle", margin: 0, isTextBox: true, objectName: "objective " + (i + 1) });
  });
  s.addNotes("~2 min. Module 3 moves from the Stream API to functional design. L01 introduced pure functions and immutability; this lesson goes deeper and makes them practical. We separate pure calculations from side effects with a functional core and an imperative shell, inject the clock, and look at referential transparency. We see why a record is only shallowly immutable and how to fix it. Then come higher-order functions, currying, partial application and composition, the tools for building pipelines from small parts. We finish with laziness through Supplier and memoization, including a real trap with computeIfAbsent. The worked example redesigns a fee calculator, and the exercise builds a renewal-quote pipeline. DEMO: open package l15_fp_principles. Question: which class in your code is hardest to test, and why?");

  // ===== 2 Problem =====
  pres.addSection({ title: "Purity and immutability" });
  s = newSlide("CONTENT", "Purity and immutability", "The problem: a fee calculator nobody can reuse");
  codeBlock(s, `class LegacyFeeCalculator {
  private Map<String, BigDecimal> totalFees = ..; // state
  private List<String> lines = ..;               // state
  BigDecimal calculate(Transaction t) {
    BigDecimal fee = t.amount().multiply(0.0025)..;
    if (fee < 0.50) fee = 0.50;
    if (!"SGD".equals(t.currency())) fee = fee + 1%;
    if (fee > 10.00) fee = 10.00;
    totalFees.put(..);   lines.add(..);         // side effects
    return fee;
  }
}`, 0.5, 1.05, 5.4, 3.3, { label: "BEFORE  ·  before/LegacyFeeCalculator", fontSize: 9.5, name: "legacy code" });
  card(s, 6.1, 1.05, 3.4, 3.3, "FBECEC", "problem card");
  s.addText([{ text: "What is wrong?", options: { bold: true, color: C.accent4, fontSize: 15, breakLine: true } },
    { text: "4 rules fused in one method", options: { bullet: true, breakLine: true } },
    { text: "cannot test the FX rule alone", options: { bullet: true, breakLine: true } },
    { text: "cannot reorder or reuse rules", options: { bullet: true, breakLine: true } },
    { text: "hidden state grows each call", options: { bullet: true, breakLine: true } },
    { text: "no audit of how a fee was made", options: { bullet: true } }],
    { x: 6.25, y: 1.15, w: 3.15, h: 3.1, fontSize: 12.5, color: C.text1, margin: 0, valign: "top", paraSpaceAfter: 6, isTextBox: true, objectName: "problem text" });
  outputBox(s, "All 3 versions: T010 533.03 USD -> fee 6.66 · T023 914.46 USD -> fee 10.00 · TOTAL FEES {SGD=42.95, USD=16.66} on 45 debits", 0.5, 4.5, 9.0, 0.5, "problem output");
  s.addNotes("~3 min. The business question: a processing fee on every debit, with four rules. A base of 0.25 percent, a minimum of fifty cents, a one percent surcharge for foreign currency, and a cap of ten. The legacy class fuses all four rules into one method and keeps totals and report lines as fields. You cannot test the FX rule alone, reuse the cap for another product, change the order of rules, or explain afterwards how a fee was built. Calling it twice also grows its hidden state. Fees are charged in the transaction's currency, so totals are kept per currency: 42.95 in SGD and 16.66 in USD. By the end of the lesson the same rules become data. DEMO: run LegacyFeeCalculator. Question: how would you test only the cap?");

  // ===== 3 Purity, edges =====
  s = newSlide("CONTENT", "Purity and immutability", "Pure core, side effects at the edges");
  codeBlock(s, `// IMPURE: reads the real clock; a test written today fails next month
List<String> expiringSoonImpure(List<Policy> ps, int days) {
  return expiringSoon(ps, LocalDate.now(), days);
}
// PURE: the date is a parameter
List<String> expiringSoon(List<Policy> ps, LocalDate today, int days)
// EDGE ADAPTER: inject a Clock (prod: systemDefaultZone, tests: Clock.fixed)
List<String> expiringSoon(List<Policy> ps, Clock clock, int days) {
  return expiringSoon(ps, LocalDate.now(clock), days);
}`, 0.5, 1.05, 9.0, 2.45, { label: "theory/PurityAndEdges", fontSize: 10, name: "purity code" });
  box(s, 0.5, 3.7, 2.6, 1.1, "Shell (edges)", "clock · DB · console", C.accent4, "shell1");
  box(s, 3.45, 3.7, 3.1, 1.1, "Functional core", "pure: data in, data out", C.accent1, "core");
  box(s, 6.9, 3.7, 2.6, 1.1, "Shell (edges)", "print · save · send", C.accent4, "shell2");
  arrow(s, 3.1, 4.25, 3.45, 4.25, "", "e1", true);
  arrow(s, 6.55, 4.25, 6.9, 4.25, "", "e2", true);
  s.addNotes("~3 min. A function that reads the clock is impure: its answer changes with the real date, so a test that passes today fails next month. Make the date a parameter and the function is pure: same inputs, same output, no side effects. With the course date, four policies expire within thirty days, POL-509 in five days first. At the edge, an adapter takes a Clock; production passes the system clock, tests pass Clock.fixed, and the result is identical. This is the 'functional core, imperative shell' pattern: reading the clock, the database or the console happens at the edges, and everything in the middle is pure and trivially testable. Pure calls are also referentially transparent: you can replace a call by its value. DEMO: run PurityAndEdges. Question: what else in your code reads 'now'?");

  // ===== 4 Immutability =====
  s = newSlide("CONTENT", "Purity and immutability", "Records are only shallowly immutable");
  codeBlock(s, `record NaiveStatement(String account, List<String> txnIds) { }
// caller adds "T999" to its list afterwards -> [T009, T012, T999]

record Statement(String account, List<String> txnIds, BigDecimal closing) {
  Statement {                                  // compact constructor
    Objects.requireNonNull(account, "account");
    txnIds = List.copyOf(txnIds);              // copy + reject nulls
    closing = closing.setScale(2);
  }
  Statement withClosing(BigDecimal c) { return new Statement(account, txnIds, c); }
}`, 0.5, 1.05, 9.0, 2.7, { label: "theory/ImmutabilityInDepth", fontSize: 10, name: "imm code" });
  tbl(s, ["Call", "Real result"], [
    ["safe record after the caller adds T999", "[T009, T012]"],
    ["Collections.unmodifiableList(src), then src.add(\"B\")", "view=[A, B]  ·  List.copyOf: copy=[A]"],
    ["List.copyOf(..).add(..)", "UnsupportedOperationException"],
    ["original.withClosing(12000)", "original 12500.00, updated 12000.00"],
  ], 0.5, 3.9, 9.0, [5.0, 4.0], 0.27, "imm table", [0], 9.5);
  s.addNotes("~3 min. A record makes its fields final, but if a field is a mutable list, the caller who passed it in can still change it. The naive statement shows T999 appearing after construction. The fix belongs in the compact constructor: validate, then copy with List.copyOf, which also rejects null elements. Be careful with Collections.unmodifiableList: it is only a read-only view, so changes to the source show through, as the output view A, B shows, while the copy stays A. Finally, instead of setters, write 'withers' that return a new value; the original statement keeps its closing balance. Immutable values are safe to share between threads and to cache, which matters for the rest of this module. DEMO: run ImmutabilityInDepth. Question: which of your records hold a List?");

  // ===== 5 HOFs =====
  pres.addSection({ title: "Functions as building blocks" });
  s = newSlide("CONTENT", "Functions as building blocks", "Higher-order functions: take or return functions");
  codeBlock(s, `// returns a function (a factory)
static UnaryOperator<BigDecimal> percentOff(int percent) {
  BigDecimal factor = BigDecimal.valueOf(100 - percent).movePointLeft(2);
  return amount -> money(amount.multiply(factor));
}
static Predicate<Transaction> debitAbove(BigDecimal limit) {
  return t -> t.type() == DEBIT && t.amount().compareTo(limit) > 0;
}
// takes a function
static <T> T applyTimes(UnaryOperator<T> f, int times, T start) { .. }`, 0.5, 1.05, 9.0, 2.6, { label: "theory/HigherOrderFunctions", fontSize: 10, name: "hof code" });
  tbl(s, ["Call", "Real result"], [
    ["percentOff(10).apply(1240.50)", "1116.45"],
    ["applyTimes(percentOff(10), 3, 1240.50)", "904.33"],
    ["transactions.filter(debitAbove(1000.00)).count()", "3"],
  ], 0.5, 3.8, 9.0, [5.5, 3.5], 0.33, "hof table", [0], 10.5);
  s.addNotes("~3 min. A higher-order function either takes a function or returns one. percentOff is a factory: given ten, it returns a function that takes ten percent off any amount; the factor is computed once and captured by the lambda. debitAbove returns a Predicate, which reads well inside filter: three debits are above one thousand. applyTimes takes a function and applies it repeatedly; ten percent off three times turns 1,240.50 into 904.33. These factories replace the configuration flags and if-else chains that usually accumulate inside one big method. Because the returned functions capture only final values, they are pure and safe to share. DEMO: run HigherOrderFunctions, first lines. Question: which flag-driven method in your code could become a factory?");

  // ===== 6 Currying & partial application =====
  s = newSlide("CONTENT", "Functions as building blocks", "Currying and partial application");
  codeBlock(s, `BiFunction<BigDecimal, BigDecimal, BigDecimal> FEE =
    (rate, amount) -> money(amount.multiply(rate));

Function<BigDecimal, Function<BigDecimal, BigDecimal>> CURRIED_FEE =
    rate -> amount -> money(amount.multiply(rate));        // curried by hand

static <A, B, R> Function<A, Function<B, R>> curry(BiFunction<A, B, R> f) {
  return a -> b -> f.apply(a, b);
}
static <A, B, R> Function<B, R> partial(BiFunction<A, B, R> f, A first) {
  return b -> f.apply(first, b);
}
Function<BigDecimal, BigDecimal> standardFee = partial(FEE, new BigDecimal("0.0025"));
Function<BigDecimal, BigDecimal> premiumFee  = curry(FEE).apply(new BigDecimal("0.0010"));`, 0.5, 1.05, 9.0, 3.1, { label: "theory/HigherOrderFunctions", fontSize: 10, name: "curry code" });
  outputBox(s, "FEE.apply(0.0025, 1432.93) = CURRIED_FEE.apply(0.0025).apply(1432.93) = 3.58 · standard / premium fee: 3.58 / 1.43", 0.5, 4.3, 9.0, 0.55, "curry output");
  s.addNotes("~3 min. Currying turns a function of two arguments into a function that takes the first argument and returns a function of the second. In Java that is Function of A to Function of B to R. The curried fee takes the rate now and the amount later. The curry helper does this for any BiFunction. Partial application is the practical use: fix some arguments now, supply the rest later. Fixing the rate gives a standard fee function and a premium fee function, both ordinary Functions you can pass to map or compose. The results match: 3.58 either way, and 1.43 at the premium rate. Java has no syntax for currying, so use it where it removes repetition, not everywhere. DEMO: run HigherOrderFunctions. Question: which argument of your methods is usually the same?");

  // ===== 7 Composition =====
  s = newSlide("CONTENT", "Functions as building blocks", "Composition: pipelines from small functions");
  codeBlock(s, `plus2.andThen(times10).apply(1)   // 30: plus2 first, then times10
plus2.compose(times10).apply(1)   // 12: times10 first, then plus2

static Function<BigDecimal, BigDecimal> pipeline(List<Function<BigDecimal, BigDecimal>> steps) {
  return steps.stream().reduce(Function.identity(), Function::andThen);
}
pipeline(List.of(percentOff(10), p -> p.subtract(25.00), ADD_GST)).apply(1240.50)  // 1189.68
pipeline(List.of()).apply(1240.50)                                                 // 1240.50`, 0.5, 1.05, 9.0, 2.35, { label: "theory/HigherOrderFunctions", fontSize: 10, name: "compose code" });
  tbl(s, ["Combinator", "Meaning", "Since"], [
    ["f.andThen(g)", "g(f(x)): left to right", "8"],
    ["f.compose(g)", "f(g(x)): right to left", "8"],
    ["Function.identity()", "x → x: neutral element of composition", "8"],
    ["Predicate.and / or / negate, Predicate.not", "combine conditions", "8 / 11"],
    ["BinaryOperator.minBy / maxBy", "pick by comparator", "8"],
  ], 0.5, 3.55, 9.0, [3.6, 4.4, 1.0], 0.27, "compose table", [0], 10);
  s.addNotes("~3 min. Composition builds bigger functions from smaller ones. andThen runs left to right: plus two then times ten gives thirty. compose runs right to left: times ten first, then plus two, gives twelve. With a list of steps, reduce with Function.identity and Function::andThen folds them into one function. Identity is the neutral element, exactly like zero for addition, so an empty pipeline returns its input unchanged. Ten percent off, twenty-five off and GST on 1,240.50 gives 1,189.68. The pipeline is just data: a list you can build from configuration, reorder, or extend without touching existing code. Predicates compose too, with and, or, negate and, since Java 11, Predicate.not. DEMO: run HigherOrderFunctions, last lines. Question: why is identity the right starting value for reduce here?");

  // ===== 8 Laziness =====
  pres.addSection({ title: "Laziness and memoization" });
  s = newSlide("CONTENT", "Laziness and memoization", "Laziness with Supplier");
  codeBlock(s, `Optional.of("SQ12").orElse(expensiveDefault.get());   // evaluated anyway
Optional.of("SQ12").orElseGet(expensiveDefault);      // never evaluated
// orElse evaluated=1, orElseGet evaluated=0

int lazyLog(boolean debugEnabled, Supplier<String> message) {
  return debugEnabled ? message.get().length() : 0;   // built only if needed
}
// debug off, then on: message built 1 time`, 0.5, 1.05, 9.0, 2.5, { label: "theory/LazinessAndMemoization", fontSize: 10, name: "lazy code" });
  tbl(s, ["Where Java is lazy with a Supplier", "Since"], [
    ["Optional.orElseGet / or / orElseThrow(Supplier)", "8 / 9 / 10"],
    ["Objects.requireNonNull(obj, Supplier<String>)", "8"],
    ["Map.computeIfAbsent(key, Function)", "8"],
    ["java.util.logging Logger.fine(Supplier<String>)", "8"],
    ["Stream intermediate operations (L06)", "8"],
  ], 0.5, 3.7, 9.0, [7.0, 2.0], 0.24, "lazy table", [0], 9.5);
  s.addNotes("~3 min. Laziness means computing a value only when it is needed. A Supplier is a computation not yet run. Optional.orElse evaluates its argument always, even when the Optional has a value; orElseGet takes a Supplier and runs it only when the Optional is empty. The output shows one evaluation versus zero. The same idea makes logging cheap: pass a Supplier for the message, and the string is built only when the level is enabled, here once. The JDK uses this pattern widely: orElseGet, the Supplier overload of requireNonNull, computeIfAbsent, the Supplier overloads of java.util.logging, and of course lazy stream pipelines from L06. Prefer the Supplier version whenever the argument is expensive or has side effects. DEMO: run LazinessAndMemoization, first lines. Question: where do you build log strings that are never printed?");

  // ===== 9 Memoization =====
  s = newSlide("CONTENT", "Laziness and memoization", "Memoization, and the computeIfAbsent trap");
  codeBlock(s, `static <K, V> Function<K, V> memoize(Function<K, V> f) {
  Map<K, V> cache = new ConcurrentHashMap<>();
  return key -> cache.computeIfAbsent(key, f);
}
// FX rate: 12 calls, 2 real lookups

// TRAP: the mapping function changes the SAME map (recursion)
long fibBroken(int n, Map<Integer, Long> cache) {
  return cache.computeIfAbsent(n,
      k -> fibBroken(k-1, cache) + fibBroken(k-2, cache));
}
// -> ConcurrentModificationException (HashMap)
// FIX: get, compute OUTSIDE, then put
// fib(90) = 2880067194370816120`, 0.5, 1.05, 6.1, 3.75, { label: "theory/LazinessAndMemoization", fontSize: 9.5, name: "memo code" });
  card(s, 6.8, 1.05, 2.7, 3.75, "FBECEC", "memo card");
  s.addText([{ text: "Memoize only when…", options: { bold: true, color: C.accent4, fontSize: 14, breakLine: true } },
    { text: "the function is pure (same input, same output)", options: { bullet: true, breakLine: true } },
    { text: "inputs repeat often", options: { bullet: true, breakLine: true } },
    { text: "the cache is bounded or the key set is small", options: { bullet: true, breakLine: true } },
    { text: "the mapping function never touches the cache", options: { bullet: true } }],
    { x: 6.95, y: 1.15, w: 2.45, h: 3.55, fontSize: 12, color: C.text1, margin: 0, valign: "top", paraSpaceAfter: 6, isTextBox: true, objectName: "memo text" });
  s.addNotes("~3 min. Memoization caches the results of a pure function. With a ConcurrentHashMap and computeIfAbsent it is three lines: twelve FX-rate calls trigger only two real lookups, one per currency. The trap is recursion. A memoized Fibonacci that calls computeIfAbsent from inside its own mapping function modifies the map during the computation. HashMap detects this and throws ConcurrentModificationException, which our code shows; for ConcurrentHashMap the Javadoc forbids it, and depending on the keys it can throw IllegalStateException or hang. The fix is to check, compute outside the map operation, then put: Fibonacci of ninety is instant. Memoize only pure functions with repeating inputs, a bounded cache, and a mapping function that never touches the cache. DEMO: run LazinessAndMemoization. Question: what goes wrong when you memoize a function that reads the clock?");

  // ===== 10 Worked example =====
  pres.addSection({ title: "Worked example" });
  s = newSlide("CONTENT", "Worked example", "Refactor: fee rules as small pure functions");
  codeBlock(s, `Function<Transaction, BigDecimal> BASE =
    t -> pct(t.amount(), "0.0025");
BiFunction<Transaction, BigDecimal, BigDecimal>
  MINIMUM = (t, fee) -> fee.max(0.50),
  FX_SURCHARGE = (t, fee) -> "SGD".equals(
      t.currency()) ? fee : fee.add(pct(.., "0.01")),
  CAP = (t, fee) -> fee.min(10.00);

static BigDecimal fee(Transaction t) {
  return BASE.andThen(forTxn(t, MINIMUM))
    .andThen(forTxn(t, FX_SURCHARGE))
    .andThen(forTxn(t, CAP)).apply(t);
}`, 0.5, 1.05, 4.5, 3.4, { label: "AFTER  ·  after/FunctionalFeeCalculator", fontSize: 9.5, name: "after code" });
  codeBlock(s, `record FeeRule(String name, BiFunction<
    Transaction, BigDecimal, BigDecimal> step) {}
record Quote(Transaction txn, BigDecimal fee,
             List<String> audit) {
  Quote apply(FeeRule r) { .. }   // new Quote
}
List<FeeRule> STANDARD_RULES = List.of(
  new FeeRule("base", ..),
  new FeeRule("min", ..),
  new FeeRule("fx", ..),
  new FeeRule("cap", ..));

quote(t023, STANDARD_RULES).audit()
// [base=2.29, min=2.29, fx=11.43, cap=10.00]`, 5.2, 1.05, 4.3, 3.4, { label: "MODERN  ·  modern/FeePipeline  ·  rules as data", fontSize: 9.5, name: "modern code" });
  outputBox(s, "All 3: T001 -> 0.50 · T010 USD -> 6.66 · T023 USD -> 10.00 · T042 -> 3.58 · TOTAL FEES {SGD=42.95, USD=16.66} on 45 debits", 0.5, 4.55, 9.0, 0.5, "ba output");
  s.addNotes("~3 min. The worked example three ways. The Java 8 version splits the four rules into small pure functions: a base function and three steps that see the transaction and the fee so far. Each is a constant you can test alone, and fee composes them with andThen, using partial application to fix the transaction. The modern version goes one step further: rules become data. A FeeRule record holds a name and a step; the standard rules are a list; and folding the list over an immutable Quote record yields the fee plus an audit trail of every step, such as base 2.29, FX 11.43, capped at 10.00 for T023. Changing a product means changing a list, not code. All three versions print the same lines. DEMO: run FeePipeline. Question: how would you add a weekend surcharge?");

  // ===== 11 Pitfalls =====
  s = newSlide("CONTENT", "Worked example", "Pitfalls and best practices");
  const pits = [["LocalDate.now() inside business logic", "Untestable, changes daily."], ["Record with a List component, no copy", "Caller can change it later."], ["unmodifiableList as \"immutable\"", "It is a view of a mutable list."], ["orElse(expensive())", "Evaluated even when not needed."], ["Recursive computeIfAbsent", "CME / IllegalStateException / hang."]];
  pits.forEach(([h, d], i) => {
    const y = 1.0 + i * 0.8;
    card(s, 0.5, y, 4.6, 0.7, "FBECEC", "pit " + i);
    iconCircle(s, I.bug, 0.6, y + 0.14, 0.42, C.accent4, "pit icon " + i);
    s.addText([{ text: h, options: { bold: true, color: C.accent4, breakLine: true } }, { text: d, options: { fontSize: 11, color: C.text1 } }], { x: 1.12, y: y + 0.02, w: 3.9, h: 0.66, fontSize: 12.5, margin: 0, valign: "middle", isTextBox: true, objectName: "pit text " + i });
  });
  const dos = ["Pass dates/clocks in; I/O at the edges", "List.copyOf in compact constructors", "Withers instead of setters", "Small named functions; compose them", "Supplier for expensive or optional work", "Memoize pure functions only, bounded"];
  card(s, 5.3, 1.0, 4.2, 3.9, C.background2, "do card");
  iconCircle(s, I.check, 5.45, 1.12, 0.45, C.accent1, "do icon");
  s.addText("Best practices", { x: 6.05, y: 1.12, w: 3.3, h: 0.45, fontSize: 15, bold: true, color: C.accent1, margin: 0, valign: "middle", isTextBox: true, objectName: "do title" });
  s.addText(bullets(dos, 12.5).map(r => { r.options.paraSpaceAfter = 7; return r; }), { x: 5.5, y: 1.7, w: 3.9, h: 3.1, margin: 0, valign: "top", isTextBox: true, objectName: "do list" });
  s.addNotes("~3 min. Five pitfalls. Calling LocalDate.now inside business logic makes it untestable and its results change daily. A record with a List component and no copy can be changed by its caller. unmodifiableList is a view, not a copy. orElse with an expensive call evaluates it every time. And recursive computeIfAbsent corrupts or blocks the cache. The habits on the right: pass dates or clocks in and keep I/O at the edges; copy collections in compact constructors; return new values with withers rather than setters; write small named functions and compose them; use a Supplier for expensive or optional work; and memoize only pure functions, with a bounded cache. DEMO: run FPPrinciplesTest. Question: which of these would a static analysis tool catch?");

  // ===== 12 Interview =====
  pres.addSection({ title: "Practice" });
  s = newSlide("CONTENT", "Practice", "Interview questions");
  const qa = [
    ["What is referential transparency?", "A call can be replaced by its value without changing the program; it requires purity."],
    ["Are Java records immutable?", "Shallowly. Copy mutable components (List.copyOf) in the compact constructor."],
    ["Currying vs partial application?", "Currying: f(a, b) → a → b → r. Partial application: fix some arguments now."],
    ["andThen vs compose?", "f.andThen(g) = g(f(x)); f.compose(g) = f(g(x))."],
    ["orElse vs orElseGet; when is memoization unsafe?", "orElse is eager, orElseGet lazy. Memoizing impure functions, unbounded caches, or recursive computeIfAbsent."],
  ];
  qa.forEach(([q, a], i) => {
    const colI = i % 2, row = Math.floor(i / 2);
    const x = i === 4 ? 0.5 : 0.5 + colI * 4.6, y = 1.0 + row * 1.38, w = i === 4 ? 9.0 : 4.4;
    card(s, x, y, w, 1.22, C.background2, "qa card " + i);
    s.addText("Q" + (i + 1), { shape: pres.shapes.OVAL, x: x + 0.12, y: y + 0.14, w: 0.42, h: 0.42, fill: { color: C.text2 }, line: { color: C.text2 }, fontSize: 11, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "q badge " + i });
    s.addText([{ text: q, options: { bold: true, color: C.text2, breakLine: true } }, { text: a, options: { color: C.text1, fontSize: 12 } }], { x: x + 0.65, y: y + 0.06, w: w - 0.8, h: 1.1, fontSize: 13.5, margin: 0, valign: "middle", isTextBox: true, objectName: "qa text " + i });
  });
  s.addNotes("~3 min. Five questions on functional principles. Referential transparency is the formal name for 'a call can be replaced by its value'; a strong answer connects it to caching, testing and reasoning. The record question is a classic trap: most candidates say 'yes, immutable'; the good answer says 'shallowly', and shows the compact-constructor copy. Currying versus partial application is often confused; ask for a Java signature. The composition question has a short, precise answer, and you can check it with the quiz. The last question combines laziness and memoization; listen for 'pure functions only' and the recursion trap. DEMO: run QuizAnswersTest. Question: which would you use to separate mid-level from senior candidates?");

  // ===== 13 Pros/cons =====
  s = newSlide("CONTENT", "Practice", "Pros and cons of functional design in Java");
  const pros = ["Pure functions are trivial to test", "Immutable values are thread-safe", "Small rules compose and reorder", "Rules as data: change config, not code", "Clock at the edge: stable tests", "Audit trails come for free"];
  const consL = ["Java has no currying syntax", "Generic signatures get long", "More small objects (withers)", "Teams need shared conventions", "Debugging lambdas is harder", "Not everything should be curried"];
  [[pros, "Pros", C.accent1, I.plus, 0.5, C.background2], [consL, "Cons / limitations", C.accent4, I.minus, 5.1, "FBECEC"]].forEach(([list, h, colr, ic, x, bg]) => {
    card(s, x, 1.0, 4.4, 3.65, bg, h + " card");
    iconCircle(s, ic, x + 0.2, 1.15, 0.5, colr, h);
    s.addText(h, { x: x + 0.85, y: 1.15, w: 3.3, h: 0.5, fontSize: 18, bold: true, color: colr, margin: 0, valign: "middle", isTextBox: true, objectName: h + " heading" });
    s.addText(bullets(list, 14).map(r => { r.options.paraSpaceAfter = 8; return r; }), { x: x + 0.25, y: 1.85, w: 3.95, h: 2.7, margin: 0, valign: "top", isTextBox: true, objectName: h + " list" });
  });
  s.addNotes("~2 min. A balanced view. On the plus side: pure functions are trivial to test; immutable values can be shared between threads without locks; small rules compose and can be reordered; rules can become data, so a product change is a configuration change; injecting the clock gives stable tests; and an audit trail falls out of folding immutable values. On the minus side: Java has no syntax for currying, so curried types are long; generic signatures in general can be hard to read; withers create more small objects, which is usually cheap but not free; a team needs shared conventions; debugging chains of lambdas is harder; and not everything should be curried or composed. Use these tools where they remove repetition or make rules testable. DEMO: none. Question: which rule in your system changes most often?");

  // ===== 14 Exercise =====
  s = newSlide("CONTENT", "Practice", "Exercise: a renewal-quote pipeline");
  codeBlock(s, `UnaryOperator<BigDecimal> quote = pipeline(List.of(
    tierDiscount(tier),                                   // partial application (0% / 5% / 10%)
    when(p -> p.compareTo(new BigDecimal("500.00")) > 0,  // conditional step
         flatOff(new BigDecimal("25.00"))),
    addGst()));                                           // +9%
quote.apply(policy.premium());`, 0.5, 1.05, 9.0, 1.75, { label: "exercise/Exercise15  ·  build each step, then compose", fontSize: 10, name: "ex code" });
  tbl(s, ["Step", "Expected (from Solution15)"], [
    ["percentOff(10) · flatOff(25.00) · capAt(1000.00) · addGst on 1240.50", "1116.45 · 1215.50 · 1000.00 · 1352.15"],
    ["RISK_LOADING.apply(15).apply(1240.50)  (curried)", "1426.58"],
    ["tierDiscount(GOLD).apply(1240.50)  (partial application)", "1178.48"],
    ["renewalQuote(POL-502)  (GOLD, 1240.50)", "1257.29"],
    ["renewalQuotes()", "{POL-501=1888.43, POL-502=1257.29, … POL-510=848.01}"],
  ], 0.5, 3.0, 9.0, [5.0, 4.0], 0.36, "ex table", [0], 10);
  s.addNotes("~2 min. The exercise builds a renewal-quote pipeline for the ten insurance policies, entirely from small pure functions. You write percentOff, flatOff that never goes below zero, capAt and addGst; a pipeline that composes any list of steps with identity for an empty list; a curried risk loading; a tier discount written as a BiFunction and then partially applied; and a conditional step called when. Then you combine them: tier discount, twenty-five off only if the price is still over five hundred, then GST. POL-502 belongs to a GOLD customer, so 1,240.50 becomes 1,257.29. Every expected value is in the Javadoc and in Exercise15Test. DEMO: run Solution15. Question: in which order would you write and test these functions?");

  // ===== 15 Summary =====
  pres.addSection({ title: "Wrap-up" });
  s = newSlide("DARK_TITLE", "Wrap-up", "Summary");
  const sum = ["Pure core, side effects (clock, I/O) at the edges", "Records are shallow: copy collections, use withers", "Factories, currying, partial application", "Compose: andThen, compose, reduce(identity, andThen)", "Supplier for laziness; memoize pure functions only", "Rules as data: FeeRule list + audit trail"];
  s.addText(bullets(sum, 14, C.background1), { x: 0.5, y: 2.1, w: 5.2, h: 2.9, margin: 0, valign: "top", isTextBox: true, objectName: "summary bullets" });
  card(s, 6.0, 0.6, 3.5, 2.05, "143F32", "exercise card");
  iconCircle(s, I.code, 6.2, 0.78, 0.45, C.accent2, "exercise");
  s.addText([{ text: "Exercise (~40 min)", options: { bold: true, color: C.accent2, breakLine: true } }, { text: "Exercise15: a composable renewal-quote pipeline built from small pure functions.", options: { color: C.background1, fontSize: 12 } }],
    { x: 6.75, y: 0.75, w: 2.65, h: 1.8, fontSize: 14, margin: 0, valign: "top", isTextBox: true, objectName: "exercise text" });
  card(s, 6.0, 2.85, 3.5, 2.05, "143F32", "next card");
  iconCircle(s, I.rocket, 6.2, 3.03, 0.45, C.accent1, "next");
  s.addText([{ text: "Next: Lesson 16", options: { bold: true, color: C.accent2, breakLine: true } }, { text: "Records, Sealed Types & Pattern Matching (Java 16–21).", options: { color: C.background1, fontSize: 12 } }],
    { x: 6.75, y: 3.0, w: 2.65, h: 1.8, fontSize: 14, margin: 0, valign: "top", isTextBox: true, objectName: "next text" });
  s.addNotes("~3 min. Recap: keep a pure core and push side effects like the clock and I/O to the edges; records are only shallowly immutable, so copy collections in the compact constructor and use withers; factories, currying and partial application create specialised functions; andThen, compose and reduce with identity build pipelines; Supplier gives laziness, and memoization is only for pure functions with a bounded cache; and rules can be data, with an audit trail for free. The exercise asks you to build the renewal-quote pipeline step by step. Next, L16 adds the Java 16 to 21 features that make functional design in Java really comfortable: records, sealed types and pattern matching. DEMO: run Solution15. Question: which of today's ideas will you try first at work?");

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
})();
