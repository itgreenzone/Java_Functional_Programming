// L08 slide deck generator - ITGreenZone Java Functional Programming
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa");
const { applyTheme } = require("/root/.claude/skills/synced/2eb53c35-a0c8-4343-9257-776fcd7fed67_dd7dcff0-93ee-4601-a8ce-12573fa09cd9/pptx/scripts/apply_theme.js");

const OUT = process.argv[2] || "L08_SortingComparators_Slides.pptx";
const LESSON = "08";
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
pres.title = "L08 Sorting with Comparators";
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
    bug: await icon(fa.FaBug), sort: await icon(fa.FaSortAmountDown), layers: await icon(fa.FaLayerGroup),
  };
  const tbl = (s, head, rows, x, y, w, colW, rowH, name, monoCols = [0], fs = 10.5) => {
    const h = head.map(t => ({ text: t, options: { bold: true, color: C.background1, fill: { color: C.text2 } } }));
    const r = rows.map((row, i) => row.map((c, j) => ({ text: c, options: Object.assign({ fill: { color: i % 2 ? C.background1 : C.background2 }, color: C.text1, fontSize: fs }, monoCols.includes(j) ? { fontFace: MONO, fontSize: fs - 0.5, bold: j === 0 } : {}) })));
    s.addTable([h, ...r], { x, y, w, colW, rowH, border: { type: "solid", pt: 0.5, color: "D5E3DA" }, valign: "middle", margin: [2, 5, 2, 5], objectName: name });
  };
  const note = (s, text, y, color, name) => s.addText(text, { x: 0.5, y, w: 9, h: 0.4, fontSize: 12.5, italic: true, color: color || C.text2, margin: 0, isTextBox: true, objectName: name });

  // ===== 1 Title =====
  pres.addSection({ title: "Introduction" });
  let s = newSlide("DARK_TITLE", "Introduction", "Sorting with Comparators");
  s.addText("LESSON 08  ·  MODULE 2 STREAM API", { x: 0.5, y: 0.6, w: 5.5, h: 0.35, fontSize: 12, bold: true, color: C.accent2, charSpacing: 2, margin: 0, isTextBox: true, objectName: "kicker" });
  s.addText("comparing · thenComparing · reversed · nullsFirst/Last · comparingByValue · reversed() [21]", { x: 0.5, y: 2.95, w: 5.0, h: 0.8, fontSize: 15, italic: true, color: C.background2, margin: 0, isTextBox: true, objectName: "subtitle" });
  card(s, 6.0, 0.6, 3.5, 4.3, "143F32", "objectives card");
  s.addText("You will be able to", { x: 6.25, y: 0.75, w: 3.1, h: 0.35, fontSize: 14, bold: true, color: C.accent2, margin: 0, isTextBox: true, objectName: "objectives heading" });
  ["Choose natural order or a Comparator", "Build comparators with factory methods", "Chain multi-key sorts without the reversed() bug", "Handle nulls, case and stable sorting", "Sort maps by value; List.sort vs sorted"].forEach((o, i) => {
    const y = 1.2 + i * 0.72;
    s.addText(String(i + 1), { shape: pres.shapes.OVAL, x: 6.25, y: y + 0.05, w: 0.36, h: 0.36, fill: { color: C.accent1 }, line: { color: C.accent1 }, fontSize: 12, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "objective number " + (i + 1) });
    s.addText(o, { x: 6.75, y, w: 2.6, h: 0.62, fontSize: 12.5, color: C.background1, valign: "middle", margin: 0, isTextBox: true, objectName: "objective " + (i + 1) });
  });
  s.addNotes("~2 min. Sorting appears in almost every report: statements by date, customers by tier, flights on a departures board. Java 8 turned Comparator into a small language of its own, with factory methods such as comparing and thenComparing, and Java 21 added reversed on every sequenced collection. Today we cover natural order versus comparators, the factory methods, multi-key sorts, the reversed gotcha that catches even senior developers, nulls, case-insensitive order, stability, sorting a map by value, and List.sort versus stream sorted. The worked example is a customer ranking: tier descending, total balance descending, name ascending. The exercise is an airport departures board with flights whose time is not announced yet. DEMO: open package l08_sorting. Question: how many comparators does your current project define by hand?");

  // ===== 2 Problem =====
  pres.addSection({ title: "Theory" });
  s = newSlide("CONTENT", "Theory", "The problem: hand-written compare methods");
  codeBlock(s, `Collections.sort(customers, new Comparator<Customer>() {
  public int compare(Customer x, Customer y) {
    int byTier = y.tier().compareTo(x.tier());   // DESC
    if (byTier != 0) return byTier;
    int byTotal = totals.get(y.id())
                        .compareTo(totals.get(x.id()));  // DESC
    if (byTotal != 0) return byTotal;
    return x.name().compareTo(y.name());          // ASC
  }
});`, 0.5, 1.05, 5.5, 3.1, { label: "BEFORE  ·  before/LegacyCustomerRanking", fontSize: 9.5, name: "legacy code" });
  codeBlock(s, `Comparator
  .comparing(Customer::tier,
             reverseOrder())
  .thenComparing(
      c -> totals.get(c.id()),
      reverseOrder())
  .thenComparing(Customer::name)`, 6.2, 1.05, 3.3, 3.1, { label: "AFTER  ·  Java 8", fontSize: 10, name: "stream code" });
  outputBox(s, "1. C003 Chen Wei PLATINUM 163950.25 · 2. C006 PLATINUM 36400.40 · 3. C010 GOLD 68900.00 … 10. C009 SILVER -150.25", 0.5, 4.3, 9.0, 0.5, "problem output");
  note(s, "Which way is DESC? In the legacy code you read y-before-x; in the chain you read reverseOrder().", 4.85, C.text2, "problem note");
  s.addNotes("~3 min. The ranking rule: tier descending, total balance descending, then name ascending as a tie-breaker. The Java 7 version on the left is twelve lines of compare logic. The direction of each key is hidden in the order of x and y: y.compareTo(x) means descending, x.compareTo(y) ascending. Swap one pair by accident and the report is silently wrong, with no exception and no compiler warning. The Java 8 version says the same thing declaratively: compare by tier in reverse order, then by total in reverse order, then by name. Each key and its direction is on its own line, so a reviewer can check it against the requirement in seconds. All three versions in the repo produce the identical ranking. DEMO: run LegacyCustomerRanking. Question: in the legacy version, which single character change would make the names descending?");

  // ===== 3 Natural vs comparator =====
  s = newSlide("CONTENT", "Theory", "sorted() vs sorted(Comparator)");
  codeBlock(s, `customers.stream().map(Customer::city).distinct().sorted()
// [Bangkok, Colombo, Jakarta, Kuala Lumpur, Singapore]

customers.stream().sorted().toList();
// ClassCastException: Customer cannot be cast to Comparable

customers.stream().sorted(comparing(Customer::city))   // OK

Stream.of(GOLD, PLATINUM, SILVER, GOLD).sorted()
// [SILVER, GOLD, GOLD, PLATINUM]   (declaration order)
Stream.of(bd("10.00"), bd("9.5"), bd("10.0"), bd("-1")).sorted()
// [-1, 9.5, 10.00, 10.0]   (compareTo: 10.00 == 10.0)`, 0.5, 1.05, 6.0, 3.4, { label: "theory/NaturalVsComparator", fontSize: 10, name: "natural code" });
  const nf = [["sorted()", "natural order: the element must be Comparable (String, Integer, LocalDate, BigDecimal, enums…)"], ["sorted(Comparator)", "any order, any type: records, legacy classes, several keys"], ["Fails late", "sorted() on a non-Comparable type compiles, then throws at run time"]];
  nf.forEach(([h, d], i) => {
    const y = 1.05 + i * 1.15;
    card(s, 6.7, y, 2.8, 1.0, i === 2 ? "FBECEC" : C.background2, "nf " + i);
    s.addText([{ text: h, options: { bold: true, fontFace: i < 2 ? MONO : THEME.bodyFontFace, color: i === 2 ? C.accent4 : C.text2, breakLine: true } }, { text: d, options: { fontSize: 11 } }], { x: 6.85, y: y + 0.05, w: 2.55, h: 0.9, fontSize: 12.5, color: C.text1, margin: 0, valign: "middle", isTextBox: true, objectName: "nf text " + i });
  });
  note(s, "Enums sort by declaration order (SILVER < GOLD < PLATINUM), not alphabetically. BigDecimal sorts by value, and the sort is stable.", 4.6, C.text2, "natural note");
  s.addNotes("~3 min. sorted with no argument uses natural order, which means the elements must implement Comparable. String, the number wrappers, LocalDate, BigDecimal and every enum do. Our Customer record does not, and here is the trap: sorted compiles happily and then throws ClassCastException at run time, as the second line shows. sorted with a Comparator works on any type and any order. Two natural orders deserve attention. Enums compare by declaration order, so SILVER, GOLD, PLATINUM, which happens to be our tier ranking; alphabetical would put GOLD first. BigDecimal compares by value, so 10.00 and 10.0 are equal, and because sorting is stable they keep their input order. DEMO: run NaturalVsComparator. Question: what would happen if someone reordered the constants in the Tier enum?");

  // ===== 4 Factories =====
  s = newSlide("CONTENT", "Theory", "Comparator factory methods [Java 8]");
  tbl(s, ["Factory", "Example", "Real result (theory/ComparatorFactories)"], [
    ["comparing(keyExtractor)", "comparing(Policy::premium)", "POL-505 185.00, POL-509 210.00, POL-504 720.00"],
    ["comparing(key, keyComparator)", "comparing(Customer::city, reverseOrder())", "Singapore, Kuala Lumpur, Jakarta, Colombo, Bangkok"],
    ["comparingInt / Long", "comparingInt(Flight::seats)", "MH602 160, SQ21 161, GA827 162 …"],
    ["comparingDouble", "comparingDouble(f -> booked / seats)", "MH602, GA827, SQ12 … TR808, SQ21"],
    ["naturalOrder / reverseOrder", "Stream.of(160, 471, 222).sorted(reverseOrder())", "[471, 222, 160]"],
    ["String.CASE_INSENSITIVE_ORDER", "labels.sorted(CASE_INSENSITIVE_ORDER)", "[CARD, card, paynow, PayPal]"],
  ], 0.5, 1.0, 9.0, [2.6, 3.35, 3.05], 0.5, "factory table", [0, 1]);
  note(s, "Java 7: new Comparator<Policy>() { compare(a, b) { return a.premium().compareTo(b.premium()); } } gives the same result.", 4.6, C.accent5, "factory note");
  s.addNotes("~3 min. The factory methods that replace hand-written compare methods. comparing takes a key extractor, usually a method reference, and the key must be Comparable. The two-argument form adds a comparator for the key itself, which is how you sort one key in reverse or case-insensitively. comparingInt, comparingLong and comparingDouble avoid boxing primitive keys; use comparingDouble for ratios such as a load factor, never for money, where BigDecimal is already Comparable. naturalOrder and reverseOrder are ready-made comparators for Comparable types. String.CASE_INSENSITIVE_ORDER has existed since Java 1.2 and fits perfectly as a key comparator. The first row shows the Java 7 anonymous class and the factory giving identical results. DEMO: run ComparatorFactories. Question: why does comparingInt exist when comparing(Flight::seats) also works?");

  // ===== 5 thenComparing =====
  s = newSlide("CONTENT", "Theory", "thenComparing: multi-key sorts");
  codeBlock(s, `static final Comparator<CustomerView> RANKING =
    Comparator.comparing(CustomerView::tier, reverseOrder())   // 1st key DESC
              .thenComparing(CustomerView::total, reverseOrder()) // 2nd key DESC
              .thenComparing(CustomerView::name);                 // tie-break ASC`, 0.5, 1.05, 9.0, 1.4, { label: "theory/ChainingAndReversed · RANKING", fontSize: 10.5, name: "ranking code" });
  const rk = [["C003", "PLATINUM", "163950.25"], ["C006", "PLATINUM", "36400.40"], ["C010", "GOLD", "68900.00"], ["C001", "GOLD", "15700.50"], ["C004", "GOLD", "6400.00"], ["C007", "GOLD", "4350.60"], ["C008", "SILVER", "2780.00"], ["C005", "SILVER", "1200.00"], ["C002", "SILVER", "850.75"], ["C009", "SILVER", "-150.25"]];
  rk.forEach(([id, t, b], i) => {
    const col = i % 5, row = Math.floor(i / 5);
    const fill = t === "PLATINUM" ? C.text2 : (t === "GOLD" ? C.accent2 : "C9D3CE");
    s.addText([{ text: (i + 1) + ". " + id, options: { bold: true, breakLine: true } }, { text: t, options: { fontSize: 9, breakLine: true } }, { text: b, options: { fontSize: 10, fontFace: MONO } }], { shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.06, x: 0.5 + col * 1.82, y: 2.65 + row * 0.95, w: 1.7, h: 0.82, fill: { color: fill }, line: { color: fill }, color: t === "PLATINUM" ? C.background1 : C.text1, fontSize: 11.5, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "rank " + i });
  });
  note(s, "Tier wins first; the total only decides inside a tier (C010 68900.00 is below C006 36400.40). Name breaks remaining ties.", 4.6, C.text2, "ranking note");
  s.addNotes("~3 min. thenComparing adds a tie-breaker that is only consulted when every earlier key is equal. Read the ranking comparator from top to bottom: tier descending first, then total balance descending, then name ascending. Each key has its own direction, given by reverseOrder as the key comparator. The result shows why the order of keys matters: C010 has 68,900 dollars, almost twice C006, but C006 ranks higher because tier is compared first and PLATINUM beats GOLD. Within GOLD the totals decide. The name key never fires in our data, but every production sort should end with a unique tie-breaker so the order is deterministic between runs and pages. The record CustomerView holds the computed total, so the comparator only reads fields. DEMO: run ChainingAndReversed, the ranking lines. Question: what would change if total came before tier?");

  // ===== 6 reversed gotcha =====
  s = newSlide("CONTENT", "Theory", "The reversed() gotcha");
  const rows = [["comparing(tier).thenComparing(name)", "C002 C005 C008 C009 | C001 C004 C007 C010 | C003 C006", C.background2, C.text1], ["(… same chain …).reversed()", "C006 C003 | C010 C007 C004 C001 | C009 C008 C005 C002", "FBECEC", C.accent4], ["comparing(tier, reverseOrder()).thenComparing(name)", "C003 C006 | C001 C004 C007 C010 | C002 C005 C008 C009", "E3F4EA", C.accent1]];
  rows.forEach(([c, r, bg, col], i) => {
    const y = 1.05 + i * 0.95;
    card(s, 0.5, y, 9.0, 0.82, bg, "rev row " + i);
    s.addText([{ text: c, options: { fontFace: MONO, fontSize: 11, bold: true, color: col, breakLine: true } }, { text: r, options: { fontFace: MONO, fontSize: 11, color: C.text1 } }], { x: 0.65, y: y + 0.04, w: 8.7, h: 0.74, margin: 0, valign: "middle", isTextBox: true, objectName: "rev text " + i });
  });
  s.addText("✗ tier DESC, but names DESC too", { x: 6.5, y: 2.1, w: 2.9, h: 0.3, fontSize: 11, bold: true, color: C.accent4, margin: 0, align: "right", isTextBox: true, objectName: "rev wrong" });
  s.addText("✓ tier DESC, names ASC", { x: 6.5, y: 3.05, w: 2.9, h: 0.3, fontSize: 11, bold: true, color: C.accent1, margin: 0, align: "right", isTextBox: true, objectName: "rev right" });
  card(s, 0.5, 4.0, 9.0, 1.05, "FFF4E0", "rev rule card");
  s.addText([{ text: "Rule: ", options: { bold: true, color: C.accent2 } }, { text: "reversed() returns a comparator that reverses EVERYTHING before it in the chain, including nullsFirst/nullsLast. To make one key descending, pass reverseOrder() as that key's comparator, or call reversed() right after that key, before the next thenComparing." }],
    { x: 0.65, y: 4.05, w: 8.7, h: 0.95, fontSize: 12.5, color: C.text1, margin: 0, valign: "middle", isTextBox: true, objectName: "rev rule" });
  s.addNotes("~4 min. This is the most common comparator bug. The requirement: tier descending, name ascending. A natural first attempt is to write the ascending chain and add reversed at the end. Look at the red row from the real run: tier is descending, but within each tier the names are now descending too, because reversed applies to the whole comparator built so far. The green row is correct: only the tier key gets reverseOrder. It compiles either way and no exception tells you, so only a test with ties within a tier catches it. The same applies to nulls: reversing a chain that ends in nullsLast moves the nulls to the front, which you will see in the exercise. DEMO: run ChainingAndReversed, lines 1 to 3. Question: where else could you put reversed() to fix it, without reverseOrder()?");

  // ===== 7 nulls =====
  s = newSlide("CONTENT", "Theory", "nullsFirst / nullsLast");
  codeBlock(s, `record Activity(String account, LocalDate last) { }  // last == null: dormant

activities.stream().sorted(comparing(Activity::last))
// NullPointerException  (ACC-1006 and ACC-1015 have no transactions)

activities.stream()
    .sorted(comparing(Activity::last,
                      nullsLast(reverseOrder()))     // most recent first
            .thenComparing(Activity::account))
// ACC-1011=2026-10-30, ACC-1005=2026-10-29, … ACC-1006=null, ACC-1015=null

.sorted(comparing(Activity::last, nullsFirst(naturalOrder())))
// [ACC-1006, ACC-1015, ACC-1001, ACC-1002]`, 0.5, 1.05, 9.0, 3.25, { label: "theory/NullsAndStability", fontSize: 10.5, name: "nulls code" });
  note(s, "nullsFirst/nullsLast wrap the KEY comparator when the key can be null; wrap the whole comparator when the element itself can be null.", 4.45, C.accent4, "nulls note");
  s.addNotes("~3 min. Real data has gaps. Here each account has the date of its latest transaction, and two accounts, ACC-1006 and ACC-1015, have none, so the date is null; this mimics a legacy entity with a nullable column. Plain comparing calls compareTo on the key and throws NullPointerException as soon as it meets a null. nullsLast and nullsFirst wrap another comparator and decide where nulls go, here the most recent activity first and dormant accounts at the end. Notice where the wrapper goes: around the key comparator, as the second argument of comparing, because the key is null, not the Activity. If the elements themselves can be null, wrap the whole comparator instead. In new code prefer Optional or a sentinel, but sorting must cope with what the data really contains. DEMO: run NullsAndStability. Question: which accounts would appear first with nullsFirst(reverseOrder())?");

  // ===== 8 Case & stability =====
  s = newSlide("CONTENT", "Theory", "Case-insensitive order and stable sorting");
  codeBlock(s, `List.of("paynow", "PayPal", "CARD", "card")
  .sorted()
  // [CARD, PayPal, card, paynow]
  .sorted(CASE_INSENSITIVE_ORDER)
  // [CARD, card, paynow, PayPal]`, 0.5, 1.05, 5.3, 1.6, { label: "theory/ComparatorFactories", fontSize: 10, name: "case code" });
  codeBlock(s, `august.stream()
  .sorted(comparing(Transaction::date).reversed())
// 31:T015, 30:T014, 26:T012, 26:T013, 24:T011,
// 22:T009, 22:T010, …   equal dates keep input order`, 0.5, 2.75, 5.3, 1.45, { label: "theory/NullsAndStability · stable", fontSize: 10, name: "stable code" });
  card(s, 6.0, 1.05, 3.5, 3.1, C.background2, "case card");
  s.addText([{ text: "Case", options: { bold: true, color: C.text2, breakLine: true } }, { text: "Natural String order is by Unicode code: all uppercase letters come before lowercase. Use CASE_INSENSITIVE_ORDER (or a Collator for languages).", options: { fontSize: 11.5, breakLine: true } }, { text: " ", options: { fontSize: 6, breakLine: true } }, { text: "Stability", options: { bold: true, color: C.text2, breakLine: true } }, { text: "Stream.sorted on an ordered stream and List.sort are stable: equal elements keep their order. CARD stays before card.", options: { fontSize: 11.5 } }],
    { x: 6.15, y: 1.15, w: 3.2, h: 2.9, fontSize: 13, color: C.text1, margin: 0, valign: "top", isTextBox: true, objectName: "case text" });
  note(s, "Stability lets you sort in passes, but one comparator with thenComparing is clearer and faster.", 4.4, C.text2, "stable note");
  s.addNotes("~3 min. Two details that decide whether a report looks right. Natural String order compares Unicode values, and every uppercase letter comes before every lowercase letter, so CARD and PayPal come before card. For user-typed text use String.CASE_INSENSITIVE_ORDER, or a java.text.Collator when language rules matter. Second, stability. A stable sort keeps equal elements in their input order. The stream sorted operation is stable on ordered streams, and List.sort is stable too. The proof on the left: sorting August transactions by date descending keeps T009 before T010 and T012 before T013, which share dates. Stability is why CARD stays before card in the case-insensitive result. You could sort in several passes and rely on stability, but one comparator chain is clearer. DEMO: run NullsAndStability, last line. Question: is a parallel unordered sort stable?");

  // ===== 9 Maps by value =====
  pres.addSection({ title: "Maps and lists" });
  s = newSlide("CONTENT", "Maps and lists", "Sorting a map by value");
  codeBlock(s, `Map<String, Long> counts = txns.stream()
    .collect(groupingBy(Transaction::accountNumber,
                        TreeMap::new, counting()));   // L11
// {ACC-1001=4, ACC-1002=2, ACC-1003=7, ACC-1004=6, …}

counts.entrySet().stream()
    .sorted(Map.Entry.<String, Long>comparingByValue(reverseOrder())
                     .thenComparing(Map.Entry.comparingByKey()))
    .limit(3)
    .map(e -> e.getKey() + "=" + e.getValue())
    .toList();`, 0.5, 1.05, 6.2, 3.3, { label: "theory/SortingMapsAndLists", fontSize: 10, name: "map code" });
  outputBox(s, "busiest 3: [ACC-1003=7, ACC-1004=6, ACC-1008=6]", 0.5, 4.5, 6.2, 0.5, "map output");
  card(s, 6.9, 1.05, 2.6, 3.95, C.background2, "map card");
  s.addText([{ text: "Remember", options: { bold: true, color: C.text2, breakLine: true } }, { text: "A Map cannot be sorted by value in place. Stream its entrySet().", options: { fontSize: 11.5, breakLine: true } }, { text: " ", options: { fontSize: 5, breakLine: true } }, { text: "TreeMap sorts by KEY only.", options: { fontSize: 11.5, breakLine: true } }, { text: " ", options: { fontSize: 5, breakLine: true } }, { text: "The type witness <String, Long> is needed before .thenComparing.", options: { fontSize: 11.5, breakLine: true } }, { text: " ", options: { fontSize: 5, breakLine: true } }, { text: "Need a sorted map? Collect into a LinkedHashMap (L10).", options: { fontSize: 11.5 } }],
    { x: 7.05, y: 1.15, w: 2.35, h: 3.75, fontSize: 13, color: C.text1, margin: 0, valign: "top", isTextBox: true, objectName: "map text" });
  s.addNotes("~3 min. A classic interview task: sort a map by its values. A Map has no sort method, and a TreeMap orders by key only, so we stream the entry set. Map.Entry offers comparingByKey and comparingByValue, each optionally with a comparator. Here we count transactions per account, then sort entries by count descending and break ties by account number, and keep the top three: ACC-1003 with seven, then ACC-1004 and ACC-1008 with six. Two practical details. Java cannot infer the generic types when you chain thenComparing onto comparingByValue, so you write the type witness String, Long. And if you need the result as a map that keeps this order, collect into a LinkedHashMap, which we do in L10. DEMO: run SortingMapsAndLists, lines 1 and 2. Question: how would you get the three quietest accounts instead?");

  // ===== 10 List.sort vs sorted =====
  s = newSlide("CONTENT", "Maps and lists", "List.sort vs stream sorted vs reversed() [21]");
  tbl(s, ["", "list.sort(cmp)", "list.stream().sorted(cmp)", "list.reversed()  [21]"], [
    ["Result", "the same list, changed", "a new list", "a reverse-ordered view"],
    ["Source", "modified in place", "unchanged", "unchanged (view)"],
    ["On List.of(...)", "UnsupportedOperationException", "works", "works"],
    ["Real result", "copy: [GA827, MH602, SQ12 …]", "source[0]=SQ318, sorted[0]=GA827", "[UL309, TR808 … GA827]"],
    ["Use when", "you own a mutable list", "a pipeline, or a shared list", "you need the other end, no comparator"],
  ], 0.5, 1.0, 9.0, [1.6, 2.45, 2.45, 2.5], 0.52, "list table", [0], 11);
  codeBlock(s, `ranked().reversed().stream().limit(3).map(Ranked::id).toList();  // [C009, C002, C005]
// Java 21 SequencedCollection: also getFirst(), getLast(), addFirst(), addLast()`, 0.5, 4.2, 9.0, 0.85, { label: "modern/ModernCustomerRanking · bottomThree", fontSize: 10, name: "reversed code" });
  s.addNotes("~3 min. Three ways to get an ordered list, with real results. List.sort sorts in place, so it needs a mutable list: on a copy it works, and on our shared List.of data it throws UnsupportedOperationException. Stream sorted builds a new list and leaves the source alone: the first flight in the source is still SQ318, while the sorted list starts with GA827. Java 21 added SequencedCollection, and List.reversed returns a reverse-ordered view without copying and without a comparator. The modern ranking uses it to take the bottom three customers, C009, C002 and C005, straight from the sorted list. SequencedCollection also adds getFirst and getLast, which we use in the tests. DEMO: run SortingMapsAndLists, last four lines. Question: if you add an element to the original list, does the reversed view see it?");

  // ===== 11 Worked example =====
  pres.addSection({ title: "Worked example" });
  s = newSlide("CONTENT", "Worked example", "Refactor: customer ranking, three ways");
  codeBlock(s, `Map<String, BigDecimal> totals = accounts.stream()
  .collect(toMap(Account::customerId,
                 Account::balance,
                 BigDecimal::add));      // L10
AtomicInteger rank = new AtomicInteger();
customers.stream()
  .sorted(comparing(Customer::tier, reverseOrder())
    .thenComparing(c -> totals.get(c.id()),
                   reverseOrder())
    .thenComparing(Customer::name))
  .map(c -> rank.incrementAndGet() + ". " + ..)
  .collect(Collectors.toList());`, 0.5, 1.05, 4.5, 3.4, { label: "AFTER  ·  Java 8  ·  after/StreamCustomerRanking", fontSize: 9.5, name: "after code" });
  codeBlock(s, `record Ranked(String id, String name,
              Tier tier, BigDecimal total) {
  static final Comparator<Ranked> ORDER =
    comparing(Ranked::tier, reverseOrder())
      .thenComparing(Ranked::total,
                     reverseOrder())
      .thenComparing(Ranked::name);
}
List<Ranked> r = customers.stream()
  .map(c -> new Ranked(..)).sorted(Ranked.ORDER)
  .toList();                               // [16]
IntStream.range(0, r.size())
  .mapToObj(i -> (i + 1) + ". " + ..) // rank
ranked().reversed()                        // [21]`, 5.2, 1.05, 4.3, 3.4, { label: "MODERN  ·  modern/ModernCustomerRanking", fontSize: 9, name: "modern code" });
  outputBox(s, "Identical in all 3 versions: 1. C003 … 3. C010 Jasmine Ong GOLD 68900.00 … 10. C009 · bottom 3 [21]: [C009, C002, C005]", 0.5, 4.55, 9.0, 0.5, "ba output");
  s.addNotes("~3 min. The worked example, three ways. The Java 8 version computes the totals with toMap and a merge function, previewing L10, and expresses the rule as one comparator chain. It still has a weakness: the rank number comes from an AtomicInteger incremented inside map, a side effect that would break with a parallel stream. The modern version fixes that. A record holds the sort keys, the comparator is a named constant on the record, so every report uses the same rule, and the rank comes from the list index with IntStream.range, with no mutable counter. Java 21 reversed gives the bottom of the ranking as a view. RankingRefactoringTest checks that all three versions print identical lines. DEMO: run the three classes. Question: why is a comparator constant on the record better than a lambda in each report?");

  // ===== 12 Pitfalls =====
  s = newSlide("CONTENT", "Worked example", "Pitfalls and best practices");
  const pits = [["reversed() at the end of a chain", "Reverses every key and moves the nulls."], ["sorted() on a non-Comparable type", "Compiles, then ClassCastException."], ["comparing on a nullable key", "NullPointerException: use nullsFirst/nullsLast."], ["a - b in compare()", "int overflow for large values: use Integer.compare / comparingInt."], ["Sorting money as double", "Use the BigDecimal key directly."]];
  pits.forEach(([h, d], i) => {
    const y = 1.0 + i * 0.8;
    card(s, 0.5, y, 4.6, 0.7, "FBECEC", "pit " + i);
    iconCircle(s, I.bug, 0.6, y + 0.14, 0.42, C.accent4, "pit icon " + i);
    s.addText([{ text: h, options: { bold: true, color: C.accent4, breakLine: true } }, { text: d, options: { fontSize: 11, color: C.text1 } }], { x: 1.12, y: y + 0.02, w: 3.9, h: 0.66, fontSize: 12.5, margin: 0, valign: "middle", isTextBox: true, objectName: "pit text " + i });
  });
  const dos = ["One key per line; direction next to the key", "End with a unique tie-breaker (id)", "Name shared comparators as constants", "CASE_INSENSITIVE_ORDER for user text", "Test with ties and nulls in the data", "reversed() [21] instead of re-sorting"];
  card(s, 5.3, 1.0, 4.2, 3.9, C.background2, "do card");
  iconCircle(s, I.check, 5.45, 1.12, 0.45, C.accent1, "do icon");
  s.addText("Best practices", { x: 6.05, y: 1.12, w: 3.3, h: 0.45, fontSize: 15, bold: true, color: C.accent1, margin: 0, valign: "middle", isTextBox: true, objectName: "do title" });
  s.addText(bullets(dos, 12.5).map(r => { r.options.paraSpaceAfter = 7; return r; }), { x: 5.5, y: 1.7, w: 3.9, h: 3.1, margin: 0, valign: "top", isTextBox: true, objectName: "do list" });
  s.addNotes("~3 min. Five pitfalls. reversed at the end of a chain reverses every key and also moves nulls from last to first. sorted with no comparator on a type that is not Comparable compiles and then throws. comparing on a key that can be null throws NullPointerException. The classic return a minus b in a compare method overflows for large or negative values and gives wrong orders; use Integer.compare or comparingInt. And converting money to double to sort it is pointless and risky, because BigDecimal is already Comparable. On the right, habits that make sorts correct and readable: one key per line with its direction beside it, a unique tie-breaker at the end, shared comparators as named constants, case-insensitive order for user text, tests that include ties and nulls, and Java 21 reversed instead of a second sort. DEMO: run SortingTest. Question: which pitfall have you seen in production?");

  // ===== 13 Interview =====
  pres.addSection({ title: "Practice" });
  s = newSlide("CONTENT", "Practice", "Interview questions");
  const qa = [
    ["Comparable vs Comparator?", "Comparable: the type's one natural order (compareTo). Comparator: any number of external orders."],
    ["How do you sort by A desc, then B asc?", "comparing(A, reverseOrder()).thenComparing(B). Not reversed() at the end."],
    ["How do you sort a Map by value?", "Stream entrySet(), sorted(Map.Entry.comparingByValue()), collect to a LinkedHashMap if needed."],
    ["Is Java's sort stable?", "Yes: List.sort and sorted() on an ordered stream keep equal elements in input order."],
    ["What do nullsFirst / nullsLast do?", "Wrap a comparator so nulls are ordered first or last instead of throwing NullPointerException."],
  ];
  qa.forEach(([q, a], i) => {
    const colI = i % 2, row = Math.floor(i / 2);
    const x = i === 4 ? 0.5 : 0.5 + colI * 4.6, y = 1.0 + row * 1.38, w = i === 4 ? 9.0 : 4.4;
    card(s, x, y, w, 1.22, C.background2, "qa card " + i);
    s.addText("Q" + (i + 1), { shape: pres.shapes.OVAL, x: x + 0.12, y: y + 0.14, w: 0.42, h: 0.42, fill: { color: C.text2 }, line: { color: C.text2 }, fontSize: 11, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "q badge " + i });
    s.addText([{ text: q, options: { bold: true, color: C.text2, breakLine: true } }, { text: a, options: { color: C.text1, fontSize: 12 } }], { x: x + 0.65, y: y + 0.06, w: w - 0.8, h: 1.1, fontSize: 13.5, margin: 0, valign: "middle", isTextBox: true, objectName: "qa text " + i });
  });
  s.addNotes("~3 min. Five questions that come up in nearly every Java interview. For question one, listen for natural order defined by the class itself versus external orders defined elsewhere, and the method names compareTo and compare. Question two is the reversed trap; ask the candidate to explain what reversed at the end would do. Question three is a favourite coding task; a strong answer mentions LinkedHashMap to keep the order. Question four checks real knowledge: both List.sort and stream sorted on ordered input are stable, which is a documented guarantee. Question five: ask where the wrapper goes when the key, not the element, is null. A senior follow-up: why is return a minus b dangerous in compare? Answer: integer overflow. DEMO: run QuizAnswersTest. Question: which of these would you ask a junior developer?");

  // ===== 14 Pros/cons =====
  s = newSlide("CONTENT", "Practice", "Pros and cons of the Comparator API");
  const pros = ["Declarative: each key and direction on one line", "Composable: thenComparing, reversed, nulls*", "No sign errors from x/y swaps", "Reusable named constants", "Primitive keys without boxing", "reversed() view in Java 21, no re-sort"];
  const consL = ["reversed() semantics surprise people", "Generic inference needs type witnesses", "Lambdas in chains are harder to debug", "Key extractors may run many times per sort", "Sorting is O(n log n) and buffers everything", "Nulls still need explicit handling"];
  [[pros, "Pros", C.accent1, I.plus, 0.5, C.background2], [consL, "Cons / limitations", C.accent4, I.minus, 5.1, "FBECEC"]].forEach(([list, h, colr, ic, x, bg]) => {
    card(s, x, 1.0, 4.4, 3.65, bg, h + " card");
    iconCircle(s, ic, x + 0.2, 1.15, 0.5, colr, h);
    s.addText(h, { x: x + 0.85, y: 1.15, w: 3.3, h: 0.5, fontSize: 18, bold: true, color: colr, margin: 0, valign: "middle", isTextBox: true, objectName: h + " heading" });
    s.addText(bullets(list, 14).map(r => { r.options.paraSpaceAfter = 8; return r; }), { x: x + 0.25, y: 1.85, w: 3.95, h: 2.7, margin: 0, valign: "top", isTextBox: true, objectName: h + " list" });
  });
  s.addNotes("~2 min. A balanced view of the Comparator API. On the plus side, every key and its direction sit on one line, comparators compose, there are no x-versus-y sign errors, shared orders become named constants, primitive keys avoid boxing, and Java 21 reversed gives the other end without sorting again. On the minus side, reversed surprises people, generic inference sometimes needs explicit type witnesses, a long chain of lambdas is harder to step through in a debugger, and the key extractor is called on every comparison, so an expensive key such as a database lookup should be computed first and stored in a record, as the worked example does. Sorting is also a stateful barrier from L06: it buffers every element. Finally, nulls never handle themselves. DEMO: show the CustomerView record. Question: when would you precompute a sort key?");

  // ===== 15 Summary =====
  pres.addSection({ title: "Wrap-up" });
  s = newSlide("DARK_TITLE", "Wrap-up", "Summary");
  const sum = ["sorted() needs Comparable; sorted(cmp) works for anything", "comparing, comparingInt/Double, naturalOrder, reverseOrder", "thenComparing for ties; reverseOrder() per DESC key", "reversed() reverses the whole chain (and the nulls)", "nullsLast, CASE_INSENSITIVE_ORDER, stable sorts, comparingByValue, reversed() [21]"];
  s.addText(bullets(sum, 14, C.background1), { x: 0.5, y: 2.1, w: 5.2, h: 2.9, margin: 0, valign: "top", isTextBox: true, objectName: "summary bullets" });
  card(s, 6.0, 0.6, 3.5, 2.05, "143F32", "exercise card");
  iconCircle(s, I.code, 6.2, 0.78, 0.45, C.accent2, "exercise");
  s.addText([{ text: "Exercise (~25 min)", options: { bold: true, color: C.accent2, breakLine: true } }, { text: "Departures board in Exercise08: date, time (TBA last), code; TBA first; latest first with TBA still last; destinations.", options: { color: C.background1, fontSize: 12 } }],
    { x: 6.75, y: 0.75, w: 2.65, h: 1.8, fontSize: 14, margin: 0, valign: "top", isTextBox: true, objectName: "exercise text" });
  card(s, 6.0, 2.85, 3.5, 2.05, "143F32", "next card");
  iconCircle(s, I.rocket, 6.2, 3.03, 0.45, C.accent1, "next");
  s.addText([{ text: "Next: Lesson 09", options: { bold: true, color: C.accent2, breakLine: true } }, { text: "Terminal Operations & Reduction: toList, reduce, min/max, anyMatch, BigDecimal totals.", options: { color: C.background1, fontSize: 12 } }],
    { x: 6.75, y: 3.0, w: 2.65, h: 1.8, fontSize: 14, margin: 0, valign: "top", isTextBox: true, objectName: "next text" });
  s.addNotes("~3 min. Recap: sorted with no argument needs Comparable elements; the factory methods build comparators from keys; thenComparing breaks ties; reverseOrder on a single key makes it descending, while reversed reverses everything before it, nulls included; and nullsLast, case-insensitive order, stability, comparingByValue and Java 21 reversed complete the toolbox. The exercise is an airport departures board built from our eight flights, where SQ318 and UL309 have been rescheduled and their new time is not announced yet. Four tasks: the normal board with TBA last within each day, a TBA-first view, a latest-first view where TBA must still be last, which is where reversed fails, and the sorted destinations. Remove @Disabled in Exercise08Test to check. DEMO: run Solution08. Question: which task will the reversed() trap catch?");

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
})();
