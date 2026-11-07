// L07 slide deck generator - ITGreenZone Java Functional Programming
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa");
const { applyTheme } = require("/root/.claude/skills/synced/2eb53c35-a0c8-4343-9257-776fcd7fed67_dd7dcff0-93ee-4601-a8ce-12573fa09cd9/pptx/scripts/apply_theme.js");

const OUT = process.argv[2] || "L07_FilterMapSlice_Slides.pptx";
const LESSON = "07";
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
pres.title = "L07 Filtering, Mapping & Slicing";
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
    bug: await icon(fa.FaBug), filter: await icon(fa.FaFilter), exchange: await icon(fa.FaExchangeAlt),
    layers: await icon(fa.FaLayerGroup), cut: await icon(fa.FaCut), search: await icon(fa.FaSearch),
  };
  const tbl = (s, head, rows, x, y, w, colW, rowH, name, monoCols = [0]) => {
    const h = head.map(t => ({ text: t, options: { bold: true, color: C.background1, fill: { color: C.text2 } } }));
    const r = rows.map((row, i) => row.map((c, j) => ({ text: c, options: Object.assign({ fill: { color: i % 2 ? C.background1 : C.background2 }, color: C.text1, fontSize: 10.5 }, monoCols.includes(j) ? { fontFace: MONO, fontSize: 10, bold: j === 0 } : {}) })));
    s.addTable([h, ...r], { x, y, w, colW, rowH, border: { type: "solid", pt: 0.5, color: "D5E3DA" }, valign: "middle", margin: [2, 5, 2, 5], objectName: name });
  };

  // ===== 1 Title =====
  pres.addSection({ title: "Introduction" });
  let s = newSlide("DARK_TITLE", "Introduction", "Filtering, Mapping & Slicing");
  s.addText("LESSON 07  ·  MODULE 2 STREAM API", { x: 0.5, y: 0.6, w: 5.5, h: 0.35, fontSize: 12, bold: true, color: C.accent2, charSpacing: 2, margin: 0, isTextBox: true, objectName: "kicker" });
  s.addText("filter · map · flatMap · mapMulti · distinct · peek · limit · skip · takeWhile · dropWhile", { x: 0.5, y: 2.95, w: 5.0, h: 0.8, fontSize: 15, italic: true, color: C.background2, margin: 0, isTextBox: true, objectName: "subtitle" });
  card(s, 6.0, 0.6, 3.5, 4.3, "143F32", "objectives card");
  s.addText("You will be able to", { x: 6.25, y: 0.75, w: 3.1, h: 0.35, fontSize: 14, bold: true, color: C.accent2, margin: 0, isTextBox: true, objectName: "objectives heading" });
  ["Filter safely, including BigDecimal money", "Map to new types and to primitive streams", "Flatten one-to-many data: flatMap vs mapMulti", "Remove duplicates; use peek only to debug", "Slice by position and by condition"].forEach((o, i) => {
    const y = 1.2 + i * 0.72;
    s.addText(String(i + 1), { shape: pres.shapes.OVAL, x: 6.25, y: y + 0.05, w: 0.36, h: 0.36, fill: { color: C.accent1 }, line: { color: C.accent1 }, fontSize: 12, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "objective number " + (i + 1) });
    s.addText(o, { x: 6.75, y, w: 2.6, h: 0.62, fontSize: 12.5, color: C.background1, valign: "middle", margin: 0, isTextBox: true, objectName: "objective " + (i + 1) });
  });
  s.addNotes("~2 min. Lesson 6 explained how a pipeline runs. Today we learn the intermediate operations you will write every day: filter to keep elements, map and its primitive variants to transform them, flatMap and the Java 16 mapMulti to expand one element into many, distinct to remove duplicates, peek to debug, and four slicing operations: limit and skip by position, takeWhile and dropWhile by condition. Every example uses our banking, airline and payments dataset, and every output on the slides comes from running the code in package l07_filter_map_slice. The exercise has ten graded mini-tasks, from one-liners to mapMulti. DEMO: open the l07 package tree in the IDE. Question to ask: which of these operations have you already used at work, and which one have you never needed?");

  // ===== 2 Problem =====
  pres.addSection({ title: "Theory" });
  s = newSlide("CONTENT", "Theory", "The problem: nested loops, manual paging");
  codeBlock(s, `for (Customer c : customers) {
  if (c.tier() != GOLD) continue;
  for (Account a : accounts) {
    if (!a.customerId().equals(c.id())) continue;
    for (Transaction t : txns)
      if (t.accountNumber().equals(a.number())
          && t.type() == DEBIT && t.amount()...)
        matches.add(t);
  }
}
Collections.sort(matches, new Comparator<>() {...});
int from = (pageNo - 1) * size;
int to = Math.min(from + size, matches.size());`, 0.5, 1.05, 5.3, 3.3, { label: "BEFORE  ·  before/LegacyGoldStatement", fontSize: 9.5, name: "legacy code" });
  codeBlock(s, `customers.stream()
  .filter(GOLD)
  .flatMap(c -> accountsOf(c))
  .flatMap(a -> txnsOf(a))
  .filter(DEBIT.and(OVER_100))
  .sorted(NEWEST_FIRST)
  .skip((pageNo - 1) * size)
  .limit(size)
  .map(StatementLine::of)
  .toList();`, 6.0, 1.05, 3.5, 3.3, { label: "AFTER  ·  one pipeline", fontSize: 10, name: "stream code" });
  outputBox(s, "Page 1 (size 5): T060 194.28 · T052 661.62 · T033 306.29 · T020 170.53 · T017 157.47  (11 matches, 3 pages)", 0.5, 4.5, 9.0, 0.5, "problem output");
  s.addNotes("~3 min. Today's business question: the spending review for GOLD customers. Show their debits over 100 dollars, newest first, five per page. The legacy version needs three nested loops to walk from customer to account to transaction, a temporary list, an anonymous Comparator, and paging arithmetic with Math.min to avoid running off the end of the list. Every operation in today's lesson appears in the pipeline on the right: filter keeps GOLD customers, flatMap expands each customer into accounts and each account into transactions, filter again, sorted, then skip and limit do the paging. All three versions in the repo return the same pages. DEMO: run LegacyGoldStatement. Question: in the legacy version, which line would you have to change to show page 2, and how sure are you it works on the last page?");

  // ===== 3 filter =====
  s = newSlide("CONTENT", "Theory", "filter, and comparing money safely");
  codeBlock(s, `txns.stream()
    .filter(t -> t.type() == DEBIT)
    .filter(t -> t.amount().compareTo(FIVE_HUNDRED) > 0)
    .map(Transaction::id)
    .toList();
// same result: .filter(IS_DEBIT.and(large))

txns.stream().filter(Predicate.not(IS_SGD))  // [11]
accounts.stream().filter(a -> a.balance().signum() < 0)`, 0.5, 1.05, 5.6, 2.75, { label: "theory/Filtering", fontSize: 10, name: "filter code" });
  card(s, 6.3, 1.05, 3.2, 2.75, "FBECEC", "equals card");
  iconCircle(s, I.bug, 6.45, 1.18, 0.42, C.accent4, "equals icon");
  s.addText([{ text: "BigDecimal trap", options: { bold: true, color: C.accent4, breakLine: true } }, { text: "new BigDecimal(\"500.0\")", options: { fontFace: MONO, fontSize: 10, breakLine: true } }, { text: "  .equals(500.00) → false", options: { fontFace: MONO, fontSize: 10, breakLine: true } }, { text: "  .compareTo(500.00) → 0", options: { fontFace: MONO, fontSize: 10, breakLine: true } }, { text: "equals also compares the scale. Use compareTo (or signum) for money.", options: { fontSize: 11.5 } }],
    { x: 6.45, y: 1.7, w: 2.95, h: 2.0, fontSize: 13, color: C.text1, margin: 0, valign: "top", isTextBox: true, objectName: "equals text" });
  outputBox(s, "debits > 500.00: [T003, T005, T010, T023, T026, T028, T036, T042, T050, T052, T057] · not SGD: [T010 USD, T023 USD] · overdrawn: [ACC-1013]", 0.5, 3.95, 9.0, 0.6, "filter output");
  s.addText("Two chained filters = one filter with and(): same result, choose what reads better.", { x: 0.5, y: 4.65, w: 9, h: 0.35, fontSize: 12.5, italic: true, color: C.text2, margin: 0, isTextBox: true, objectName: "filter note" });
  s.addNotes("~3 min. filter takes a Predicate and keeps elements for which it returns true. Practice item one: debit transactions over 500 dollars. Eleven match, listed in the output box. You can chain two filters or combine predicates with and; the result is identical because filters are fused into one pass anyway, so choose what reads best. Predicate.not, added in Java 11, avoids awkward negated lambdas and works with method references. The trap on the right matters for banking code: BigDecimal equals compares the scale too, so 500.0 is not equal to 500.00. Always compare money with compareTo, or signum for the sign, as the overdrawn-account filter does. DEMO: run Filtering. Question: what would filter(t -> t.amount().equals(new BigDecimal(\"500\"))) match in our data?");

  // ===== 4 map & primitive maps =====
  s = newSlide("CONTENT", "Theory", "map: one in, one out, possibly a new type");
  tbl(s, ["Operation", "Turns", "Real result (theory/Mapping)", "Since"], [
    ["map(Customer::name)", "Stream<Customer> → Stream<String>", "[ALICE TAN, BALA KUMAR, …] (with toUpperCase)", "Java 8"],
    ["map(c -> new CustomerCard(..))", "Stream<Customer> → Stream<CustomerCard>", "CustomerCard[id=C001, upperName=ALICE TAN, tier=GOLD]", "Java 16 record"],
    ["mapToInt(Flight::booked)", "Stream<Flight> → IntStream", ".sum() → 1808 seats booked", "Java 8"],
    ["mapToDouble(f -> 100.0*booked/seats)", "Stream<Flight> → DoubleStream", ".average() → 84.1% load factor", "Java 8"],
    ["IntStream.mapToObj(i -> \"Page \" + i)", "IntStream → Stream<String>", "[Page 1, Page 2, Page 3]", "Java 8"],
    ["mapToInt(seats - booked).boxed()", "IntStream → Stream<Integer>", "[16, 63, 6, 62, 27, 52, 2, 42]", "Java 8"],
  ], 0.5, 1.0, 9.0, [2.75, 2.45, 2.85, 0.95], 0.5, "map table");
  s.addText([{ text: "Rules: ", options: { bold: true, color: C.accent1 } }, { text: "map keeps the count and the order. Use mapToInt/Long/Double for numbers (no boxing, sum/average built in). Use Locale.ROOT in toUpperCase for the same result on every machine. Money stays BigDecimal: never mapToDouble an amount." }],
    { x: 0.5, y: 4.6, w: 9, h: 0.55, fontSize: 12, color: C.text1, margin: 0, valign: "top", isTextBox: true, objectName: "map rules" });
  s.addNotes("~3 min. map applies a Function to each element: one element in, exactly one out, so the count and the order never change, only the values and possibly the type. Practice item two is the first row: customer names in uppercase. Note Locale.ROOT, which gives the same uppercase on every machine; a Turkish locale, for example, handles the letter i differently. map can also build a new type such as a CustomerCard record. For numbers, mapToInt, mapToLong and mapToDouble switch to primitive streams with sum and average built in, and no Integer boxing; mapToObj and boxed go back to objects. The load factor is a ratio, so double is fine there, but never mapToDouble a money amount: L12 explains why. DEMO: run Mapping. Question: why does boxed exist at all?");

  // ===== 5 flatMap =====
  s = newSlide("CONTENT", "Theory", "flatMap: one in, zero or more out, flattened");
  const chain = [["Customer", "GOLD: 4", C.text2], ["Account", "6 accounts", C.accent1], ["Transaction", "19 txns", C.accent2]];
  chain.forEach(([h, d, col], i) => {
    const x = 0.5 + i * 2.05;
    s.addText([{ text: h, options: { bold: true, fontSize: 13, breakLine: true } }, { text: d, options: { fontSize: 11 } }], { shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.08, x, y: 1.05, w: 1.7, h: 0.8, fill: { color: col }, line: { color: col }, color: col === C.accent2 ? C.text1 : C.background1, align: "center", valign: "middle", margin: 3, isTextBox: true, objectName: "chain " + i });
    if (i < 2) s.addShape(pres.shapes.RIGHT_ARROW, { x: x + 1.75, y: 1.32, w: 0.25, h: 0.26, fill: { color: C.accent5 }, line: { color: C.accent5 }, objectName: "chain arrow " + i });
  });
  codeBlock(s, `customers.stream()
    .filter(c -> c.tier() == GOLD)
    .flatMap(c -> accountsOf(c).stream())
    .flatMap(a -> transactionsOf(a).stream())
    .map(Transaction::id)
    .toList();
// [T009, T012, T017, T018, T005, … T052]  (19)`, 0.5, 2.0, 5.6, 2.3, { label: "theory/FlatMapping · Practice 3", fontSize: 10, name: "flatMap code" });
  card(s, 6.3, 1.05, 3.2, 3.25, C.background2, "map vs flatMap card");
  s.addText([{ text: "map vs flatMap", options: { bold: true, color: C.text2, breakLine: true } }, { text: "map(accountsOf)", options: { fontFace: MONO, fontSize: 10.5, breakLine: true } }, { text: "→ Stream<List<Account>>  (10 lists)", options: { fontSize: 11, breakLine: true } }, { text: "flatMap(c -> accountsOf(c).stream())", options: { fontFace: MONO, fontSize: 10, breakLine: true } }, { text: "→ Stream<Account>", options: { fontSize: 11, breakLine: true } }, { text: " ", options: { fontSize: 6, breakLine: true } }, { text: "Nested lists: ", options: { bold: true } }, { text: "flatMap(List::stream) turns [[SIN, NRT], [SIN, LHR, SIN], []] into [SIN, NRT, SIN, LHR, SIN].", options: { fontSize: 11 } }],
    { x: 6.45, y: 1.15, w: 2.95, h: 3.05, fontSize: 13, color: C.text1, margin: 0, valign: "top", isTextBox: true, objectName: "map vs flatMap text" });
  outputBox(s, "One element → a Stream of 0..n elements → all merged into one stream. Empty lists simply disappear.", 0.5, 4.45, 9.0, 0.5, "flatMap output");
  s.addNotes("~4 min. flatMap is the operation people find hardest, so use the diagram. The function you pass returns a stream, not a value. For each customer we return a stream of that customer's accounts, and flatMap merges all those small streams into one stream of accounts. Do it again to go from accounts to transactions. Practice item three: all transactions of GOLD customers, 19 in total, in customer order. Compare with map on the right: map with the same function gives a stream of ten lists, one per customer, which is rarely what you want. The same idea flattens nested lists with List::stream, and empty lists simply disappear. DEMO: run FlatMapping, lines 1 and 2. Question: what is the type of the stream after map(FlatMapping::accountsOf), and how do you fix it?");

  // ===== 6 mapMulti =====
  s = newSlide("CONTENT", "Theory", "mapMulti [16]: push, don't return");
  codeBlock(s, `// flatMap: return a Stream for EVERY element
flights.stream()
    .flatMap(f -> Stream.of(f.from(), f.to()))
    .distinct().sorted().toList();
// [BKK, CGK, CMB, EWR, KUL, LHR, NRT, SIN]`, 0.5, 1.05, 4.4, 2.0, { label: "flatMap", fontSize: 10, name: "flatMap2 code" });
  codeBlock(s, `// mapMulti: call down.accept(..) 0..n times
flights.stream()
    .<String>mapMulti((f, down) -> {
        if (f.booked() * 100 >= f.seats() * 95)
            down.accept(f.code());
    })
    .toList();
// [SQ318, TR808, SQ21]`, 5.1, 1.05, 4.4, 2.0, { label: "mapMulti  [Java 16]", fontSize: 10, name: "mapMulti code" });
  tbl(s, ["", "flatMap", "mapMulti [16]"], [
    ["Function returns", "a Stream<R>", "nothing: you call down.accept(r)"],
    ["Best when", "you already have a collection or stream", "0 or 1 (or a few) results, loops, ifs"],
    ["Cost", "one Stream object per element", "no Stream per element"],
    ["Type witness", "inferred", "often needs .<R>mapMulti"],
  ], 0.5, 3.2, 9.0, [2.0, 3.4, 3.6], 0.37, "mapMulti table", [0]);
  s.addNotes("~3 min. mapMulti, added in Java 16, does the same job as flatMap but in the opposite style. Instead of returning a stream, your lambda receives the element and a consumer, often called down or sink, and calls accept zero or more times. It shines when an element produces zero or one result, or a few results computed with ifs and loops, because no Stream object is created per element. Our example emits only flights that are at least 95 percent full: SQ318, TR808 and SQ21. flatMap stays the natural choice when you already have a collection, as with the airports or the account lists. One practical detail: the compiler usually cannot infer the output type of mapMulti, so write the type witness, angle bracket String. DEMO: run FlatMapping, lines 3 and 6. Question: rewrite the airports example with mapMulti. Is it clearer?");

  // ===== 7 distinct =====
  s = newSlide("CONTENT", "Theory", "distinct: decided by equals/hashCode");
  codeBlock(s, `customers.stream().map(Customer::city).distinct().toList();
// [Singapore, Kuala Lumpur, Jakarta, Colombo, Bangkok]

record CityTier(String city, Tier tier) { }           // [16]
customers.stream().map(c -> new CityTier(..)).distinct().count(); // 9
customers.stream().map(c -> new CityTierBean(..)).distinct().count(); // 10

Stream.of(bd("1.0"), bd("1.00"), bd("1.0")).distinct().count(); // 2
   ... .map(b -> b.setScale(2)).distinct().count();              // 1`, 0.5, 1.05, 9.0, 2.75, { label: "theory/DistinctAndPeek · Practice 4", fontSize: 10, name: "distinct code" });
  const dfacts = [[I.check, "Keeps the first", "in encounter order: Singapore first, because C001 lives there."], [I.layers, "Records just work", "equals/hashCode from the components: 9 of 10."], [I.times, "No equals? No dedup", "a plain class compares identity: 10 of 10."], [I.bug, "BigDecimal scale", "1.0 ≠ 1.00. Normalise with setScale first."]];
  dfacts.forEach(([ic, h, d], i) => {
    const x = 0.5 + i * 2.3;
    card(s, x, 3.95, 2.1, 1.1, C.background2, "dfact " + i);
    iconCircle(s, ic, x + 0.1, 4.05, 0.36, i > 1 ? C.accent4 : C.accent1, h);
    s.addText([{ text: h, options: { bold: true, color: C.text2, breakLine: true } }, { text: d, options: { fontSize: 10 } }], { x: x + 0.52, y: 3.98, w: 1.53, h: 1.04, fontSize: 11.5, color: C.text1, margin: 0, valign: "middle", isTextBox: true, objectName: "dfact text " + i });
  });
  s.addNotes("~3 min. distinct removes duplicates using equals and hashCode, and on an ordered stream it keeps the first occurrence, so practice item four, distinct cities, starts with Singapore because customer C001 lives there. Records generate equals and hashCode from their components, so distinct works immediately: ten customers give nine distinct city-and-tier pairs, because Alice and Jasmine are both GOLD in Singapore. A plain class without equals compares identity, so nothing is removed: ten out of ten. And our old friend BigDecimal: 1.0 and 1.00 are not equal, so distinct keeps both; normalise the scale first. Remember from L06 that distinct is stateful: it keeps a set of everything seen. DEMO: run DistinctAndPeek. Question: how would you get distinct customers by city only, keeping the whole customer?");

  // ===== 8 peek =====
  s = newSlide("CONTENT", "Theory", "peek: a debugging window, not business logic");
  codeBlock(s, `payments.subList(0, 4).stream()
    .peek(p -> log.add("in " + p.id()))
    .filter(p -> p.status() == FAILED)
    .peek(p -> log.add("FAILED " + p.id()))
    .map(Payment::id)
    .toList();`, 0.5, 1.05, 4.6, 2.2, { label: "theory/DistinctAndPeek · peekTrace", fontSize: 10, name: "peek code" });
  outputBox(s, "[in P001, in P002, in P003, FAILED P003, in P004, result [P003]]", 0.5, 3.35, 4.6, 0.6, "peek output");
  card(s, 5.3, 1.05, 4.2, 2.9, "FBECEC", "peek count card");
  iconCircle(s, I.bug, 5.45, 1.18, 0.42, C.accent4, "peek count icon");
  s.addText([{ text: "count() may skip peek  [9+]", options: { bold: true, color: C.accent4, breakLine: true } }, { text: "payments.stream()\n  .peek(p -> seen.add(p.id()))\n  .count();", options: { fontFace: MONO, fontSize: 10, breakLine: true } }, { text: "count=12  peeked=0", options: { fontFace: MONO, fontSize: 11, bold: true, color: C.accent4, breakLine: true } }, { text: "The size of a List is known, so the pipeline is not run. Add a filter and peek sees all 12.", options: { fontSize: 11 } }],
    { x: 5.45, y: 1.7, w: 4.0, h: 2.2, fontSize: 13, color: C.text1, margin: 0, valign: "top", isTextBox: true, objectName: "peek count text" });
  s.addText("Use peek to see the flow while learning or debugging. Never to save, send, count or mutate: it may run fewer times than you expect.", { x: 0.5, y: 4.15, w: 9, h: 0.8, fontSize: 13, italic: true, color: C.text2, margin: 0, valign: "top", isTextBox: true, objectName: "peek rule" });
  s.addNotes("~3 min. peek takes a Consumer and passes every element through unchanged. It is perfect for seeing the flow, as in the trace on the left: P003 is the only payment that reaches the second peek. But the Javadoc says it exists mainly for debugging, and here is why. On the right is real output from Java 21: count on a list stream with a peek returns 12, yet peek ran zero times. Since Java 9, count can take the size directly from a sized source and skip the pipeline. Add a filter and peek runs for all twelve. Short-circuiting operations can also skip elements. So never put business logic such as saving, sending or counting in peek. DEMO: run DistinctAndPeek, last line. Question: where would you put the audit log instead?");

  // ===== 9 limit/skip =====
  pres.addSection({ title: "Slicing" });
  s = newSlide("CONTENT", "Slicing", "limit and skip: slice by position (pagination)");
  codeBlock(s, `static <T> List<T> page(List<T> items, int pageNo, int size) {
    return items.stream()
        .skip((long) (pageNo - 1) * size) // earlier pages
        .limit(size)                    // one page
        .toList();
}
txns.stream().sorted(comparing(Transaction::date)
                     .thenComparing(Transaction::id))
    .limit(5)...           // Practice 5`, 0.5, 1.05, 5.9, 2.8, { label: "theory/Slicing · Practice 5 and 6", fontSize: 10, name: "page code" });
  const pages = [["page(ids, 2, 5)", "[T006, T007, T008, T009, T010]"], ["page(ids, 12, 5)", "[T056 … T060]"], ["page(ids, 13, 5)", "[]  (no exception)"], ["first 5 by date", "T001 08-02 … T005 08-16"]];
  pages.forEach(([a, b], i) => {
    const y = 1.05 + i * 0.7;
    card(s, 6.6, y, 2.9, 0.6, i === 2 ? "FFF4E0" : C.background2, "page card " + i);
    s.addText([{ text: a, options: { fontFace: MONO, fontSize: 10.5, bold: true, color: C.text2, breakLine: true } }, { text: b, options: { fontFace: MONO, fontSize: 10, color: C.accent1 } }], { x: 6.72, y: y + 0.03, w: 2.7, h: 0.55, margin: 0, valign: "middle", isTextBox: true, objectName: "page text " + i });
  });
  s.addText([{ text: "Rules: ", options: { bold: true, color: C.accent1 } }, { text: "sort before you page (a stable order); skip past the end gives an empty list; cast to long before multiplying; for a database, page in SQL (OFFSET/FETCH), not in memory." }],
    { x: 0.5, y: 4.0, w: 9, h: 0.9, fontSize: 12.5, color: C.text1, margin: 0, valign: "top", isTextBox: true, objectName: "page rules" });
  s.addNotes("~3 min. limit keeps the first n elements; skip throws away the first n. Together they implement practice item six, pagination: skip the earlier pages, then limit to one page. The cards show real results over the sixty transaction ids: page 2 is T006 to T010, page 12 is the last full page, and page 13 is simply an empty list, with no index exception to guard against. Practice item five, the first five transactions by date, sorts first and then limits. Paging only makes sense on a stable order, so sort with a tie-breaker such as the id. Cast to long before multiplying to avoid int overflow on huge page numbers. And in a real application, page in the database with OFFSET and FETCH rather than loading every row. DEMO: run Slicing. Question: which of skip and limit is short-circuiting?");

  // ===== 10 takeWhile/dropWhile =====
  s = newSlide("CONTENT", "Slicing", "takeWhile / dropWhile [9]: sorted input!");
  const pay = [["P001", "120.00", 1], ["P002", "45.50", 1], ["P003", "310.25", 0], ["P004", "89.90", 2], ["P005", "1500.00", 2], ["P006", "220.00", 2]];
  s.addText("payments in source order, predicate: amount < 300.00", { x: 0.5, y: 1.0, w: 9, h: 0.3, fontSize: 12, bold: true, color: C.text2, margin: 0, isTextBox: true, objectName: "tw heading" });
  pay.forEach(([id, amt, st], i) => {
    const x = 0.5 + i * 1.18;
    const fill = st === 1 ? C.accent1 : (st === 0 ? C.accent4 : "C9D3CE");
    s.addText([{ text: id, options: { bold: true, breakLine: true } }, { text: amt, options: { fontSize: 10 } }], { shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.06, x, y: 1.38, w: 1.05, h: 0.62, fill: { color: fill }, line: { color: fill }, fontFace: MONO, fontSize: 11, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "pay " + i });
  });
  s.addText("STOP at P003 →", { x: 7.65, y: 1.45, w: 1.85, h: 0.45, fontSize: 13, bold: true, color: C.accent4, margin: 0, isTextBox: true, objectName: "stop label" });
  tbl(s, ["Pipeline", "Real result (theory/Slicing)"], [
    ["takeWhile(< 300)  on source order", "[P001, P002]  ← stops at the first failure"],
    ["filter(< 300)", "[P001, P002, P004, P006, P007, P009, P011, P012]"],
    ["sorted(amount).takeWhile(< 300)", "[P009, P002, P007, P004, P001, P011, P006, P012]  ✓"],
    ["sorted(at).takeWhile(before 11-03)", "[P001, P002, P003, P004, P005, P006]"],
    ["sorted(at).dropWhile(before 11-03)", "[P007, P008, P009, P010, P011, P012]"],
  ], 0.5, 2.15, 9.0, [3.4, 5.6], 0.4, "tw table", [0, 1]);
  s.addText("takeWhile = filter only when the input is sorted by the same condition. Bonus: it short-circuits, so it ends an infinite iterate.", { x: 0.5, y: 4.65, w: 9, h: 0.45, fontSize: 12.5, italic: true, color: C.accent4, margin: 0, isTextBox: true, objectName: "tw note" });
  s.addNotes("~4 min. takeWhile and dropWhile arrived in Java 9 and slice by a condition instead of a position. takeWhile keeps elements while the predicate holds and stops at the first one that fails; dropWhile discards them until the first failure and keeps everything after. The boxes show the classic bug: payments in source order, take while the amount is under 300. P003 is 310.25, so takeWhile stops there and returns only two payments, while filter returns eight. Sort by amount first and takeWhile returns the same eight, and stops early. The time-based example is correct because payments are sorted by time: everything before November 3rd, then the rest. takeWhile is also short-circuiting, so it can end an infinite iterate. DEMO: run Slicing, last five lines. Question: when is takeWhile faster than filter?");

  // ===== 11 Worked example =====
  pres.addSection({ title: "Worked example" });
  s = newSlide("CONTENT", "Worked example", "Refactor: GOLD spending review, three ways");
  codeBlock(s, `SampleData.customers().stream()
  .filter(c -> c.tier() == GOLD)
  .flatMap(c -> accounts.stream()
      .filter(a -> a.customerId()
                    .equals(c.id())))
  .flatMap(a -> txns.stream()
      .filter(t -> t.accountNumber()
                    .equals(a.number())))
  .filter(t -> t.type() == DEBIT && ..)
  .sorted(comparing(Transaction::date)
      .reversed().thenComparing(..::id))
  .skip((long) (pageNo - 1) * size)
  .limit(size).map(..)
  .collect(Collectors.toList());`, 0.5, 1.05, 4.5, 3.4, { label: "AFTER  ·  Java 8  ·  after/StreamGoldStatement", fontSize: 9, name: "after code" });
  codeBlock(s, `record StatementLine(LocalDate date,
    String txnId, String account,
    Category category, BigDecimal amount)
// indexes built once (groupingBy, L11)
customers.stream()
  .filter(GOLD)
  .<Account>mapMulti((c, down) ->
      ACCOUNTS_BY_CUSTOMER.getOrDefault(
          c.id(), List.of()).forEach(down))
  .<Transaction>mapMulti(...)
  .filter(DEBIT.and(OVER_100))
  .sorted(NEWEST_FIRST)
  .skip(..).limit(size)
  .map(StatementLine::of).toList();`, 5.2, 1.05, 4.3, 3.4, { label: "MODERN  ·  modern/ModernGoldStatement", fontSize: 9, name: "modern code" });
  outputBox(s, "page 2: T018 447.37 · T014 302.05 · T012 235.93 · T009 268.07 · T005 538.57 · page 3: T001 150.39 · page 4: []", 0.5, 4.55, 9.0, 0.5, "ba output");
  s.addNotes("~3 min. The worked example, three ways. The Java 8 version is a faithful translation of the nested loops: filter GOLD customers, flatMap to their accounts, flatMap to their transactions, filter debits over 100, sort newest first with the id as a tie-breaker, then skip and limit for the page. It still scans all accounts for every customer, exactly like the loops. The modern version fixes that: it builds two lookup maps once, a preview of groupingBy in L11, uses mapMulti for the one-to-many steps, names the predicates, and returns a StatementLine record. GoldStatementRefactoringTest checks that all three versions return identical pages for seven page sizes and thirteen page numbers. DEMO: run the three classes. Question: why does the Comparator say reversed before thenComparing, and what would happen the other way round? L08 explains.");

  // ===== 12 Pitfalls =====
  s = newSlide("CONTENT", "Worked example", "Pitfalls and best practices");
  const pits = [["equals on BigDecimal", "500.0 ≠ 500.00. Use compareTo or signum."], ["map where flatMap is needed", "Stream<List<T>> instead of Stream<T>."], ["takeWhile on unsorted input", "Stops at the first failure: 2 instead of 8."], ["distinct on a class without equals", "Nothing removed. Use a record or implement equals/hashCode."], ["Business logic in peek", "count() may skip it: peeked=0."]];
  pits.forEach(([h, d], i) => {
    const y = 1.0 + i * 0.8;
    card(s, 0.5, y, 4.6, 0.7, "FBECEC", "pit " + i);
    iconCircle(s, I.bug, 0.6, y + 0.14, 0.42, C.accent4, "pit icon " + i);
    s.addText([{ text: h, options: { bold: true, color: C.accent4, breakLine: true } }, { text: d, options: { fontSize: 11, color: C.text1 } }], { x: 1.12, y: y + 0.02, w: 3.9, h: 0.66, fontSize: 12.5, margin: 0, valign: "middle", isTextBox: true, objectName: "pit text " + i });
  });
  const dos = ["Filter early: less work for map and sorted", "Name predicates; combine with and/or/not", "Primitive maps for numbers, BigDecimal for money", "flatMap for collections, mapMulti for 0..1 results", "Sort with a tie-breaker before limit/skip", "takeWhile only on input sorted by its condition"];
  card(s, 5.3, 1.0, 4.2, 3.9, C.background2, "do card");
  iconCircle(s, I.check, 5.45, 1.12, 0.45, C.accent1, "do icon");
  s.addText("Best practices", { x: 6.05, y: 1.12, w: 3.3, h: 0.45, fontSize: 15, bold: true, color: C.accent1, margin: 0, valign: "middle", isTextBox: true, objectName: "do title" });
  s.addText(bullets(dos, 12.5).map(r => { r.options.paraSpaceAfter = 7; return r; }), { x: 5.5, y: 1.7, w: 3.9, h: 3.1, margin: 0, valign: "top", isTextBox: true, objectName: "do list" });
  s.addNotes("~3 min. Five pitfalls, each with real output from today's code. Comparing money with equals silently misses values with a different scale. Using map where you needed flatMap leaves you with a stream of lists; the compiler usually catches it later, at the collect. takeWhile on unsorted input returns two payments instead of eight, and no test fails unless you check the count. distinct on a class without equals removes nothing. And business logic in peek may never run: count skipped it completely. On the right are the habits that prevent these: filter early, name your predicates, use primitive streams for counts and ratios but BigDecimal for money, pick flatMap or mapMulti deliberately, always sort with a tie-breaker before paging, and only use takeWhile on sorted input. DEMO: run FilterMapSliceTest. Question: which of these five bugs would a code reviewer spot fastest?");

  // ===== 13 Interview =====
  pres.addSection({ title: "Practice" });
  s = newSlide("CONTENT", "Practice", "Interview questions");
  const qa = [
    ["map vs flatMap?", "map: one in, one out. flatMap: the function returns a Stream; all of them are merged into one."],
    ["flatMap vs mapMulti [16]?", "Same result. mapMulti pushes into a consumer: no Stream per element; best for 0..1 results."],
    ["How does distinct decide duplicates?", "equals/hashCode; keeps the first in encounter order. Records get them for free."],
    ["filter vs takeWhile?", "filter tests every element. takeWhile stops at the first failure: same only on sorted input."],
    ["Why is peek risky?", "It is for debugging; since Java 9, count() may not run the pipeline, so peek may never run."],
  ];
  qa.forEach(([q, a], i) => {
    const colI = i % 2, row = Math.floor(i / 2);
    const x = i === 4 ? 0.5 : 0.5 + colI * 4.6, y = 1.0 + row * 1.38, w = i === 4 ? 9.0 : 4.4;
    card(s, x, y, w, 1.22, C.background2, "qa card " + i);
    s.addText("Q" + (i + 1), { shape: pres.shapes.OVAL, x: x + 0.12, y: y + 0.14, w: 0.42, h: 0.42, fill: { color: C.text2 }, line: { color: C.text2 }, fontSize: 11, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "q badge " + i });
    s.addText([{ text: q, options: { bold: true, color: C.text2, breakLine: true } }, { text: a, options: { color: C.text1, fontSize: 12 } }], { x: x + 0.65, y: y + 0.06, w: w - 0.8, h: 1.1, fontSize: 13.5, margin: 0, valign: "middle", isTextBox: true, objectName: "qa text " + i });
  });
  s.addNotes("~3 min. Five interview questions on today's operations. Question one is asked almost everywhere; a strong answer mentions the type of the function: map takes T to R, flatMap takes T to a Stream of R. Question two separates candidates who know modern Java: same result, different style, and mapMulti avoids creating a stream per element. Question three: listen for equals, hashCode and encounter order, and ask what happens with BigDecimal. Question four is a favourite because the bug compiles and runs; ask for an example where the results differ. Question five tests whether the candidate knows the Java 9 count optimisation. A senior follow-up: how would you remove duplicate customers by city while keeping the whole customer? Answer: toMap keyed by city with a merge function that keeps the first, in L10, or groupingBy in L11. DEMO: run QuizAnswersTest. Question: which question would you ask first?");

  // ===== 14 Pros/cons =====
  s = newSlide("CONTENT", "Practice", "Pros and cons of these operations");
  const pros = ["Each operation has one clear job", "flatMap removes nested loops", "Paging without index arithmetic", "Primitive maps: no boxing, built-in sum/average", "mapMulti: no stream per element [16]", "takeWhile ends early on sorted or infinite input [9]"];
  const consL = ["flatMap with lookups can hide O(n×m) scans", "distinct and sorted buffer elements", "takeWhile is wrong on unsorted input", "mapMulti often needs a type witness", "peek is unreliable for side effects", "In-memory paging loads everything first"];
  [[pros, "Pros", C.accent1, I.plus, 0.5, C.background2], [consL, "Cons / limitations", C.accent4, I.minus, 5.1, "FBECEC"]].forEach(([list, h, colr, ic, x, bg]) => {
    card(s, x, 1.0, 4.4, 3.65, bg, h + " card");
    iconCircle(s, ic, x + 0.2, 1.15, 0.5, colr, h);
    s.addText(h, { x: x + 0.85, y: 1.15, w: 3.3, h: 0.5, fontSize: 18, bold: true, color: colr, margin: 0, valign: "middle", isTextBox: true, objectName: h + " heading" });
    s.addText(bullets(list, 14).map(r => { r.options.paraSpaceAfter = 8; return r; }), { x: x + 0.25, y: 1.85, w: 3.95, h: 2.7, margin: 0, valign: "top", isTextBox: true, objectName: h + " list" });
  });
  s.addNotes("~2 min. A balanced view. On the plus side, each operation does one job, so a pipeline reads like a list of requirements; flatMap replaces nested loops; skip and limit replace paging arithmetic and never throw on the last page; primitive maps avoid boxing; mapMulti avoids a stream per element; and takeWhile can stop early. On the minus side, a flatMap that searches a list for every element is still a nested loop, just hidden, which is why the modern version builds lookup maps first. distinct and sorted buffer elements. takeWhile is only correct on sorted input. mapMulti often needs an explicit type. peek is unreliable for side effects. And paging a stream means the whole list is already in memory, so page in the database for large data. DEMO: show the lookup maps in ModernGoldStatement. Question: where in your code base would flatMap hide a slow nested scan?");

  // ===== 15 Summary =====
  pres.addSection({ title: "Wrap-up" });
  s = newSlide("DARK_TITLE", "Wrap-up", "Summary");
  const sum = ["filter keeps; compare money with compareTo", "map: 1 → 1; mapToInt/Double for numbers; boxed back", "flatMap / mapMulti [16]: 1 → 0..n, flattened", "distinct uses equals/hashCode; peek only to debug", "limit/skip by position; takeWhile/dropWhile [9] by condition, on sorted input"];
  s.addText(bullets(sum, 14, C.background1), { x: 0.5, y: 2.1, w: 5.2, h: 2.9, margin: 0, valign: "top", isTextBox: true, objectName: "summary bullets" });
  card(s, 6.0, 0.6, 3.5, 2.05, "143F32", "exercise card");
  iconCircle(s, I.code, 6.2, 0.78, 0.45, C.accent2, "exercise");
  s.addText([{ text: "Exercise (~30 min)", options: { bold: true, color: C.accent2, breakLine: true } }, { text: "10 graded mini-tasks in Exercise07, from filter to mapMulti. Expected results are in the comments; then remove @Disabled.", options: { color: C.background1, fontSize: 12 } }],
    { x: 6.75, y: 0.75, w: 2.65, h: 1.8, fontSize: 14, margin: 0, valign: "top", isTextBox: true, objectName: "exercise text" });
  card(s, 6.0, 2.85, 3.5, 2.05, "143F32", "next card");
  iconCircle(s, I.rocket, 6.2, 3.03, 0.45, C.accent1, "next");
  s.addText([{ text: "Next: Lesson 08", options: { bold: true, color: C.accent2, breakLine: true } }, { text: "Sorting with Comparators: comparing, thenComparing, reversed and its gotcha, nulls.", options: { color: C.background1, fontSize: 12 } }],
    { x: 6.75, y: 3.0, w: 2.65, h: 1.8, fontSize: 14, margin: 0, valign: "top", isTextBox: true, objectName: "next text" });
  s.addNotes("~3 min. Recap the five points: filter with compareTo for money; map one to one, primitive maps for numbers; flatMap and mapMulti for one to many; distinct depends on equals and hashCode, and peek is only for debugging; limit and skip slice by position, takeWhile and dropWhile by condition on sorted input. The exercise has ten graded mini-tasks in Exercise07, each with its expected result in the comment, so learners know when they are done. Tasks one to four are single filters and maps, five to eight use distinct, flatMap and slicing, and nine and ten need takeWhile on sorted input and mapMulti. Remove @Disabled in Exercise07Test to check. Solution07 is the reference. DEMO: open Exercise07, then run Solution07. Next lesson: sorting with comparators. Question: which task do you expect to take the longest?");

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
})();
