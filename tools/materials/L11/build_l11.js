// L11 slide deck generator - ITGreenZone Java Functional Programming
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa");
const { applyTheme } = require("/root/.claude/skills/synced/2eb53c35-a0c8-4343-9257-776fcd7fed67_dd7dcff0-93ee-4601-a8ce-12573fa09cd9/pptx/scripts/apply_theme.js");

const OUT = process.argv[2] || "L11_GroupingPartitioning_Slides.pptx";
const LESSON = "11";
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
pres.title = "L11 Grouping & Partitioning";
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
  const bucket = (s, x, y, w, h, label, items, col, name) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color: "FFFFFF" }, line: { color: col, width: 2 }, objectName: name });
    s.addText(label, { x, y: y + 0.03, w, h: 0.32, fontSize: 12, bold: true, color: col, align: "center", margin: 0, isTextBox: true, objectName: name + " label" });
    s.addText(items, { x: x + 0.05, y: y + 0.36, w: w - 0.1, h: h - 0.4, fontSize: 10.5, fontFace: MONO, color: C.text1, align: "center", valign: "top", margin: 0, isTextBox: true, objectName: name + " items" });
  };

  // ===== 1 Title =====
  pres.addSection({ title: "Introduction" });
  let s = newSlide("DARK_TITLE", "Introduction", "Grouping & Partitioning");
  s.addText("LESSON 11  ·  MODULE 2  ·  MOST IMPORTANT", { x: 0.5, y: 0.6, w: 5.5, h: 0.35, fontSize: 12, bold: true, color: C.accent2, charSpacing: 2, margin: 0, isTextBox: true, objectName: "kicker" });
  s.addText("groupingBy · downstream collectors · filtering vs filter · multi-level maps · partitioningBy", { x: 0.5, y: 2.95, w: 5.0, h: 0.8, fontSize: 15, italic: true, color: C.background2, margin: 0, isTextBox: true, objectName: "subtitle" });
  card(s, 6.0, 0.6, 3.5, 4.3, "143F32", "objectives card");
  s.addText("You will be able to", { x: 6.25, y: 0.75, w: 3.1, h: 0.35, fontSize: 14, bold: true, color: C.accent2, margin: 0, isTextBox: true, objectName: "objectives heading" });
  ["Use all 3 groupingBy overloads", "Pick the right downstream collector", "Keep empty groups with filtering [9]", "Build multi-level and record-keyed maps", "Partition and solve classic interview tasks"].forEach((o, i) => {
    const y = 1.2 + i * 0.72;
    s.addText(String(i + 1), { shape: pres.shapes.OVAL, x: 6.25, y: y + 0.05, w: 0.36, h: 0.36, fill: { color: C.accent1 }, line: { color: C.accent1 }, fontSize: 12, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "objective number " + (i + 1) });
    s.addText(o, { x: 6.75, y, w: 2.6, h: 0.62, fontSize: 12.5, color: C.background1, valign: "middle", margin: 0, isTextBox: true, objectName: "objective " + (i + 1) });
  });
  s.addNotes("~2 min. If you remember one lesson from this module, make it this one. groupingBy turns a stream into buckets, and with a downstream collector it answers almost every reporting question: totals per category, counts per city, the largest transaction per account, policies by expiry month. Everything from L10 now comes together: counting, reducing, mapping, filtering, teeing, all used inside groups. We also cover multi-level grouping, partitioningBy, and the classic interview tasks, which reappear in the practice lab of L19. The exercise has twelve grouping problems at interview level, each with its exact expected output. DEMO: open package l11_grouping. Question: what report in your current system is really a groupingBy in disguise?");

  // ===== 2 Problem =====
  pres.addSection({ title: "groupingBy" });
  s = newSlide("CONTENT", "groupingBy", "The problem: get-or-init maps for every report");
  codeBlock(s, `Map<Category, Integer> counts = new HashMap<>();
Map<Category, BigDecimal> totals = new HashMap<>();
Map<Category, Transaction> largest = new HashMap<>();
for (Transaction t : txns) {
  if (t.type() != DEBIT) continue;
  Integer n = counts.get(t.category());
  counts.put(t.category(), n == null ? 1 : n + 1);
  BigDecimal sum = totals.get(t.category());
  totals.put(t.category(), sum == null ? t.amount() : sum.add(..));
  Transaction max = largest.get(t.category());
  if (max == null || t.amount().compareTo(max.amount()) > 0) ..
}`, 0.5, 1.05, 5.6, 3.3, { label: "BEFORE  ·  before/LegacyCategoryReport", fontSize: 9.5, name: "legacy code" });
  codeBlock(s, `debits.collect(groupingBy(
  Transaction::category,
  () -> new EnumMap<>(
        Category.class),
  collectingAndThen(
    toList(),
    CategoryStats::of)))`, 6.3, 1.05, 3.2, 3.3, { label: "MODERN  ·  one groupingBy", fontSize: 10, name: "stream code" });
  outputBox(s, "TRANSFER: 8 debits, total 7190.92, largest T042 1432.93 · TRAVEL: 3 debits, 3173.90 … DINING: 10 debits, 839.28", 0.5, 4.5, 9.0, 0.5, "problem output");
  s.addNotes("~3 min. The business question: a spending report per category, debits only, with the count, the total, and the largest transaction, sorted by total descending. The legacy version needs three hash maps and the get, check for null, put dance for each of them: if the map has no value yet start at one, otherwise add one. It works, but every new column means another map and another null check. The modern version is one groupingBy: the classifier is the category, the map factory is an EnumMap, and the downstream builds a small statistics record from each group's list. TRANSFER leads with eight debits totalling 7,190.92. All three versions in the repo print the same seven lines, and a test checks it. DEMO: run LegacyCategoryReport. Question: how many lines would you add to the legacy code to also report the average?");

  // ===== 3 Overloads + buckets =====
  s = newSlide("CONTENT", "groupingBy", "groupingBy: three overloads, one idea (buckets)");
  bucket(s, 0.5, 1.05, 1.7, 1.2, "Singapore", "C001 C003\nC005 C010", C.accent1, "b1");
  bucket(s, 2.3, 1.05, 1.7, 1.2, "Jakarta", "C004 C009", C.accent3, "b2");
  bucket(s, 4.1, 1.05, 1.7, 1.2, "Kuala Lumpur", "C002 C006", C.accent2, "b3");
  bucket(s, 5.9, 1.05, 1.7, 1.2, "Colombo", "C007", C.text2, "b4");
  bucket(s, 7.7, 1.05, 1.8, 1.2, "Bangkok", "C008", C.accent4, "b5");
  tbl(s, ["Overload", "Result", "Real example"], [
    ["groupingBy(Customer::city)", "Map<String, List<Customer>> (HashMap)", "Singapore → [C001, C003, C005, C010]"],
    ["groupingBy(city, counting())", "Map<String, Long> (HashMap)", "Singapore → 4"],
    ["groupingBy(city, TreeMap::new, counting())", "your map type", "{Bangkok=1, Colombo=1, Jakarta=2, Kuala Lumpur=2, Singapore=4}"],
  ], 0.5, 2.4, 9.0, [3.2, 2.6, 3.2], 0.5, "overload table", [0]);
  note(s, "classifier = which bucket · mapFactory = what kind of map · downstream = what to do with each bucket (default: toList)", 4.65, C.accent5, "overload note");
  s.addNotes("~3 min. groupingBy sorts elements into buckets. The classifier function decides the bucket for each element; here the city, so Singapore gets four customers. The one-argument form gives a HashMap from key to list, which is fine for lookups but has no defined order. The two-argument form adds a downstream collector that processes each bucket instead of collecting it into a list: counting gives the number of customers per city. The three-argument form adds a map factory in the middle, so TreeMap gives sorted keys and EnumMap gives enum order. Watch the argument order in the three-argument form: classifier, map factory, then downstream. Reports and tests should almost always use the three-argument form, because a HashMap's printed order is not reliable. DEMO: run GroupingBasics, lines 1 and 2. Question: what is the default downstream when you pass none?");

  // ===== 4 Downstream recipes =====
  s = newSlide("CONTENT", "groupingBy", "Downstream recipes");
  tbl(s, ["Downstream", "Question it answers", "Real result (theory/GroupingBasics, DownstreamRecipes)"], [
    ["counting()", "how many per key?", "per city: Singapore=4, Jakarta=2 …"],
    ["summingInt(Flight::seats)", "sum per key", "seats per origin: {CGK=162, SIN=1916}"],
    ["averagingInt(Flight::booked)", "average per key", "{CGK=120.0, SIN=241.14…}"],
    ["mapping(Customer::city, toCollection(TreeSet::new))", "distinct values per key", "GOLD=[Colombo, Jakarta, Singapore]"],
    ["collectingAndThen(maxBy(amount), o -> o.orElseThrow().id())", "largest per key, unwrapped", "ACC-1001=T018, ACC-1002=T005 …"],
    ["mapping(Customer::name, joining(\", \"))", "a text list per key", "PLATINUM=Chen Wei, Farah Aziz"],
    ["reducing(ZERO, Transaction::amount, BigDecimal::add)", "money per key", "TRANSFER=10362.65 (all types)"],
  ], 0.5, 1.0, 9.0, [3.9, 1.9, 3.2], 0.45, "recipe table", [0], 10);
  note(s, "maxBy inside groupingBy is never empty (a group has ≥ 1 element), so orElseThrow() is safe there.", 4.75, C.text2, "recipe note");
  s.addNotes("~3 min. The downstream recipes you will use every week, all with real output. counting for how many per key; summingInt and averagingInt for numbers per key; mapping with toSet or a TreeSet for the distinct values per key, such as the cities each tier lives in; maxBy for the largest per key, wrapped in collectingAndThen to unwrap the Optional and keep only the id; mapping with joining for a readable list; and reducing with BigDecimal for money per key. One reassuring detail: maxBy returns an Optional, but inside groupingBy a group always has at least one element, so orElseThrow can never fail there. Choosing the downstream is really choosing the question you ask of each bucket. DEMO: run GroupingBasics. Question: which downstream gives the average premium per policy type as a BigDecimal?");

  // ===== 5 filter vs filtering =====
  s = newSlide("CONTENT", "groupingBy", "filter before grouping vs filtering [9]: empty groups");
  bucket(s, 0.5, 1.05, 1.4, 1.2, "PAYNOW", "1", C.accent3, "f1");
  bucket(s, 2.0, 1.05, 1.4, 1.2, "PAYPAL", "1", C.accent3, "f2");
  s.addText("CARD ?", { x: 3.5, y: 1.3, w: 1.0, h: 0.6, fontSize: 14, bold: true, color: C.accent4, margin: 0, isTextBox: true, objectName: "missing card" });
  bucket(s, 5.1, 1.05, 1.4, 1.2, "CARD", "0", C.accent1, "g1");
  bucket(s, 6.6, 1.05, 1.4, 1.2, "PAYNOW", "1", C.accent1, "g2");
  bucket(s, 8.1, 1.05, 1.4, 1.2, "PAYPAL", "1", C.accent1, "g3");
  codeBlock(s, `payments.stream()
  .filter(p -> p.status() == FAILED)
  .collect(groupingBy(Payment::method,
      TreeMap::new, counting()));
// {PAYNOW=1, PAYPAL=1}   ✗ CARD vanished`, 0.5, 2.45, 4.4, 1.85, { label: "filter first", fontSize: 10, name: "filter code" });
  codeBlock(s, `payments.stream()
  .collect(groupingBy(Payment::method,
      TreeMap::new,
      filtering(p -> p.status() == FAILED,
                counting())));
// {CARD=0, PAYNOW=1, PAYPAL=1}   ✓`, 5.1, 2.45, 4.4, 1.85, { label: "filtering()  [Java 9]", fontSize: 10, name: "filtering code" });
  note(s, "A report row \"CARD: 0 failures\" is information. A missing row looks like a bug. Use filtering when every key must appear.", 4.5, C.accent4, "filtering note");
  s.addNotes("~3 min. The most important subtlety of the lesson. Count FAILED payments per method. If you filter first, CARD payments never reach the collector, so CARD has no bucket at all: the map is PAYNOW one, PAYPAL one. If you use the Java 9 filtering collector inside groupingBy, every payment is first put in its method's bucket and the filter runs inside it, so CARD stays with a count of zero. Both are correct code; they answer different questions. In a dashboard or a regulatory report, a row that says CARD has zero failures is information, while a missing row looks like a bug or a data outage. The same applies to mapping and flatMapping versus map and flatMap before grouping. DEMO: run DownstreamRecipes, lines 1 and 2. Question: which version would a fraud dashboard need?");

  // ===== 6 flatMapping, teeing, BigDecimal =====
  s = newSlide("CONTENT", "groupingBy", "flatMapping [9] and teeing [12] per group");
  codeBlock(s, `customers.stream().collect(groupingBy(Customer::tier,
    () -> new EnumMap<>(Tier.class),
    flatMapping(c -> accountsOf(c).stream().map(Account::number), toList())));
// {SILVER=[ACC-1003, ACC-1008, ACC-1012, ACC-1013],
//  GOLD=[ACC-1001, ACC-1002, ACC-1007, ACC-1011, ACC-1014, ACC-1015],
//  PLATINUM=[ACC-1004, ACC-1005, ACC-1006, ACC-1009, ACC-1010]}

payments.stream().collect(groupingBy(Payment::method, TreeMap::new,
    teeing(counting(),
           reducing(BigDecimal.ZERO, Payment::amount, BigDecimal::add),
           CountTotal::new)));
// {CARD=5/2070.29, PAYNOW=4/1824.30, PAYPAL=3/535.25}`, 0.5, 1.05, 9.0, 3.4, { label: "theory/DownstreamRecipes", fontSize: 10.5, name: "flat code" });
  note(s, "teeing per group = two answers per key in one pass. L10's exercise (toMap + merge) becomes one groupingBy.", 4.65, C.text2, "flat note");
  s.addNotes("~3 min. Two more powerful downstreams. flatMapping, from Java 9, expands each element into several values inside the group: one customer has several accounts, so grouping customers by tier and flat-mapping to their account numbers gives all accounts per tier. teeing per group, with Java 12, gives two answers per key in one pass: here the count and the BigDecimal total per payment method, wrapped in a small record. Compare this with the L10 exercise, where you built the same summary with toMap and a merge function: groupingBy with teeing expresses it more directly. The merge-function approach still matters when you want a custom value type that merges itself, as in L10's portfolio example. DEMO: run DownstreamRecipes, lines 3 and 4. Question: how would you add the average to the per-method summary?");

  // ===== 7 Multi-level =====
  pres.addSection({ title: "Multi-level & partitioning" });
  s = newSlide("CONTENT", "Multi-level & partitioning", "Multi-level grouping: nested maps or a record key");
  codeBlock(s, `groupingBy(Customer::city, TreeMap::new,
    groupingBy(Customer::tier, () -> new EnumMap<>(Tier.class), counting()))
// {Bangkok={SILVER=1}, Colombo={GOLD=1}, Jakarta={SILVER=1, GOLD=1},
//  Kuala Lumpur={SILVER=1, PLATINUM=1}, Singapore={SILVER=1, GOLD=2, PLATINUM=1}}

record CityTier(String city, Tier tier) implements Comparable<CityTier> { .. }
groupingBy(c -> new CityTier(c.city(), c.tier()), TreeMap::new, counting())
// {Bangkok/SILVER=1, Colombo/GOLD=1, Jakarta/SILVER=1, Jakarta/GOLD=1, …}`, 0.5, 1.05, 9.0, 2.25, { label: "theory/MultiLevelAndPartitioning", fontSize: 10.5, name: "multi code" });
  tbl(s, ["", "Nested maps", "Record key (flat map)"], [
    ["Type", "Map<String, Map<Tier, Long>>", "Map<CityTier, Long>"],
    ["Good for", "drill-down UIs, per-city sections", "sorting all rows, CSV export, pivots"],
    ["Watch out", "3+ levels become unreadable", "record needs equals/hashCode (free) and an order"],
  ], 0.5, 3.45, 9.0, [1.4, 3.6, 4.0], 0.38, "multi table", [0]);
  s.addNotes("~3 min. Pass a groupingBy as the downstream of another groupingBy and you get nested maps: city, then tier, then count. Singapore has one SILVER, two GOLD and one PLATINUM customer. The outer TreeMap sorts cities and the inner EnumMap keeps tier order. Nested maps suit drill-down screens and reports with one section per city. The alternative is a composite key: a record with city and tier. Records give equals and hashCode for free, and implementing Comparable lets a TreeMap sort the flat map. A flat map is easier to sort by any column, export to CSV or turn into a pivot table. Beyond two levels, nested maps become hard to read and to type, so prefer a record key. DEMO: run MultiLevelAndPartitioning, lines 1 and 2. Question: which shape would you use for a category by month pivot table?");

  // ===== 8 Partitioning =====
  s = newSlide("CONTENT", "Multi-level & partitioning", "partitioningBy: always two buckets");
  bucket(s, 0.5, 1.05, 2.1, 1.3, "true (SUCCESS)", "8 · 2999.19", C.accent1, "p1");
  bucket(s, 2.75, 1.05, 2.1, 1.3, "false (other)", "4 · 1430.65", C.accent4, "p2");
  bucket(s, 5.15, 1.05, 2.1, 1.3, "false", "8 flights", C.text2, "p3");
  bucket(s, 7.4, 1.05, 2.1, 1.3, "true (overbooked)", "0  ← still there", C.accent2, "p4");
  codeBlock(s, `payments.stream().collect(partitioningBy(p -> p.status() == SUCCESS, counting()))
// {false=4, true=8}
payments.stream().collect(partitioningBy(p -> p.status() == SUCCESS,
    reducing(BigDecimal.ZERO, Payment::amount, BigDecimal::add)))
// {false=1430.65, true=2999.19}
flights: partitioningBy(booked > seats, counting())  → {false=8, true=0}
         groupingBy(booked > seats, counting())      → {false=8}`, 0.5, 2.55, 9.0, 2.0, { label: "theory/MultiLevelAndPartitioning", fontSize: 10.5, name: "part code" });
  note(s, "partitioningBy = groupingBy with a Predicate, and BOTH keys guaranteed. Need 3+ buckets? Use groupingBy.", 4.7, C.text2, "part note");
  s.addNotes("~3 min. partitioningBy is a special groupingBy whose classifier is a predicate, so there are exactly two buckets, true and false, and both keys are always present. Eight payments succeeded, totalling 2,999.19, and four did not. The flights example shows why the guarantee matters: no flight is overbooked, so partitioningBy gives false eight, true zero, while groupingBy with the same boolean gives only false eight, and map.get(true) returns null. Like groupingBy, partitioningBy takes any downstream, such as counting or a BigDecimal reducing. The returned map is a special two-entry map, so do not try to add keys to it. For three or more categories, such as SUCCESS, FAILED and PENDING, use groupingBy on the status. DEMO: run MultiLevelAndPartitioning, last three lines. Question: what does map.get(true) return in the groupingBy version?");

  // ===== 9 Classic I =====
  pres.addSection({ title: "Classic tasks" });
  s = newSlide("CONTENT", "Classic tasks", "Classic tasks I: top-N and best per group");
  codeBlock(s, `// top-3 transactions per account
groupingBy(Transaction::accountNumber, TreeMap::new,
    collectingAndThen(toList(), list -> list.stream()
        .sorted(comparing(Transaction::amount).reversed())
        .limit(3).map(Transaction::id).toList()))
// ACC-1001=[T018, T009, T012], ACC-1002=[T005, T020], ACC-1003=[T049, T055, T042]

// highest-balance account per customer
groupingBy(Account::customerId, TreeMap::new,
    collectingAndThen(maxBy(comparing(Account::balance)),
                      o -> o.orElseThrow().number()))
// {C001=ACC-1001, C002=ACC-1003, C003=ACC-1006, …, C010=ACC-1015}`, 0.5, 1.05, 9.0, 3.4, { label: "theory/ClassicTasks", fontSize: 10.5, name: "classic1 code" });
  note(s, "Top-N per group: collectingAndThen(toList(), sort + limit). Groups smaller than N simply return fewer (ACC-1002 has 2).", 4.65, C.text2, "classic1 note");
  s.addNotes("~3 min. Two classic interview tasks. Top three transactions per account: group by account, collect each group into a list, then use collectingAndThen to sort that list by amount descending, take three and keep the ids. ACC-1001's top three are T018, T009 and T012, and ACC-1002 has only two transactions, so it returns two, with no special case needed. Highest-balance account per customer is maxBy with a balance comparator, unwrapped: C003 owns three accounts and the largest is ACC-1006 with 100,000. Both patterns generalise: any 'best per group' is maxBy or minBy, and any 'top N per group' is collectingAndThen with sort and limit. For very large groups, a bounded priority queue in a custom collector would avoid sorting everything, which is L13 territory. DEMO: run ClassicTasks, first lines. Question: how would you get the bottom two per account?");

  // ===== 10 Classic II =====
  s = newSlide("CONTENT", "Classic tasks", "Classic tasks II: by month, top-N keys, invert a map");
  codeBlock(s, `groupingBy(p -> YearMonth.from(p.expiry()), TreeMap::new,
           mapping(Policy::number, toList()))
// {2026-11=[POL-502, POL-505, POL-509], 2026-12=[POL-503, POL-508], …}

txns.stream().collect(groupingBy(Transaction::category, counting()))
    .entrySet().stream()
    .sorted(Map.Entry.<Category, Long>comparingByValue(reverseOrder())
                     .thenComparing(Map.Entry.comparingByKey()))
    .limit(3)                     // [TRANSFER=15, DINING=10, SALARY=8]

idToCity.entrySet().stream()
    .collect(groupingBy(Map.Entry::getValue, TreeMap::new,
                        mapping(Map.Entry::getKey, toList())))
// {Bangkok=[C008], …, Singapore=[C001, C003, C005, C010]}`, 0.5, 1.05, 9.0, 3.6, { label: "theory/ClassicTasks", fontSize: 10, name: "classic2 code" });
  note(s, "YearMonth is the right key for 'per month': comparable, readable, no day-of-month noise.", 4.75, C.text2, "classic2 note");
  s.addNotes("~3 min. Three more classics. Group policies by expiry month with YearMonth as the key and a TreeMap for chronological order: three policies expire in November 2026, which is exactly the renewal list the business needs. The frequency pattern counts per key with groupingBy and counting, then streams the entry set, sorts by count descending with the key as a tie-breaker, and takes the top N: TRANSFER fifteen, DINING ten, SALARY eight. Inverting a map from customer to city into city to customers is groupingBy on the entry value with mapping to the entry key. These three patterns appear again and again in the L19 practice lab and in real reporting code. DEMO: run ClassicTasks, last lines. Question: why is YearMonth a better key than the string '2026-11'?");

  // ===== 11 Worked example =====
  pres.addSection({ title: "Worked example" });
  s = newSlide("CONTENT", "Worked example", "Refactor: category spending report, three ways");
  codeBlock(s, `Map<Category, Long> counts = debits.stream()
  .collect(groupingBy(Transaction::category,
                      counting()));
Map<Category, BigDecimal> totals = ..
  .collect(groupingBy(Transaction::category,
      reducing(ZERO, Transaction::amount,
               BigDecimal::add)));
Map<Category, Transaction> largest = ..
  .collect(groupingBy(Transaction::category,
      collectingAndThen(maxBy(..), o -> o.get())));
totals.keySet().stream()
  .sorted(comparing(totals::get).reversed())..`, 0.5, 1.05, 4.5, 3.4, { label: "AFTER  ·  Java 8  ·  3 groupings", fontSize: 9.5, name: "after code" });
  codeBlock(s, `record CategoryStats(long count,
    BigDecimal total, Transaction largest) {
  static CategoryStats of(List<Transaction> t) {..}
}
debits.collect(groupingBy(
    Transaction::category,
    () -> new EnumMap<>(Category.class),
    collectingAndThen(toList(),
                      CategoryStats::of)))
  .entrySet().stream()
  .sorted(comparingByValue(
      comparing(CategoryStats::total)
        .reversed()))
  .map(..).toList();`, 5.2, 1.05, 4.3, 3.4, { label: "MODERN  ·  1 grouping + record", fontSize: 9.5, name: "modern code" });
  outputBox(s, "All 3: TRANSFER 8 / 7190.92 / T042 · TRAVEL 3 / 3173.90 / T026 · UTILITIES 8 / 1578.49 … DINING 10 / 839.28 / T020", 0.5, 4.55, 9.0, 0.5, "ba output");
  s.addNotes("~3 min. The worked example, three ways. The Java 8 version replaces each hand-written map with a groupingBy, one for counts, one for BigDecimal totals and one for the largest transaction, then sorts the categories by total. It is much shorter than the loops but still groups the data three times and combines the maps by key. The modern version groups once into an EnumMap; the downstream collects each category's transactions into a list and builds a CategoryStats record from it. Then the entry set is sorted by the record's total. Adding a column such as the average now means adding one field to the record, not another grouping. CategoryReportRefactoringTest checks that all three versions produce the same seven lines. DEMO: run ModernCategoryReport. Question: when would collecting each group into a list be too expensive?");

  // ===== 12 Pitfalls =====
  s = newSlide("CONTENT", "Worked example", "Pitfalls and best practices");
  const pits = [["filter before groupingBy", "Groups with no match disappear (no CARD row)."], ["1-arg groupingBy in reports", "HashMap: no defined order; flaky tests."], ["Nested maps 3+ levels deep", "Unreadable types; use a record key."], ["groupingBy(boolean) instead of partitioningBy", "Missing key → get(true) returns null."], ["averagingDouble on money", "Floating-point; use reducing + divide."]];
  pits.forEach(([h, d], i) => {
    const y = 1.0 + i * 0.8;
    card(s, 0.5, y, 4.6, 0.7, "FBECEC", "pit " + i);
    iconCircle(s, I.bug, 0.6, y + 0.14, 0.42, C.accent4, "pit icon " + i);
    s.addText([{ text: h, options: { bold: true, color: C.accent4, breakLine: true } }, { text: d, options: { fontSize: 11, color: C.text1 } }], { x: 1.12, y: y + 0.02, w: 3.9, h: 0.66, fontSize: 12.5, margin: 0, valign: "middle", isTextBox: true, objectName: "pit text " + i });
  });
  const dos = ["Use the 3-arg form: TreeMap / EnumMap", "filtering/mapping inside when every key must show", "Unwrap maxBy with collectingAndThen", "Record keys for multi-dimensional groups", "Check: sum of groups == grand total", "SQL GROUP BY for huge data (L21)"];
  card(s, 5.3, 1.0, 4.2, 3.9, C.background2, "do card");
  iconCircle(s, I.check, 5.45, 1.12, 0.45, C.accent1, "do icon");
  s.addText("Best practices", { x: 6.05, y: 1.12, w: 3.3, h: 0.45, fontSize: 15, bold: true, color: C.accent1, margin: 0, valign: "middle", isTextBox: true, objectName: "do title" });
  s.addText(bullets(dos, 12.5).map(r => { r.options.paraSpaceAfter = 7; return r; }), { x: 5.5, y: 1.7, w: 3.9, h: 3.1, margin: 0, valign: "top", isTextBox: true, objectName: "do list" });
  s.addNotes("~3 min. Five pitfalls. Filtering before grouping silently drops groups with no match. The one-argument groupingBy returns a HashMap, so printed reports and string-based tests become flaky. Nested maps three or more levels deep produce unreadable types; switch to a record key. groupingBy on a boolean instead of partitioningBy may miss a key, so get(true) returns null and the next line throws. And averagingDouble on money introduces floating-point error. On the right, the habits: the three-argument form with an explicit map, filtering or mapping inside the group when every key must appear, collectingAndThen to unwrap maxBy, record keys for multi-dimensional groups, and a property-style test that the sum of the groups equals the grand total, which GroupingTest does for categories. For millions of rows, let the database group with SQL. DEMO: run GroupingTest. Question: which of these would a test catch?");

  // ===== 13 Interview =====
  pres.addSection({ title: "Practice" });
  s = newSlide("CONTENT", "Practice", "Interview questions");
  const qa = [
    ["groupingBy vs partitioningBy?", "groupingBy: any key, only keys that occur. partitioningBy: a Predicate, always true AND false."],
    ["How do you get a sorted result map?", "3-arg groupingBy(classifier, TreeMap::new, downstream)."],
    ["filter vs filtering inside groupingBy?", "filter first drops empty groups; filtering(..) [9] keeps them with an empty/zero result."],
    ["Top 3 per group?", "collectingAndThen(toList(), l -> l.stream().sorted(..).limit(3).toList())."],
    ["Count per key, then the 2 most frequent?", "groupingBy(key, counting()) → entrySet().stream().sorted(comparingByValue(reverseOrder())).limit(2)."],
  ];
  qa.forEach(([q, a], i) => {
    const colI = i % 2, row = Math.floor(i / 2);
    const x = i === 4 ? 0.5 : 0.5 + colI * 4.6, y = 1.0 + row * 1.38, w = i === 4 ? 9.0 : 4.4;
    card(s, x, y, w, 1.22, C.background2, "qa card " + i);
    s.addText("Q" + (i + 1), { shape: pres.shapes.OVAL, x: x + 0.12, y: y + 0.14, w: 0.42, h: 0.42, fill: { color: C.text2 }, line: { color: C.text2 }, fontSize: 11, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "q badge " + i });
    s.addText([{ text: q, options: { bold: true, color: C.text2, breakLine: true } }, { text: a, options: { color: C.text1, fontSize: 12 } }], { x: x + 0.65, y: y + 0.06, w: w - 0.8, h: 1.1, fontSize: 13.5, margin: 0, valign: "middle", isTextBox: true, objectName: "qa text " + i });
  });
  s.addNotes("~3 min. Grouping questions appear in almost every Java interview, often as live coding. Question one: listen for both keys being guaranteed in partitioningBy. Question two: the three-argument form and the order of its arguments. Question three separates good candidates from great ones; ask them for an example where the difference shows in a report. Question four is a very common live-coding task; accept a solution that sorts each group, then ask about very large groups. Question five combines grouping with the map-sorting pattern from L08. A senior follow-up: how would you compute the total per category per month, and in what shape would you return it? Expect either nested maps with YearMonth keys or a record key. DEMO: run QuizAnswersTest. Question: which would you set as a live-coding task?");

  // ===== 14 Pros/cons =====
  s = newSlide("CONTENT", "Practice", "Pros and cons of grouping with streams");
  const pros = ["One expression per report question", "Downstreams compose: count, sum, max, join…", "You choose the map: sorted, enum, linked", "filtering/flatMapping/teeing per group", "partitioningBy guarantees both buckets", "Easy to test: compare maps, check totals"];
  const consL = ["Whole data set must be in memory", "Nested generics get hard to read", "Empty-group semantics surprise people", "HashMap order by default", "Collecting groups to lists can be costly", "Databases group faster for big data"];
  [[pros, "Pros", C.accent1, I.plus, 0.5, C.background2], [consL, "Cons / limitations", C.accent4, I.minus, 5.1, "FBECEC"]].forEach(([list, h, colr, ic, x, bg]) => {
    card(s, x, 1.0, 4.4, 3.65, bg, h + " card");
    iconCircle(s, ic, x + 0.2, 1.15, 0.5, colr, h);
    s.addText(h, { x: x + 0.85, y: 1.15, w: 3.3, h: 0.5, fontSize: 18, bold: true, color: colr, margin: 0, valign: "middle", isTextBox: true, objectName: h + " heading" });
    s.addText(bullets(list, 14).map(r => { r.options.paraSpaceAfter = 8; return r; }), { x: x + 0.25, y: 1.85, w: 3.95, h: 2.7, margin: 0, valign: "top", isTextBox: true, objectName: h + " list" });
  });
  s.addNotes("~2 min. A balanced view. On the plus side, every report question becomes one expression; downstream collectors compose; you choose the exact map type; filtering, flatMapping and teeing work per group; partitioningBy guarantees both buckets; and grouped results are easy to test by comparing maps and checking that totals are preserved. On the minus side, the whole data set must be in memory; nested generic types such as a map of maps of lists become hard to read; the empty-group behaviour surprises people; the default map is a HashMap with no order; collecting every group into a list before summarising can be costly for big groups; and for millions of rows a database GROUP BY is faster and uses less memory. L21 discusses where to draw that line. DEMO: none. Question: at what data size would you move a grouping into SQL?");

  // ===== 15 Summary =====
  pres.addSection({ title: "Wrap-up" });
  s = newSlide("DARK_TITLE", "Wrap-up", "Summary");
  const sum = ["groupingBy(classifier[, mapFactory], downstream): buckets + a question per bucket", "Downstreams: counting, summing, mapping, maxBy+collectingAndThen, joining, reducing", "filtering/flatMapping [9] keep empty groups; teeing [12] per group", "Multi-level: nested maps or a record key", "partitioningBy: always true and false"];
  s.addText(bullets(sum, 14, C.background1), { x: 0.5, y: 2.1, w: 5.2, h: 2.9, margin: 0, valign: "top", isTextBox: true, objectName: "summary bullets" });
  card(s, 6.0, 0.6, 3.5, 2.05, "143F32", "exercise card");
  iconCircle(s, I.code, 6.2, 0.78, 0.45, C.accent2, "exercise");
  s.addText([{ text: "Exercise (~45 min)", options: { bold: true, color: C.accent2, breakLine: true } }, { text: "12 interview-level grouping problems in Exercise11, each with its exact expected toString() in the Javadoc.", options: { color: C.background1, fontSize: 12 } }],
    { x: 6.75, y: 0.75, w: 2.65, h: 1.8, fontSize: 14, margin: 0, valign: "top", isTextBox: true, objectName: "exercise text" });
  card(s, 6.0, 2.85, 3.5, 2.05, "143F32", "next card");
  iconCircle(s, I.rocket, 6.2, 3.03, 0.45, C.accent1, "next");
  s.addText([{ text: "Next: Lesson 12", options: { bold: true, color: C.accent2, breakLine: true } }, { text: "Primitive Streams & Numeric Work: IntStream, summaryStatistics, chars(), why not double for money.", options: { color: C.background1, fontSize: 12 } }],
    { x: 6.75, y: 3.0, w: 2.65, h: 1.8, fontSize: 14, margin: 0, valign: "top", isTextBox: true, objectName: "next text" });
  s.addNotes("~3 min. Recap: groupingBy puts elements into buckets with a classifier, an optional map factory and a downstream question per bucket; the key downstreams are counting, summing, mapping, maxBy unwrapped with collectingAndThen, joining and reducing for money; filtering and flatMapping keep empty groups, and teeing gives two answers per group; multi-level grouping uses nested maps or a record key; and partitioningBy always returns both true and false. The exercise has twelve interview-level problems on the shared dataset, from customers per city to the highest-balance account per customer, each with its exact expected output in the Javadoc. Remove @Disabled in Exercise11Test to check. Solution11 is the reference. DEMO: run Solution11. Question: which problem do you expect to be the hardest?");

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
})();
