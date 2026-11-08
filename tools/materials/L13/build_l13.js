// L13 slide deck generator - ITGreenZone Java Functional Programming
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa");
const { applyTheme } = require("/root/.claude/skills/synced/2eb53c35-a0c8-4343-9257-776fcd7fed67_dd7dcff0-93ee-4601-a8ce-12573fa09cd9/pptx/scripts/apply_theme.js");

const OUT = process.argv[2] || "L13_AdvancedOperations_Slides.pptx";
const LESSON = "13";
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
pres.title = "L13 Advanced Stream Operations";
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
  let s = newSlide("DARK_TITLE", "Introduction", "Advanced Stream Operations");
  s.addText("LESSON 13  ·  MODULE 2", { x: 0.5, y: 0.6, w: 5.5, h: 0.35, fontSize: 12, bold: true, color: C.accent2, charSpacing: 2, margin: 0, isTextBox: true, objectName: "kicker" });
  s.addText("Collector.of · iterate / generate / concat · Map.merge · batches & windows · running totals · paging", { x: 0.5, y: 2.95, w: 5.0, h: 0.8, fontSize: 15, italic: true, color: C.background2, margin: 0, isTextBox: true, objectName: "subtitle" });
  card(s, 6.0, 0.6, 3.5, 4.3, "143F32", "objectives card");
  s.addText("You will be able to", { x: 6.25, y: 0.75, w: 3.1, h: 0.35, fontSize: 14, bold: true, color: C.accent2, margin: 0, isTextBox: true, objectName: "objectives heading" });
  ["Write a custom Collector with Collector.of", "Generate, concat and flatten streams", "Choose Map.merge/compute vs streams", "Chunk, window, zip and run totals", "Stream a paged result set lazily"].forEach((o, i) => {
    const y = 1.2 + i * 0.72;
    s.addText(String(i + 1), { shape: pres.shapes.OVAL, x: 6.25, y: y + 0.05, w: 0.36, h: 0.36, fill: { color: C.accent1 }, line: { color: C.accent1 }, fontSize: 12, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "objective number " + (i + 1) });
    s.addText(o, { x: 6.75, y, w: 2.6, h: 0.62, fontSize: 12.5, color: C.background1, valign: "middle", margin: 0, isTextBox: true, objectName: "objective " + (i + 1) });
  });
  s.addNotes("~2 min. This lesson collects the techniques you need once the standard operations are not enough. We build our own Collector, a BigDecimal statistics collector, because the built-in summarizing collectors use double. We generate streams that do not come from a collection, flatten nested data, and compare Map.merge and compute with stream-based map transforms. Then come index-based tasks: batches, sliding windows, zipping and running totals, where we will be honest that streams are sometimes a poor fit. We stream a paged result set lazily with StreamSupport, and we take a short look beyond Java 21 at Stream Gatherers. The exercise builds a running balance per account and payment-file batches. DEMO: open package l13_advanced. Question: which of these have you written by hand before?");

  // ===== 2 Problem =====
  pres.addSection({ title: "Custom collectors" });
  s = newSlide("CONTENT", "Custom collectors", "The problem: money statistics per payment method");
  codeBlock(s, `Map<String, Integer> count = new HashMap<>();
Map<String, BigDecimal> sum = new HashMap<>();
Map<String, BigDecimal> min = new HashMap<>();
Map<String, BigDecimal> max = new HashMap<>();
for (Payment p : payments) {
  String m = p.method();
  count.put(m, count.containsKey(m) ? .. + 1 : 1);
  sum.put(m, sum.containsKey(m) ? ..add(..) : ..);
  if (!min.containsKey(m) || .. < 0) min.put(..);
  if (!max.containsKey(m) || .. > 0) max.put(..);
}`, 0.5, 1.05, 5.0, 3.3, { label: "BEFORE  ·  before/LegacyPaymentStats", fontSize: 9.5, name: "legacy code" });
  codeBlock(s, `payments.stream()
  .collect(groupingBy(
     Payment::method,
     TreeMap::new,
     mapping(Payment::amount,
             moneyStats())));

// summarizingDouble?
// double: not for money (L12)`, 5.7, 1.05, 3.8, 3.3, { label: "MODERN  ·  one custom collector", fontSize: 10, name: "stream code" });
  outputBox(s, "All 3: CARD: count=5 sum=2070.29 min=89.90 max=999.99 avg=414.06 · PAYNOW: count=4 … · PAYPAL: count=3 sum=535.25 …", 0.5, 4.5, 9.0, 0.5, "problem output");
  s.addNotes("~3 min. The business question: for each payment method, the count, total, smallest, largest and average payment, all in BigDecimal. The legacy version keeps four hash maps in sync with containsKey checks. Java has summarizingDouble, which gives exactly these statistics, but in double, and L12 showed why that is not acceptable for money. There is no summarizing collector for BigDecimal. So we write one: a custom collector called moneyStats, which we can then reuse anywhere, including as the downstream of groupingBy. The three versions in the repo, before, after with four groupingBy passes, and modern with the custom collector, print the same three lines, checked by a test. DEMO: run LegacyPaymentStats. Question: how many places would change to add a median?");

  // ===== 3 Collector.of anatomy =====
  s = newSlide("CONTENT", "Custom collectors", "Collector.of: five parts");
  codeBlock(s, `public static Collector<BigDecimal, ?, MoneyStats> moneyStats() {
  return Collector.of(
      Acc::new,      // supplier    : a new, empty container
      Acc::add,      // accumulator : add ONE element to a container
      Acc::merge,    // combiner    : merge two containers (parallel)
      Acc::finish,   // finisher    : container -> immutable result
      Collector.Characteristics.UNORDERED);
}
private static final class Acc {           // mutable, never escapes
  long count; BigDecimal sum = ZERO.setScale(2), min, max;
  void add(BigDecimal v) { count++; sum = sum.add(v); min = ..; max = ..; }
  Acc merge(Acc o) { .. count += o.count; sum = sum.add(o.sum); .. }
  MoneyStats finish() { return count == 0 ? EMPTY : new MoneyStats(..); }
}`, 0.5, 1.05, 6.3, 3.75, { label: "theory/CustomCollectors  [8]", fontSize: 9.5, name: "anatomy code" });
  tbl(s, ["Characteristic", "Meaning"], [
    ["IDENTITY_FINISH", "finisher is a cast; may be skipped"],
    ["UNORDERED", "result ignores encounter order"],
    ["CONCURRENT", "one shared container, thread-safe"],
  ], 7.0, 1.05, 2.5, [1.25, 1.25], 0.5, "char table", [0], 9);
  note(s, "The container is mutable for speed; the result is an immutable record.", 4.9, C.text2, "anatomy note");
  s.addNotes("~3 min. Collector.of takes the same four functions we met in L10, plus characteristics. The supplier creates an empty container, here a small private accumulator class. The accumulator adds one element: count plus one, add to the sum, update min and max. The combiner merges two containers; a sequential stream never calls it, but a parallel stream does, so it must be correct, including when one side is empty. The finisher turns the mutable container into an immutable MoneyStats record. Characteristics are hints: UNORDERED says the result does not depend on encounter order; IDENTITY_FINISH means the finisher can be skipped; CONCURRENT is for thread-safe shared containers and is rarely needed. DEMO: open CustomCollectors. Question: why must merge handle an empty side?");

  // ===== 4 MoneyStats results =====
  s = newSlide("CONTENT", "Custom collectors", "Using the custom collector (real output)");
  tbl(s, ["Call", "Result"], [
    ["payments.stream().map(Payment::amount).collect(moneyStats())", "count=12 sum=4429.84 min=18.80 max=1500.00 avg=369.15"],
    ["same with parallelStream()", "equal (true): the combiner works"],
    ["List.of().stream().collect(moneyStats())", "count=0 sum=0.00 min=null max=null avg=0.00"],
    ["groupingBy(method, .., mapping(amount, moneyStats())) · CARD", "count=5 sum=2070.29 min=89.90 max=999.99 avg=414.06"],
    ["  · PAYNOW", "count=4 sum=1824.30 min=18.80 max=1500.00 avg=456.08"],
    ["  · PAYPAL", "count=3 sum=535.25 min=75.00 max=310.25 avg=178.42"],
  ], 0.5, 1.0, 9.0, [4.9, 4.1], 0.4, "use table", [0, 1], 9);
  card(s, 0.5, 4.1, 9.0, 0.85, C.background2, "test card");
  s.addText([{ text: "Tested: ", options: { bold: true, color: C.accent1 } }, { text: "10,000 amounts collected sequentially and in parallel give equal MoneyStats (AdvancedOperationsTest). When to write your own: a reusable aggregation no built-in collector offers (BigDecimal statistics, top-N, a custom report row)." }],
    { x: 0.7, y: 4.12, w: 8.6, h: 0.8, fontSize: 11.5, color: C.text1, margin: 0, valign: "middle", isTextBox: true, objectName: "test text" });
  s.addNotes("~3 min. Here is the collector in use. All twelve payments: count twelve, sum 4,429.84, min 18.80, max 1,500.00, average 369.15. The same pipeline on a parallel stream gives an equal record, which tells us the combiner is correct; a test repeats this with ten thousand amounts. The empty case is defined too: count zero, sum 0.00, average 0.00, and no min or max. Because it is a normal Collector, it works as a downstream: mapping adapts each Payment to its amount, and groupingBy gives one MoneyStats per method. Write your own collector when you need a reusable aggregation that no built-in collector offers; for a one-off, reduce or a loop may be simpler. DEMO: run CustomCollectors. Question: what would break if merge forgot to add the counts?");

  // ===== 5 Generating & flattening =====
  pres.addSection({ title: "Sources and maps" });
  s = newSlide("CONTENT", "Sources and maps", "Generating, concatenating and flattening streams");
  tbl(s, ["Code (theory/GeneratingAndFlattening)", "Real result", "Since"], [
    ["Stream.iterate(Aug, m -> !m.isAfter(Nov), m -> m.plusMonths(1))", "[2026-08, 2026-09, 2026-10, 2026-11]", "9"],
    ["Stream.iterate(expiry.minusWeeks(4), d -> d.plusWeeks(1))\n      .limit(4)", "[2026-11-02, … 2026-11-23]", "8"],
    ["Stream.generate(() -> \"------\").limit(3)", "[------, ------, ------]", "8"],
    ["Stream.concat(departures from SIN, arrivals to SIN)", "[DEP SQ318, … DEP SQ21, ARR GA827]", "8"],
    ["Stream.of(\"SQ12\", null, ..).flatMap(Stream::ofNullable)", "2 elements", "9"],
    ["customers(Singapore).flatMap(accounts).flatMap(txns).count()", "27", "8"],
    ["ids.map(lookup).flatMap(Optional::stream)", "[Alice Tan, Chen Wei] (C999 unknown)", "9"],
  ], 0.5, 1.0, 9.0, [5.4, 2.9, 0.7], 0.42, "gen table", [0], 9);
  note(s, "Deep flattening: group the children first (Map<id, List<…>>), then flatMap through the lookups: one pass per level, no nested loops.", 4.75, C.text2, "gen note");
  s.addNotes("~3 min. Streams do not have to come from a collection. iterate with a condition, from Java 9, generates statement months from August to November like a for loop. iterate with limit generates four weekly reminders before a policy expiry. generate repeats a supplier, here a placeholder row, and always needs a limit. concat joins two streams, keeping departures before arrivals. ofNullable, from Java 9, gives zero or one element, which removes nulls inside flatMap, and Optional.stream does the same for Optionals. For deep structures, customers to accounts to transactions, group the children by parent id first, then flatMap through the lookups: Singapore customers have twenty-seven transactions. DEMO: run GeneratingAndFlattening. Question: what happens to Stream.generate without limit?");

  // ===== 6 Map.merge/compute =====
  s = newSlide("CONTENT", "Sources and maps", "Map.merge, compute, computeIfAbsent vs streams");
  codeBlock(s, `// update a map IN PLACE (loops, event handlers, caches)
for (Account a : accounts)
  totals.merge(a.customerId(), a.balance(), BigDecimal::add);

for (Account a : accounts)
  map.computeIfAbsent(a.customerId(), k -> new ArrayList<>())
     .add(a.number());

map.compute(type, (k, old) -> old == null ? 1 : old + 1);`, 0.5, 1.05, 5.6, 2.9, { label: "theory/MapTransforms  [8]", fontSize: 9.5, name: "merge code" });
  codeBlock(s, `// build a NEW map from a collection
accounts.stream().collect(toMap(
  Account::customerId,
  Account::balance,
  BigDecimal::add,
  TreeMap::new));
// same result: true`, 6.3, 1.05, 3.2, 2.9, { label: "stream equivalent", fontSize: 9.5, name: "tomap code" });
  tbl(s, ["Situation", "Use"], [
    ["Whole collection in hand, new result map", "stream: groupingBy / toMap"],
    ["Events arrive one by one (listener, cache, counter)", "merge / compute / computeIfAbsent"],
  ], 0.5, 4.1, 9.0, [5.0, 4.0], 0.35, "merge table", [], 11);
  s.addNotes("~3 min. Two tools for the same job. Map.merge, compute and computeIfAbsent, all Java 8, update a map in place: merge puts the value or combines it with the existing one, so a total per customer becomes one line inside the loop; computeIfAbsent builds a multimap without the get-null-put dance; compute recomputes one entry from its old value. The stream version, toMap with a merge function and a TreeMap, gives the same map, and the code checks it. Rule of thumb: when you have the whole collection and want a new map, use a stream. When values arrive one at a time, for example in an event listener, a cache or a counter, update the map with merge or compute. DEMO: run MapTransforms. Question: which would you use in a Kafka consumer that counts messages?");

  // ===== 7 entrySet transforms =====
  s = newSlide("CONTENT", "Sources and maps", "Transforming maps with entrySet streams");
  codeBlock(s, `totals.entrySet().stream()
  .sorted(Map.Entry.<String, BigDecimal>comparingByValue(reverseOrder())
          .thenComparing(Map.Entry.comparingByKey()))
  .limit(3)
  .collect(toMap(Map.Entry::getKey, Map.Entry::getValue,
                 (a, b) -> a, LinkedHashMap::new));
// {C003=163950.25, C010=68900.00, C006=36400.40}

totals.entrySet().stream().collect(toMap(Map.Entry::getKey,
    e -> e.getValue().compareTo(new BigDecimal("50000")) >= 0 ? "HIGH" : "STANDARD", ..));
// C003=HIGH, C010=HIGH, others STANDARD

copy.replaceAll((k, v) -> v.signum() > 0 ? v.add(v.multiply(rate)).setScale(2, HALF_UP) : v);
// +1%: C001 15700.50 -> 15857.51, C009 -150.25 unchanged`, 0.5, 1.05, 9.0, 3.4, { label: "theory/MapTransforms", fontSize: 10, name: "entry code" });
  note(s, "Sorted result? collect into a LinkedHashMap, or the order is lost. replaceAll needs a mutable map: copy first.", 4.6, C.accent4, "entry note");
  s.addNotes("~3 min. To transform a map, stream its entry set. Sorting by value: compare entries by value in reverse order, then by key for ties, limit to the top three, and collect into a LinkedHashMap, because a HashMap would lose the sorted order and a TreeMap would re-sort by key. Here the top three customers by total balance are C003, C010 and C006. Mapping values to a new map, here a balance band per customer, leaves the source map untouched. replaceAll, from Java 8, updates every value in place, which needs a mutable map, so we copy first: one percent interest turns 15,700.50 into 15,857.51 and leaves the overdrawn customer alone. A test checks the source map is unchanged. DEMO: run MapTransforms. Question: why does the explicit type witness appear in comparingByValue?");

  // ===== 8 chunk/windows/zip =====
  pres.addSection({ title: "Index-based tasks" });
  s = newSlide("CONTENT", "Index-based tasks", "Batches, sliding windows and zip with an index");
  codeBlock(s, `static <T> List<List<T>> chunk(List<T> list, int size) {
  int chunks = (list.size() + size - 1) / size;     // round up
  return IntStream.range(0, chunks)
      .mapToObj(i -> list.subList(i * size,
                     Math.min(list.size(), (i + 1) * size)))
      .toList();
}
static <T> List<List<T>> windows(List<T> list, int n) {
  return IntStream.rangeClosed(0, list.size() - n)
      .mapToObj(i -> list.subList(i, i + n)).toList();
}`, 0.5, 1.05, 5.7, 3.3, { label: "theory/BatchesAndWindows", fontSize: 9.5, name: "chunk code" });
  tbl(s, ["Call", "Result"], [
    ["chunk(1..250, 100) sizes", "[100, 100, 50]"],
    ["chunk(payments, 5)", "[P001..P005, P006..P010, P011..P012]"],
    ["windows([1..5], 3)", "[[1,2,3], [2,3,4], [3,4,5]]"],
    ["zip(SQ12,TR808,MH602 / NRT,BKK,KUL)", "[SQ12=NRT, TR808=BKK, MH602=KUL]"],
  ], 6.4, 1.05, 3.1, [1.45, 1.65], 0.6, "chunk table", [0], 9);
  note(s, "No built-in operation in Java 21: iterate over INDEXES with IntStream. Needs a random-access List; subList returns views.", 4.55, C.text2, "chunk note");
  s.addNotes("~3 min. Java 21 has no built-in operation for batches or windows, so we stream over indexes. chunk computes the number of chunks, rounding up, and maps each chunk index to a subList: 250 items in batches of 100 give 100, 100 and 50, and our twelve payments in batches of five give three batches. windows maps each start index to a subList of length n: five values give three windows of three. zip pairs two lists by index and stops at the shorter one. Two caveats: this only works on random-access lists, not on a stream from a file, and subList returns views of the original list, so copy them if the source can change. DEMO: run BatchesAndWindows. Question: what does windows return for a list shorter than n?");

  // ===== 9 Running totals =====
  s = newSlide("CONTENT", "Index-based tasks", "Running totals: where streams are a poor fit");
  codeBlock(s, `List<BigDecimal> out = new ArrayList<>();
BigDecimal acc = BigDecimal.ZERO;
for (BigDecimal v : values) {
  acc = acc.add(v);
  out.add(acc);
}
// O(n), obvious, correct`, 0.5, 1.05, 4.4, 2.6, { label: "LOOP  ·  recommended", fontSize: 10, name: "loop code" });
  codeBlock(s, `IntStream.rangeClosed(1, values.size())
  .mapToObj(i -> values.subList(0, i)
      .stream()
      .reduce(ZERO, BigDecimal::add))
  .toList();
// correct, but re-sums every
// prefix: O(n²)`, 5.1, 1.05, 4.4, 2.6, { label: "STREAM  ·  pure but quadratic", fontSize: 10, name: "quad code" });
  outputBox(s, "Monthly SGD debits {2026-08=3314.36, 2026-09=6097.94, 2026-10=5832.65} → running total [3314.36, 9412.30, 15244.95] (both) · 2-month moving average [4706.15, 5965.30]", 0.5, 3.8, 9.0, 0.6, "running output");
  note(s, "A running total depends on the previous result: that is state. Use a loop (or a Gatherer, beyond Java 21). Never an outside variable mutated in map().", 4.55, C.accent4, "running note");
  s.addNotes("~3 min. Running totals are the classic example of a task where streams fit poorly, because each result depends on the previous one. The loop is linear, obvious and correct. The pure stream version re-sums every prefix, so it is correct but quadratic: fine for three months, slow for a million rows. A third version you will see in real code mutates an outside variable inside map; it only works sequentially and breaks the stream contract, so avoid it. Note that the monthly totals use SGD debits only: two transactions are in USD, and adding currencies would be a bug. Both versions give 3,314.36, 9,412.30 and 15,244.95. DEMO: run BatchesAndWindows, last lines. Question: why does mutating an outside variable break in parallel?");

  // ===== 10 Paging =====
  s = newSlide("CONTENT", "Index-based tasks", "Streaming a paged result set with StreamSupport");
  codeBlock(s, `Iterator<Transaction> it = ..;       // fetches the next page on demand
Stream<Transaction> rows = StreamSupport.stream(
    Spliterators.spliteratorUnknownSize(it, ORDERED | NONNULL),
    false);                               // false = sequential

// Java 9 alternative, no Iterator class:
Stream.iterate(0, p -> p + 1).map(pages::fetch)
      .takeWhile(page -> !page.isEmpty()).flatMap(List::stream);`, 0.5, 1.05, 9.0, 2.2, { label: "theory/PagingWithSpliterator  [8]", fontSize: 10, name: "paging code" });
  tbl(s, ["60 transactions, page size 25", "Result", "Pages fetched"], [
    ["stream(pages).count()", "60 rows", "4 (25 + 25 + 10 + empty)"],
    ["stream(pages).filter(..).findFirst()", "T001", "1"],
    ["stream(pages).filter(amount > 1000).limit(2).count()", "2 found", "1"],
    ["iterate + takeWhile [9] .count()", "60 rows", "4"],
  ], 0.5, 3.4, 9.0, [4.6, 1.7, 2.7], 0.33, "paging table", [0], 10);
  s.addNotes("~3 min. Large result sets come in pages: from a REST API, a database cursor or a file. Wrap an Iterator that fetches the next page only when the current one is used up, turn it into a Spliterator with unknown size, and StreamSupport.stream gives a lazy stream. The fake repository counts round trips. Counting all sixty rows needs four fetches: twenty-five, twenty-five, ten, and an empty page that ends the stream. findFirst needs one fetch, and so does finding the first two amounts over one thousand, because short-circuiting stops the pipeline. Java 9 offers a shorter version: iterate over page numbers, takeWhile the page is not empty, and flatten. Real cursors also need closing; L21 adds try-with-resources. DEMO: run PagingWithSpliterator. Question: why pass false as the second argument?");

  // ===== 11 Gatherers =====
  s = newSlide("CONTENT", "Index-based tasks", "Beyond Java 21: Stream Gatherers (preview only)");
  codeBlock(s, `// Java 24+ (JEP 485; preview in 22 and 23). Does NOT compile with Java 21.
payments.stream().gather(Gatherers.windowFixed(100)).toList();     // batches
values.stream().gather(Gatherers.windowSliding(2)).toList();       // windows
values.stream()
      .gather(Gatherers.scan(() -> BigDecimal.ZERO, BigDecimal::add))
      .toList();                                                   // running totals`, 0.5, 1.05, 9.0, 2.0, { label: "BEYOND JAVA 21  ·  not part of this course's code", fontSize: 10, name: "gatherer code" });
  tbl(s, ["Task in this lesson", "Java 21 (this course)", "Java 24+ Gatherer"], [
    ["Batches of 100", "chunk(list, 100) with IntStream indexes", "Gatherers.windowFixed(100)"],
    ["Sliding windows", "windows(list, n) with subList", "Gatherers.windowSliding(n)"],
    ["Running totals", "a loop", "Gatherers.scan(init, op)"],
    ["Custom stateful step", "a loop or a custom Spliterator", "Gatherer.of(..)"],
  ], 0.5, 3.2, 9.0, [2.4, 3.6, 3.0], 0.33, "gatherer table", [2], 10.5);
  s.addNotes("~2 min. A short look beyond Java 21, clearly labelled. Java 22 previewed Stream Gatherers, and Java 24 made them final. A gatherer is a custom intermediate operation, the way a collector is a custom terminal operation. The built-in Gatherers class includes windowFixed for batches, windowSliding for windows, and scan for running totals: exactly the three tasks we solved by hand today, and they also work on streams that are not lists. None of this compiles with Java 21, and our repository targets 21, so the course code keeps the IntStream helpers and the loop. Once your team runs Java 25, a long-term-support release, these helpers can be replaced. DEMO: none. Question: which of today's helpers would you delete first after upgrading?");

  // ===== 12 Worked example =====
  pres.addSection({ title: "Worked example" });
  s = newSlide("CONTENT", "Worked example", "Refactor: payment statistics, three ways");
  codeBlock(s, `Map<String, Long> count = ..groupingBy(
    Payment::method, TreeMap::new, counting());
Map<String, BigDecimal> sum = ..groupingBy(
    Payment::method, reducing(ZERO,
    Payment::amount, BigDecimal::add));
Map<String, Optional<Payment>> min =
    ..groupingBy(Payment::method,
       minBy(comparing(Payment::amount)));
Map<String, Optional<Payment>> max = ..
count.keySet().stream().map(m -> m
  + ": count=" + count.get(m) + ..)`, 0.5, 1.05, 4.5, 3.4, { label: "AFTER  ·  Java 8  ·  4 passes", fontSize: 9.5, name: "after code" });
  codeBlock(s, `SampleData.payments().stream()
  .collect(groupingBy(
     Payment::method,
     TreeMap::new,
     mapping(Payment::amount,
         CustomCollectors.moneyStats())))
  .entrySet().stream()
  .map(e -> e.getKey() + ": "
          + e.getValue())
  .toList();
// MoneyStats.toString formats
// the line; 1 pass, reusable`, 5.2, 1.05, 4.3, 3.4, { label: "MODERN  ·  1 pass, custom collector", fontSize: 9.5, name: "modern code" });
  outputBox(s, "All 3: CARD: count=5 sum=2070.29 min=89.90 max=999.99 avg=414.06 · PAYNOW: count=4 sum=1824.30 … avg=456.08 · PAYPAL: … avg=178.42", 0.5, 4.55, 9.0, 0.5, "ba output");
  s.addNotes("~3 min. The worked example three ways. The Java 8 version replaces each hand-written map with a groupingBy: counting, reducing for the BigDecimal sum, minBy and maxBy, and then combines the four maps by key. It is clearer than the loop but passes over the data four times and must unwrap two Optionals. The modern version uses our custom collector as the downstream: one pass, one reusable component, and the MoneyStats record formats the line itself. If we later need the average elsewhere, or a parallel run, the collector already supports it. PaymentStatsRefactoringTest checks that all three versions print the same three lines. DEMO: run ModernPaymentStats. Question: when is a custom collector over-engineering?");

  // ===== 13 Pitfalls =====
  s = newSlide("CONTENT", "Worked example", "Pitfalls and best practices");
  const pits = [["Combiner that ignores an empty side", "Parallel results silently wrong."], ["Stream.generate / iterate without a limit", "Infinite stream: the program hangs."], ["Mutating an outside variable in map()", "Breaks in parallel; hides state."], ["Sorted entries collected into a HashMap", "Order lost; use LinkedHashMap."], ["Adding SGD and USD amounts", "Group or filter by currency first."]];
  pits.forEach(([h, d], i) => {
    const y = 1.0 + i * 0.8;
    card(s, 0.5, y, 4.6, 0.7, "FBECEC", "pit " + i);
    iconCircle(s, I.bug, 0.6, y + 0.14, 0.42, C.accent4, "pit icon " + i);
    s.addText([{ text: h, options: { bold: true, color: C.accent4, breakLine: true } }, { text: d, options: { fontSize: 11, color: C.text1 } }], { x: 1.12, y: y + 0.02, w: 3.9, h: 0.66, fontSize: 12.5, margin: 0, valign: "middle", isTextBox: true, objectName: "pit text " + i });
  });
  const dos = ["Test custom collectors sequential AND parallel", "Return immutable results from finishers", "merge/compute for one-by-one updates", "IntStream indexes for batches and windows", "Use a loop for running totals", "Lazy paging: short-circuit early"];
  card(s, 5.3, 1.0, 4.2, 3.9, C.background2, "do card");
  iconCircle(s, I.check, 5.45, 1.12, 0.45, C.accent1, "do icon");
  s.addText("Best practices", { x: 6.05, y: 1.12, w: 3.3, h: 0.45, fontSize: 15, bold: true, color: C.accent1, margin: 0, valign: "middle", isTextBox: true, objectName: "do title" });
  s.addText(bullets(dos, 12.5).map(r => { r.options.paraSpaceAfter = 7; return r; }), { x: 5.5, y: 1.7, w: 3.9, h: 3.1, margin: 0, valign: "top", isTextBox: true, objectName: "do list" });
  s.addNotes("~3 min. Five pitfalls. A combiner that does not handle an empty side gives wrong results only in parallel, which is why our test compares sequential and parallel runs. generate and iterate without a limit or a condition never end. Mutating an outside variable inside map, often seen in running totals, breaks in parallel and hides state. Sorting entries and collecting them into a HashMap loses the order. And adding amounts in different currencies is a business bug that no compiler catches. The habits on the right: test custom collectors both ways, return immutable results, use merge and compute for one-by-one updates, IntStream indexes for batches and windows, a loop for running totals, and lazy paging with early short-circuiting. DEMO: run AdvancedOperationsTest. Question: which pitfall have you met in production?");

  // ===== 14 Interview =====
  pres.addSection({ title: "Practice" });
  s = newSlide("CONTENT", "Practice", "Interview questions");
  const qa = [
    ["What are the parts of Collector.of?", "Supplier, accumulator, combiner, finisher, characteristics."],
    ["When is the combiner called?", "Only when partial results are merged, i.e. in parallel streams."],
    ["Map.merge vs toMap?", "merge updates a map in place; toMap builds a new one from a stream."],
    ["How do you batch a list in Java 21?", "IntStream over chunk indexes + subList. Java 24+: windowFixed."],
    ["How do you stream a paged API lazily?", "Iterator → Spliterators.spliteratorUnknownSize → StreamSupport.stream, or iterate + takeWhile [9]."],
  ];
  qa.forEach(([q, a], i) => {
    const colI = i % 2, row = Math.floor(i / 2);
    const x = i === 4 ? 0.5 : 0.5 + colI * 4.6, y = 1.0 + row * 1.38, w = i === 4 ? 9.0 : 4.4;
    card(s, x, y, w, 1.22, C.background2, "qa card " + i);
    s.addText("Q" + (i + 1), { shape: pres.shapes.OVAL, x: x + 0.12, y: y + 0.14, w: 0.42, h: 0.42, fill: { color: C.text2 }, line: { color: C.text2 }, fontSize: 11, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "q badge " + i });
    s.addText([{ text: q, options: { bold: true, color: C.text2, breakLine: true } }, { text: a, options: { color: C.text1, fontSize: 12 } }], { x: x + 0.65, y: y + 0.06, w: w - 0.8, h: 1.1, fontSize: 13.5, margin: 0, valign: "middle", isTextBox: true, objectName: "qa text " + i });
  });
  s.addNotes("~3 min. Five interview questions for this lesson. The first is about the anatomy of a collector; strong candidates also explain the characteristics. The second checks understanding of parallel execution: a sequential stream never calls the combiner, which is why bugs in it hide until production. The third distinguishes updating a map in place from building a new one, and a good answer gives a use case for each. The fourth is a common practical task; a senior candidate mentions subList views, rounding up the number of chunks, and Gatherers in newer Java. The fifth tests whether the candidate knows that streams can be lazy over external data. DEMO: run QuizAnswersTest. Question: which would you ask a senior candidate?");

  // ===== 15 Summary =====
  pres.addSection({ title: "Wrap-up" });
  s = newSlide("DARK_TITLE", "Wrap-up", "Summary");
  const sum = ["Collector.of: supplier, accumulator, combiner, finisher [8]", "iterate [9], generate, concat, ofNullable [9], flatMap levels", "merge/compute in place; entrySet streams for new maps", "Batches and windows: IntStream over indexes", "Running totals: a loop (Gatherers beyond 21)", "Paging: StreamSupport over a lazy Iterator"];
  s.addText(bullets(sum, 14, C.background1), { x: 0.5, y: 2.1, w: 5.2, h: 2.9, margin: 0, valign: "top", isTextBox: true, objectName: "summary bullets" });
  card(s, 6.0, 0.6, 3.5, 2.05, "143F32", "exercise card");
  iconCircle(s, I.code, 6.2, 0.78, 0.45, C.accent2, "exercise");
  s.addText([{ text: "Exercise (~45 min)", options: { bold: true, color: C.accent2, breakLine: true } }, { text: "Exercise13: running balance per account and payment-file batches with control totals.", options: { color: C.background1, fontSize: 12 } }],
    { x: 6.75, y: 0.75, w: 2.65, h: 1.8, fontSize: 14, margin: 0, valign: "top", isTextBox: true, objectName: "exercise text" });
  card(s, 6.0, 2.85, 3.5, 2.05, "143F32", "next card");
  iconCircle(s, I.rocket, 6.2, 3.03, 0.45, C.accent1, "next");
  s.addText([{ text: "Next: Lesson 14", options: { bold: true, color: C.accent2, breakLine: true } }, { text: "Parallel Streams & Performance: when parallel helps, when it hurts, and how to measure.", options: { color: C.background1, fontSize: 12 } }],
    { x: 6.75, y: 3.0, w: 2.65, h: 1.8, fontSize: 14, margin: 0, valign: "top", isTextBox: true, objectName: "next text" });
  s.addNotes("~3 min. Recap: Collector.of builds reusable aggregations from a supplier, an accumulator, a combiner and a finisher; iterate, generate, concat and ofNullable create streams that do not come from a collection; merge and compute update maps in place, while entry-set streams build new maps; batches and windows stream over indexes; running totals belong in a loop until Gatherers arrive; and StreamSupport turns a paged source into a lazy stream. The exercise has two parts: a running balance statement per account, computing the opening balance from the closing balance and the SGD movements, and payment-file batches with a control total per batch. Remove @Disabled in Exercise13Test. DEMO: run Solution13. Question: why must the batch control totals add up to the grand total?");

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
})();
