// L01 slide deck generator - ITGreenZone Java Functional Programming
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa");
const { applyTheme } = require("/root/.claude/skills/synced/2eb53c35-a0c8-4343-9257-776fcd7fed67_dd7dcff0-93ee-4601-a8ce-12573fa09cd9/pptx/scripts/apply_theme.js");

const OUT = process.argv[2] || "L01_WhyFP_Slides.pptx";
const LESSON = "01";
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
pres.title = "L01 Why Functional Programming in Java";
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
    target: await icon(fa.FaBullseye), func: await icon(fa.FaExchangeAlt), lock: await icon(fa.FaLock),
    flask: await icon(fa.FaFlask), hour: await icon(fa.FaHourglassHalf), code: await icon(fa.FaCode),
    check: await icon(fa.FaCheck), times: await icon(fa.FaTimes), q: await icon(fa.FaQuestion),
    plus: await icon(fa.FaThumbsUp), minus: await icon(fa.FaExclamationTriangle), rocket: await icon(fa.FaRocket),
    layers: await icon(fa.FaLayerGroup), cogs: await icon(fa.FaCogs),
  };

  // ===== 1 Title + objectives =====
  pres.addSection({ title: "Introduction" });
  let s = newSlide("DARK_TITLE", "Introduction", "Why Functional Programming in Java");
  s.addText("LESSON 01  ·  MODULE 1 FUNCTIONAL FOUNDATIONS", { x: 0.5, y: 0.6, w: 5.5, h: 0.35, fontSize: 12, bold: true, color: C.accent2, charSpacing: 2, margin: 0, isTextBox: true, objectName: "kicker" });
  s.addText("From anonymous classes to lambdas and streams, Java 8 → Java 21", { x: 0.5, y: 3.0, w: 5.0, h: 0.8, fontSize: 16, italic: true, color: C.background2, margin: 0, isTextBox: true, objectName: "subtitle" });
  card(s, 6.0, 0.6, 3.5, 4.3, "143F32", "objectives card");
  s.addText("You will be able to", { x: 6.25, y: 0.75, w: 3.1, h: 0.35, fontSize: 14, bold: true, color: C.accent2, margin: 0, isTextBox: true, objectName: "objectives heading" });
  const objs = ["Explain imperative vs declarative code", "Say what \"functional\" means in Java, and what it does not", "Refactor a strategy class → anonymous class → lambda", "Name the core ideas: functions as values, immutability, purity, laziness", "Place each feature on the Java 8 → 21 timeline"];
  objs.forEach((o, i) => {
    const y = 1.2 + i * 0.72;
    s.addText(String(i + 1), { shape: pres.shapes.OVAL, x: 6.25, y: y + 0.05, w: 0.36, h: 0.36, fill: { color: C.accent1 }, line: { color: C.accent1 }, fontSize: 12, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "objective number " + (i + 1) });
    s.addText(o, { x: 6.75, y, w: 2.6, h: 0.62, fontSize: 12.5, color: C.background1, valign: "middle", margin: 0, isTextBox: true, objectName: "objective " + (i + 1) });
  });
  s.addNotes("~3 min. Welcome everyone to Lesson 01. This lesson answers one question: why should a Java developer care about functional programming? We will not learn every API today. Instead we see the problem that lambdas and streams solve, using one real example: finding transactions over 1,000.00 in our banking dataset. We will rewrite the same filter four times, from a strategy class to a modern Java 21 stream, and the code will shrink each time. Read the five objectives with the class. Point out that everything we run today uses the shared dataset: 10 customers, 15 accounts, 60 transactions, so every number on the slides is real program output. Question to ask: who has used streams at work, and who has written an anonymous class this year?");

  // ===== 2 Problem: imperative vs declarative =====
  pres.addSection({ title: "Theory" });
  s = newSlide("CONTENT", "Theory", "The problem: code that says HOW, not WHAT");
  codeBlock(s, `// Imperative: HOW (loop, if, mutable total)
BigDecimal total = BigDecimal.ZERO;
for (Transaction t : txns) {
    if (t.type() == TxnType.DEBIT) {
        total = total.add(t.amount());
    }
}
return total;`, 0.5, 1.1, 4.4, 2.3, { label: "BEFORE  ·  pre-Java 8", fontSize: 11, name: "imperative code" });
  codeBlock(s, `// Declarative: WHAT (rule + result)
return txns.stream()
    .filter(t -> t.type() == TxnType.DEBIT)
    .map(Transaction::amount)
    .reduce(BigDecimal.ZERO,
            BigDecimal::add);`, 5.1, 1.1, 4.4, 2.3, { label: "AFTER  ·  Java 8 stream", fontSize: 11, name: "declarative code" });
  badge(s, "Java 8", 8.75, 1.15);
  outputBox(s, "Total debits (imperative):  16692.44   ·   Total debits (declarative): 16692.44", 0.5, 3.6, 9.0, 0.45, "debit output");
  s.addText([
    { text: "Imperative: ", options: { bold: true, color: C.accent4 } }, { text: "you manage the loop, the state and the order.   ", options: { color: C.text1 } },
    { text: "Declarative: ", options: { bold: true, color: C.accent1 } }, { text: "you state the rule; the library runs it.", options: { color: C.text1 } },
  ], { x: 0.5, y: 4.3, w: 9, h: 0.6, fontSize: 14, margin: 0, isTextBox: true, objectName: "contrast line" });
  s.addNotes("~3 min. Both blocks compute the total of all DEBIT transactions. Left is how most of us learned Java: create a mutable total, loop, check a condition, add. It works, but the business rule, 'only debits', is buried inside control flow, and the reader must simulate the loop in their head. Right is the declarative version: filter the debits, take the amounts, add them up. Each line is one idea. DEMO: run ImperativeVsDeclarative in the theory package; both print 16692.44, so the result is identical. Stress that declarative does not mean slower or magic: a loop still runs, but the library owns it, which later lets it be lazy or parallel. Question: which version would you rather review in a pull request at 6 pm, and why?");

  // ===== 3 What functional means in Java =====
  s = newSlide("CONTENT", "Theory", "What \"functional\" means in Java");
  s.addText([
    { text: "Java is an object-oriented language with functional features.", options: { bold: true, breakLine: true } },
    { text: "Since Java 8 you can pass behaviour as a value. Java is not a pure FP language: data is mutable by default, there is no tail-call optimisation, and side effects are allowed anywhere. Functional style is a discipline you choose.", options: {} },
  ], { x: 0.5, y: 1.0, w: 9, h: 1.0, fontSize: 14, color: C.text1, margin: 0, valign: "top", isTextBox: true, objectName: "definition" });
  const ideas = [
    [I.func, "Functions as values", "Store, pass and return behaviour: Function, Predicate, lambdas.", "Java 8"],
    [I.lock, "Immutability", "Data that cannot change: records, List.of, new value instead of setters.", "Java 9 / 16"],
    [I.flask, "Pure functions", "Same input → same output, no side effects. Easy to test and reuse.", "Any Java"],
    [I.hour, "Laziness", "Stream steps run only when a terminal operation asks for a result.", "Java 8"],
  ];
  ideas.forEach(([ic, h, d, v], i) => {
    const x = 0.5 + i * 2.3;
    card(s, x, 2.2, 2.1, 2.55, C.background2, "idea card " + h);
    iconCircle(s, ic, x + 0.15, 2.38, 0.55, C.accent1, h);
    badge(s, v, x + 2.1 - 0.15 - 0.8, 2.5, { w: 0.8 });
    s.addText(h, { x: x + 0.15, y: 3.05, w: 1.85, h: 0.4, fontSize: 15, bold: true, color: C.text2, margin: 0, isTextBox: true, objectName: "idea title " + h });
    s.addText(d, { x: x + 0.15, y: 3.45, w: 1.85, h: 1.4, fontSize: 12.5, color: C.text1, margin: 0, valign: "top", isTextBox: true, objectName: "idea text " + h });
  });
  s.addNotes("~3 min. Be precise here, because interviewers ask this. Java did not become Haskell. It stayed object-oriented and added a way to treat behaviour as a value. So 'functional Java' means a style: prefer small functions, immutable data, and pipelines that describe results. Walk through the four core ideas; each one has its own lesson later in the course. Functions as values: L02 to L04. Immutability: records and List.of, L15 and L16. Pure functions: L15. Laziness: L06. The badges show where the support arrived; for example immutable List.of is Java 9 and records are Java 16. Question: can you name something in your current project that is impure, such as a method that reads the clock or a static cache?");

  // ===== 4 Timeline =====
  s = newSlide("CONTENT", "Theory", "Java 8 → 21: the functional timeline");
  const tl = [
    [8, "Lambdas, Streams, Optional, java.util.function", true],
    [9, "List.of, takeWhile / dropWhile, Optional.or", false],
    [10, "var, orElseThrow(), toUnmodifiableList", false],
    [11, "Predicate.not, var in lambdas, isEmpty", true],
    [12, "Collectors.teeing", false],
    [14, "Switch expressions", false],
    [16, "Records, toList(), mapMulti, instanceof patterns", false],
    [17, "Sealed classes", true],
    [21, "Pattern switch, record patterns, sequenced collections, virtual threads", true],
  ];
  const lineY = 2.95;
  s.addShape(pres.shapes.LINE, { x: 1.3, y: lineY, w: 7.44, h: 0, line: { color: C.text2, width: 3 }, objectName: "timeline line" });
  tl.forEach(([v, label, lts], i) => {
    const cx = 1.3 + i * 0.93;
    const up = i % 2 === 0;
    const d = 0.5;
    s.addText(String(v), { shape: pres.shapes.OVAL, x: cx - d / 2, y: lineY - d / 2, w: d, h: d, fill: { color: lts ? C.accent2 : C.accent1 }, line: { color: C.background1, width: 2 }, fontSize: 14, bold: true, color: lts ? C.text1 : C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "version " + v });
    const bw = 1.7, bx = Math.min(Math.max(cx - bw / 2, 0.4), 9.5 - bw);
    s.addText(label, { x: bx, y: up ? 1.15 : 3.35, w: bw, h: 1.45, fontSize: 11.5, color: C.text1, align: "center", valign: up ? "bottom" : "top", margin: 0, isTextBox: true, objectName: "timeline label " + v });
  });
  s.addText([{ text: "LTS  ", options: { bold: true, color: C.accent2 } }, { text: "8 · 11 · 17 · 21     ", options: { color: C.text1 } },
    { text: "Beyond Java 21: ", options: { bold: true, color: C.accent5 } }, { text: "unnamed variables _ (22), Stream Gatherers (24)", options: { color: C.accent5 } }],
    { x: 0.5, y: 4.85, w: 9, h: 0.32, fontSize: 12, margin: 0, isTextBox: true, objectName: "lts note" });
  s.addNotes("~3 min. This timeline is the map for the whole course. Amber circles are long-term-support releases: 8, 11, 17 and 21, the versions companies actually run. Java 8 was the big bang: lambdas, streams, Optional and the java.util.function interfaces. After that, each release added smaller but useful pieces: immutable List.of in 9, var in 10, Predicate.not in 11, teeing in 12, records and Stream.toList in 16, sealed classes in 17, and pattern matching for switch in 21. DEMO: run FeatureTimeline; it builds this exact list with groupingBy into a TreeMap, so it is also a preview of L11. Remind the class that we always tag APIs with a version badge, so nobody uses toList() on a Java 11 server by mistake. Question: which Java version does your production system run today?");

  // ===== 5 Behaviour parameterisation visual =====
  pres.addSection({ title: "Worked example" });
  s = newSlide("CONTENT", "Worked example", "Behaviour parameterisation: the code shrinks");
  s.addText("One business rule: \"a transaction is high value when amount > 1,000.00\". The filter loop is written once; only the rule changes.", { x: 0.5, y: 0.95, w: 9, h: 0.5, fontSize: 14, color: C.text1, margin: 0, isTextBox: true, objectName: "rule statement" });
  const steps = [
    ["0", "Hard-coded loop", "copy the loop for every rule", "—", C.accent4],
    ["1", "Strategy class", "named class + new file", "~13 lines", C.accent5],
    ["2", "Anonymous class", "inline, still ceremony", "6 lines", C.accent3],
    ["3", "Lambda", "just the rule", "1 line", C.accent1],
  ];
  steps.forEach(([n, h, d, lines, col], i) => {
    const x = 0.5 + i * 2.3;
    card(s, x, 1.65, 2.1, 2.45, C.background2, "step card " + n);
    s.addText("STEP " + n, { x: x + 0.15, y: 1.78, w: 1.8, h: 0.28, fontSize: 11, bold: true, color: col, margin: 0, isTextBox: true, objectName: "step label " + n });
    s.addText(h, { x: x + 0.15, y: 2.06, w: 1.8, h: 0.4, fontSize: 15, bold: true, color: C.text2, margin: 0, isTextBox: true, objectName: "step title " + n });
    s.addText(lines, { x: x + 0.15, y: 2.5, w: 1.8, h: 0.8, fontSize: 30, bold: true, color: col, fontFace: THEME.headFontFace, margin: 0, isTextBox: true, objectName: "step lines " + n });
    s.addText(d, { x: x + 0.15, y: 3.35, w: 1.8, h: 0.6, fontSize: 12.5, color: C.text1, margin: 0, valign: "top", isTextBox: true, objectName: "step desc " + n });
    if (i < steps.length - 1) s.addShape(pres.shapes.RIGHT_ARROW, { x: x + 2.12, y: 2.75, w: 0.16, h: 0.25, fill: { color: C.accent2 }, line: { color: C.accent2 }, objectName: "arrow " + n });
  });
  outputBox(s, "All steps → 11 over 1000.00 [T003, T019, T025, T026, T027, T038, T039, T042, T049, T055, T056]", 0.5, 4.3, 9.0, 0.45, "eleven output");
  s.addText("Step 4 (next slides): Stream API removes the loop itself; Java 16 adds toList().", { x: 0.5, y: 4.82, w: 9, h: 0.3, fontSize: 12, italic: true, color: C.accent5, margin: 0, isTextBox: true, objectName: "step 4 note" });
  s.addNotes("~3 min. Behaviour parameterisation is the key idea of the lesson: write the loop once and pass the behaviour, the rule, as an argument. Step 0 hard-codes the rule, so every new rule means copying the loop. Step 1 is the classic strategy pattern: an interface plus a named class, about 13 lines and a new file for one condition. Step 2 inlines it as an anonymous class: 6 lines, still mostly ceremony. Step 3 is a lambda: one line that is only the rule. DEMO: run HighValueFilterTest; one parameterised test proves all seven versions return exactly the same 11 transaction IDs. Question: in step 1, how many of those 13 lines contain actual business logic? The answer is one, the compareTo line.");

  // ===== 6 Before code =====
  s = newSlide("CONTENT", "Worked example", "Before Java 8: strategy class and anonymous class");
  codeBlock(s, `interface TransactionFilter {
    boolean matches(Transaction txn);
}
class HighValueFilter
        implements TransactionFilter {
    private final BigDecimal threshold;
    // constructor sets threshold ...
    public boolean matches(Transaction t) {
        return t.amount()
                .compareTo(threshold) > 0;
    }
}
filter(txns, new HighValueFilter(THRESHOLD));`, 0.5, 1.05, 4.4, 3.75, { label: "STEP 1  ·  strategy class (before/)", fontSize: 10.5, name: "strategy code" });
  codeBlock(s, `filter(txns, new TransactionFilter() {
    @Override
    public boolean matches(Transaction t) {
        return t.amount()
                .compareTo(THRESHOLD) > 0;
    }
});`, 5.1, 1.05, 4.4, 2.3, { label: "STEP 2  ·  anonymous class (Java 1.1+)", fontSize: 10.5, name: "anonymous code" });
  card(s, 5.1, 3.55, 4.4, 1.25, C.background2, "pain card");
  s.addText(bullets(["1 line of logic, 5+ lines of ceremony", "A new class or file per rule", "Hard to read, easy to get wrong"], 13), { x: 5.25, y: 3.62, w: 4.1, h: 1.1, margin: 0, valign: "middle", isTextBox: true, objectName: "pain points" });
  s.addNotes("~2 min. Here is the real code from the before package. Left: the strategy interface TransactionFilter and the HighValueFilter class. Notice the interface has exactly one abstract method, matches. Keep that in mind, it matters on the next slide. Right: the anonymous class version, which saves the separate file but still needs new, the interface name, @Override, the method signature and the braces. DEMO: run StrategyClassDemo and AnonymousClassDemo; both print 11 matches. This is the code style many legacy banking systems still have, often with dozens of these little classes. Question: if the business adds a second rule, debit only and over 1,000.00, what would you have to write in each style?");

  // ===== 7 After code =====
  s = newSlide("CONTENT", "Worked example", "After: lambda and the Stream API (Java 8)");
  codeBlock(s, `// Same OLD interface, one abstract method
// -> the lambda IS matches(...)
filter(txns,
    t -> t.amount().compareTo(THRESHOLD) > 0);`, 0.5, 1.05, 4.4, 1.75, { label: "STEP 3  ·  lambda (after/LambdaDemo)", fontSize: 10.5, name: "lambda code" });
  badge(s, "Java 8", 4.15, 1.1);
  codeBlock(s, `// No hand-written loop, no custom interface
List<String> ids = txns.stream()
    .filter(t -> t.amount()
                  .compareTo(THRESHOLD) > 0)
    .map(Transaction::id)
    .collect(Collectors.toList());`, 5.1, 1.05, 4.4, 1.75, { label: "STEP 4  ·  stream (after/StreamDemo)", fontSize: 10.5, name: "stream code" });
  badge(s, "Java 8", 8.75, 1.1);
  outputBox(s, "Lambda:          11 over 1000.00 [T003, T019, T025, … T056]\nStream (Java 8): 11 over 1000.00 [T003, T019, T025, … T056]", 0.5, 3.0, 9.0, 0.7, "after output");
  const lambdaParts = [["t", "parameter"], ["->", "arrow"], ["t.amount().compareTo(THRESHOLD) > 0", "body = the rule (returns boolean)"]];
  let lx = 0.5;
  lambdaParts.forEach(([code, lab], i) => {
    const w = [0.8, 0.8, 4.3][i];
    s.addText(code, { x: lx, y: 3.95, w, h: 0.45, fontFace: MONO, fontSize: 12, bold: true, color: C.background1, fill: { color: [C.accent3, C.accent2, C.accent1][i] }, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "lambda part " + lab });
    s.addText(lab, { x: lx, y: 4.45, w, h: 0.35, fontSize: 11.5, color: C.text1, align: "center", margin: 0, isTextBox: true, objectName: "lambda label " + lab });
    lx += w + 0.1;
  });
  s.addText("A lambda works with any interface that has one abstract method — even one written before Java 8.", { x: 7.1, y: 3.9, w: 2.4, h: 0.95, fontSize: 12, italic: true, color: C.text2, margin: 0, valign: "middle", isTextBox: true, objectName: "sam note" });
  s.addNotes("~3 min. Step 3 is the surprise: we did not change the old TransactionFilter interface at all. Because it has a single abstract method, the compiler accepts a lambda wherever a TransactionFilter is expected. The lambda body becomes the implementation of matches. That is called target typing, and it is why old Comparator and Runnable code converts so easily. Step 4 goes further: the Stream API gives us filter, map and collect, so we need neither our own loop nor our own interface. Break the lambda down using the coloured boxes: parameter, arrow, body. DEMO: run LambdaDemo and StreamDemo and show the same 11 IDs. Question: what type does the compiler infer for t, and how does it know?");

  // ===== 8 Modern =====
  s = newSlide("CONTENT", "Worked example", "Modern Java (9–21): the same filter, cleaner");
  codeBlock(s, `List<String> ids = txns.stream()
    .filter(HighValueRule::isHighValue) // method ref
    .map(Transaction::id)               // record accessor
    .toList();                          // unmodifiable

long rest = txns.stream()
    .filter(Predicate.not(HighValueRule::isHighValue))
    .count();                           // 49

txns.stream()
    .filter((final var t) -> isHighValue(t)) // var
    .map(Transaction::id)
    .toList();`, 0.5, 1.05, 5.9, 3.75, { label: "STEP 5  ·  modern/ModernDemo", fontSize: 10.5, name: "modern code" });
  const mod = [["Java 8", "Method reference to a named rule"], ["Java 16", "Records: Transaction::id accessor"], ["Java 16", "Stream.toList() — unmodifiable"], ["Java 11", "Predicate.not(...)"], ["Java 11", "var in lambda parameters"]];
  mod.forEach(([v, t], i) => {
    const y = 1.1 + i * 0.58;
    badge(s, v, 6.65, y + 0.1, { w: 0.75 });
    s.addText(t, { x: 7.5, y, w: 2.0, h: 0.46, fontSize: 12, color: C.text1, margin: 0, valign: "middle", isTextBox: true, objectName: "modern item " + i });
  });
  outputBox(s, "11 over 1000.00 · not high value: 49 · var: true", 6.6, 4.1, 2.9, 0.7, "modern output");
  s.addNotes("~3 min. Same rule, written the way we write it in a Java 21 codebase. First, the rule has a name, HighValueRule::isHighValue, so the pipeline reads like a sentence. Transaction is a record, so Transaction::id is a free accessor. toList() arrived in Java 16 and returns an unmodifiable list, unlike Collectors.toList(), which makes no promise. Predicate.not in Java 11 lets us negate a method reference: 49 transactions are not high value. Finally, var in lambda parameters, Java 11, is only useful when you need a modifier or annotation such as final. DEMO: run ModernDemo; the output box shows the real results. Question: if you call add on the list returned by toList(), what happens? Answer: UnsupportedOperationException.");

  // ===== 9 API table =====
  pres.addSection({ title: "Reference" });
  s = newSlide("CONTENT", "Reference", "API used in this lesson");
  const hdr = ["API", "Signature", "Returns", "Since", "Use in L01"].map(t => ({ text: t, options: { bold: true, color: C.background1, fill: { color: C.text2 } } }));
  const rows = [
    ["Predicate<T>", "boolean test(T t)", "boolean", "8", "the high-value rule"],
    ["Function<T,R>", "R apply(T t)", "R", "8", "ADD_GST, discountOf"],
    ["Function.andThen", "andThen(Function<? super R,? extends V>)", "Function<T,V>", "8", "discount, then GST"],
    ["Stream.filter", "filter(Predicate<? super T>)", "Stream<T>", "8", "keep matches"],
    ["Stream.map", "map(Function<? super T,? extends R>)", "Stream<R>", "8", "Transaction → id"],
    ["Stream.reduce", "reduce(T identity, BinaryOperator<T>)", "T", "8", "sum BigDecimal"],
    ["Collectors.toList", "toList()", "Collector → List", "8", "no mutability promise"],
    ["List.of", "of(E... elements)", "List<E>", "9", "immutable sample data"],
    ["Predicate.not", "not(Predicate<? super T>)", "Predicate<T>", "11", "count the rest"],
    ["Stream.toList", "toList()", "List<T>", "16", "unmodifiable result"],
    ["record", "record Transaction(...)", "—", "16", "immutable data carrier"],
  ].map((r, i) => r.map((c, j) => ({ text: j === 3 ? "Java " + c : c, options: Object.assign({ fill: { color: i % 2 ? C.background1 : C.background2 }, color: C.text1 },
    j === 1 ? { fontFace: MONO, fontSize: 9.5 } : {}, j === 3 ? { bold: true, color: Number(c) > 8 ? C.accent4 : C.accent1 } : {}, j === 0 ? { bold: true, fontFace: MONO, fontSize: 10 } : {}) })));
  s.addTable([hdr, ...rows], { x: 0.5, y: 1.0, w: 9.0, colW: [1.55, 3.25, 1.45, 0.75, 2.0], fontSize: 10.5, rowH: 0.33, border: { type: "solid", pt: 0.5, color: "D5E3DA" }, valign: "middle", margin: [2, 5, 2, 5], objectName: "api table" });
  s.addNotes("~2 min. This is the reference table for the lesson; learners will also find it on the cheat sheet. Do not read every row. Point out the pattern instead: everything in green arrived in Java 8, the foundation, and everything in red came later, so check your target version before using it. Highlight three rows. Predicate and Function are the two functional interfaces we used today; L02 covers the whole java.util.function package. Stream.filter and map take a Predicate and a Function, which is why a lambda fits there. And Collectors.toList versus Stream.toList: same name, different guarantees, a classic interview trap. Question: which row would fail to compile on a Java 11 server? Answer: Stream.toList and records, both Java 16.");

  // ===== 10 Core ideas in code =====
  pres.addSection({ title: "Core ideas" });
  s = newSlide("CONTENT", "Core ideas", "Core ideas in code: functions as values and purity");
  codeBlock(s, `// store a function in a variable
Function<BigDecimal, BigDecimal> ADD_GST =
    a -> a.multiply(new BigDecimal("1.09"))
          .setScale(2, RoundingMode.HALF_UP);

// pass it, return it, compose it
applyToAll(prices, ADD_GST);
applyToAll(prices, discountOf(10));
applyToAll(prices,
    discountOf(10).andThen(ADD_GST));`, 0.5, 1.05, 4.6, 2.75, { label: "theory/FunctionsAsValues", fontSize: 10.5, name: "functions code" });
  outputBox(s, "GST       → [109.00, 65.29]\n10% off   → [90.00, 53.91]\nboth      → [98.10, 58.76]", 0.5, 3.95, 4.6, 0.85, "functions output");
  card(s, 5.35, 1.05, 4.15, 1.65, C.background2, "pure card");
  iconCircle(s, I.check, 5.5, 1.2, 0.45, C.accent1, "pure");
  s.addText([{ text: "Pure  transferFee(2500.00)", options: { bold: true, breakLine: true, color: C.text2 } }, { text: "call 1 → 12.50   call 2 → 12.50", options: { fontFace: MONO, fontSize: 11.5, breakLine: true } }, { text: "Depends only on its input.", options: { italic: true } }],
    { x: 6.1, y: 1.15, w: 3.3, h: 1.45, fontSize: 13, color: C.text1, margin: 0, valign: "middle", isTextBox: true, objectName: "pure text" });
  card(s, 5.35, 2.9, 4.15, 1.8, "FBECEC", "impure card");
  iconCircle(s, I.times, 5.5, 3.05, 0.45, C.accent4, "impure");
  s.addText([{ text: "Impure  (reads a mutable rate)", options: { bold: true, breakLine: true, color: C.accent4 } }, { text: "call 1 → 12.50   call 2 → 25.00", options: { fontFace: MONO, fontSize: 11.5, breakLine: true } }, { text: "Same input, different answer: hard to test, unsafe to share.", options: { italic: true } }],
    { x: 6.1, y: 3.0, w: 3.3, h: 1.6, fontSize: 13, color: C.text1, margin: 0, valign: "middle", isTextBox: true, objectName: "impure text" });
  s.addNotes("~3 min. Two core ideas with real code. Left: ADD_GST is a Function stored in a constant, exactly like a number or a String. applyToAll takes a function as a parameter, discountOf returns a function, and andThen composes two functions into one: ten percent off, then nine percent GST. The output box shows the real results with HALF_UP rounding to two decimals; we never use double for money. Right: purity. transferFee always returns 12.50 for 2,500.00. The impure calculator reads a mutable rate field, so after someone changes the rate the same input returns 25.00. DEMO: run FunctionsAsValues and PureFunctions. Question: why is the pure version easier to test with @ParameterizedTest, and safe to call from many threads?");

  // ===== 11 Laziness =====
  s = newSlide("CONTENT", "Core ideas", "Laziness: nothing runs until the terminal op");
  const belt = [["source", "T001…T004"], ["filter", "amount > 200.00"], ["map", "Transaction::id"], ["toList()", "terminal op"]];
  belt.forEach(([h, d], i) => {
    const x = 0.5 + i * 2.32;
    const fill = i === 3 ? C.accent2 : (i === 0 ? C.text2 : C.accent1);
    s.addText([{ text: h, options: { bold: true, fontSize: 15, breakLine: true, fontFace: MONO } }, { text: d, options: { fontSize: 11.5 } }],
      { shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.08, x, y: 1.05, w: 2.0, h: 0.85, fill: { color: fill }, line: { color: fill }, color: i === 3 ? C.text1 : C.background1, align: "center", valign: "middle", margin: 2, isTextBox: true, objectName: "belt " + h });
    if (i < 3) s.addShape(pres.shapes.RIGHT_ARROW, { x: x + 2.04, y: 1.35, w: 0.24, h: 0.26, fill: { color: C.accent5 }, line: { color: C.accent5 }, objectName: "belt arrow " + i });
  });
  codeBlock(s, `  filter T001
  filter T002
  filter T003
  map    T003
  filter T004
  map    T004
   result = [T003, T004]`, 0.5, 2.15, 3.6, 2.6, { label: "Printed by peek(): one element at a time", fontSize: 13, name: "trace" });
  s.addText(bullets([
    [{ text: "No terminal operation → ", options: { bold: true } }, { text: "nothing printed at all." }],
    [{ text: "Vertical, not horizontal: ", options: { bold: true } }, { text: "each element goes through filter and map before the next starts (loop fusion)." }],
    [{ text: "Short-circuit: ", options: { bold: true } }, { text: "limit(2) stopped early." }],
  ], 14), { x: 4.35, y: 2.15, w: 3.1, h: 2.6, margin: 0, valign: "top", isTextBox: true, objectName: "laziness bullets" });
  card(s, 7.65, 2.15, 1.85, 2.6, C.background2, "stat card");
  s.addText([{ text: "19", options: { fontSize: 48, bold: true, color: C.accent1, fontFace: THEME.headFontFace, breakLine: true } }, { text: "of 60 transactions inspected to find the first 2 over 1,000.00", options: { fontSize: 12, color: C.text1 } }],
    { x: 7.75, y: 2.25, w: 1.65, h: 2.4, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "stat 19" });
  s.addNotes("~3 min. Think of a stream as a conveyor belt that only starts when someone at the end asks for a result. DEMO: run LazinessDemo. Part 1 builds a pipeline with no terminal operation and prints nothing. Part 2 adds toList() and the trace appears; read it aloud with the class. T001 and T002 are filtered out, T003 passes filter and immediately goes to map, before T004 is even looked at. That is loop fusion: one pass, not one pass per operation. Part 3 uses limit(2) on all 60 transactions and stops after inspecting only 19. Note: we use peek only to make the flow visible; it is a debugging tool, not for business logic. Question: predict what prints if we remove toList() from part 2. Answer: nothing.");

  // ===== 12 Pitfalls & best practices =====
  pres.addSection({ title: "Practice" });
  s = newSlide("CONTENT", "Practice", "Pitfalls and best practices");
  codeBlock(s, `// DON'T: side effect fills an outside list
List<String> ids = new ArrayList<>();
txns.stream().filter(HighValueRule::isHighValue)
    .forEach(t -> ids.add(t.id()));

// DO: return the result from the pipeline
List<String> ids = txns.stream()
    .filter(HighValueRule::isHighValue)
    .map(Transaction::id)
    .toList();`, 0.5, 1.05, 4.6, 3.0, { label: "Pitfall 1 and its fix", fontSize: 10.5, name: "pitfall code" });
  s.addText([
    { text: "Pitfall 2: ", options: { bold: true, color: C.accent4 } }, { text: "expecting map/peek to run without a terminal op.  ", options: {} },
    { text: "Pitfall 3: ", options: { bold: true, color: C.accent4 } }, { text: "double for money: always BigDecimal, scale 2, HALF_UP.", options: {} },
  ], { x: 0.5, y: 4.15, w: 4.6, h: 0.95, fontSize: 12.5, color: C.text1, margin: 0, valign: "top", isTextBox: true, objectName: "more pitfalls" });
  const dos = [["Do", "Keep lambdas short; extract rules into named methods", C.accent1, I.check], ["Do", "Prefer immutable data: records, List.of, toList()", C.accent1, I.check], ["Do", "One stream operation per line", C.accent1, I.check], ["Don't", "Mutate shared state inside a lambda", C.accent4, I.times], ["Don't", "Rewrite every loop as a stream just because you can", C.accent4, I.times]];
  dos.forEach(([k, t, col, ic], i) => {
    const y = 1.05 + i * 0.8;
    iconCircle(s, ic, 5.35, y + 0.1, 0.42, col, "do " + i);
    s.addText([{ text: k + "  ", options: { bold: true, color: col } }, { text: t, options: { color: C.text1 } }], { x: 5.9, y, w: 3.6, h: 0.62, fontSize: 13, margin: 0, valign: "middle", isTextBox: true, objectName: "do text " + i });
  });
  s.addNotes("~3 min. The most common mistake when people start with streams is pitfall 1: they keep the imperative habit and fill an outside ArrayList from forEach. It works on one thread and silently breaks with parallel streams, and the code is no clearer than a loop. The fix is to let the pipeline return the result. Pitfall 2 we saw on the laziness slide. Pitfall 3 is about our domain: money is always BigDecimal with scale 2 and HALF_UP. Then the best practices on the right, which are also the coding standards for every lesson in this course. Stress the last one: streams are a tool, not a religion; complex control flow is often clearer as a loop, and L18 covers when not to use streams. Question: why does pitfall 1 break with parallel()?");

  // ===== 13 Interview questions =====
  s = newSlide("CONTENT", "Practice", "Interview questions");
  const qa = [
    ["Is Java a functional language?", "No. It is object-oriented with functional features since Java 8. Data is mutable by default and side effects are allowed."],
    ["What is behaviour parameterisation?", "Passing behaviour as an argument so one method serves many rules: strategy → anonymous class → lambda."],
    ["Imperative vs declarative?", "Imperative says how (loops, state). Declarative says what; the library controls iteration, so it can be lazy or parallel."],
    ["What is a pure function, and why care?", "Same input → same output, no side effects. Easy to test, cache and run on many threads."],
    ["Why does a lambda fit a pre-Java-8 interface?", "Any interface with one abstract method is a functional interface. The lambda's target type decides which one."],
  ];
  qa.forEach(([q, a], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = i === 4 ? 0.5 : 0.5 + col * 4.6, y = 1.0 + row * 1.38, w = i === 4 ? 9.0 : 4.4;
    card(s, x, y, w, 1.22, C.background2, "qa card " + i);
    s.addText("Q" + (i + 1), { shape: pres.shapes.OVAL, x: x + 0.12, y: y + 0.14, w: 0.42, h: 0.42, fill: { color: C.text2 }, line: { color: C.text2 }, fontSize: 11, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "q badge " + i });
    s.addText([{ text: q, options: { bold: true, color: C.text2, breakLine: true } }, { text: a, options: { color: C.text1, fontSize: 12 } }], { x: x + 0.65, y: y + 0.06, w: w - 0.8, h: 1.1, fontSize: 13, margin: 0, valign: "middle", isTextBox: true, objectName: "qa text " + i });
  });
  s.addNotes("~3 min. Five questions that come up in Java interviews at junior to senior level. Run this as a quick round: read the question, give the class ten seconds, then reveal the answer. For question 1, a strong answer mentions what Java does not have: no immutability by default, no tail-call optimisation, side effects allowed. For question 2, ask someone to name the three steps we coded today. For question 5, the key words are 'single abstract method' and 'target type'; @FunctionalInterface is optional and only adds a compile-time check, which is the topic of L02. Encourage learners to answer in two sentences, not ten. Question to ask: which of these five did you find hardest to explain in your own words?");

  // ===== 14 Pros & Cons =====
  s = newSlide("CONTENT", "Practice", "Pros and cons of functional style in Java");
  const pros = ["Less boilerplate: the rule is the code", "Intent is readable: filter, map, reduce", "Composable: andThen, and, or", "Pure functions are easy to test", "Laziness and short-circuiting for free", "Parallelism is an opt-in, not a rewrite"];
  const cons = ["Learning curve for teams new to it", "Stack traces and debugging are harder", "Small overhead (lambdas, boxing) in hot loops", "Checked exceptions fit badly in lambdas", "Clever one-liners can hurt readability", "Poor fit for complex, stateful control flow"];
  [[pros, "Pros", C.accent1, I.plus, 0.5, C.background2], [cons, "Cons / limitations", C.accent4, I.minus, 5.1, "FBECEC"]].forEach(([list, h, col, ic, x, bg]) => {
    card(s, x, 1.0, 4.4, 3.65, bg, h + " card");
    iconCircle(s, ic, x + 0.2, 1.15, 0.5, col, h);
    s.addText(h, { x: x + 0.85, y: 1.15, w: 3.3, h: 0.5, fontSize: 18, bold: true, color: col, margin: 0, valign: "middle", isTextBox: true, objectName: h + " heading" });
    s.addText(bullets(list, 15).map(r => { r.options.paraSpaceAfter = 10; return r; }), { x: x + 0.25, y: 1.85, w: 3.95, h: 3.05, margin: 0, valign: "top", isTextBox: true, objectName: h + " list" });
  });
  s.addNotes("~2 min. A fair, balanced view, because a good architect knows the costs as well as the benefits. On the left, the benefits we saw today: less boilerplate, clearer intent, composition with andThen, easy testing of pure functions, and laziness. On the right, the real limitations. Debugging a long pipeline is harder than stepping through a loop, though IntelliJ's stream debugger helps, which we cover in L18. Lambdas and boxing add a little overhead, which only matters in very hot code and must be measured, not guessed. Checked exceptions are awkward, covered in L03 and L17. And overly clever one-liners are a real code-review problem. Question: from your own projects, which con worries you most?");

  // ===== 15 Summary =====
  pres.addSection({ title: "Wrap-up" });
  s = newSlide("DARK_TITLE", "Wrap-up", "Summary");
  const sum = ["Declarative code states WHAT; the library handles HOW", "Java = OO + functional features since Java 8; not pure FP", "Behaviour parameterisation: strategy → anonymous → lambda", "Core ideas: functions as values, immutability, purity, laziness", "Any one-abstract-method interface accepts a lambda"];
  s.addText(bullets(sum, 14, C.background1), { x: 0.5, y: 2.2, w: 5.2, h: 2.8, margin: 0, valign: "top", isTextBox: true, objectName: "summary bullets" });
  card(s, 6.0, 0.6, 3.5, 2.05, "143F32", "exercise card");
  iconCircle(s, I.code, 6.2, 0.78, 0.45, C.accent2, "exercise");
  s.addText([{ text: "Exercise (~20 min)", options: { bold: true, color: C.accent2, breakLine: true } }, { text: "Rewrite the anonymous Comparator and Runnable in LegacyBatchJobs as lambdas in Exercise01. Remove @Disabled and make the tests pass.", options: { color: C.background1, fontSize: 12 } }],
    { x: 6.75, y: 0.75, w: 2.65, h: 1.8, fontSize: 14, margin: 0, valign: "top", isTextBox: true, objectName: "exercise text" });
  card(s, 6.0, 2.85, 3.5, 2.05, "143F32", "next card");
  iconCircle(s, I.rocket, 6.2, 3.03, 0.45, C.accent1, "next");
  s.addText([{ text: "Next: Lesson 02", options: { bold: true, color: C.accent2, breakLine: true } }, { text: "Functional Interfaces: rules and standards. SAM, @FunctionalInterface, java.util.function and composition.", options: { color: C.background1, fontSize: 12 } }],
    { x: 6.75, y: 3.0, w: 2.65, h: 1.8, fontSize: 14, margin: 0, valign: "top", isTextBox: true, objectName: "next text" });
  s.addNotes("~3 min. Recap the five points; ask a different learner to explain each one in a sentence. Then introduce the exercise. Open the exercise package in IntelliJ: LegacyBatchJobs has a Comparator for customers by joined date, a Comparator for accounts by balance with the highest first, and a Runnable that prints the month-end banner. Learners rewrite each as a lambda in Exercise01, then remove @Disabled from Exercise01Test. The test compares their output to the legacy code, so it proves behaviour is identical: the expected banner is 15 accounts with a total balance of 300382.25. Give 20 minutes, then walk through Solution01. Next lesson goes deep on functional interfaces. Question: before L02, what do you think makes Comparator a functional interface even though it declares equals?");

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
})();
