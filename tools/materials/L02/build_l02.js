// L01 slide deck generator - ITGreenZone Java Functional Programming
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa");
const { applyTheme } = require("/root/.claude/skills/synced/2eb53c35-a0c8-4343-9257-776fcd7fed67_dd7dcff0-93ee-4601-a8ce-12573fa09cd9/pptx/scripts/apply_theme.js");

const OUT = process.argv[2] || "L02_FunctionalInterfaces_Slides.pptx";
const LESSON = "02";
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
pres.title = "L02 Functional Interfaces: Rules and Standards";
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
    gift: await icon(fa.FaGift), inbox: await icon(fa.FaInbox), exch: await icon(fa.FaExchangeAlt), filter: await icon(fa.FaFilter),
    puzzle: await icon(fa.FaPuzzlePiece), tag: await icon(fa.FaTag), bug: await icon(fa.FaBug),
  };

  // ===== 1 Title =====
  pres.addSection({ title: "Introduction" });
  let s = newSlide("DARK_TITLE", "Introduction", "Functional Interfaces: Rules and Standards");
  s.addText("LESSON 02  ·  MODULE 1 FUNCTIONAL FOUNDATIONS", { x: 0.5, y: 0.6, w: 5.5, h: 0.35, fontSize: 12, bold: true, color: C.accent2, charSpacing: 2, margin: 0, isTextBox: true, objectName: "kicker" });
  s.addText("One abstract method, many shapes: the contracts behind every lambda", { x: 0.5, y: 3.15, w: 5.0, h: 0.8, fontSize: 16, italic: true, color: C.background2, margin: 0, isTextBox: true, objectName: "subtitle" });
  card(s, 6.0, 0.6, 3.5, 4.3, "143F32", "objectives card");
  s.addText("You will be able to", { x: 6.25, y: 0.75, w: 3.1, h: 0.35, fontSize: 14, bold: true, color: C.accent2, margin: 0, isTextBox: true, objectName: "objectives heading" });
  ["State the SAM rule and what does not count", "Use @FunctionalInterface correctly", "Pick the right java.util.function type, incl. primitives", "Compose with andThen, compose, and, or, not", "Decide: custom interface or built-in?"].forEach((o, i) => {
    const y = 1.2 + i * 0.72;
    s.addText(String(i + 1), { shape: pres.shapes.OVAL, x: 6.25, y: y + 0.05, w: 0.36, h: 0.36, fill: { color: C.accent1 }, line: { color: C.accent1 }, fontSize: 12, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "objective number " + (i + 1) });
    s.addText(o, { x: 6.75, y, w: 2.6, h: 0.62, fontSize: 12.5, color: C.background1, valign: "middle", margin: 0, isTextBox: true, objectName: "objective " + (i + 1) });
  });
  s.addNotes("~3 min. Welcome to Lesson 02. In Lesson 01 we saw that a lambda can stand in for any interface with one abstract method. Today we make that rule precise, because it is the contract behind every lambda and method reference you will ever write. We cover the exact SAM rule and what does not count towards it, the purpose of the @FunctionalInterface annotation, the java.util.function catalogue including the primitive versions, how to compose small functions into bigger ones, and the standards for when to write your own interface. Every example again uses the shared banking, payments and airline dataset, and every printed value is real program output. Question to ask: who can name three interfaces from java.util.function without looking?");

  // ===== 2 Problem =====
  pres.addSection({ title: "Theory" });
  s = newSlide("CONTENT", "Theory", "The problem: an interface for every shape");
  codeBlock(s, `interface PaymentCheck {
    boolean passes(Payment payment);
}
// + SuccessfulCheck, MinimumAmountCheck,
//   MethodCheck ... and hand-made combinators:
class AndCheck implements PaymentCheck {
    private final List<PaymentCheck> checks;
    public boolean passes(Payment p) {
        for (PaymentCheck c : checks)
            if (!c.passes(p)) return false;
        return true;
    }
}`, 0.5, 1.05, 5.3, 3.4, { label: "BEFORE  ·  before/LegacyPaymentChecks", fontSize: 10.5, name: "legacy code" });
  card(s, 6.05, 1.05, 3.45, 2.0, C.background2, "stat card");
  s.addText([{ text: "5 classes", options: { fontSize: 36, bold: true, color: C.accent4, fontFace: THEME.headFontFace, breakLine: true } }, { text: "for one rule: SUCCESS and amount ≥ 100.00 and not PayPal", options: { fontSize: 13, color: C.text1 } }],
    { x: 6.2, y: 1.15, w: 3.15, h: 1.8, margin: 0, valign: "middle", isTextBox: true, objectName: "stat text" });
  s.addText(bullets(["Every project invents its own one-method interfaces", "No shared and / or / not: you write them again", "Libraries cannot accept your rules"], 13), { x: 6.05, y: 3.2, w: 3.45, h: 1.3, margin: 0, valign: "top", isTextBox: true, objectName: "pain bullets" });
  outputBox(s, "Legacy checks -> settle today: [P001, P005, P010]", 0.5, 4.6, 9.0, 0.42, "legacy output");
  s.addNotes("~3 min. Before Java 8, every codebase was full of tiny interfaces like PaymentCheck: one method, one meaning, used in one place. To express a single business rule, 'settle today means SUCCESS, at least 100.00, and not PayPal', the legacy code in our before package needs five classes: three rule classes plus hand-written AndCheck and NotCheck combinators. Every team rewrote these combinators, and no library could accept your rule because it was your private type. DEMO: run LegacyPaymentChecks; it selects P001, P005 and P010. Keep that result in mind; on slide 9 a few lines of Predicate composition give the same answer. Question: in your current project, how many single-method interfaces could be replaced by a standard type?");

  // ===== 3 SAM rules =====
  s = newSlide("CONTENT", "Theory", "The SAM rule: exactly one abstract method");
  codeBlock(s, `@FunctionalInterface
public interface FeeRule {
    BigDecimal feeFor(Transaction txn);   // the SAM
    default FeeRule plus(FeeRule other) { ... }
    static FeeRule flat(String amount) { ... }
    static FeeRule percent(String rate) { ... }
    private static BigDecimal round(BigDecimal v) { ... }
    boolean equals(Object other);   // not counted
    String toString();              // not counted
}
FeeRule CARD_FEE = FeeRule.flat("0.50")
        .plus(FeeRule.percent("0.1"));`, 0.5, 1.05, 5.5, 3.45, { label: "theory/SamRules", fontSize: 10.5, name: "feerule code" });
  outputBox(s, "T003:1221.40 -> card fee 1.72  ·  T004 -> 0.72", 0.5, 4.62, 5.5, 0.42, "feerule output");
  const rules = [["1 abstract method", "counts: this is the SAM", C.accent1, I.check, "Java 8"], ["default methods", "allowed, not counted", C.accent1, I.check, "Java 8"], ["static methods", "allowed, not counted", C.accent1, I.check, "Java 8"], ["private methods", "allowed, not counted", C.accent1, I.check, "Java 9"], ["equals, toString", "Object methods: not counted", C.accent5, I.check, ""], ["2+ abstract methods", "not functional: no lambda", C.accent4, I.times, ""]];
  rules.forEach(([h, d, col, ic, v], i) => {
    const y = 1.05 + i * 0.66;
    iconCircle(s, ic, 6.25, y + 0.08, 0.4, col, "rule " + i);
    s.addText([{ text: h, options: { bold: true, color: C.text2, breakLine: true } }, { text: d, options: { fontSize: 11.5, color: C.text1 } }], { x: 6.75, y, w: 2.1, h: 0.58, fontSize: 13, margin: 0, valign: "middle", isTextBox: true, objectName: "rule text " + i });
    if (v) badge(s, v, 8.85, y + 0.17, { w: 0.65 });
  });
  s.addNotes("~4 min. This is the most important slide of the lesson. A functional interface has exactly one abstract method, the SAM. Everything else is allowed and does not count. Default methods, like plus, give behaviour for free. Static methods, like flat and percent, are factories. Private methods, new in Java 9, let default and static methods share helper code; here round keeps every fee at two decimals with HALF_UP. Re-declaring public Object methods such as equals or toString does not count either, because every object already implements them. Generic interfaces are fine too; see Converter in the same class. DEMO: run SamRules; T003 at 1,221.40 pays 0.50 plus 0.1 percent, which is 1.72. Question: if I add a second abstract method, reason, what breaks?");

  // ===== 4 annotation + older SAMs =====
  s = newSlide("CONTENT", "Theory", "@FunctionalInterface, and the older SAMs");
  codeBlock(s, `@FunctionalInterface
interface FraudCheck {
    boolean flags(String txnId);
    String reason(String txnId);
}
// javac:
// error: Unexpected @FunctionalInterface annotation
//   FraudCheck is not a functional interface
//   multiple non-overriding abstract methods found`, 0.5, 1.05, 5.0, 2.75, { label: "Compile-time check (proved by FunctionalInterfaceRulesTest)", fontSize: 10.5, name: "annotation code" });
  s.addText(bullets([[{ text: "Optional: ", options: { bold: true } }, { text: "any SAM interface accepts lambdas without it." }], [{ text: "Purpose: ", options: { bold: true } }, { text: "compiler check + documentation of intent." }], [{ text: "Standard: ", options: { bold: true } }, { text: "always add it to your own functional interfaces." }]], 13), { x: 0.5, y: 3.95, w: 5.0, h: 1.15, margin: 0, valign: "top", isTextBox: true, objectName: "annotation bullets" });
  const sams = [["Runnable", "run()", "Java 1.0", "EOD job ran"], ["Comparator", "compare(a, b)", "Java 1.2", "first by name: Alice Tan"], ["FileFilter", "accept(File)", "Java 1.2", "2 of 3 files are .csv"], ["Callable", "call() throws", "Java 5", "settled total 2999.19"]];
  s.addText("Older single-method interfaces became functional for free", { x: 5.8, y: 1.05, w: 3.7, h: 0.4, fontSize: 13, bold: true, color: C.text2, margin: 0, isTextBox: true, objectName: "older heading" });
  sams.forEach(([n, m, v, out], i) => {
    const y = 1.5 + i * 0.9;
    card(s, 5.8, y, 3.7, 0.78, C.background2, "sam card " + n);
    s.addText([{ text: n + "  ", options: { bold: true, color: C.text2, fontFace: MONO, fontSize: 12 } }, { text: m, options: { fontFace: MONO, fontSize: 11, color: C.text1, breakLine: true } }, { text: out, options: { fontSize: 11.5, color: C.accent5, italic: true } }],
      { x: 5.95, y: y + 0.05, w: 2.6, h: 0.68, margin: 0, valign: "middle", isTextBox: true, objectName: "sam text " + n });
    badge(s, v, 8.7, y + 0.27, { w: 0.7 });
  });
  s.addNotes("~3 min. The @FunctionalInterface annotation is optional. Any interface with one abstract method accepts a lambda without it. So why use it? Two reasons. First, the compiler checks the rule: if someone adds a second abstract method later, the build fails right at the interface, with the message on the left, instead of breaking every lambda in other modules. Second, it documents intent for the reader. Our standard: always put it on your own functional interfaces. On the right, interfaces that existed long before Java 8 but already had a single abstract method, so they became functional interfaces for free. DEMO: run SamInspector, which uses reflection to count abstract methods, and OlderSams for the outputs. Question: Callable and Supplier look identical. What is the one real difference?");

  // ===== 5 The big four visual =====
  pres.addSection({ title: "Catalogue" });
  s = newSlide("CONTENT", "Catalogue", "java.util.function: four basic shapes");
  const shapes = [[I.gift, "Supplier<T>", "() → T", "get()", "produces"], [I.inbox, "Consumer<T>", "T → void", "accept(t)", "consumes"], [I.exch, "Function<T,R>", "T → R", "apply(t)", "transforms"], [I.filter, "Predicate<T>", "T → boolean", "test(t)", "tests"]];
  shapes.forEach(([ic, n, sig, m, verb], i) => {
    const x = 0.5 + i * 2.3;
    card(s, x, 1.05, 2.1, 2.2, C.background2, "shape " + n);
    iconCircle(s, ic, x + 0.15, 1.2, 0.5, C.accent1, n);
    badge(s, "Java 8", x + 1.3, 1.33, { w: 0.65 });
    s.addText(n, { x: x + 0.15, y: 1.8, w: 1.85, h: 0.35, fontSize: 13, bold: true, fontFace: MONO, color: C.text2, margin: 0, isTextBox: true, objectName: "shape name " + n });
    s.addText(sig, { x: x + 0.15, y: 2.15, w: 1.85, h: 0.45, fontSize: 18, bold: true, fontFace: MONO, color: C.accent1, margin: 0, isTextBox: true, objectName: "shape sig " + n });
    s.addText(m + "  ·  " + verb, { x: x + 0.15, y: 2.65, w: 1.85, h: 0.45, fontSize: 12, color: C.text1, margin: 0, isTextBox: true, objectName: "shape method " + n });
  });
  const variants = [["Two inputs", "BiFunction (T,U)→R · BiConsumer (T,U)→void · BiPredicate (T,U)→boolean"], ["Same type in and out", "UnaryOperator T→T (a Function) · BinaryOperator (T,T)→T (a BiFunction)"], ["Primitives (slide 7)", "IntPredicate, ToIntFunction, IntUnaryOperator … + Long / Double"]];
  variants.forEach(([h, d], i) => {
    const y = 3.45 + i * 0.55;
    s.addText(h, { x: 0.5, y, w: 2.1, h: 0.45, fontSize: 13, bold: true, color: C.accent2, fill: { color: C.text2 }, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "variant head " + i });
    s.addText(d, { x: 2.7, y, w: 6.8, h: 0.45, fontSize: 11, fontFace: MONO, color: C.text1, valign: "middle", margin: 0, isTextBox: true, objectName: "variant text " + i });
  });
  s.addNotes("~3 min. Almost every lambda you write fits one of four shapes. A Supplier takes nothing and produces a value. A Consumer takes a value and returns nothing, so it exists for side effects like printing or sending. A Function transforms a T into an R. A Predicate tests a T and answers true or false. Learn the method names too: get, accept, apply and test, because you will call them when you use these types directly. Then three families build on these: Bi versions take two inputs, Operator versions have the same type in and out, and primitive versions avoid boxing. Tip for learners: read the arrow aloud, for example 'T to boolean is a Predicate'. Question: what shape is the lambda in filter, and what shape is the lambda in map?");

  // ===== 6 Catalogue table =====
  s = newSlide("CONTENT", "Catalogue", "Catalogue: interface, method, signature, use");
  const hdr = ["Interface", "Method", "Signature", "Typical use", "Example (real output)"].map(t => ({ text: t, options: { bold: true, color: C.background1, fill: { color: C.text2 } } }));
  const rows = [
    ["Supplier<T>", "get", "() → T", "lazy value, factory", "STATEMENT_DATE → 2026-10-31"],
    ["Consumer<T>", "accept", "T → void", "print, send, log", "PRINT_ACCOUNT → ****1001 12500.00"],
    ["BiConsumer<T,U>", "accept", "(T,U) → void", "Map.forEach", "PRINT_PAIR → interest = 312.50"],
    ["Function<T,R>", "apply", "T → R", "map, convert", "LABEL → T003 TRANSFER 1221.40"],
    ["BiFunction<T,U,R>", "apply", "(T,U) → R", "combine two inputs", "ADD_INTEREST(12500.00, 2.5) → 12812.50"],
    ["UnaryOperator<T>", "apply", "T → T", "same-type transform", "MASK(\"ACC-1001\") → ****1001"],
    ["BinaryOperator<T>", "apply", "(T,T) → T", "reduce, merge", "ADD(120.00, 45.50) → 165.50"],
    ["Predicate<T>", "test", "T → boolean", "filter", "OVERDRAWN → [ACC-1013]"],
    ["BiPredicate<T,U>", "test", "(T,U) → boolean", "check a pair", "HAS_TIER(Alice, GOLD) → true"],
  ].map((r, i) => r.map((c, j) => ({ text: c, options: Object.assign({ fill: { color: i % 2 ? C.background1 : C.background2 }, color: C.text1 }, j === 0 ? { bold: true, fontFace: MONO, fontSize: 10 } : {}, j === 2 ? { fontFace: MONO, fontSize: 10, color: C.accent1, bold: true } : {}, j === 4 ? { fontFace: MONO, fontSize: 9.5 } : {}) })));
  s.addTable([hdr, ...rows], { x: 0.5, y: 1.0, w: 9.0, colW: [1.75, 0.75, 1.3, 1.6, 3.6], fontSize: 11, rowH: 0.36, border: { type: "solid", pt: 0.5, color: "D5E3DA" }, valign: "middle", margin: [2, 5, 2, 5], objectName: "catalogue table" });
  s.addText("All in java.util.function since Java 8. Examples: theory/BuiltInCatalogue.", { x: 0.5, y: 4.75, w: 9, h: 0.3, fontSize: 11.5, italic: true, color: C.accent5, margin: 0, isTextBox: true, objectName: "table note" });
  s.addNotes("~3 min. This is the reference table learners will use most; it is also on the cheat sheet. Each row has a real example from BuiltInCatalogue and the real output. Walk through three rows in detail. Supplier: the statement date is produced only when get is called, which matters later for Optional.orElseGet and lazy logging. BiFunction: ADD_INTEREST takes a balance and a rate, so 12,500.00 at 2.5 percent becomes 12,812.50, BigDecimal with HALF_UP. BinaryOperator: ADD is just the method reference BigDecimal::add, and this is exactly the type that Stream.reduce expects. DEMO: run BuiltInCatalogue. Question: UnaryOperator<String> and Function<String,String> look the same. Can you pass one where the other is expected? Answer: a UnaryOperator is a Function, but not the other way round.");

  // ===== 7 Primitives =====
  s = newSlide("CONTENT", "Catalogue", "Primitive specialisations: no boxing");
  s.addText([{ text: "Function<Flight,Integer>", options: { fontFace: MONO, bold: true, color: C.accent4 } }, { text: "  int → Integer (box) → int (unbox), one object per call", options: { color: C.text1 } }], { x: 0.5, y: 1.0, w: 9, h: 0.35, fontSize: 13, margin: 0, isTextBox: true, objectName: "boxing line" });
  s.addText([{ text: "ToIntFunction<Flight>", options: { fontFace: MONO, bold: true, color: C.accent1 } }, { text: "  returns a plain int: no objects, no unboxing", options: { color: C.text1 } }], { x: 0.5, y: 1.35, w: 9, h: 0.35, fontSize: 13, margin: 0, isTextBox: true, objectName: "primitive line" });
  const prim = [["IntPredicate", "int → boolean"], ["IntFunction<R>", "int → R"], ["ToIntFunction<T>", "T → int"], ["IntUnaryOperator", "int → int"], ["IntBinaryOperator", "(int,int) → int"], ["ObjIntConsumer<T>", "(T,int) → void"], ["IntSupplier", "() → int"]];
  const ph = [{ text: "Interface", options: { bold: true, color: C.background1, fill: { color: C.text2 } } }, { text: "Shape", options: { bold: true, color: C.background1, fill: { color: C.text2 } } }];
  s.addTable([ph, ...prim.map((r, i) => r.map((c) => ({ text: c, options: { fontFace: MONO, fontSize: 10.5, color: C.text1, fill: { color: i % 2 ? C.background1 : C.background2 } } })))], { x: 0.5, y: 1.85, w: 3.9, colW: [2.1, 1.8], rowH: 0.34, border: { type: "solid", pt: 0.5, color: "D5E3DA" }, valign: "middle", margin: [2, 5, 2, 5], objectName: "primitive table" });
  s.addText("+ Long… and Double… versions, e.g. ToDoubleFunction<T>", { x: 0.5, y: 4.65, w: 3.9, h: 0.3, fontSize: 11, italic: true, color: C.accent5, margin: 0, isTextBox: true, objectName: "prim note" });
  codeBlock(s, `ToIntFunction<Flight> BOOKED = Flight::booked;
IntPredicate FEWER_THAN_10 = left -> left < 10;
IntUnaryOperator WITH_OVERBOOKING =
    seats -> seats + seats / 10;

flights.stream().mapToInt(BOOKED).sum();
flights.stream()
    .filter(f -> FEWER_THAN_10
        .test(f.seats() - f.booked()))
    .map(Flight::code).toList();`, 4.65, 1.85, 4.85, 2.55, { label: "theory/PrimitiveSpecialisations", fontSize: 10.5, name: "primitive code" });
  badge(s, "Java 8", 8.75, 1.9);
  outputBox(s, "Booked 1808 · Nearly full [TR808, SQ21] · 471→518", 4.65, 4.5, 4.85, 0.5, "primitive output");
  s.addNotes("~3 min. Generics in Java work only with objects, so Function<Flight, Integer> must wrap every int result in an Integer object, which is boxing, and the caller usually unwraps it again. For one call that is nothing; inside a stream over millions of elements it creates millions of short-lived objects. The primitive specialisations avoid that: ToIntFunction returns a plain int, IntPredicate tests a plain int, and so on, with Long and Double versions too. On the right, the airline example: total booked seats is 1,808, the nearly-full flights are TR808 and SQ21, and SQ318's 471 seats with ten percent overbooking become 518. DEMO: run PrimitiveSpecialisations. Do not promise speed-ups without measuring; the rule is just 'prefer primitive types when the value is a number'. Question: which stream method takes a ToIntFunction?");

  // ===== 8 Composition =====
  pres.addSection({ title: "Composition" });
  s = newSlide("CONTENT", "Composition", "Composition: small functions, bigger behaviour");
  const fx = 0.5;
  [["fee.andThen(gst)", "100.00 → +1.00 → ×1.09", "110.09", C.accent1], ["fee.compose(gst)", "100.00 → ×1.09 → +1.00", "110.00", C.accent3], ["pipeline [fee, gst, fee]", "reduce(identity(), andThen)", "111.09", C.accent2]].forEach(([h, d, r, col], i) => {
    const y = 1.05 + i * 0.78;
    card(s, fx, y, 4.4, 0.66, C.background2, "fn card " + i);
    s.addText([{ text: h, options: { fontFace: MONO, bold: true, color: C.text2, fontSize: 12, breakLine: true } }, { text: d, options: { fontSize: 11.5, color: C.text1 } }], { x: fx + 0.15, y: y + 0.03, w: 3.0, h: 0.6, margin: 0, valign: "middle", isTextBox: true, objectName: "fn text " + i });
    s.addText(r, { x: fx + 3.2, y: y + 0.08, w: 1.05, h: 0.5, fontSize: 18, bold: true, color: col, fontFace: MONO, align: "right", valign: "middle", margin: 0, isTextBox: true, objectName: "fn result " + i });
  });
  s.addText("Function [8]: andThen = this first · compose = argument first · identity() = do nothing", { x: 0.5, y: 3.45, w: 4.4, h: 0.55, fontSize: 12, italic: true, color: C.text1, margin: 0, isTextBox: true, objectName: "fn note" });
  outputBox(s, "Consumer.andThen: audit, then notify · BinaryOperator.maxBy(amount) → P005", 0.5, 4.2, 4.4, 0.75, "consumer output");
  const ph2 = ["Predicate rule", "Count"].map(t => ({ text: t, options: { bold: true, color: C.background1, fill: { color: C.text2 } } }));
  const prow = [["IS_DEBIT", "45"], ["IS_DEBIT.and(IS_LARGE)", "3"], ["IS_DEBIT.or(IS_LARGE)", "53"], ["IS_DEBIT.negate()", "15"], ["Predicate.not(IS_LARGE)  [11]", "49"], ["Predicate.isEqual(\"USD\")", "2"]].map((r, i) => r.map((c, j) => ({ text: c, options: { fontFace: MONO, fontSize: j ? 13 : 11, bold: j === 1, color: j ? C.accent1 : C.text1, align: j ? "center" : "left", fill: { color: i % 2 ? C.background1 : C.background2 } } })));
  s.addTable([ph2, ...prow], { x: 5.15, y: 1.05, w: 4.35, colW: [3.45, 0.9], rowH: 0.42, border: { type: "solid", pt: 0.5, color: "D5E3DA" }, valign: "middle", margin: [2, 6, 2, 6], objectName: "predicate table" });
  s.addText("of 60 transactions · IS_LARGE = amount > 1000.00", { x: 5.15, y: 4.15, w: 4.35, h: 0.3, fontSize: 11, italic: true, color: C.accent5, margin: 0, isTextBox: true, objectName: "pred note" });
  s.addNotes("~4 min. Default methods on the functional interfaces let us build big behaviour from small, tested pieces. Function: andThen runs this function first and then the argument; compose runs the argument first. With a 1.00 fee and nine percent GST, fee-then-GST on 100.00 is 110.09, but GST-then-fee is 110.00, so the order matters. identity is the neutral function, and reducing a list of steps with identity and andThen builds a whole pipeline, which we will use for the premium calculator in L21. Predicate gives and, or, negate, plus the static not from Java 11 and isEqual. The counts on the right are real: 45 debits, only 3 large debits. Consumer.andThen chains side effects, and BinaryOperator.maxBy turns a Comparator into a reducer. DEMO: run Composition. Question: why does fee.compose(gst) start with GST?");

  // ===== 9 Before/after =====
  s = newSlide("CONTENT", "Composition", "Before / after: the same rule with Predicate");
  codeBlock(s, `List<PaymentCheck> checks = new ArrayList<>();
checks.add(new SuccessfulCheck());
checks.add(new MinimumAmountCheck(
        new BigDecimal("100.00")));
checks.add(new NotCheck(
        new MethodCheck("PAYPAL")));
PaymentCheck rule = new AndCheck(checks);
// + 5 class definitions (slide 2)`, 0.5, 1.05, 4.4, 2.75, { label: "BEFORE  ·  custom interface + 5 classes", fontSize: 10.5, name: "before code" });
  codeBlock(s, `Predicate<Payment> SUCCESSFUL =
    p -> p.status() == PaymentStatus.SUCCESS;
Predicate<Payment> AT_LEAST_100 =
    p -> p.amount().compareTo(HUNDRED) >= 0;
Predicate<Payment> PAYPAL =
    p -> "PAYPAL".equals(p.method());

Predicate<Payment> SETTLE_TODAY = SUCCESSFUL
    .and(AT_LEAST_100)
    .and(PAYPAL.negate());`, 5.1, 1.05, 4.4, 2.75, { label: "AFTER  ·  after/PaymentRules", fontSize: 10.5, name: "after code" });
  badge(s, "Java 8", 8.75, 1.1);
  outputBox(s, "Legacy checks -> settle today: [P001, P005, P010]\nPredicate rules -> settle today: [P001, P005, P010]", 0.5, 3.95, 9.0, 0.65, "before after output");
  s.addText("Same result, no custom interface, no combinator classes: and / or / negate are default methods.", { x: 0.5, y: 4.7, w: 9, h: 0.35, fontSize: 13, italic: true, color: C.text2, margin: 0, isTextBox: true, objectName: "ba note" });
  s.addNotes("~3 min. Here is the payoff. On the left, the legacy way to build the settle-today rule: create a list, add three rule objects, wrap one in NotCheck, wrap all in AndCheck, plus the five class definitions we saw on slide 2. On the right, the Java 8 way: three small named predicates, each one line, and the rule is composed with and and negate, which Predicate gives us as default methods. No custom interface and no combinator classes. Both select exactly P001, P005 and P010; BeforeAfterModernTest proves it. And because the result is a standard Predicate, it plugs straight into Stream.filter, Optional.filter, removeIf and any library that accepts a Predicate. DEMO: run PaymentRules; it also prints the payments that need review: P003, P006, P008 and P012. Question: how would you add 'or amount over 1,000.00 regardless of method'?");

  // ===== 10 Modern =====
  s = newSlide("CONTENT", "Composition", "Modern Java (9–21) and functional interfaces");
  codeBlock(s, `// [16] a record implementing a functional interface
record AboveThreshold(BigDecimal limit)
        implements Predicate<Transaction> {
    public boolean test(Transaction t) {
        return t.amount().compareTo(limit) > 0;
    }
}
// [14] switch expression as a lambda body
Function<Category, BigDecimal> CASHBACK_RATE =
    c -> switch (c) {
        case DINING -> new BigDecimal("0.05");
        case GROCERIES -> new BigDecimal("0.03");
        case TRAVEL, SHOPPING -> new BigDecimal("0.01");
        default -> BigDecimal.ZERO; };`, 0.5, 1.05, 5.6, 3.95, { label: "modern/ModernInterfaces", fontSize: 10.5, name: "modern code" });
  const mod = [["Java 9", "private interface methods (FeeRule.round)"], ["Java 11", "Predicate.not(new AboveThreshold(500))"], ["Java 11", "var in lambda: (final var t) -> …"], ["Java 14", "switch expression in a Function"], ["Java 16", "record implements Predicate"]];
  mod.forEach(([v, t], i) => {
    const y = 1.05 + i * 0.5;
    badge(s, v, 6.35, y + 0.1, { w: 0.75 });
    s.addText(t, { x: 7.2, y, w: 2.3, h: 0.45, fontSize: 11.5, color: C.text1, margin: 0, valign: "middle", isTextBox: true, objectName: "modern item " + i });
  });
  outputBox(s, "> 5000.00: [T025, T027, T038, T049, T055, T056]\nnot > 500.00: 38\ncashback on debits: 123.43", 6.35, 3.7, 3.15, 1.3, "modern output");
  s.addNotes("~3 min. What changed for functional interfaces after Java 8? Java 9 added private interface methods, which we used in FeeRule to share rounding code. Java 11 added Predicate.not and var in lambda parameters. Java 14 made switch expressions standard, so a whole lookup table can be the body of a Function, like the cashback rates here. And Java 16 records can implement a functional interface: AboveThreshold is a named, configurable, immutable rule with equals and toString for free, which is great for logging and for rules loaded from configuration. You can still pass it anywhere a Predicate is expected. DEMO: run ModernInterfaces: six transactions are above 5,000.00, 38 are not above 500.00, and total cashback on debits is 123.43. Question: what does the record version give you that a plain lambda does not?");

  // ===== 11 Standards =====
  pres.addSection({ title: "Standards" });
  s = newSlide("CONTENT", "Standards", "Standards: custom interface or built-in?");
  const cols = [["Write your own when…", C.accent1, [["Domain meaning", "FeeRule, FraudRule read better than Function<Transaction, BigDecimal>"], ["Checked exceptions", "the method must declare throws (like Callable.call)"], ["More than 2 parameters", "TriFunction<A,B,C,R> (exercise)"], ["Extra defaults", "domain combinators: plus, or, describe"]]], ["Reuse a built-in when…", C.accent3, [["The shape is generic", "filter → Predicate, map → Function"], ["It crosses APIs", "streams, Optional, collections accept them"], ["It is local", "a private helper does not need a new type"], ["Primitives", "use IntPredicate, ToIntFunction…"]]]];
  cols.forEach(([h, col, items], ci) => {
    const x = 0.5 + ci * 4.6;
    s.addText(h, { x, y: 1.0, w: 4.4, h: 0.42, fontSize: 16, bold: true, color: col, margin: 0, isTextBox: true, objectName: "std head " + ci });
    items.forEach(([t, d], i) => {
      const y = 1.5 + i * 0.75;
      card(s, x, y, 4.4, 0.65, C.background2, "std card " + ci + i);
      s.addText([{ text: t, options: { bold: true, color: C.text2, breakLine: true } }, { text: d, options: { fontSize: 11.5, color: C.text1 } }], { x: x + 0.15, y: y + 0.02, w: 4.1, h: 0.6, fontSize: 13, margin: 0, valign: "middle", isTextBox: true, objectName: "std text " + ci + i });
    });
  });
  s.addText([{ text: "Naming: ", options: { bold: true, color: C.text2 } }, { text: "interface = role noun (FeeRule, FraudRule); method = verb (feeFor, flags). Always add @FunctionalInterface.", options: { color: C.text1 } }], { x: 0.5, y: 4.6, w: 9, h: 0.45, fontSize: 12.5, margin: 0, isTextBox: true, objectName: "naming" });
  s.addNotes("~3 min. A practical decision guide used in code review. Write your own functional interface when a name adds meaning: FeeRule or FraudRule tells the reader much more than Function<Transaction, BigDecimal>. Also when the method must throw a checked exception, because none of the java.util.function methods declare throws; that is exactly why Callable exists next to Supplier. Also when you need more than two parameters, since the JDK stops at Bi; that is the TriFunction in your exercise. And when you want domain combinators as default methods. Otherwise, reuse the built-ins: they work with streams, Optional and collections, and every Java developer already knows them. Naming standard: a role noun for the interface and a verb for the method. Question: in a payments service, would you name a rule 'Function<Payment, Boolean>'? Why not?");

  // ===== 12 Pitfalls =====
  s = newSlide("CONTENT", "Standards", "Pitfalls: ambiguity, boxing and broken SAMs");
  codeBlock(s, `static String run(Supplier<String> s) { ... }
static String run(Callable<String> c) { ... }

run(() -> "x");
// error: reference to run is ambiguous
//   both run(Supplier<String>) and
//   run(Callable<String>) match

// FIX: different names
runSupplier(() -> "x");
runCallable(() -> "y");`, 0.5, 1.05, 4.9, 3.35, { label: "Pitfall 1: overloading with same-shape interfaces", fontSize: 10.5, name: "ambiguity code" });
  const pits = [[I.bug, "Pitfall 2: boxing", "Function<Flight,Integer> in a hot path. Use ToIntFunction and mapToInt."], [I.bug, "Pitfall 3: a second abstract method", "Breaks every lambda. @FunctionalInterface catches it at the interface."], [I.bug, "Pitfall 4: side effects in Function", "map(t -> { log.add(t); … }). Keep Function pure; use Consumer at the edges."]];
  pits.forEach(([ic, h, d], i) => {
    const y = 1.05 + i * 1.22;
    card(s, 5.6, y, 3.9, 1.08, "FBECEC", "pit card " + i);
    iconCircle(s, ic, 5.75, y + 0.18, 0.42, C.accent4, "pit " + i);
    s.addText([{ text: h, options: { bold: true, color: C.accent4, breakLine: true } }, { text: d, options: { fontSize: 11.5, color: C.text1 } }], { x: 6.3, y: y + 0.05, w: 3.1, h: 0.98, fontSize: 13, margin: 0, valign: "middle", isTextBox: true, objectName: "pit text " + i });
  });
  outputBox(s, "Proved with the real compiler in FunctionalInterfaceRulesTest", 0.5, 4.55, 4.9, 0.45, "pitfall output");
  s.addNotes("~3 min. Pitfall 1 surprises even senior developers. If you overload a method with two functional interfaces of the same shape, here Supplier and Callable, both returning a String with no parameters, a lambda call cannot choose between them and the build fails with 'reference to run is ambiguous'. Our test compiles this snippet with the real Java compiler to prove it. The fix is simple: give the methods different names, as the JDK does with mapToInt and mapToLong. Pitfall 2: boxing by using Function with Integer where ToIntFunction fits. Pitfall 3: adding a second abstract method to a widely used interface; the annotation catches it at the source. Pitfall 4: a Function with side effects; keep functions pure and put side effects in a Consumer at the edges. Question: why can ExecutorService overload submit with Runnable and Callable safely?");

  // ===== 13 Interview =====
  pres.addSection({ title: "Practice" });
  s = newSlide("CONTENT", "Practice", "Interview questions");
  const qa = [
    ["What makes an interface functional?", "Exactly one abstract method. Default, static, private and public Object methods do not count."],
    ["Is @FunctionalInterface required?", "No. It adds a compile-time check and documents intent; any SAM interface accepts lambdas."],
    ["Supplier vs Callable?", "Same shape, () → T, but Callable.call() can throw a checked Exception."],
    ["Why IntPredicate instead of Predicate<Integer>?", "It avoids boxing ints into Integer objects on every call."],
    ["andThen vs compose?", "f.andThen(g) runs f then g; f.compose(g) runs g then f."],
  ];
  qa.forEach(([q, a], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = i === 4 ? 0.5 : 0.5 + col * 4.6, y = 1.0 + row * 1.38, w = i === 4 ? 9.0 : 4.4;
    card(s, x, y, w, 1.22, C.background2, "qa card " + i);
    s.addText("Q" + (i + 1), { shape: pres.shapes.OVAL, x: x + 0.12, y: y + 0.14, w: 0.42, h: 0.42, fill: { color: C.text2 }, line: { color: C.text2 }, fontSize: 11, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "q badge " + i });
    s.addText([{ text: q, options: { bold: true, color: C.text2, breakLine: true } }, { text: a, options: { color: C.text1, fontSize: 12.5 } }], { x: x + 0.65, y: y + 0.06, w: w - 0.8, h: 1.1, fontSize: 13.5, margin: 0, valign: "middle", isTextBox: true, objectName: "qa text " + i });
  });
  s.addNotes("~3 min. Five interview questions on functional interfaces, from junior to mid level. Run them as a quick round: read the question, wait ten seconds, then reveal. For question 1, push for the full answer: interviewers listen for 'public Object methods do not count', because many candidates forget Comparator's equals. For question 3, the key word is 'checked exception'. For question 4, a good candidate says boxing and does not invent performance numbers. For question 5, ask the class to give the 100.00 fee and GST example from slide 8: 110.09 versus 110.00. A senior follow-up: why does the JDK stop at BiFunction, and what would you do for three parameters? Answer: write a TriFunction or group the parameters into a record. Question: which of these did you find the hardest?");

  // ===== 14 Pros & Cons =====
  s = newSlide("CONTENT", "Practice", "Pros and cons of functional interfaces");
  const pros = ["One shared vocabulary across all libraries", "Free combinators: and, or, andThen, compose", "Lambdas and method references just work", "Custom SAMs give domain names", "Primitive versions avoid boxing", "Old SAMs (Runnable, Comparator) work too"];
  const cons = ["43 interfaces in java.util.function to learn", "No checked exceptions in built-in methods", "Stops at two parameters (Bi…)", "Generic signatures can be hard to read", "Overloading by SAM type causes ambiguity", "Lambdas lose the descriptive name of a class"];
  [[pros, "Pros", C.accent1, I.plus, 0.5, C.background2], [cons, "Cons / limitations", C.accent4, I.minus, 5.1, "FBECEC"]].forEach(([list, h, col, ic, x, bg]) => {
    card(s, x, 1.0, 4.4, 3.65, bg, h + " card");
    iconCircle(s, ic, x + 0.2, 1.15, 0.5, col, h);
    s.addText(h, { x: x + 0.85, y: 1.15, w: 3.3, h: 0.5, fontSize: 18, bold: true, color: col, margin: 0, valign: "middle", isTextBox: true, objectName: h + " heading" });
    s.addText(bullets(list, 14.5).map(r => { r.options.paraSpaceAfter = 9; return r; }), { x: x + 0.25, y: 1.85, w: 3.95, h: 2.7, margin: 0, valign: "top", isTextBox: true, objectName: h + " list" });
  });
  s.addNotes("~2 min. A balanced view. The big win is a shared vocabulary: every library, from streams to Spring Cloud Function, speaks Function, Consumer, Supplier and Predicate, and you get combinators for free. Custom interfaces still let you name domain concepts. The limitations are real too. The package has 43 interfaces, which is a lot to memorise, though you really need about ten. None of the built-in methods can throw checked exceptions, which we will solve in L03 and L17. The JDK stops at two parameters. Generic signatures such as Function<? super T, ? extends R> are hard to read at first; L04 explains the wildcards in practice. And overloading by SAM type causes ambiguity. Question: which limitation have you already hit in real code?");

  // ===== 15 Summary =====
  pres.addSection({ title: "Wrap-up" });
  s = newSlide("DARK_TITLE", "Wrap-up", "Summary");
  const sum = ["SAM: exactly one abstract method; default, static, private and Object methods don't count", "@FunctionalInterface: optional, but always use it on your own", "Four shapes: Supplier, Consumer, Function, Predicate (+ Bi, Operator, primitives)", "Compose: andThen / compose, and / or / negate / not", "Custom SAM for domain names, checked exceptions, 3+ params"];
  s.addText(bullets(sum, 13.5, C.background1), { x: 0.5, y: 2.1, w: 5.2, h: 2.9, margin: 0, valign: "top", isTextBox: true, objectName: "summary bullets" });
  card(s, 6.0, 0.6, 3.5, 2.05, "143F32", "exercise card");
  iconCircle(s, I.code, 6.2, 0.78, 0.45, C.accent2, "exercise");
  s.addText([{ text: "Exercise (~25 min)", options: { bold: true, color: C.accent2, breakLine: true } }, { text: "Fraud rule engine: compose Predicates, finish FraudRule.or and TriFunction.andThen, write transferFee. Remove @Disabled.", options: { color: C.background1, fontSize: 12 } }],
    { x: 6.75, y: 0.75, w: 2.65, h: 1.8, fontSize: 14, margin: 0, valign: "top", isTextBox: true, objectName: "exercise text" });
  card(s, 6.0, 2.85, 3.5, 2.05, "143F32", "next card");
  iconCircle(s, I.rocket, 6.2, 3.03, 0.45, C.accent1, "next");
  s.addText([{ text: "Next: Lesson 03", options: { bold: true, color: C.accent2, breakLine: true } }, { text: "Lambda Expressions in depth: syntax, target typing, effectively final, this, exceptions.", options: { color: C.background1, fontSize: 12 } }],
    { x: 6.75, y: 3.0, w: 2.65, h: 1.8, fontSize: 14, margin: 0, valign: "top", isTextBox: true, objectName: "next text" });
  s.addNotes("~3 min. Recap the five points, asking a learner to explain each in one sentence. Then the exercise, a small fraud rule engine. Learners compose three Predicate rules: a large debit is a DEBIT over 900.00, foreign currency is anything not SGD, and suspicious is a large debit transfer or any foreign-currency transaction. They also implement the default method or on the custom FraudRule interface, the default andThen on a TriFunction, and a transferFee TriFunction with a minimum fee. Expected results are in Exercise02Test: seven suspicious transactions, T003, T010, T023, T036, T042, T050 and T057, and a fee of 12.50 on 2,500.00 at 0.5 percent. Give 25 minutes, then walk through Solution02. Next lesson goes deep into lambda syntax. Question: which interface from today will you use first at work?");

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
})();
