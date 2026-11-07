// L10 slide deck generator - ITGreenZone Java Functional Programming
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa");
const { applyTheme } = require("/root/.claude/skills/synced/2eb53c35-a0c8-4343-9257-776fcd7fed67_dd7dcff0-93ee-4601-a8ce-12573fa09cd9/pptx/scripts/apply_theme.js");

const OUT = process.argv[2] || "L10_Collectors_Slides.pptx";
const LESSON = "10";
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
pres.title = "L10 Collectors I: Collecting Results";
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
    bug: await icon(fa.FaBug), box: await icon(fa.FaBoxOpen), plusc: await icon(fa.FaPlusCircle),
    merge: await icon(fa.FaCodeBranch), flag: await icon(fa.FaFlagCheckered),
  };
  const tbl = (s, head, rows, x, y, w, colW, rowH, name, monoCols = [0], fs = 10.5) => {
    const h = head.map(t => ({ text: t, options: { bold: true, color: C.background1, fill: { color: C.text2 } } }));
    const r = rows.map((row, i) => row.map((c, j) => ({ text: c, options: Object.assign({ fill: { color: i % 2 ? C.background1 : C.background2 }, color: C.text1, fontSize: fs }, monoCols.includes(j) ? { fontFace: MONO, fontSize: fs - 0.5, bold: j === 0 } : {}) })));
    s.addTable([h, ...r], { x, y, w, colW, rowH, border: { type: "solid", pt: 0.5, color: "D5E3DA" }, valign: "middle", margin: [2, 5, 2, 5], objectName: name });
  };
  const note = (s, text, y, color, name) => s.addText(text, { x: 0.5, y, w: 9, h: 0.4, fontSize: 12.5, italic: true, color: color || C.text2, margin: 0, isTextBox: true, objectName: name });

  // ===== 1 Title =====
  pres.addSection({ title: "Introduction" });
  let s = newSlide("DARK_TITLE", "Introduction", "Collectors I: Collecting Results");
  s.addText("LESSON 10  ·  MODULE 2 STREAM API", { x: 0.5, y: 0.6, w: 5.5, h: 0.35, fontSize: 12, bold: true, color: C.accent2, charSpacing: 2, margin: 0, isTextBox: true, objectName: "kicker" });
  s.addText("toCollection · toMap · joining · summarizing · reducing · collectingAndThen · filtering · flatMapping · teeing", { x: 0.5, y: 2.95, w: 5.0, h: 0.8, fontSize: 14, italic: true, color: C.background2, margin: 0, isTextBox: true, objectName: "subtitle" });
  card(s, 6.0, 0.6, 3.5, 4.3, "143F32", "objectives card");
  s.addText("You will be able to", { x: 6.25, y: 0.75, w: 3.1, h: 0.35, fontSize: 14, bold: true, color: C.accent2, margin: 0, isTextBox: true, objectName: "objectives heading" });
  ["Explain what a Collector is made of", "Choose the collection type you get back", "Use toMap safely: duplicates, merge, map type", "Aggregate: joining, summing, summarizing, BigDecimal", "Compose: collectingAndThen, filtering, flatMapping, teeing"].forEach((o, i) => {
    const y = 1.2 + i * 0.72;
    s.addText(String(i + 1), { shape: pres.shapes.OVAL, x: 6.25, y: y + 0.05, w: 0.36, h: 0.36, fill: { color: C.accent1 }, line: { color: C.accent1 }, fontSize: 12, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "objective number " + (i + 1) });
    s.addText(o, { x: 6.75, y, w: 2.6, h: 0.62, fontSize: 12.5, color: C.background1, valign: "middle", margin: 0, isTextBox: true, objectName: "objective " + (i + 1) });
  });
  s.addNotes("~2 min. collect is the most flexible terminal operation, and the Collectors class is a toolbox of ready-made recipes for it. Today we cover the recipes that build collections and maps, the aggregating ones such as joining, summing and summarizing, the BigDecimal totals that banking needs, and the composing collectors: collectingAndThen, mapping, filtering and flatMapping from Java 9, and teeing from Java 12, which runs two collectors in one pass. Next lesson, groupingBy, uses almost all of these as downstream collectors, so today is the foundation for the most important lesson of the module. The worked example is an insurance portfolio summary; the exercise is a payment gateway summary per payment method. DEMO: open package l10_collectors. Question: which Collectors methods have you used besides toList?");

  // ===== 2 Problem =====
  pres.addSection({ title: "Collections" });
  s = newSlide("CONTENT", "Collections", "The problem: maps kept in sync by hand");
  codeBlock(s, `Map<PolicyType, Integer> counts = new HashMap<>();
Map<PolicyType, BigDecimal> totals = new HashMap<>();
Map<PolicyType, StringBuilder> numbers = new HashMap<>();
for (Policy p : policies) {
  if (!counts.containsKey(p.type())) {
    counts.put(p.type(), 0);
    totals.put(p.type(), BigDecimal.ZERO);
    numbers.put(p.type(), new StringBuilder());
  }
  counts.put(t, counts.get(t) + 1);
  totals.put(t, totals.get(t).add(p.premium()));
  if (numbers.get(t).length() > 0) numbers.get(t).append(", ");
  numbers.get(t).append(p.number());
}`, 0.5, 1.05, 5.6, 3.35, { label: "BEFORE  ·  before/LegacyPortfolioSummary", fontSize: 9.5, name: "legacy code" });
  codeBlock(s, `policies.stream().collect(
  toMap(Policy::type,
        TypeSummary::of,
        TypeSummary::merge,
        () -> new EnumMap<>(
              PolicyType.class)))`, 6.3, 1.05, 3.2, 3.35, { label: "MODERN  ·  one collector", fontSize: 10, name: "stream code" });
  outputBox(s, "LIFE: 2 policies, 4250.00 [POL-501, POL-507] … HOME: 2 policies, 1565.25 · TOTAL: 10 policies, 10826.50", 0.5, 4.5, 9.0, 0.5, "problem output");
  s.addNotes("~3 min. The business question: an insurance portfolio summary showing, for each policy type, how many policies, their total premium and their numbers, plus a grand total. The legacy version keeps three hash maps in sync by hand: check containsKey, initialise all three, then update each, with a StringBuilder and a comma check for the number list. Forget one of the three puts and you get a NullPointerException at run time. The modern version on the right says it in one collector: key by type, turn each policy into a small summary, merge two summaries when the key repeats, and put the results in an EnumMap, which keeps the enum order. All three versions in the repo produce the identical six lines. DEMO: run LegacyPortfolioSummary. Question: what happens in the legacy code if a new PolicyType is added to the enum?");

  // ===== 3 Anatomy =====
  s = newSlide("CONTENT", "Collections", "What a Collector is made of");
  const parts = [[I.box, "supplier", "a new empty container", "TreeSet::new"], [I.plusc, "accumulator", "add ONE element to it", "TreeSet::add"], [I.merge, "combiner", "merge TWO containers (parallel)", "TreeSet::addAll"], [I.flag, "finisher", "optional final transform", "e.g. unmodifiable"]];
  parts.forEach(([ic, h, d, ex], i) => {
    const x = 0.5 + i * 2.3;
    card(s, x, 1.0, 2.1, 1.85, C.background2, "part " + i);
    iconCircle(s, ic, x + 0.15, 1.12, 0.45, [C.text2, C.accent1, C.accent3, C.accent2][i], h);
    s.addText([{ text: h, options: { bold: true, fontFace: MONO, color: C.text2, breakLine: true } }, { text: d, options: { fontSize: 11, breakLine: true } }, { text: ex, options: { fontFace: MONO, fontSize: 10, color: C.accent1 } }], { x: x + 0.15, y: 1.65, w: 1.85, h: 1.15, fontSize: 13, color: C.text1, margin: 0, valign: "top", isTextBox: true, objectName: "part text " + i });
    if (i < 3) s.addShape(pres.shapes.RIGHT_ARROW, { x: x + 2.12, y: 1.8, w: 0.16, h: 0.24, fill: { color: C.accent5 }, line: { color: C.accent5 }, objectName: "part arrow " + i });
  });
  codeBlock(s, `customers.stream().map(Customer::city)
    .collect(TreeSet::new, TreeSet::add, TreeSet::addAll);     // by hand
customers.stream().map(Customer::city)
    .collect(Collectors.toCollection(TreeSet::new));         // ready-made
// both: [Bangkok, Colombo, Jakarta, Kuala Lumpur, Singapore]`, 0.5, 3.05, 9.0, 1.5, { label: "theory/CollectionCollectors", fontSize: 10.5, name: "anatomy code" });
  note(s, "Collector<T, A, R>: T = element type, A = mutable container, R = result. Custom collectors: L13.", 4.7, C.accent5, "anatomy note");
  s.addNotes("~3 min. Before the toolbox, the idea. A Collector is a recipe of four functions. The supplier creates a new empty container. The accumulator adds one element to a container. The combiner merges two containers, which a parallel stream needs when it collects chunks separately. And an optional finisher transforms the container into the final result, for example making it unmodifiable. The code shows the same recipe twice: written by hand with the three-argument collect, and with the ready-made Collectors.toCollection. Both give the five cities in sorted order. Unlike reduce, which combines immutable values, a collector mutates a container, which is far more efficient for building lists and maps. The generic signature Collector of T, A, R names the element, the container and the result. We write custom collectors in L13. DEMO: run CollectionCollectors. Question: why would a combiner never run on a sequential stream?");

  // ===== 4 Collections =====
  s = newSlide("CONTENT", "Collections", "Collecting into collections");
  tbl(s, ["Collector", "You get", "Real result / note", "Since"], [
    ["toList()", "a List (type not guaranteed)", "prefer Stream.toList() [16] for read-only", "Java 8"],
    ["toSet()", "a Set, no defined order", "cities: 5 elements; print order not reliable", "Java 8"],
    ["toCollection(TreeSet::new)", "exactly the type you choose", "[Bangkok, Colombo, Jakarta, Kuala Lumpur, Singapore]", "Java 8"],
    ["toCollection(ArrayDeque::new)", "a Deque", "peekLast = GA827", "Java 8"],
    ["toUnmodifiableList / Set", "immutable, no nulls", "Set of SGD, USD, SGD: size 2, add → UnsupportedOperationException", "Java 10"],
  ], 0.5, 1.0, 9.0, [2.6, 2.1, 3.4, 0.9], 0.58, "collections table", [0]);
  note(s, "Rule: if the type or order matters, say so with toCollection(...) or a sorted collection; never rely on HashSet order.", 4.6, C.text2, "collections note");
  s.addNotes("~2 min. The collection collectors. Collectors.toList makes no promise about the list type, which is why Java 16 added Stream.toList for read-only results. toSet gives a set with no defined iteration order: our five cities are all there, but printing them could give any order, so tests should compare contents, not strings. When the type or the order matters, say so with toCollection and a constructor reference: TreeSet for sorted and distinct, ArrayDeque for a queue, LinkedHashSet for first-seen order. Java 10 added the unmodifiable variants, which also reject null elements: collecting SGD, USD, SGD gives a set of size 2 that refuses any later add. DEMO: run CollectionCollectors. Question: which collector would you use for distinct account numbers in first-seen order?");

  // ===== 5 toMap =====
  pres.addSection({ title: "toMap" });
  s = newSlide("CONTENT", "toMap", "toMap(key, value) and the duplicate-key trap");
  codeBlock(s, `customers.stream()
    .collect(toMap(Customer::id, Function.identity()));
// byId.get("C004") -> Dewi Lestari

customers.stream()
    .collect(toMap(Customer::city, Customer::name));
// IllegalStateException: Duplicate key Singapore
//   (attempted merging values Alice Tan and Chen Wei)`, 0.5, 1.05, 6.0, 2.9, { label: "theory/ToMapCollector", fontSize: 10.5, name: "tomap code" });
  card(s, 6.7, 1.05, 2.8, 2.9, "FBECEC", "dup card");
  iconCircle(s, I.bug, 6.85, 1.18, 0.42, C.accent4, "dup icon");
  s.addText([{ text: "Two-argument toMap", options: { bold: true, color: C.accent4, breakLine: true } }, { text: "assumes UNIQUE keys. The first duplicate throws, at run time, on real data.", options: { fontSize: 11.5, breakLine: true } }, { text: " ", options: { fontSize: 5, breakLine: true } }, { text: "Also: a null VALUE throws NullPointerException (toMap uses Map.merge).", options: { fontSize: 11.5 } }],
    { x: 6.85, y: 1.7, w: 2.55, h: 2.2, fontSize: 13, color: C.text1, margin: 0, valign: "top", isTextBox: true, objectName: "dup text" });
  note(s, "Unique key (id)? Two arguments are fine. Anything else (city, type, method)? Always give a merge function.", 4.15, C.accent4, "tomap note");
  s.addNotes("~3 min. toMap takes a key mapper and a value mapper. With a unique key such as the customer id, and Function.identity as the value, it builds a lookup index in one line: C004 is Dewi Lestari. But the two-argument form assumes keys are unique, and the first duplicate throws IllegalStateException. Keying customers by city fails immediately, and the real message names the key and both values: Duplicate key Singapore, attempted merging values Alice Tan and Chen Wei. In production this typically passes every test with small data and fails on the first real duplicate. A second trap: toMap uses Map.merge internally, so a null value throws NullPointerException; our demo maps customers without a relationship manager to null. The rule: unique key, two arguments; anything else, always pass a merge function. DEMO: run ToMapCollector, lines 2 to 3. Question: is a customer's email a safe key?");

  // ===== 6 toMap merge + supplier =====
  s = newSlide("CONTENT", "toMap", "Merge function and map supplier");
  codeBlock(s, `toMap(Customer::city, Customer::name,
      (a, b) -> a + ", " + b,          // merge duplicates
      TreeMap::new)                    // sorted keys
// {Bangkok=Hana Sato, Colombo=Ganesh Perera,
//  Jakarta=Dewi Lestari, Irfan Hakim, …,
//  Singapore=Alice Tan, Chen Wei, Ethan Lim, Jasmine Ong}

toMap(Account::customerId, Account::balance,
      BigDecimal::add,                 // money total per key
      LinkedHashMap::new)              // first-seen order
// {C001=15700.50, C002=850.75, C003=163950.25, …}`, 0.5, 1.05, 6.0, 3.6, { label: "theory/ToMapCollector", fontSize: 10.5, name: "merge code" });
  tbl(s, ["mapSupplier", "Key order"], [
    ["(default)", "HashMap: none"],
    ["TreeMap::new", "sorted"],
    ["LinkedHashMap::new", "first seen"],
    ["() -> new EnumMap<>(T.class)", "enum order"],
  ], 6.7, 1.05, 2.8, [1.65, 1.15], 0.45, "supplier table", [0], 10);
  note(s, "Merge functions must be associative too: (a, b) -> a keeps the first, BigDecimal::add totals, Long::sum counts.", 4.8, C.text2, "merge note");
  s.addNotes("~3 min. The three- and four-argument forms fix both problems. The merge function says what to do when a key repeats: concatenate the names, keep the first with a, b arrow a, add BigDecimal balances, or count with Long::sum. The fourth argument chooses the map: TreeMap for sorted keys, LinkedHashMap for first-seen order, and EnumMap for enum keys, which is compact and keeps declaration order. The second example totals balances per customer: C003 has 163,950.25 across three accounts. This merge-based pattern is exactly what you need for the exercise, and next lesson you will see that groupingBy is a more general version of the same idea. Merge functions run in parallel combining too, so they must be associative. DEMO: run ToMapCollector, lines 4 and 5. Question: how would you count customers per city with toMap?");

  // ===== 7 joining / counting / summing =====
  pres.addSection({ title: "Aggregating" });
  s = newSlide("CONTENT", "Aggregating", "joining, counting, summing, averaging");
  tbl(s, ["Collector", "Real result (theory/AggregatingCollectors)", "Stream equivalent"], [
    ["joining(\", \", \"Flights: [\", \"]\")", "Flights: [SQ318, SQ12, TR808, MH602, SQ938, UL309, SQ21, GA827]", "none: joining is unique"],
    ["counting()", "12", "count()"],
    ["summingInt(Flight::booked)", "1808", "mapToInt(..).sum()"],
    ["averagingInt(Flight::booked)", "226.0", "mapToInt(..).average()"],
  ], 0.5, 1.0, 9.0, [3.0, 4.0, 2.0], 0.48, "agg table", [0, 1], 10.5);
  card(s, 0.5, 3.75, 9.0, 1.3, "FFF4E0", "agg card");
  s.addText([{ text: "Why do these exist if count() and sum() do the same? ", options: { bold: true, color: C.accent2 } }, { text: "Because they are COLLECTORS: they can be passed as the downstream of groupingBy, partitioningBy, teeing, filtering and mapping. counting() per city, summingInt per route, averaging per tier: that is L11. At top level, prefer the plain stream methods." }],
    { x: 0.65, y: 3.8, w: 8.7, h: 1.2, fontSize: 13, color: C.text1, margin: 0, valign: "middle", isTextBox: true, objectName: "agg text" });
  s.addNotes("~2 min. The aggregating collectors. joining concatenates strings with an optional delimiter, prefix and suffix, and has no simpler stream equivalent, so it is used everywhere for report lines. counting, summingInt and averagingInt give the same answers as count, mapToInt sum and average: 12 payments, 1,808 booked seats, an average of 226 per flight. So why do they exist? Because they are collectors, and collectors can be nested inside other collectors as downstream operations. groupingBy with counting gives a count per city; with summingInt, a sum per route. That is the whole of next lesson. At the top level, prefer the plain stream methods, which are shorter and avoid boxing. Note that averagingInt returns a double, so for money we need something else. DEMO: run AggregatingCollectors, lines 1 to 4. Question: what does averagingInt return on an empty stream?");

  // ===== 8 summarizing / maxBy / reducing =====
  s = newSlide("CONTENT", "Aggregating", "summarizing, minBy/maxBy and BigDecimal totals");
  codeBlock(s, `IntSummaryStatistics st = flights.stream()
    .collect(summarizingInt(Flight::seats));
// count=8 sum=2078 min=160 max=471 average=259.75   (one pass)

payments.stream().collect(maxBy(comparing(Payment::amount)))
// Optional[P005 … 1500.00]

payments.stream()
    .collect(reducing(ZERO, Payment::amount, BigDecimal::add));
// 4429.84
payments.stream()
    .collect(mapping(Payment::amount,
                     reducing(ZERO, BigDecimal::add)));
// 4429.84`, 0.5, 1.05, 6.3, 3.6, { label: "theory/AggregatingCollectors", fontSize: 10, name: "summ code" });
  card(s, 7.0, 1.05, 2.5, 3.6, C.background2, "summ card");
  s.addText(bullets(["summarizing*: count, sum, min, max, average in ONE pass", "Its toString uses the default locale: print fields yourself", "maxBy/minBy return Optional", "Money: reducing(ZERO, mapper, add), never averagingDouble"], 11.5).map(r => { r.options.paraSpaceAfter = 6; return r; }),
    { x: 7.15, y: 1.15, w: 2.25, h: 3.4, margin: 0, valign: "top", isTextBox: true, objectName: "summ list" });
  s.addNotes("~3 min. summarizingInt computes five statistics in a single pass: eight flights, 2,078 seats, a minimum of 160, a maximum of 471 and an average of 259.75. One practical warning: the toString of IntSummaryStatistics formats the average with the default locale, so on a German machine you would see a comma, and a golden-file test would fail; our code prints each field explicitly with Locale.ROOT. maxBy and minBy are the collector forms of max and min and return Optional: the largest payment is P005 for 1,500. For money, use reducing with BigDecimal.ZERO, a mapper and add, or mapping with reducing; both give 4,429.84 for all twelve payments. Never use averagingDouble or summingDouble for money: they use double arithmetic. DEMO: run AggregatingCollectors, lines 5 to 8. Question: why would summarizingDouble be wrong for premiums?");

  // ===== 9 Composing =====
  pres.addSection({ title: "Composing" });
  s = newSlide("CONTENT", "Composing", "Composing collectors [8, 9]");
  tbl(s, ["Collector", "Does", "Real result (theory/ComposingCollectors)", "Since"], [
    ["collectingAndThen(maxBy(..), opt -> ..)", "post-process the result", "largest payment P005 (Optional unwrapped)", "8"],
    ["mapping(Customer::name, joining(\" | \"))", "map inside the collector", "Alice Tan | Dewi Lestari | Ganesh Perera | Jasmine Ong", "8"],
    ["filtering(SUCCESS, counting())", "filter inside the collector", "8 SUCCESS", "9"],
    ["flatMapping(c -> accounts(c), toList())", "flatMap inside the collector", "[ACC-1001, ACC-1002, ACC-1004, … ACC-1015]", "9"],
  ], 0.5, 1.0, 9.0, [3.4, 1.8, 3.2, 0.6], 0.55, "compose table", [0], 10);
  card(s, 0.5, 4.15, 9.0, 0.9, "FFF4E0", "compose card");
  s.addText([{ text: "Same as stream ops? ", options: { bold: true, color: C.accent2 } }, { text: "At top level, yes: filter, map and flatMap before collect are simpler. Inside groupingBy they are NOT the same: filter before grouping drops empty groups, filtering() keeps them with 0 (L11)." }],
    { x: 0.65, y: 4.18, w: 8.7, h: 0.84, fontSize: 12.5, color: C.text1, margin: 0, valign: "middle", isTextBox: true, objectName: "compose text" });
  s.addNotes("~3 min. Four collectors that wrap another collector. collectingAndThen applies a finisher to the result, commonly to unwrap the Optional from maxBy or to make a collection unmodifiable: largest payment P005. mapping applies a function inside the collector, so mapping with joining gives the GOLD customer names separated by bars. Java 9 added filtering and flatMapping: filtering with counting counts the eight SUCCESS payments, and flatMapping turns Singapore customers into their eight account numbers. At the top level, plain stream operations do the same job more simply. Their real power appears inside groupingBy next lesson: filtering before grouping silently drops groups with no matches, while the filtering collector keeps them with a count of zero, which reports usually need. DEMO: run ComposingCollectors, lines 1 to 4. Question: when would a report need a group with count zero?");

  // ===== 10 teeing =====
  s = newSlide("CONTENT", "Composing", "teeing [12]: two collectors, one pass");
  const tx = [["payments", 0.5, C.text2], ["counting()", 3.3, C.accent1], ["reducing(ZERO, amount, add)", 3.3, C.accent3], ["CountAndTotal::new", 6.6, C.accent2]];
  s.addText("payments.stream()", { shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.06, x: 0.5, y: 1.55, w: 2.3, h: 0.6, fill: { color: C.text2 }, line: { color: C.text2 }, fontFace: MONO, fontSize: 12, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "tee src" });
  s.addText("counting()", { shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.06, x: 3.3, y: 1.0, w: 2.8, h: 0.55, fill: { color: C.accent1 }, line: { color: C.accent1 }, fontFace: MONO, fontSize: 11.5, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "tee a" });
  s.addText("reducing(ZERO, amount, add)", { shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.06, x: 3.3, y: 2.15, w: 2.8, h: 0.55, fill: { color: C.accent3 }, line: { color: C.accent3 }, fontFace: MONO, fontSize: 11, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "tee b" });
  s.addText("CountAndTotal::new", { shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.06, x: 6.6, y: 1.5, w: 2.9, h: 0.7, fill: { color: C.accent2 }, line: { color: C.accent2 }, fontFace: MONO, fontSize: 10.5, bold: true, color: C.text1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "tee merge" });
  [[2.85, 1.6, 0.4, 0.1], [2.85, 2.0, 0.4, 0.1], [6.15, 1.35, 0.4, 0.1], [6.15, 2.3, 0.4, 0.1]].forEach(([x, y], i) => s.addShape(pres.shapes.RIGHT_ARROW, { x, y, w: 0.4, h: 0.22, fill: { color: C.accent5 }, line: { color: C.accent5 }, objectName: "tee arrow " + i }));
  outputBox(s, "12 payments, total 4429.84   ·   teeing(minBy, maxBy) on balances: -150.25 .. 100000.00", 0.5, 2.95, 9.0, 0.5, "tee output");
  codeBlock(s, `Collectors.teeing(downstream1, downstream2, merger)   // Java 12
// both downstreams receive EVERY element; the merger combines their results`, 0.5, 3.6, 9.0, 0.8, { label: "signature", fontSize: 10.5, name: "tee sig" });
  note(s, "Modern portfolio: teeing(toMap(...EnumMap), reducing(...)) builds the per-type map and the grand total in one pass.", 4.55, C.text2, "tee note");
  s.addNotes("~3 min. teeing, added in Java 12, is named after the T-shaped pipe fitting: every element flows into two downstream collectors at once, and a merger function combines their two results. Here counting and a BigDecimal reducing run over the payments in a single pass, and the merger builds a CountAndTotal record: 12 payments, total 4,429.84. With minBy and maxBy it gives a range of balances, from minus 150.25 to 100,000, in one pass. Before Java 12 you either streamed twice or wrote a custom collector. The modern portfolio in the worked example uses teeing to build the per-type EnumMap and the grand total together. Watch the generic inference: with naturalOrder you may need a type witness, as our code shows. DEMO: run ComposingCollectors, lines 5 and 6. Question: how would you compute the average with teeing instead of averaging?");

  // ===== 11 Worked example =====
  pres.addSection({ title: "Worked example" });
  s = newSlide("CONTENT", "Worked example", "Refactor: portfolio summary, three ways");
  codeBlock(s, `Map<PolicyType, Long> counts = policies.stream()
  .collect(toMap(Policy::type, p -> 1L,
                 Long::sum, TreeMap::new));
Map<PolicyType, BigDecimal> totals = ..
  .collect(toMap(Policy::type, Policy::premium,
                 BigDecimal::add, TreeMap::new));
Map<PolicyType, String> numbers = ..
  .collect(toMap(Policy::type, Policy::number,
                 (a, b) -> a + ", " + b,
                 TreeMap::new));
BigDecimal grand = .. .collect(reducing(
    ZERO, Policy::premium, BigDecimal::add));`, 0.5, 1.05, 4.5, 3.4, { label: "AFTER  ·  Java 8  ·  3 passes", fontSize: 9.5, name: "after code" });
  codeBlock(s, `record TypeSummary(long count, BigDecimal total,
                   List<String> numbers) {
  TypeSummary merge(TypeSummary o) { .. }
}
policies.collect(teeing(                 // [12]
  toMap(Policy::type, TypeSummary::of,
        TypeSummary::merge,
        () -> new EnumMap<>(PolicyType.class)),
  reducing(EMPTY, TypeSummary::of,
           TypeSummary::merge),
  Portfolio::new));
// one pass; parallel gives the same lines`, 5.2, 1.05, 4.3, 3.4, { label: "MODERN  ·  1 pass, record merge", fontSize: 9.5, name: "modern code" });
  outputBox(s, "All 3: LIFE 2, 4250.00 · HEALTH 2, 2065.75 · MOTOR 2, 2550.50 · TRAVEL 2, 395.00 · HOME 2, 1565.25 · TOTAL 10, 10826.50", 0.5, 4.55, 9.0, 0.5, "ba output");
  s.addNotes("~3 min. The worked example, three ways. The Java 8 version replaces the hand-synced maps with three toMap collectors, each with its own merge function, plus reducing for the grand total. It is correct, but it streams over the policies four times and the three maps must still be combined by key. The modern version puts count, total and policy numbers in one immutable record with a merge method, so a single toMap into an EnumMap builds everything per type, and teeing adds the grand total in the same pass. Because merge is associative, the parallel version gives the same lines, which PortfolioRefactoringTest checks along with the equality of all three versions. Notice that TreeMap and EnumMap both order keys by enum declaration order: LIFE, HEALTH, MOTOR, TRAVEL, HOME. DEMO: run ModernPortfolioSummary. Question: why must merge return a new record instead of changing this one?");

  // ===== 12 Pitfalls =====
  s = newSlide("CONTENT", "Worked example", "Pitfalls and best practices");
  const pits = [["toMap without merge on a non-unique key", "IllegalStateException: Duplicate key …"], ["null value in toMap", "NullPointerException (Map.merge)."], ["Relying on toSet / HashMap order", "Order is not defined: tests flicker."], ["averagingDouble / summingDouble for money", "Floating-point rounding errors."], ["Printing IntSummaryStatistics", "Locale-dependent decimal separator."]];
  pits.forEach(([h, d], i) => {
    const y = 1.0 + i * 0.8;
    card(s, 0.5, y, 4.6, 0.7, "FBECEC", "pit " + i);
    iconCircle(s, I.bug, 0.6, y + 0.14, 0.42, C.accent4, "pit icon " + i);
    s.addText([{ text: h, options: { bold: true, color: C.accent4, breakLine: true } }, { text: d, options: { fontSize: 11, color: C.text1 } }], { x: 1.12, y: y + 0.02, w: 3.9, h: 0.66, fontSize: 12.5, margin: 0, valign: "middle", isTextBox: true, objectName: "pit text " + i });
  });
  const dos = ["Always pass a merge function unless the key is an id", "Choose the map: TreeMap / LinkedHashMap / EnumMap", "Money: reducing(ZERO, mapper, BigDecimal::add)", "Immutable value records with an associative merge", "teeing for two answers in one pass", "Top level: plain stream ops; collectors for downstream"];
  card(s, 5.3, 1.0, 4.2, 3.9, C.background2, "do card");
  iconCircle(s, I.check, 5.45, 1.12, 0.45, C.accent1, "do icon");
  s.addText("Best practices", { x: 6.05, y: 1.12, w: 3.3, h: 0.45, fontSize: 15, bold: true, color: C.accent1, margin: 0, valign: "middle", isTextBox: true, objectName: "do title" });
  s.addText(bullets(dos, 12.5).map(r => { r.options.paraSpaceAfter = 7; return r; }), { x: 5.5, y: 1.7, w: 3.9, h: 3.1, margin: 0, valign: "top", isTextBox: true, objectName: "do list" });
  s.addNotes("~3 min. Five pitfalls from today's code. toMap without a merge function on a key that is not unique throws IllegalStateException, often only on production data. A null value in toMap throws NullPointerException because the implementation uses Map.merge. Relying on the order of toSet or a default HashMap makes tests flicker between JVM versions. Summing or averaging money with the double collectors introduces rounding errors. And the toString of the summary statistics classes depends on the default locale. On the right, the habits: a merge function unless the key is an id, an explicit map type when order matters, the reducing idiom for BigDecimal, immutable value records with an associative merge method, teeing when you need two answers in one pass, and plain stream operations at the top level. DEMO: run CollectorsTest. Question: which of these would a code reviewer most likely miss?");

  // ===== 13 Interview =====
  pres.addSection({ title: "Practice" });
  s = newSlide("CONTENT", "Practice", "Interview questions");
  const qa = [
    ["What happens on a duplicate key in toMap?", "IllegalStateException, unless you pass a merge function as the third argument."],
    ["How do you get a sorted map from toMap?", "Fourth argument: a map supplier such as TreeMap::new (or LinkedHashMap::new for insertion order)."],
    ["What is a Collector made of?", "supplier, accumulator, combiner, finisher (+ characteristics)."],
    ["What does teeing do?", "Java 12: sends every element to two collectors and merges both results, in one pass."],
    ["How do you sum BigDecimal with a collector?", "reducing(BigDecimal.ZERO, mapper, BigDecimal::add), or mapping + reducing. Never summingDouble."],
  ];
  qa.forEach(([q, a], i) => {
    const colI = i % 2, row = Math.floor(i / 2);
    const x = i === 4 ? 0.5 : 0.5 + colI * 4.6, y = 1.0 + row * 1.38, w = i === 4 ? 9.0 : 4.4;
    card(s, x, y, w, 1.22, C.background2, "qa card " + i);
    s.addText("Q" + (i + 1), { shape: pres.shapes.OVAL, x: x + 0.12, y: y + 0.14, w: 0.42, h: 0.42, fill: { color: C.text2 }, line: { color: C.text2 }, fontSize: 11, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "q badge " + i });
    s.addText([{ text: q, options: { bold: true, color: C.text2, breakLine: true } }, { text: a, options: { color: C.text1, fontSize: 12 } }], { x: x + 0.65, y: y + 0.06, w: w - 0.8, h: 1.1, fontSize: 13.5, margin: 0, valign: "middle", isTextBox: true, objectName: "qa text " + i });
  });
  s.addNotes("~3 min. Five interview questions. The duplicate-key question is asked constantly because it is such a common production bug; a strong answer gives the exception name and the merge-function fix, and mentions the null-value trap too. The sorted-map question tests knowledge of the four-argument form. The anatomy question separates people who have only used collectors from those who understand them; listen for the combiner and why parallel streams need it. teeing is a good modern-Java question; ask for a use case such as count and total in one pass. The BigDecimal question checks domain sense: summingDouble on money is a red flag. A senior follow-up: what is the difference between filter before collect and the filtering collector? Expect the empty-groups answer from L11. DEMO: run QuizAnswersTest. Question: which would you ask first?");

  // ===== 14 Pros/cons =====
  s = newSlide("CONTENT", "Practice", "Pros and cons of collectors");
  const pros = ["Ready-made recipes for collections, maps, strings", "You choose the result type (TreeMap, EnumMap …)", "Composable: downstream collectors nest", "Parallel-ready via the combiner", "teeing: several answers in one pass", "Mutable containers: efficient for big results"];
  const consL = ["toMap duplicate and null traps", "Generic inference errors can be cryptic", "Nested collectors get hard to read", "Many overlap with simpler stream methods", "No built-in BigDecimal sum/average", "summary toString is locale-dependent"];
  [[pros, "Pros", C.accent1, I.plus, 0.5, C.background2], [consL, "Cons / limitations", C.accent4, I.minus, 5.1, "FBECEC"]].forEach(([list, h, colr, ic, x, bg]) => {
    card(s, x, 1.0, 4.4, 3.65, bg, h + " card");
    iconCircle(s, ic, x + 0.2, 1.15, 0.5, colr, h);
    s.addText(h, { x: x + 0.85, y: 1.15, w: 3.3, h: 0.5, fontSize: 18, bold: true, color: colr, margin: 0, valign: "middle", isTextBox: true, objectName: h + " heading" });
    s.addText(bullets(list, 14).map(r => { r.options.paraSpaceAfter = 8; return r; }), { x: x + 0.25, y: 1.85, w: 3.95, h: 2.7, margin: 0, valign: "top", isTextBox: true, objectName: h + " list" });
  });
  s.addNotes("~2 min. A balanced view of collectors. On the plus side, they are ready-made, tested recipes; you choose the exact result type; they compose, which is what makes groupingBy so powerful; they are designed for parallel streams through the combiner; teeing gives several answers in one pass; and because they fill mutable containers, they are efficient even for large results. On the minus side, toMap has the duplicate-key and null-value traps; generic inference errors, like the one we hit with teeing and naturalOrder while writing this lesson, can be cryptic; deeply nested collectors become hard to read, so extract them into well-named methods or constants; many overlap with simpler stream methods; there is no BigDecimal sum or average; and the summary statistics toString depends on the locale. DEMO: none. Question: where would you draw the line between one clever collector and two simple streams?");

  // ===== 15 Summary =====
  pres.addSection({ title: "Wrap-up" });
  s = newSlide("DARK_TITLE", "Wrap-up", "Summary");
  const sum = ["Collector = supplier, accumulator, combiner, finisher", "toCollection(...) when type or order matters; toUnmodifiable* [10]", "toMap: merge function unless key is unique; choose the map", "joining, summarizing, maxBy; money = reducing(ZERO, .., add)", "collectingAndThen, mapping, filtering/flatMapping [9], teeing [12]"];
  s.addText(bullets(sum, 14, C.background1), { x: 0.5, y: 2.1, w: 5.2, h: 2.9, margin: 0, valign: "top", isTextBox: true, objectName: "summary bullets" });
  card(s, 6.0, 0.6, 3.5, 2.05, "143F32", "exercise card");
  iconCircle(s, I.code, 6.2, 0.78, 0.45, C.accent2, "exercise");
  s.addText([{ text: "Exercise (~30 min)", options: { bold: true, color: C.accent2, breakLine: true } }, { text: "Payment gateway summary in Exercise10: count, total and both per method with toMap + merge; SUCCESS only; teeing line.", options: { color: C.background1, fontSize: 12 } }],
    { x: 6.75, y: 0.75, w: 2.65, h: 1.8, fontSize: 14, margin: 0, valign: "top", isTextBox: true, objectName: "exercise text" });
  card(s, 6.0, 2.85, 3.5, 2.05, "143F32", "next card");
  iconCircle(s, I.rocket, 6.2, 3.03, 0.45, C.accent1, "next");
  s.addText([{ text: "Next: Lesson 11", options: { bold: true, color: C.accent2, breakLine: true } }, { text: "Grouping & Partitioning: groupingBy with downstream collectors, multi-level maps, partitioningBy.", options: { color: C.background1, fontSize: 12 } }],
    { x: 6.75, y: 3.0, w: 2.65, h: 1.8, fontSize: 14, margin: 0, valign: "top", isTextBox: true, objectName: "next text" });
  s.addNotes("~3 min. Recap: a collector is supplier, accumulator, combiner and finisher; use toCollection when the type or order matters, and the Java 10 unmodifiable variants for immutable results; toMap needs a merge function unless the key is unique, and a map supplier when order matters; joining and summarizing are the most useful aggregators, and money is summed with reducing; and the composing collectors, collectingAndThen, mapping, filtering, flatMapping and teeing, prepare us for grouping. The exercise is a payment gateway summary for CARD, PAYNOW and PAYPAL: counts, totals, both together with a MethodSummary record and its merge method, the same for SUCCESS payments only, and one line built with teeing and joining. Expected values are in the Javadoc. DEMO: run Solution10. Question: which task would be one line with groupingBy?");

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
})();
