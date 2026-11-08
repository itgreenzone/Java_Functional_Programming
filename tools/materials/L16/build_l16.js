// L16 slide deck generator - ITGreenZone Java Functional Programming
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa");
const { applyTheme } = require("/root/.claude/skills/synced/2eb53c35-a0c8-4343-9257-776fcd7fed67_dd7dcff0-93ee-4601-a8ce-12573fa09cd9/pptx/scripts/apply_theme.js");

const OUT = process.argv[2] || "L16_RecordsSealedPatterns_Slides.pptx";
const LESSON = "16";
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
pres.title = "L16 Records, Sealed Types & Pattern Matching";
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
  let s = newSlide("DARK_TITLE", "Introduction", "Records, Sealed Types & Pattern Matching");
  s.addText("LESSON 16  ·  MODULE 3  ·  JAVA 16–21", { x: 0.5, y: 0.6, w: 5.5, h: 0.35, fontSize: 12, bold: true, color: C.accent2, charSpacing: 2, margin: 0, isTextBox: true, objectName: "kicker" });
  s.addText("records · compact constructors · sealed interfaces · instanceof patterns · switch expressions · record patterns · guards · sequenced collections", { x: 0.5, y: 3.15, w: 5.0, h: 0.9, fontSize: 15, italic: true, color: C.background2, margin: 0, isTextBox: true, objectName: "subtitle" });
  card(s, 6.0, 0.6, 3.5, 4.3, "143F32", "objectives card");
  s.addText("You will be able to", { x: 6.25, y: 0.75, w: 3.1, h: 0.35, fontSize: 14, bold: true, color: C.accent2, margin: 0, isTextBox: true, objectName: "objectives heading" });
  ["Validate data in compact constructors", "Model outcomes with sealed records", "Use instanceof and switch patterns", "Write exhaustive switches with guards", "Use getFirst/getLast/reversed [21]"].forEach((o, i) => {
    const y = 1.2 + i * 0.72;
    s.addText(String(i + 1), { shape: pres.shapes.OVAL, x: 6.25, y: y + 0.05, w: 0.36, h: 0.36, fill: { color: C.accent1 }, line: { color: C.accent1 }, fontSize: 12, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "objective number " + (i + 1) });
    s.addText(o, { x: 6.75, y, w: 2.6, h: 0.62, fontSize: 12.5, color: C.background1, valign: "middle", margin: 0, isTextBox: true, objectName: "objective " + (i + 1) });
  });
  s.addNotes("~2 min. Java 16 to 21 added the features that make functional design in Java feel natural: records for immutable data, sealed interfaces to close a set of alternatives, and pattern matching to take data apart safely. Together they give Java algebraic data types: a payment result is exactly one of approved, declined, pending or refunded, and the compiler checks that every case is handled. We also cover switch expressions, record patterns with guards, and the Java 21 sequenced collections. The worked example refactors a payment outcome report from if-else chains, through a classic class hierarchy, to sealed records with pattern switches. The exercise models insurance claim outcomes. DEMO: open package l16_records_sealed. Question: where does your code use a status field plus nullable columns?");

  // ===== 2 Problem =====
  pres.addSection({ title: "Records and sealed types" });
  s = newSlide("CONTENT", "Records and sealed types", "The problem: status flags and if/else chains");
  codeBlock(s, `for (Payment p : payments) {
  if (p.status() == SUCCESS) {
    approved++; settled = settled.add(p.amount());
    lines.add(p.id() + " APPROVED " + ..);
  } else if (p.status() == FAILED) {
    declined++; lines.add(.. " DECLINED " ..);
  } else if (p.status() == PENDING) {
    pending++; lines.add(.. " PENDING since " ..);
  } else {                 // everything else!
    refunded++; lines.add(.. " REFUNDED " ..);
  }
}`, 0.5, 1.05, 5.3, 3.3, { label: "BEFORE  ·  before/LegacyOutcomeReport", fontSize: 9.5, name: "legacy code" });
  codeBlock(s, `sealed interface PaymentResult
  permits Approved, Declined,
          Pending, Refunded { }

switch (result) {
  case Approved(var id, var m, var amt)
       when amt >= 1000 -> ..
  case Approved a  -> ..
  case Declined d  -> ..
  case Pending p   -> ..
  case Refunded r  -> ..
}   // no default: exhaustive`, 5.95, 1.05, 3.55, 3.3, { label: "MODERN  ·  sealed + patterns", fontSize: 9.5, name: "modern code" });
  outputBox(s, "All 3: P005 APPROVED large PAYNOW 1500.00 · P008 PENDING since 2026-11-03T07:20:00Z … APPROVED=8 DECLINED=2 PENDING=1 REFUNDED=1 settled=2999.19", 0.5, 4.5, 9.0, 0.5, "problem output");
  s.addNotes("~3 min. The business question: describe each payment's outcome and summarise counts and the settled total. The legacy loop branches on the status enum and builds strings with four counters. The dangerous line is the final else: a new status, say CHARGEBACK, would silently be reported as refunded. The modern version turns each outcome into a record carrying exactly the data that outcome has: an approved payment has an amount, a pending one has a timestamp. A sealed interface lists the four permitted records, so a switch over it needs no default, and the compiler fails the build if a case is missing. The three versions in the repo print the same thirteen lines. DEMO: run LegacyOutcomeReport. Question: what would happen to a new CHARGEBACK status in the legacy code?");

  // ===== 3 Records =====
  s = newSlide("CONTENT", "Records and sealed types", "Records: validate, normalise, compare by value");
  codeBlock(s, `record Money(String currency, BigDecimal amount) {
  Money {                                          // compact constructor
    Objects.requireNonNull(currency, "currency");
    if (!currency.matches("[A-Z]{3}")) throw new IllegalArgumentException(..);
    amount = amount.setScale(2, RoundingMode.HALF_UP);   // normalise
  }
  Money plus(Money other) {                        // refuses SGD + USD
    if (!currency.equals(other.currency)) throw new IllegalArgumentException("currency mismatch: ..");
    return new Money(currency, amount.add(other.amount));
  }
}
List<String> topSpenders(..) {
  record AccountTotal(String account, BigDecimal total) { }   // LOCAL record [16]
  ..
}`, 0.5, 1.05, 9.0, 3.0, { label: "theory/RecordsInPipelines", fontSize: 9.5, name: "rec code" });
  tbl(s, ["Call", "Real result"], [
    ["Money.of(\"SGD\", \"10.005\") · Money.of(\"sgd\", ..) · SGD plus USD", "SGD 10.01 · 3 capital letters: sgd · currency mismatch: SGD vs USD"],
    ["debits: toMap(currency, Money::of, Money::plus, TreeMap::new)", "{SGD=SGD 15244.95, USD=USD 1447.49}"],
    ["Money.of(\"SGD\", \"5\").equals(Money.of(\"SGD\", \"5.00\"))", "true (normalised in the constructor)"],
  ], 0.5, 4.15, 9.0, [4.9, 4.1], 0.27, "rec table", [0], 9);
  s.addNotes("~3 min. Records are immutable data carriers with generated constructor, accessors, equals, hashCode and toString. The compact constructor is where validation and normalisation belong: Money rejects a null or lower-case currency and rounds the amount to two decimals with HALF_UP, the course rule. Behaviour that protects the data belongs in the record too: plus refuses to add SGD to USD, which earlier lessons showed is a real bug. Used as the merge function of toMap, it gives clean totals per currency. Because the amount is normalised, five and five point zero zero are equal money. Local records, declared inside a method, give a name to an intermediate pipeline result without polluting the package. DEMO: run RecordsInPipelines. Question: what does record equals do with two BigDecimals of different scale?");

  // ===== 4 Sealed =====
  s = newSlide("CONTENT", "Records and sealed types", "Sealed interfaces + records = algebraic data types");
  codeBlock(s, `public sealed interface PaymentResult permits Approved, Declined, Pending, Refunded {
  String paymentId();
}
public record Approved(String paymentId, String method, BigDecimal amount) implements PaymentResult { }
public record Declined(String paymentId, String method, String reason)    implements PaymentResult { }
public record Pending(String paymentId, Instant since)                    implements PaymentResult { }
public record Refunded(String paymentId, BigDecimal amount)               implements PaymentResult { }

static PaymentResult toResult(Payment p) {
  return switch (p.status()) {                 // switch EXPRESSION [14], exhaustive over the enum
    case SUCCESS  -> new Approved(p.id(), p.method(), p.amount());
    case FAILED   -> new Declined(p.id(), p.method(), "failed at gateway");
    case PENDING  -> new Pending(p.id(), p.at());
    case REFUNDED -> new Refunded(p.id(), p.amount());
  };
}`, 0.5, 1.05, 9.0, 3.3, { label: "theory/PaymentResults  ·  sealed [17], records [16]", fontSize: 9.5, name: "sealed code" });
  note(s, "Decision: the dataset has a REFUNDED status, so the type has a 4th case (the brief named 3). PaymentResult.class.getPermittedSubclasses().length == 4.", 4.5, C.text2, "sealed note");
  s.addNotes("~3 min. An algebraic data type says: a value is exactly one of these alternatives, and each alternative carries its own data. In Java 21 that is a sealed interface plus records. PaymentResult permits four records; no other class may implement it, and the compiler and the runtime both know the list. Each record holds only what makes sense for that outcome: no nullable amount on a declined payment, no reason on an approved one. Converting the flat Payment record is a switch expression over the enum, from Java 14; it is exhaustive, so adding an enum value breaks the build here too. Note the decision on the slide: our dataset includes refunded payments, so the type has a fourth case. DEMO: run PaymentResults. Question: what would a 'Declined with amount null' bug look like without sealed types?");

  // ===== 5 Pattern evolution =====
  pres.addSection({ title: "Pattern matching" });
  s = newSlide("CONTENT", "Pattern matching", "From casts to patterns: Java 8 → 21");
  codeBlock(s, `// Java 8
if (o instanceof Customer) { Customer c = (Customer) o; .. c.name() .. }
// Java 16: pattern matching for instanceof (variable in scope only where true)
if (o instanceof Customer c && c.tier() == Tier.PLATINUM) { .. c.name() .. }
// Java 14: switch expression, arrows, yield
int riskScore(PaymentStatus s) {
  return switch (s) {
    case SUCCESS -> 0;
    case PENDING -> 2;
    case REFUNDED, FAILED -> { int base = 5; yield s == FAILED ? base * 2 : base; }
  };
}`, 0.5, 1.05, 9.0, 2.75, { label: "theory/PatternMatchingEvolution", fontSize: 9.5, name: "evo code" });
  tbl(s, ["Feature", "Version", "Real output"], [
    ["instanceof + cast", "8", "customer Alice Tan"],
    ["switch expression (arrow, yield)", "14", "risk SUCCESS=0 PENDING=2 REFUNDED=5 FAILED=10"],
    ["pattern matching for instanceof", "16", "PLATINUM customer Chen Wei"],
    ["pattern switch, record patterns, guards, case null", "21", "next slide"],
    ["unnamed patterns _", "22 (Beyond 21)", "not used in this course"],
  ], 0.5, 3.95, 9.0, [4.2, 1.4, 3.4], 0.21, "evo table", [0], 9);
  s.addNotes("~3 min. Pattern matching arrived in steps. In Java 8 you test with instanceof, then cast, then use, repeating the type three times. Java 14 made switch an expression: arrow cases with no fall-through, several labels per case, yield for a block, and exhaustiveness over enums, so riskScore needs no default. Java 16 added pattern matching for instanceof: the test declares and casts a variable in one step, and it is in scope only where the test is true, so it combines with and-and conditions. Java 21 completes the picture with pattern switches, record patterns and guards, on the next slide. Unnamed patterns, the underscore, became final in Java 22, so they are beyond our Java 21 target. DEMO: run PatternMatchingEvolution, first lines. Question: why can't the pattern variable be used after an or-or?");

  // ===== 6 Pattern switch 21 =====
  s = newSlide("CONTENT", "Pattern matching", "Java 21: pattern switch, record patterns, guards");
  codeBlock(s, `static String describeJava21(Object o) {
  return switch (o) {
    case null -> "null!";
    case Customer(var id, var name, var city, var tier, var joined) when tier == Tier.PLATINUM
                    -> "PLATINUM customer " + name + " (" + city + ")";
    case Customer c -> "customer " + c.name();
    case Account(var number, var owner, var type, var balance) when balance.signum() < 0
                    -> "OVERDRAWN account " + number + " " + balance;
    case Account a  -> "account " + a.number();
    case Money(var currency, var amount) when !currency.equals("SGD") -> "foreign money " + ..;
    case Money m    -> "money " + m;
    default         -> "unknown " + o.getClass().getSimpleName();
  };
}
case Fee(var id, Money(var ccy, var amt)) when amt.compareTo(TEN) >= 0 -> ..   // NESTED record pattern`, 0.5, 1.05, 9.0, 3.2, { label: "theory/PatternMatchingEvolution  [21]", fontSize: 9.5, name: "sw21 code" });
  outputBox(s, "PLATINUM customer Chen Wei (Singapore) · OVERDRAWN account ACC-1013 -150.25 · foreign money USD 533.03 · unknown Integer · null! · T023: capped fee USD 10.00", 0.5, 4.35, 9.0, 0.55, "sw21 output");
  s.addNotes("~3 min. Java 21 pattern matching for switch. Each case is a pattern: a type pattern like Customer c, or a record pattern that destructures the record into its components, like Customer of id, name, city, tier, joined. A guard, written with when, adds a condition; more specific guarded cases must come before the general case of the same type, or the compiler reports dominance. case null handles null explicitly, instead of throwing NullPointerException. Over Object a default is required; over a sealed type it is not. Record patterns nest: one case can take apart a Fee and the Money inside it. Real output: Chen Wei is PLATINUM, ACC-1013 is overdrawn, a USD amount is foreign money, and null prints 'null!'. DEMO: run PatternMatchingEvolution. Question: what happens if you swap the two Customer cases?");

  // ===== 7 Streams + switch =====
  s = newSlide("CONTENT", "Pattern matching", "Streams + switch: classify and aggregate");
  codeBlock(s, `static String describe(PaymentResult r) {
  return switch (r) {                         // exhaustive: no default
    case Approved(var id, var m, var amt) when amt.compareTo(new BigDecimal("1000")) >= 0
                               -> id + " APPROVED large " + m + " " + amt;
    case Approved(var id, var m, var amt) -> id + " APPROVED " + m + " " + amt;
    case Declined(var id, var m, var why) -> id + " DECLINED " + m + " (" + why + ")";
    case Pending(var id, var since)       -> id + " PENDING since " + since;
    case Refunded(var id, var amt)        -> id + " REFUNDED " + amt;
  };
}
results.stream().collect(groupingBy(r -> switch (r) {
    case Approved a -> "APPROVED"; case Declined d -> "DECLINED";
    case Pending p -> "PENDING";   case Refunded f -> "REFUNDED"; }, TreeMap::new, counting()));
results.stream().map(r -> r instanceof Approved a ? a.amount() : ZERO).reduce(ZERO, BigDecimal::add);`, 0.5, 1.05, 9.0, 3.25, { label: "theory/PaymentResults", fontSize: 9.5, name: "agg code" });
  outputBox(s, "count by kind : {APPROVED=8, DECLINED=2, PENDING=1, REFUNDED=1} · settled total : 2999.19", 0.5, 4.4, 9.0, 0.5, "agg output");
  s.addNotes("~3 min. Streams and pattern switches combine naturally. describe is an exhaustive switch with record patterns and one guard for large approvals; it is used in map to produce report lines. A switch expression also works as the classifier of groupingBy, giving counts per kind: eight approved, two declined, one pending, one refunded. For a simple yes-or-no test, an instanceof pattern inside map is enough: only approved amounts count as settled money, 2,999.19. The big benefit is maintenance. When the business adds a CHARGEBACK outcome, you add one record to the permits list, and the compiler shows you every switch that must now handle it. Nothing falls silently into an else branch. DEMO: run PaymentResults. Question: which switch would you NOT want to be exhaustive?");

  // ===== 8 Sequenced =====
  pres.addSection({ title: "Sequenced collections" });
  s = newSlide("CONTENT", "Sequenced collections", "SequencedCollection and SequencedMap [21]");
  tbl(s, ["Call (theory/SequencedCollectionsDemo)", "Real result", "Before Java 21"], [
    ["payments.getFirst() / getLast()", "P001 / P012", "get(0) / get(size() - 1)"],
    ["payments.reversed() first 3", "[P012, P011, P010]", "copy + Collections.reverse"],
    ["ids.reversed() after ids.addFirst(\"P000\")", "[P002, P001, P000] (a view)", "–"],
    ["sorted by date: getFirst() .. getLast()", "T001 2026-08-02 .. T060 2026-10-30", "get(0) .."],
    ["TreeMap monthly: firstEntry() / lastEntry()", "2026-08=3314.36 / 2026-10=5832.65", "firstEntry (NavigableMap only)"],
    ["LinkedHashMap putFirst, pollFirstEntry()", "polled P003=PAYPAL", "iterator().next() + remove"],
    ["LinkedHashSet getFirst() / getLast()", "Singapore / Bangkok", "iterate to the end"],
  ], 0.5, 1.0, 9.0, [3.7, 3.0, 2.3], 0.42, "seq table", [0], 10);
  note(s, "Implemented by List, Deque, LinkedHashSet, SortedSet, LinkedHashMap, SortedMap. reversed() returns a VIEW.", 4.5, C.text2, "seq note");
  s.addNotes("~3 min. Java 21 added sequenced collections, JEP 431: one set of interfaces for collections with a defined first and last element. Lists, deques, linked hash sets and sorted sets are SequencedCollections; linked hash maps and sorted maps are SequencedMaps. You get getFirst and getLast instead of get zero and get size minus one, addFirst and addLast, removeFirst and removeLast, and reversed. Maps get firstEntry, lastEntry, pollFirstEntry, putFirst and a reversed view. The results are real: the first and last payments, the earliest and latest transactions, the first and last month of debits, and a LinkedHashMap used as a small queue. Remember that reversed returns a view, so changes to the source show through. DEMO: run SequencedCollectionsDemo. Question: where do you write list.get(list.size() - 1) today?");

  // ===== 9 Worked example =====
  pres.addSection({ title: "Worked example" });
  s = newSlide("CONTENT", "Worked example", "Refactor: payment outcome report, three ways");
  codeBlock(s, `abstract static class Outcome {
  final Payment p;
  abstract String kind();
  abstract String describe();
  BigDecimal settledAmount() { return ZERO; }
  static Outcome of(Payment p) {
    switch (p.status()) {
      case SUCCESS: return new ApprovedOutcome(p);
      ..
      default: return new RefundedOutcome(p);
    }
  }
}  // + 4 subclasses, each overriding 2-3 methods`, 0.5, 1.05, 4.5, 3.4, { label: "AFTER  ·  Java 8 OO  ·  open hierarchy", fontSize: 9.5, name: "after code" });
  codeBlock(s, `List<PaymentResult> results =
    PaymentResults.results();
String summary = PaymentResults
    .countByKind(results).entrySet()
    .stream()
    .map(e -> e.getKey() + "=" + e.getValue())
    .collect(joining(" "))
  + " settled=" + PaymentResults.settled(results);
return Stream.concat(results.stream()
        .map(PaymentResults::describe),
    Stream.of(summary)).toList();`, 5.2, 1.05, 4.3, 3.4, { label: "MODERN  ·  sealed records + switches", fontSize: 9.5, name: "modern code" });
  outputBox(s, "All 3: 12 lines (P001 APPROVED CARD 120.00 … P012 DECLINED PAYNOW (failed at gateway)) + APPROVED=8 DECLINED=2 PENDING=1 REFUNDED=1 settled=2999.19", 0.5, 4.55, 9.0, 0.5, "ba output");
  s.addNotes("~3 min. The worked example three ways. The Java 8 object-oriented version is a real improvement on the loop: an abstract Outcome class with one subclass per outcome, each overriding kind, describe and settledAmount. Adding a new outcome is easy, but adding a new operation means editing every subclass, and the hierarchy is open, so nothing guarantees all outcomes are known; the factory still ends with default. The modern version separates data from operations: records hold the data, the sealed interface closes the set, and each operation is one exhaustive switch in one place. Adding an operation touches one method; adding an outcome makes the compiler list every switch to update. OutcomeReportRefactoringTest checks all three print the same thirteen lines. DEMO: run SealedOutcomeReport. Question: when is the OO version still the better choice?");

  // ===== 10 Pitfalls =====
  s = newSlide("CONTENT", "Worked example", "Pitfalls and best practices");
  const pits = [["default in a switch over a sealed type", "Hides missing cases when a type is added."], ["General case before a guarded one", "Compile error: the guarded case is dominated."], ["Record with BigDecimal not normalised", "5 and 5.00 are not equal records."], ["Mutable List component, no copy", "Records are shallowly immutable (L15)."], ["Nullable fields instead of a new case", "Declined with amount null: a type in disguise."]];
  pits.forEach(([h, d], i) => {
    const y = 1.0 + i * 0.8;
    card(s, 0.5, y, 4.6, 0.7, "FBECEC", "pit " + i);
    iconCircle(s, I.bug, 0.6, y + 0.14, 0.42, C.accent4, "pit icon " + i);
    s.addText([{ text: h, options: { bold: true, color: C.accent4, breakLine: true } }, { text: d, options: { fontSize: 11, color: C.text1 } }], { x: 1.12, y: y + 0.02, w: 3.9, h: 0.66, fontSize: 12.5, margin: 0, valign: "middle", isTextBox: true, objectName: "pit text " + i });
  });
  const dos = ["Validate + normalise in compact constructors", "One record per alternative; seal the set", "Exhaustive switches, no default", "Specific (guarded) cases first", "case null when null is possible", "getFirst/getLast/reversed over index maths"];
  card(s, 5.3, 1.0, 4.2, 3.9, C.background2, "do card");
  iconCircle(s, I.check, 5.45, 1.12, 0.45, C.accent1, "do icon");
  s.addText("Best practices", { x: 6.05, y: 1.12, w: 3.3, h: 0.45, fontSize: 15, bold: true, color: C.accent1, margin: 0, valign: "middle", isTextBox: true, objectName: "do title" });
  s.addText(bullets(dos, 12.5).map(r => { r.options.paraSpaceAfter = 7; return r; }), { x: 5.5, y: 1.7, w: 3.9, h: 3.1, margin: 0, valign: "top", isTextBox: true, objectName: "do list" });
  s.addNotes("~3 min. Five pitfalls. A default branch in a switch over a sealed type compiles, but it hides missing cases when a new type is added, which throws away the main benefit. Putting the general case before a guarded case of the same type is a compile error, because the guarded case can never match. A record with a BigDecimal component compares with BigDecimal.equals, which is scale-sensitive, so normalise in the constructor. Records are shallowly immutable, so copy list components. And nullable fields that are only set for some statuses are a missing type in disguise: give each alternative its own record. The habits are on the right. DEMO: run RecordsSealedPatternsTest. Question: which pitfall would the compiler catch for you?");

  // ===== 11 Interview =====
  pres.addSection({ title: "Practice" });
  s = newSlide("CONTENT", "Practice", "Interview questions");
  const qa = [
    ["What does a record generate?", "Private final fields, canonical constructor, accessors, equals, hashCode, toString."],
    ["Why sealed interfaces?", "Close the set of implementations: exhaustive switches, no default, safer evolution."],
    ["What is a record pattern?", "case Approved(var id, var amt): test the type and destructure in one step [21]."],
    ["What is a guard? Dominance?", "case X x when cond. A general case before a guarded one makes it unreachable: compile error."],
    ["What do sequenced collections add?", "getFirst/getLast, addFirst/addLast, removeFirst/Last, reversed(); firstEntry/lastEntry for maps [21]."],
  ];
  qa.forEach(([q, a], i) => {
    const colI = i % 2, row = Math.floor(i / 2);
    const x = i === 4 ? 0.5 : 0.5 + colI * 4.6, y = 1.0 + row * 1.38, w = i === 4 ? 9.0 : 4.4;
    card(s, x, y, w, 1.22, C.background2, "qa card " + i);
    s.addText("Q" + (i + 1), { shape: pres.shapes.OVAL, x: x + 0.12, y: y + 0.14, w: 0.42, h: 0.42, fill: { color: C.text2 }, line: { color: C.text2 }, fontSize: 11, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "q badge " + i });
    s.addText([{ text: q, options: { bold: true, color: C.text2, breakLine: true } }, { text: a, options: { color: C.text1, fontSize: 12 } }], { x: x + 0.65, y: y + 0.06, w: w - 0.8, h: 1.1, fontSize: 13.5, margin: 0, valign: "middle", isTextBox: true, objectName: "qa text " + i });
  });
  s.addNotes("~3 min. Five modern-Java interview questions. For records, a strong candidate lists what is generated and adds that records are shallowly immutable and cannot extend classes. For sealed interfaces, listen for exhaustiveness and safer evolution, not only 'restricting inheritance'. The record pattern question checks whether they have used Java 21; ask them to destructure a nested record. The guard question tests precision: when adds a condition, and dominance rules make a general case before a guarded case a compile error. The sequenced collections question is a quick check of how current their knowledge is. A senior follow-up: compare sealed types plus switches with the visitor pattern. DEMO: run QuizAnswersTest. Question: which would you ask to check real Java 21 experience?");

  // ===== 12 Pros/cons =====
  s = newSlide("CONTENT", "Practice", "Pros and cons: sealed records vs class hierarchies");
  const pros = ["Data is explicit and immutable", "Compiler checks every case", "New operation = one new switch", "No nullable \"sometimes\" fields", "Destructuring reads like the data", "Works naturally in streams"];
  const consL = ["New case = touch every switch", "Requires Java 17 (sealed) / 21 (patterns)", "Long record patterns can be noisy", "No behaviour inheritance in records", "Team must learn dominance rules", "Not for open plugin hierarchies"];
  [[pros, "Pros", C.accent1, I.plus, 0.5, C.background2], [consL, "Cons / limitations", C.accent4, I.minus, 5.1, "FBECEC"]].forEach(([list, h, colr, ic, x, bg]) => {
    card(s, x, 1.0, 4.4, 3.65, bg, h + " card");
    iconCircle(s, ic, x + 0.2, 1.15, 0.5, colr, h);
    s.addText(h, { x: x + 0.85, y: 1.15, w: 3.3, h: 0.5, fontSize: 18, bold: true, color: colr, margin: 0, valign: "middle", isTextBox: true, objectName: h + " heading" });
    s.addText(bullets(list, 14).map(r => { r.options.paraSpaceAfter = 8; return r; }), { x: x + 0.25, y: 1.85, w: 3.95, h: 2.7, margin: 0, valign: "top", isTextBox: true, objectName: h + " list" });
  });
  s.addNotes("~2 min. A balanced comparison with classic class hierarchies. Sealed records make data explicit and immutable, let the compiler check every case, make a new operation a single new switch, remove nullable fields that are only sometimes set, read like the data when destructured, and fit naturally into streams. The costs: a new case means touching every switch, which is the point but still work; you need Java 17 for sealed types and 21 for pattern switches; long record patterns can be noisy; records cannot inherit behaviour; teams must learn the dominance rules; and for open plugin hierarchies, where third parties add implementations, a classic interface with polymorphism remains the better choice. DEMO: none. Question: which of your hierarchies is really closed?");

  // ===== 13 Exercise =====
  s = newSlide("CONTENT", "Practice", "Exercise: insurance claim outcomes");
  codeBlock(s, `sealed interface ClaimOutcome permits Approved, PartiallyApproved, Rejected, UnderReview { }
record Claim(String id, String policyNumber, LocalDate incident,
             BigDecimal claimed, boolean documentsComplete)
// rules: unknown policy -> Rejected · incident after expiry -> Rejected · documents missing -> UnderReview
//        claimed > 10 x premium -> PartiallyApproved(10 x premium) · else Approved(claimed)`, 0.5, 1.05, 9.0, 1.5, { label: "exercise/Exercise16  ·  model given, logic to write", fontSize: 9.5, name: "ex code" });
  tbl(s, ["Claim", "Policy", "Outcome (from Solution16)"], [
    ["CL-01  5000.00", "POL-501 LIFE", "CL-01 APPROVED (large) 5000.00"],
    ["CL-02  800.00, incident 2026-12-10", "POL-502 (expires 2026-11-30)", "CL-02 REJECTED (policy expired)"],
    ["CL-03  12000.00", "POL-503 HEALTH, premium 960.00", "CL-03 PARTIAL 9600.00 (over limit)"],
    ["CL-04  450.00, documents missing", "POL-505 TRAVEL", "CL-04 UNDER REVIEW (documents missing)"],
    ["CL-06  100.00", "POL-999 (unknown)", "CL-06 REJECTED (unknown policy)"],
    ["all 8 claims", "", "{APPROVED=3, PARTIAL=2, REJECTED=2, UNDER_REVIEW=1} · total paid 35280.50"],
  ], 0.5, 2.65, 9.0, [2.8, 2.6, 3.6], 0.36, "ex table", [], 10);
  s.addNotes("~2 min. The exercise models insurance claim outcomes with sealed records. The model is given so the tests compile: a Claim record that validates itself, and a sealed ClaimOutcome with four records. The dataset has no claims, so eight claims against our policies are defined as exercise input; the payout rules are course rules, not real insurance terms. You write decide with the rules shown, describe with record patterns and a guard, the list of outcomes, counts per kind with a switch as classifier, the amount paid with an exhaustive switch, the total, the rejected claims with an instanceof pattern, paid amounts per policy type, and the last outcome with getLast. Expected values are in the Javadoc and in Exercise16Test. DEMO: run Solution16. Question: which rule would you change into its own record?");

  // ===== 14 Beyond 21 =====
  s = newSlide("CONTENT", "Practice", "Version map, and what comes after Java 21");
  tbl(s, ["Feature", "Preview", "Final"], [
    ["switch expressions (arrow, yield)", "12, 13", "14"],
    ["text blocks", "13, 14", "15"],
    ["records", "14, 15", "16"],
    ["pattern matching for instanceof", "14, 15", "16"],
    ["sealed classes and interfaces", "15, 16", "17"],
    ["pattern matching for switch", "17–20", "21"],
    ["record patterns (incl. nested)", "19, 20", "21"],
    ["sequenced collections", "–", "21"],
    ["unnamed variables and patterns _", "21", "22 (Beyond Java 21)"],
    ["primitive types in patterns", "23+", "preview (Beyond Java 21)"],
  ], 0.5, 1.0, 9.0, [5.0, 2.0, 2.0], 0.36, "ver table", [0], 11);
  s.addNotes("~2 min. A version map to keep the history straight, because interviewers and code reviewers often ask 'which Java do I need for this?'. Switch expressions became final in Java 14, records and instanceof patterns in 16, sealed types in 17, and pattern matching for switch together with record patterns in 21, as did sequenced collections. Two items are beyond our Java 21 target: unnamed variables and patterns, the underscore, which became final in Java 22, and primitive types in patterns, still in preview. Since Java 21 is a long-term-support release, everything in the green rows is available in long-term-support production environments today. DEMO: none. Question: which Java version does your production run, and which of these can you use?");

  // ===== 15 Summary =====
  pres.addSection({ title: "Wrap-up" });
  s = newSlide("DARK_TITLE", "Wrap-up", "Summary");
  const sum = ["Records [16]: validate + normalise in compact constructors", "Sealed [17] + records = algebraic data types", "instanceof patterns [16], switch expressions [14]", "Pattern switch, record patterns, guards, case null [21]", "Exhaustive switches over sealed types: no default", "Sequenced collections [21]: getFirst, getLast, reversed"];
  s.addText(bullets(sum, 14, C.background1), { x: 0.5, y: 2.1, w: 5.2, h: 2.9, margin: 0, valign: "top", isTextBox: true, objectName: "summary bullets" });
  card(s, 6.0, 0.6, 3.5, 2.05, "143F32", "exercise card");
  iconCircle(s, I.code, 6.2, 0.78, 0.45, C.accent2, "exercise");
  s.addText([{ text: "Exercise (~45 min)", options: { bold: true, color: C.accent2, breakLine: true } }, { text: "Exercise16: insurance claim outcomes with sealed records, processed with streams.", options: { color: C.background1, fontSize: 12 } }],
    { x: 6.75, y: 0.75, w: 2.65, h: 1.8, fontSize: 14, margin: 0, valign: "top", isTextBox: true, objectName: "exercise text" });
  card(s, 6.0, 2.85, 3.5, 2.05, "143F32", "next card");
  iconCircle(s, I.rocket, 6.2, 3.03, 0.45, C.accent1, "next");
  s.addText([{ text: "Next: Lesson 17", options: { bold: true, color: C.accent2, breakLine: true } }, { text: "Functional Error Handling: checked exceptions in lambdas, Result types, validation.", options: { color: C.background1, fontSize: 12 } }],
    { x: 6.75, y: 3.0, w: 2.65, h: 1.8, fontSize: 14, margin: 0, valign: "top", isTextBox: true, objectName: "next text" });
  s.addNotes("~3 min. Recap: records are immutable data carriers, with validation and normalisation in the compact constructor; sealed interfaces plus records give algebraic data types; instanceof patterns and switch expressions removed casts and fall-through; Java 21 pattern switches add record patterns, guards and case null; switches over sealed types are exhaustive, so leave out default; and sequenced collections give getFirst, getLast and reversed. The exercise models insurance claims with sealed outcomes. Next, L17 uses these tools for functional error handling: a sealed Result type with Success and Failure is exactly the pattern from today. DEMO: run Solution16. Question: which status-plus-nullable-fields class will you refactor first?");

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
})();
