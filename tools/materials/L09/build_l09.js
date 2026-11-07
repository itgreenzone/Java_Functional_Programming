// L09 slide deck generator - ITGreenZone Java Functional Programming
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa");
const { applyTheme } = require("/root/.claude/skills/synced/2eb53c35-a0c8-4343-9257-776fcd7fed67_dd7dcff0-93ee-4601-a8ce-12573fa09cd9/pptx/scripts/apply_theme.js");

const OUT = process.argv[2] || "L09_TerminalReduction_Slides.pptx";
const LESSON = "09";
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
pres.title = "L09 Terminal Operations & Reduction";
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
    bug: await icon(fa.FaBug), list: await icon(fa.FaListUl), compress: await icon(fa.FaCompressAlt),
    search: await icon(fa.FaSearch), sort: await icon(fa.FaSortAmountUp), checkd: await icon(fa.FaCheckDouble),
  };
  const tbl = (s, head, rows, x, y, w, colW, rowH, name, monoCols = [0], fs = 10.5) => {
    const h = head.map(t => ({ text: t, options: { bold: true, color: C.background1, fill: { color: C.text2 } } }));
    const r = rows.map((row, i) => row.map((c, j) => ({ text: c, options: Object.assign({ fill: { color: i % 2 ? C.background1 : C.background2 }, color: C.text1, fontSize: fs }, monoCols.includes(j) ? { fontFace: MONO, fontSize: fs - 0.5, bold: j === 0 } : {}) })));
    s.addTable([h, ...r], { x, y, w, colW, rowH, border: { type: "solid", pt: 0.5, color: "D5E3DA" }, valign: "middle", margin: [2, 5, 2, 5], objectName: name });
  };
  const note = (s, text, y, color, name) => s.addText(text, { x: 0.5, y, w: 9, h: 0.4, fontSize: 12.5, italic: true, color: color || C.text2, margin: 0, isTextBox: true, objectName: name });

  // ===== 1 Title =====
  pres.addSection({ title: "Introduction" });
  let s = newSlide("DARK_TITLE", "Introduction", "Terminal Operations & Reduction");
  s.addText("LESSON 09  ·  MODULE 2 STREAM API", { x: 0.5, y: 0.6, w: 5.5, h: 0.35, fontSize: 12, bold: true, color: C.accent2, charSpacing: 2, margin: 0, isTextBox: true, objectName: "kicker" });
  s.addText("toList · forEachOrdered · toArray · reduce · count · min/max · anyMatch · findFirst", { x: 0.5, y: 2.95, w: 5.0, h: 0.8, fontSize: 15, italic: true, color: C.background2, margin: 0, isTextBox: true, objectName: "subtitle" });
  card(s, 6.0, 0.6, 3.5, 4.3, "143F32", "objectives card");
  s.addText("You will be able to", { x: 6.25, y: 0.75, w: 3.1, h: 0.35, fontSize: 14, bold: true, color: C.accent2, margin: 0, isTextBox: true, objectName: "objectives heading" });
  ["Pick the right terminal operation", "Use toList() [16] vs Collectors.toList()", "Use all 3 reduce forms correctly", "Sum and average BigDecimal money safely", "Know match/find results on empty streams"].forEach((o, i) => {
    const y = 1.2 + i * 0.72;
    s.addText(String(i + 1), { shape: pres.shapes.OVAL, x: 6.25, y: y + 0.05, w: 0.36, h: 0.36, fill: { color: C.accent1 }, line: { color: C.accent1 }, fontSize: 12, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "objective number " + (i + 1) });
    s.addText(o, { x: 6.75, y, w: 2.6, h: 0.62, fontSize: 12.5, color: C.background1, valign: "middle", margin: 0, isTextBox: true, objectName: "objective " + (i + 1) });
  });
  s.addNotes("~2 min. The terminal operation is the one that runs the pipeline and produces the answer, so choosing it well matters as much as the steps before it. Today: the operations that hand back elements, such as forEach, toList and toArray; reduce in its three forms with the two rules every reduction must obey; and the questions you ask of a stream: count, min, max, anyMatch, allMatch, noneMatch, findFirst and findAny. Banking makes it concrete: totals and averages are BigDecimal, so we learn to sum and divide money correctly. The exercise produces month-end totals in Singapore dollars, with USD transactions converted and rounded per line. DEMO: open package l09_terminal_ops. Question: what does allMatch return on an empty list? Keep your answer; we will check it later.");

  // ===== 2 Problem =====
  pres.addSection({ title: "Collecting" });
  s = newSlide("CONTENT", "Collecting", "The problem: four loops for four answers");
  codeBlock(s, `BigDecimal total = BigDecimal.ZERO;
for (Account a : accounts) total = total.add(a.balance());
Transaction highest = null;
for (Transaction t : txns)
  if (highest == null || t.amount().compareTo(..) > 0)
    highest = t;
boolean overdrawn = false;
for (Account a : accounts)
  if (a.balance().signum() < 0) { overdrawn = true; break; }
BigDecimal premiums = BigDecimal.ZERO;
for (Policy p : policies) premiums = premiums.add(..);`, 0.5, 1.05, 5.4, 3.2, { label: "BEFORE  ·  before/LegacyDashboard", fontSize: 9.5, name: "legacy code" });
  codeBlock(s, `accounts.stream().map(Account::balance)
  .reduce(ZERO, BigDecimal::add)

txns.stream()
  .max(comparing(Transaction::amount))

accounts.stream()
  .anyMatch(a ->
      a.balance().signum() < 0)`, 6.1, 1.05, 3.4, 3.2, { label: "AFTER  ·  one terminal op each", fontSize: 9.5, name: "stream code" });
  outputBox(s, "total balance 300382.25 · highest txn T049 7721.99 · any overdrawn true · average premium 1082.65", 0.5, 4.4, 9.0, 0.5, "problem output");
  s.addNotes("~3 min. Our bank dashboard asks four questions: the total balance of all accounts, the highest transaction, whether any account is overdrawn, and the average premium. The legacy version needs four loops with four accumulators, a null check because the highest transaction might not exist, and a boolean flag with a manual break for early exit. Each question maps onto exactly one terminal operation: reduce for the total, max for the highest, anyMatch for the overdrawn check, which stops early on its own, and reduce followed by divide for the average. The answers in the output box are the same in all three versions in the repo. Notice that max returns an Optional, so the 'no transactions' case is explicit instead of a null. DEMO: run LegacyDashboard. Question: which of these four loops already had an early exit, and which terminal operation gives you that for free?");

  // ===== 3 Family =====
  s = newSlide("CONTENT", "Collecting", "The terminal operation family");
  const fam = [[I.list, "Hand back elements", "forEach · forEachOrdered · collect · toList [16] · toArray · iterator", C.accent1], [I.compress, "Reduce to one value", "reduce (3 forms) · count · sum/average (primitive)", C.accent3], [I.sort, "Pick one", "min(cmp) · max(cmp) → Optional", C.text2], [I.checkd, "Ask yes/no", "anyMatch · allMatch · noneMatch → boolean  ✂", C.accent2], [I.search, "Find one", "findFirst · findAny → Optional  ✂", C.accent4]];
  fam.forEach(([ic, h, d, col], i) => {
    const y = 1.0 + i * 0.78;
    card(s, 0.5, y, 9.0, 0.68, C.background2, "fam " + i);
    iconCircle(s, ic, 0.62, y + 0.12, 0.44, col, h);
    s.addText(h, { x: 1.2, y: y + 0.05, w: 2.6, h: 0.58, fontSize: 14, bold: true, color: col, margin: 0, valign: "middle", isTextBox: true, objectName: "fam h " + i });
    s.addText(d, { x: 3.8, y: y + 0.05, w: 5.6, h: 0.58, fontSize: 12, fontFace: MONO, color: C.text1, margin: 0, valign: "middle", isTextBox: true, objectName: "fam d " + i });
  });
  note(s, "✂ = short-circuiting: may finish without reading every element. All are Java 8 except toList() (Java 16).", 4.95, C.accent5, "fam note");
  s.addNotes("~2 min. A map of every terminal operation, grouped by the kind of answer it gives. The first group hands the elements back: forEach and forEachOrdered for side effects, collect with a Collector, the Java 16 toList, toArray, and the rarely used iterator. The second group folds everything into one value: reduce in three forms, count, and sum and average on primitive streams. min and max pick one element with a comparator and return an Optional, because the stream may be empty. The matching operations answer yes or no and short-circuit, as do findFirst and findAny, which return an Optional. When you face a stream question, first decide which kind of answer you need, and the operation follows. DEMO: none; point to the method map from L06. Question: which group returns Optional, and why?");

  // ===== 4 forEach / toList / toArray =====
  s = newSlide("CONTENT", "Collecting", "forEach, toList() [16] and toArray");
  tbl(s, ["Call", "Real result (theory/CollectingResults)", "Note"], [
    ["parallel().forEachOrdered(add)", "[SQ318, SQ12, TR808, MH602, SQ938, UL309, SQ21, GA827]", "encounter order kept"],
    ["parallelStream().forEach(set::add)", "all 8 codes, in any order", "needs a thread-safe target"],
    ["stream().toList().add(..)", "UnsupportedOperationException", "Java 16, unmodifiable"],
    ["collect(Collectors.toList()).add(..)", "ArrayList size 13", "mutable today, not guaranteed"],
    ["Stream.of(\"SQ12\", null).toList()", "[SQ12, null]", "nulls allowed"],
    ["… .collect(toUnmodifiableList())", "NullPointerException", "Java 10, no nulls"],
    ["toArray(String[]::new)", "String[] [SQ318, SQ12, TR808]", "typed; toArray() → Object[]"],
  ], 0.5, 1.0, 9.0, [3.4, 3.55, 2.05], 0.46, "collect table", [0, 1]);
  note(s, "Prefer toList() for results you only read. Need to add later? collect(Collectors.toCollection(ArrayList::new)).", 4.65, C.text2, "collect note");
  s.addNotes("~3 min. Real results from CollectingResults. forEach on a parallel stream runs on several threads in any order, so its target must be thread-safe; forEachOrdered keeps the encounter order even in parallel, as the first row shows. Java 16's toList returns an unmodifiable list, so adding to it throws. Collectors.toList returns an ArrayList today and adding works, but the specification does not promise mutability, so code that relies on it is fragile. Another difference that bites in migrations: toList accepts null elements, while Collectors.toUnmodifiableList from Java 10 throws NullPointerException. toArray with a generator such as String[]::new gives a typed array; without it you get Object[]. Rule of thumb: toList for read-only results, toCollection(ArrayList::new) when you will modify. DEMO: run CollectingResults. Question: why can forEach not simply print in order on a parallel stream?");

  // ===== 5 reduce identity =====
  pres.addSection({ title: "Reduction" });
  s = newSlide("CONTENT", "Reduction", "reduce(identity, op): fold many into one");
  const fold = [["0", C.text2], ["+12500.00", C.accent1], ["+3200.50", C.accent1], ["+850.75", C.accent1], ["… 15 accounts", C.accent5], ["= 300382.25", C.accent2]];
  fold.forEach(([t, col], i) => {
    s.addText(t, { shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.06, x: 0.5 + i * 1.52, y: 1.05, w: 1.4, h: 0.55, fill: { color: col }, line: { color: col }, fontFace: MONO, fontSize: 11.5, bold: true, color: col === C.accent2 ? C.text1 : C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "fold " + i });
  });
  codeBlock(s, `BigDecimal total = accounts.stream()
    .map(Account::balance)
    .reduce(BigDecimal.ZERO, BigDecimal::add);
// 300382.25

// what it does, conceptually:
BigDecimal result = identity;
for (BigDecimal b : balances) result = result.add(b);`, 0.5, 1.8, 5.6, 2.55, { label: "theory/Reducing · Practice: total balance", fontSize: 10.5, name: "reduce code" });
  card(s, 6.3, 1.8, 3.2, 2.55, C.background2, "reduce card");
  s.addText([{ text: "Identity form", options: { bold: true, color: C.text2, breakLine: true } }, { text: "T reduce(T identity, BinaryOperator<T> op)", options: { fontFace: MONO, fontSize: 9.5, breakLine: true } }, { text: " ", options: { fontSize: 5, breakLine: true } }, { text: "Empty stream → the identity (0).", options: { fontSize: 11.5, breakLine: true } }, { text: "BigDecimal has no sum(): this IS the idiom for money.", options: { fontSize: 11.5 } }],
    { x: 6.45, y: 1.9, w: 2.95, h: 2.35, fontSize: 13, color: C.text1, margin: 0, valign: "top", isTextBox: true, objectName: "reduce text" });
  note(s, "Identity must be neutral: ZERO for add, ONE for multiply. Never a starting balance.", 4.5, C.accent4, "reduce note");
  s.addNotes("~3 min. reduce folds a stream into one value by applying a binary operator again and again. The identity form takes a starting value and the operator; conceptually it is the loop at the bottom of the code. Practice item one, the total balance of all fifteen accounts, is 300,382.25. This is the standard idiom for money, because BigDecimal has no sum method and no primitive stream: map to BigDecimal, then reduce with BigDecimal.ZERO and BigDecimal::add. On an empty stream the identity form returns the identity itself, which here is zero. The identity must be neutral for the operator: zero for addition, one for multiplication. Using it as a 'starting balance' is a bug, as slide 7 proves. DEMO: run Reducing, line 1. Question: what would reduce(BigDecimal.ONE, BigDecimal::multiply) compute?");

  // ===== 6 Optional & 3-arg =====
  s = newSlide("CONTENT", "Reduction", "reduce without identity, and the 3-argument form");
  codeBlock(s, `// Optional form: no identity
Optional<BigDecimal> largest = txns.stream()
    .map(Transaction::amount)
    .reduce(BigDecimal::max);
// Optional[7721.99]
List.<BigDecimal>of().stream()
    .reduce(BigDecimal::add);
// Optional.empty`, 0.5, 1.05, 4.45, 2.6, { label: "Optional<T> reduce(BinaryOperator<T>)", fontSize: 10, name: "opt code" });
  codeBlock(s, `// 3-arg: identity, accumulator, combiner
int seats = flights.stream()
    .reduce(0,
            (sum, f) -> sum + f.seats(),
            Integer::sum);  // combiner
// 2078

flights.stream().mapToInt(Flight::seats).sum();
// 2078: clearer for numbers`, 5.05, 1.05, 4.45, 2.6, { label: "U reduce(U, BiFunction<U,T,U>, BinaryOperator<U>)", fontSize: 10, name: "three code" });
  tbl(s, ["Form", "Empty stream", "Use when"], [
    ["reduce(identity, op)", "identity", "a neutral value exists (sums, products)"],
    ["reduce(op)", "Optional.empty", "no neutral value (max, min, longest)"],
    ["reduce(identity, acc, combiner)", "identity", "result type ≠ element type; parallel merge"],
  ], 0.5, 3.8, 9.0, [3.0, 1.8, 4.2], 0.36, "forms table", [0]);
  s.addNotes("~3 min. Without an identity, reduce returns an Optional: there is no sensible answer for an empty stream, so you get Optional.empty, and for our transactions BigDecimal::max gives 7,721.99. Use this form when no neutral value exists, such as max, min or longest. The three-argument form lets the result type differ from the element type: we fold Flight objects into an int. The accumulator adds one flight to a running sum; the combiner merges two partial sums, which only happens in parallel, but it must be correct anyway. For numbers, mapToInt and sum say the same thing more clearly, and in L10 collectors cover most other type-changing reductions. The table summarises when to choose each form. DEMO: run Reducing, lines 2 and 3. Question: why must the combiner agree with the accumulator?");

  // ===== 7 Rules =====
  s = newSlide("CONTENT", "Reduction", "The two rules: associative operator, true identity");
  const rules = [["Associative: (a op b) op c == a op (b op c)", "IntStream.rangeClosed(1, 10).reduce(0, (a, b) -> a - b)", "sequential = -55 · parallel differs = true", "FBECEC", C.accent4], ["Identity: x op identity == x", "IntStream.rangeClosed(1, 10).reduce(100, Integer::sum)", "sequential = 155 · parallel bigger = true (100 added per chunk)", "FBECEC", C.accent4], ["Both rules hold", "accounts.stream().map(balance).reduce(ZERO, BigDecimal::add)", "300382.25 sequential or parallel", "E3F4EA", C.accent1]];
  rules.forEach(([h, c, r, bg, col], i) => {
    const y = 1.0 + i * 1.12;
    card(s, 0.5, y, 9.0, 1.0, bg, "rule " + i);
    s.addText([{ text: h, options: { bold: true, color: col, breakLine: true } }, { text: c, options: { fontFace: MONO, fontSize: 10.5, breakLine: true } }, { text: r, options: { fontFace: MONO, fontSize: 10.5, bold: true, color: col } }], { x: 0.65, y: y + 0.04, w: 8.7, h: 0.92, fontSize: 13, color: C.text1, margin: 0, valign: "middle", isTextBox: true, objectName: "rule text " + i });
  });
  note(s, "Sequential code hides both bugs. They appear the day someone adds .parallel() (L14).", 4.45, C.accent4, "rules note");
  s.addNotes("~3 min. Two rules from the Javadoc that every reduction must obey. First, the operator must be associative, because a parallel stream splits the data and reduces chunks independently. Subtraction is not associative: sequentially the sum of 1 to 10 subtracted from zero is minus 55, but the parallel run gives a different number; the test only asserts that it differs, because the exact value depends on how the data was split. Second, the identity must really be neutral. Using 100 as a 'starting value' gives 155 sequentially, but in parallel every chunk starts from 100, so the result is bigger. Both bugs are invisible in sequential code and appear the day someone adds parallel. Addition of BigDecimal with ZERO satisfies both rules, so the total balance is always 300,382.25. DEMO: run Reducing, lines 5 and 6. Question: is string concatenation associative? Is it commutative?");

  // ===== 8 BigDecimal =====
  s = newSlide("CONTENT", "Reduction", "Money: sum, average, rounding");
  codeBlock(s, `BigDecimal total = policies.stream()
    .map(Policy::premium)
    .reduce(BigDecimal.ZERO, BigDecimal::add);
// 10826.50
BigDecimal avg = total.divide(
    BigDecimal.valueOf(policies.size()),
    2, RoundingMode.HALF_UP);   // 1082.65`, 0.5, 1.05, 5.4, 2.3, { label: "theory/Reducing · Practice: average premium", fontSize: 10.5, name: "avg code" });
  codeBlock(s, `// USD → SGD at 1.3456, T010 533.03 and T023 914.46
round each line, then add   → 1947.75   ✓ bank rule
add, then round once        → 1947.74`, 0.5, 3.5, 5.4, 1.15, { label: "solution/Solution09 · perLineVsAtEnd", fontSize: 10.5, name: "round code" });
  card(s, 6.1, 1.05, 3.4, 3.6, C.background2, "money card");
  s.addText(bullets(["No average() for BigDecimal: sum, then divide", "Always give divide a scale and RoundingMode (non-terminating results throw ArithmeticException)", "Empty list: guard before dividing by zero", "Decide WHERE to round (per line or at the end) and test it", "Never mapToDouble a money amount"], 12).map(r => { r.options.paraSpaceAfter = 5; return r; }),
    { x: 6.25, y: 1.15, w: 3.15, h: 3.4, margin: 0, valign: "top", isTextBox: true, objectName: "money list" });
  s.addNotes("~3 min. Practice item four, the average premium. BigDecimal has no average, so we sum with reduce, then divide by the count. Always pass a scale and a rounding mode to divide: when the exact result does not terminate, like one divided by three, divide without them throws ArithmeticException. Here the ten premiums total 10,826.50, and the average is exactly 1,082.65. Guard the empty case, because dividing by a zero count fails; the modern dashboard returns 0.00 instead. Second example: two USD transactions converted at 1.3456. Rounding each converted line and then adding gives 1,947.75; adding first and rounding once gives 1,947.74. Neither is wrong in theory, but your bank's rule decides, and your tests must pin it down. The exercise uses round-per-line. DEMO: run Solution09, last line. Question: which rule does your company use?");

  // ===== 9 count/min/max =====
  pres.addSection({ title: "Questions" });
  s = newSlide("CONTENT", "Questions", "count, min and max");
  codeBlock(s, `payments.stream()
    .filter(p -> p.status() == REFUNDED)
    .count();                                   // 1  (long)

txns.stream().max(comparing(Transaction::amount))
// Optional[T049 … 7721.99]   (SALARY credit)
txns.stream().min(comparing(Transaction::amount))
// Optional[T046 … 18.35]     (DINING debit)`, 0.5, 1.05, 5.6, 2.9, { label: "theory/MatchFindCount · Practice: highest transaction", fontSize: 10.5, name: "minmax code" });
  card(s, 6.3, 1.05, 3.2, 2.9, C.background2, "minmax card");
  s.addText([{ text: "Remember", options: { bold: true, color: C.text2, breakLine: true } }, { text: "count() returns long.", options: { fontSize: 11.5, breakLine: true } }, { text: "min/max need a Comparator on Stream<T> and return Optional<T>.", options: { fontSize: 11.5, breakLine: true } }, { text: "IntStream.max() needs none: OptionalInt.", options: { fontSize: 11.5, breakLine: true } }, { text: "Ties: max returns one of them; add thenComparing(id) to make it deterministic.", options: { fontSize: 11.5 } }],
    { x: 6.45, y: 1.15, w: 2.95, h: 2.7, fontSize: 13, color: C.text1, margin: 0, valign: "top", isTextBox: true, objectName: "minmax text" });
  note(s, "max(comparing(amount)) is reduce(BinaryOperator) in disguise: no identity, so Optional.", 4.15, C.text2, "minmax note");
  s.addNotes("~3 min. count returns a long, even for small streams. min and max on an object stream take a comparator, the same comparators from L08, and return Optional, because an empty stream has no maximum. Practice item two: the highest transaction is T049, a salary credit of 7,721.99, and the lowest is T046, a dining debit of 18.35. On primitive streams, max needs no comparator and returns OptionalInt. If several elements tie for the maximum, the Javadoc does not promise which one you get, so for deterministic reports add a tie-breaker such as the id, as the modern dashboard does. Conceptually, max is the Optional form of reduce with a 'keep the larger' operator. DEMO: run MatchFindCount, first three lines. Question: why does count return long and not int?");

  // ===== 10 Match & find =====
  s = newSlide("CONTENT", "Questions", "Matching and finding");
  tbl(s, ["Call", "Course data", "Empty stream"], [
    ["anyMatch(balance < 0)", "true (ACC-1013)", "false"],
    ["allMatch(amount > 0)", "true", "true  (vacuous truth)"],
    ["noneMatch(currency == EUR)", "true", "true"],
    ["filter(FAILED).findFirst()", "Optional[P003]", "Optional.empty"],
    ["parallel … findAny()", "P003 or P012", "Optional.empty"],
  ], 0.5, 1.0, 5.6, [2.6, 1.6, 1.4], 0.48, "match table", [0], 11);
  card(s, 6.3, 1.0, 3.2, 2.9, C.background2, "match card");
  s.addText(bullets(["All five short-circuit: anyMatch stops at the first true, allMatch at the first false", "allMatch on empty = true: 'no counter-example'", "findFirst respects encounter order", "findAny may be faster in parallel; only use it when any match is fine"], 11.5).map(r => { r.options.paraSpaceAfter = 5; return r; }),
    { x: 6.45, y: 1.1, w: 2.95, h: 2.75, margin: 0, valign: "top", isTextBox: true, objectName: "match list" });
  note(s, "Practice: any overdrawn account → true. Validation code: check isEmpty() first if 'no data' must fail.", 4.1, C.accent4, "match note");
  s.addNotes("~3 min. The matching operations answer yes or no and stop as soon as they know: anyMatch at the first true, allMatch and noneMatch at the first counter-example. Practice item three, is any account overdrawn, is true because of ACC-1013. Now the opening question: on an empty stream, anyMatch is false, but allMatch and noneMatch are true. This is vacuous truth: there is no counter-example. It matters in validation: 'all payments are approved' is true for a batch with no payments, so if an empty batch must fail, check isEmpty first. findFirst returns the first match in encounter order, P003. findAny may return any match and can be faster on a parallel stream; the test only checks that it is P003 or P012. DEMO: run MatchFindCount. Question: how would you check that an account has at least one transaction AND all are SGD?");

  // ===== 11 Worked example =====
  pres.addSection({ title: "Worked example" });
  s = newSlide("CONTENT", "Worked example", "Refactor: the bank dashboard, three ways");
  codeBlock(s, `BigDecimal total = accounts.stream()
  .map(Account::balance)
  .reduce(BigDecimal.ZERO, BigDecimal::add);
String highest = txns.stream()
  .max(comparing(Transaction::amount))
  .map(t -> t.id() + " " + t.amount())
  .orElse("none");
boolean overdrawn = accounts.stream()
  .anyMatch(a -> a.balance().signum() < 0);
BigDecimal avg = policies.stream()
  .map(Policy::premium)
  .reduce(BigDecimal.ZERO, BigDecimal::add)
  .divide(valueOf(n), 2, HALF_UP);`, 0.5, 1.05, 4.5, 3.4, { label: "AFTER  ·  Java 8  ·  after/StreamDashboard", fontSize: 9.5, name: "after code" });
  codeBlock(s, `record Dashboard(BigDecimal totalBalance,
    Optional<Transaction> highest,
    boolean anyOverdrawn,
    BigDecimal averagePremium) { .. }

static BigDecimal average(List<BigDecimal> v) {
  return v.isEmpty()
    ? BigDecimal.ZERO.setScale(2)
    : sum(v).divide(valueOf(v.size()),
                    2, HALF_UP);
}
max(comparing(Transaction::amount)
      .thenComparing(Transaction::id))`, 5.2, 1.05, 4.3, 3.4, { label: "MODERN  ·  modern/ModernDashboard", fontSize: 9.5, name: "modern code" });
  outputBox(s, "All 3: 300382.25 · T049 7721.99 · true · 1082.65  |  modern on empty data: 0 · none · false · 0.00", 0.5, 4.55, 9.0, 0.5, "ba output");
  s.addNotes("~3 min. The worked example, three ways. The Java 8 version answers each dashboard question with one terminal operation, exactly as on slide 2. Two weaknesses remain: the average divides by the policy count, so an empty list throws ArithmeticException, and the highest transaction is turned into the string 'none' early, losing the information. The modern version returns a Dashboard record that keeps the Optional transaction, uses a small reusable sum helper, makes the average empty-safe, and adds an id tie-breaker to max so ties are deterministic. DashboardRefactoringTest checks that all three versions produce the same four lines, and that the modern one works on empty data, giving 0, none, false and 0.00. DEMO: run ModernDashboard. Question: why is total balance printed as 0 and not 0.00 for empty data, and does it matter?");

  // ===== 12 Pitfalls =====
  s = newSlide("CONTENT", "Worked example", "Pitfalls and best practices");
  const pits = [["toList().add(...)", "UnsupportedOperationException: toList() is unmodifiable."], ["Non-associative op or fake identity", "Correct sequentially, wrong in parallel."], ["divide() without scale / on empty", "ArithmeticException."], ["allMatch as validation", "true for an empty batch."], ["forEach to fill a list", "Side effects; unsafe in parallel. Use toList/collect."]];
  pits.forEach(([h, d], i) => {
    const y = 1.0 + i * 0.8;
    card(s, 0.5, y, 4.6, 0.7, "FBECEC", "pit " + i);
    iconCircle(s, I.bug, 0.6, y + 0.14, 0.42, C.accent4, "pit icon " + i);
    s.addText([{ text: h, options: { bold: true, color: C.accent4, breakLine: true } }, { text: d, options: { fontSize: 11, color: C.text1 } }], { x: 1.12, y: y + 0.02, w: 3.9, h: 0.66, fontSize: 12.5, margin: 0, valign: "middle", isTextBox: true, objectName: "pit text " + i });
  });
  const dos = ["Money: reduce(ZERO, BigDecimal::add)", "divide(n, 2, HALF_UP); guard empty", "Numbers: mapToInt().sum(), not reduce", "Prefer Optional over null or 'none'", "findFirst unless any match is fine", "Add a tie-breaker to min/max"];
  card(s, 5.3, 1.0, 4.2, 3.9, C.background2, "do card");
  iconCircle(s, I.check, 5.45, 1.12, 0.45, C.accent1, "do icon");
  s.addText("Best practices", { x: 6.05, y: 1.12, w: 3.3, h: 0.45, fontSize: 15, bold: true, color: C.accent1, margin: 0, valign: "middle", isTextBox: true, objectName: "do title" });
  s.addText(bullets(dos, 12.5).map(r => { r.options.paraSpaceAfter = 7; return r; }), { x: 5.5, y: 1.7, w: 3.9, h: 3.1, margin: 0, valign: "top", isTextBox: true, objectName: "do list" });
  s.addNotes("~3 min. Five pitfalls, each demonstrated in today's code. Adding to the result of toList throws, because it is unmodifiable. A non-associative operator or a fake identity gives the right answer sequentially and a wrong one in parallel. divide without a scale fails on non-terminating results, and dividing by an empty count fails always. allMatch used as validation passes an empty batch. And forEach that adds to an outer list is a side effect that breaks in parallel; let toList or collect build the list. On the right, the habits: the BigDecimal sum idiom, divide with scale and rounding plus an empty guard, mapToInt and sum for plain numbers, Optional instead of null or placeholder strings, findFirst unless any match will do, and a tie-breaker on min and max. DEMO: run TerminalOpsTest. Question: which pitfall would only show up in production?");

  // ===== 13 Interview =====
  pres.addSection({ title: "Practice" });
  s = newSlide("CONTENT", "Practice", "Interview questions");
  const qa = [
    ["toList() vs collect(Collectors.toList())?", "toList() [16]: unmodifiable, allows nulls. Collectors.toList(): no guarantees (ArrayList today)."],
    ["The three forms of reduce?", "identity+op → T; op only → Optional<T>; identity+accumulator+combiner → U."],
    ["Why must reduce be associative?", "Parallel streams reduce chunks separately and combine them in any grouping."],
    ["allMatch on an empty stream?", "true (vacuous truth). anyMatch → false, noneMatch → true."],
    ["findFirst vs findAny?", "findFirst respects encounter order; findAny may return any element and is cheaper in parallel."],
  ];
  qa.forEach(([q, a], i) => {
    const colI = i % 2, row = Math.floor(i / 2);
    const x = i === 4 ? 0.5 : 0.5 + colI * 4.6, y = 1.0 + row * 1.38, w = i === 4 ? 9.0 : 4.4;
    card(s, x, y, w, 1.22, C.background2, "qa card " + i);
    s.addText("Q" + (i + 1), { shape: pres.shapes.OVAL, x: x + 0.12, y: y + 0.14, w: 0.42, h: 0.42, fill: { color: C.text2 }, line: { color: C.text2 }, fontSize: 11, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "q badge " + i });
    s.addText([{ text: q, options: { bold: true, color: C.text2, breakLine: true } }, { text: a, options: { color: C.text1, fontSize: 12 } }], { x: x + 0.65, y: y + 0.06, w: w - 0.8, h: 1.1, fontSize: 13.5, margin: 0, valign: "middle", isTextBox: true, objectName: "qa text " + i });
  });
  s.addNotes("~3 min. Five interview questions. Question one is common since Java 16; a strong answer names unmodifiability and the null difference with toUnmodifiableList. Question two: ask for a use case of each form, for example sum, max and a type-changing fold. Question three separates candidates who have used parallel streams: they should mention splitting into chunks and the combiner, and give subtraction as a counter-example. Question four is the vacuous-truth trap; ask why it matters for validation. Question five: ask when findAny is appropriate, for example 'is there any FAILED payment, show me one'. A senior follow-up: how do you sum BigDecimal values in a stream, and how do you average them? Expect reduce with ZERO and add, then divide with scale and rounding mode. DEMO: run QuizAnswersTest. Question: which question would you give a junior?");

  // ===== 14 Pros/cons =====
  s = newSlide("CONTENT", "Practice", "Pros and cons of terminal operations");
  const pros = ["One operation per question: intent is clear", "Short-circuiting match/find stop early", "Optional makes 'no result' explicit", "reduce works for any type, incl. BigDecimal", "toList() [16] gives safe read-only results", "Same code can run in parallel (if rules hold)"];
  const consL = ["reduce rules (associativity, identity) are easy to break", "No BigDecimal sum/average built in", "Empty-stream results surprise people", "toList vs Collectors.toList differences", "forEach invites side effects", "One pass per question: several passes over the data"];
  [[pros, "Pros", C.accent1, I.plus, 0.5, C.background2], [consL, "Cons / limitations", C.accent4, I.minus, 5.1, "FBECEC"]].forEach(([list, h, colr, ic, x, bg]) => {
    card(s, x, 1.0, 4.4, 3.65, bg, h + " card");
    iconCircle(s, ic, x + 0.2, 1.15, 0.5, colr, h);
    s.addText(h, { x: x + 0.85, y: 1.15, w: 3.3, h: 0.5, fontSize: 18, bold: true, color: colr, margin: 0, valign: "middle", isTextBox: true, objectName: h + " heading" });
    s.addText(bullets(list, 14).map(r => { r.options.paraSpaceAfter = 8; return r; }), { x: x + 0.25, y: 1.85, w: 3.95, h: 2.7, margin: 0, valign: "top", isTextBox: true, objectName: h + " list" });
  });
  s.addNotes("~2 min. A balanced view. On the plus side: each question becomes one named operation, so the intent is obvious; match and find operations stop early; Optional makes the 'no result' case explicit; reduce works for any type, including BigDecimal; toList gives safe read-only results; and the same code can run in parallel, provided the rules hold. On the minus side: the associativity and identity rules are easy to break without noticing; there is no BigDecimal sum or average, so you write the idiom yourself; empty-stream results surprise people; the two toList variants differ in subtle ways; forEach invites side effects; and asking four questions means four passes over the data, which matters for large data. L10 collectors such as teeing and summarizing can answer several questions in one pass. DEMO: none. Question: how would you compute total and count in a single pass?");

  // ===== 15 Summary =====
  pres.addSection({ title: "Wrap-up" });
  s = newSlide("DARK_TITLE", "Wrap-up", "Summary");
  const sum = ["toList() [16] unmodifiable; forEachOrdered keeps order; toArray(String[]::new)", "reduce: identity → T, no identity → Optional, 3-arg → U", "Associative operator + true identity, or parallel breaks", "Money: reduce(ZERO, add), divide(n, 2, HALF_UP)", "Empty stream: allMatch/noneMatch true, anyMatch false"];
  s.addText(bullets(sum, 14, C.background1), { x: 0.5, y: 2.1, w: 5.2, h: 2.9, margin: 0, valign: "top", isTextBox: true, objectName: "summary bullets" });
  card(s, 6.0, 0.6, 3.5, 2.05, "143F32", "exercise card");
  iconCircle(s, I.code, 6.2, 0.78, 0.45, C.accent2, "exercise");
  s.addText([{ text: "Exercise (~30 min)", options: { bold: true, color: C.accent2, breakLine: true } }, { text: "Month-end totals in Exercise09: debits, credits, net, average, largest debit per month, in SGD with per-line rounding.", options: { color: C.background1, fontSize: 12 } }],
    { x: 6.75, y: 0.75, w: 2.65, h: 1.8, fontSize: 14, margin: 0, valign: "top", isTextBox: true, objectName: "exercise text" });
  card(s, 6.0, 2.85, 3.5, 2.05, "143F32", "next card");
  iconCircle(s, I.rocket, 6.2, 3.03, 0.45, C.accent1, "next");
  s.addText([{ text: "Next: Lesson 10", options: { bold: true, color: C.accent2, breakLine: true } }, { text: "Collectors I: toMap and its traps, joining, summing, averaging, teeing, BigDecimal totals.", options: { color: C.background1, fontSize: 12 } }],
    { x: 6.75, y: 3.0, w: 2.65, h: 1.8, fontSize: 14, margin: 0, valign: "top", isTextBox: true, objectName: "next text" });
  s.addNotes("~3 min. Recap: toList is unmodifiable, forEachOrdered keeps encounter order, toArray takes a generator; reduce has three forms with different empty-stream results; the operator must be associative and the identity truly neutral; money is summed with ZERO and add and divided with an explicit scale and rounding; and on an empty stream allMatch and noneMatch are true while anyMatch is false. The exercise produces month-end totals for August to October in Singapore dollars. USD lines are converted at a fixed exercise rate of 1.3456 and rounded per line, using the helper provided. Five tasks: debit total, credit total, net, average debit with an empty-month guard, and the largest debit as an Optional. Expected values are in the Javadoc. DEMO: run Solution09. Question: which task needs the empty guard, and why?");

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
})();
