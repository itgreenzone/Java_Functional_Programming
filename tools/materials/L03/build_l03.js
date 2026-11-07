// L01 slide deck generator - ITGreenZone Java Functional Programming
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa");
const { applyTheme } = require("/root/.claude/skills/synced/2eb53c35-a0c8-4343-9257-776fcd7fed67_dd7dcff0-93ee-4601-a8ce-12573fa09cd9/pptx/scripts/apply_theme.js");

const OUT = process.argv[2] || "L03_Lambdas_Slides.pptx";
const LESSON = "03";
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
pres.title = "L03 Lambda Expressions in Depth";
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
    bug: await icon(fa.FaBug), bag: await icon(fa.FaSuitcase), cog: await icon(fa.FaCog),
  };

  // ===== 1 Title =====
  pres.addSection({ title: "Introduction" });
  let s = newSlide("DARK_TITLE", "Introduction", "Lambda Expressions in Depth");
  s.addText("LESSON 03  ·  MODULE 1 FUNCTIONAL FOUNDATIONS", { x: 0.5, y: 0.6, w: 5.5, h: 0.35, fontSize: 12, bold: true, color: C.accent2, charSpacing: 2, margin: 0, isTextBox: true, objectName: "kicker" });
  s.addText("Syntax, target typing, capture, scope and checked exceptions", { x: 0.5, y: 2.75, w: 5.0, h: 0.8, fontSize: 16, italic: true, color: C.background2, margin: 0, isTextBox: true, objectName: "subtitle" });
  card(s, 6.0, 0.6, 3.5, 4.3, "143F32", "objectives card");
  s.addText("You will be able to", { x: 6.25, y: 0.75, w: 3.1, h: 0.35, fontSize: 14, bold: true, color: C.accent2, margin: 0, isTextBox: true, objectName: "objectives heading" });
  ["Write every lambda form and know the return rules", "Explain target typing: one text, many types", "Capture variables correctly (effectively final)", "Predict this and scope vs anonymous classes", "Handle checked exceptions in lambdas"].forEach((o, i) => {
    const y = 1.2 + i * 0.72;
    s.addText(String(i + 1), { shape: pres.shapes.OVAL, x: 6.25, y: y + 0.05, w: 0.36, h: 0.36, fill: { color: C.accent1 }, line: { color: C.accent1 }, fontSize: 12, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "objective number " + (i + 1) });
    s.addText(o, { x: 6.75, y, w: 2.6, h: 0.62, fontSize: 12.5, color: C.background1, valign: "middle", margin: 0, isTextBox: true, objectName: "objective " + (i + 1) });
  });
  s.addNotes("~3 min. Welcome to Lesson 03. In L01 we met lambdas and in L02 the interfaces they implement. Today we look closely at the lambda itself: every syntax form and its return rules, how the compiler decides what type a lambda is, which variables a lambda may use and why they must be effectively final, what this means inside a lambda compared with an anonymous class, var in lambda parameters, and the most common real-world pain point: checked exceptions. We finish by refactoring a payment validator from anonymous classes to lambdas without changing a single output. Several slides show real compiler error messages; each one is proved by a test that runs the Java compiler. Question to ask: who has seen 'must be final or effectively final' in their own code?");

  // ===== 2 Problem =====
  pres.addSection({ title: "Theory" });
  s = newSlide("CONTENT", "Theory", "The problem: anonymous-class ceremony");
  codeBlock(s, `validations.add(new PaymentValidation() {
    @Override
    public String check(Payment p) {
        return p.status() == FAILED
            ? "failed payments ..." : null;
    }
});
// ... x 4 rules`, 0.5, 1.05, 4.6, 2.8, { label: "BEFORE  ·  one rule, 8 lines", fontSize: 10.5, name: "legacy code" });
  codeBlock(s, `List<PaymentValidation> RULES = List.of(
  p -> p.amount().signum() > 0
          ? null : "...",
  p -> p.status() == FAILED ? "..." : null,
  p -> isPayPalOverLimit(p) ? "..." : null,
  p -> p.amount().compareTo(LIMIT) > 0
          ? "..." : null);`, 5.3, 1.05, 4.2, 2.8, { label: "AFTER  ·  four rules, one each", fontSize: 10, name: "lambda code" });
  badge(s, "Java 8", 8.75, 1.1);
  outputBox(s, "Both: P003 failed · P003 PayPal limit · P005 needs approval · P012 failed", 0.5, 4.0, 9.0, 0.45, "problem output");
  s.addText("Same interface, same messages, same order. The lambda is just the body of check(...).", { x: 0.5, y: 4.6, w: 9, h: 0.4, fontSize: 13, italic: true, color: C.text2, margin: 0, isTextBox: true, objectName: "problem note" });
  s.addNotes("~2 min. Here is the code we will refactor at the end of the lesson. On the left, one of four validation rules in LegacyPaymentValidator: eight lines, of which only the ternary expression is business logic. On the right, all four rules as lambdas, implementing exactly the same PaymentValidation interface. DEMO: run LegacyPaymentValidator and LambdaPaymentValidator; both print the same four errors: P003 failed and over the PayPal limit, P005 needs manual approval, and P012 failed. The point for today: before we can refactor confidently, we must understand the exact rules for lambdas, because a lambda is not just shorter syntax for an anonymous class. this, scope, variable capture and exceptions all behave differently. Question: what do you think this means inside the lambda version?");

  // ===== 3 Syntax forms =====
  s = newSlide("CONTENT", "Theory", "Syntax forms and return rules");
  const hdr = ["Form", "Example (theory/SyntaxForms)", "Result"].map(t => ({ text: t, options: { bold: true, color: C.background1, fill: { color: C.text2 } } }));
  const rows = [
    ["No parameters", "() -> \"statement ready\"", "statement ready"],
    ["One, inferred", "t -> t.id()", "T003"],
    ["One, parentheses", "(t) -> t.id()", "T003"],
    ["Explicit type", "(Transaction t) -> t.id()", "T003"],
    ["Two parameters", "(a, b) -> a.add(b)", "165.50"],
    ["Block body", "amount -> { ...; return ...; }", "2512.50"],
  ].map((r, i) => r.map((c, j) => ({ text: c, options: Object.assign({ fill: { color: i % 2 ? C.background1 : C.background2 }, color: C.text1 }, j === 1 ? { fontFace: MONO, fontSize: 10.5 } : {}, j === 0 ? { bold: true } : {}, j === 2 ? { fontFace: MONO, color: C.accent1, bold: true } : {}) })));
  s.addTable([hdr, ...rows], { x: 0.5, y: 1.0, w: 5.6, colW: [1.3, 2.85, 1.45], fontSize: 11, rowH: 0.36, border: { type: "solid", pt: 0.5, color: "D5E3DA" }, valign: "middle", margin: [2, 5, 2, 5], objectName: "syntax table" });
  const rr = [["Expression body", "its value is returned automatically: no return, no braces"], ["Block body", "braces + statements; needs return when a value is expected"], ["Void-compatible", "list -> list.add(x) is fine as a Consumer: result ignored"], ["Value-compatible", "same text as a Function<List,Boolean> returns true"]];
  rr.forEach(([h, d], i) => {
    const y = 1.0 + i * 0.78;
    card(s, 6.35, y, 3.15, 0.68, C.background2, "rule card " + i);
    s.addText([{ text: h, options: { bold: true, color: C.text2, breakLine: true } }, { text: d, options: { fontSize: 11, color: C.text1 } }], { x: 6.48, y: y + 0.02, w: 2.95, h: 0.64, fontSize: 12.5, margin: 0, valign: "middle", isTextBox: true, objectName: "rule text " + i });
  });
  outputBox(s, "void-compatible: [audited]   ·   value-compatible: true [audited, audited]", 0.5, 4.3, 9.0, 0.45, "syntax output");
  s.addText("Parentheses are optional only for one parameter with an inferred type.", { x: 0.5, y: 4.82, w: 9, h: 0.3, fontSize: 12, italic: true, color: C.accent5, margin: 0, isTextBox: true, objectName: "syntax note" });
  s.addNotes("~3 min. Every lambda has the shape parameters, arrow, body. The table shows each parameter form with real output from SyntaxForms. Parentheses are optional only when there is exactly one parameter and its type is inferred; no parameters, two parameters or an explicit type all need them. The body is either an expression, whose value is returned automatically, or a block in braces, which needs an explicit return when a value is expected. The subtle part is on the right: an expression such as list.add(x) is both a statement and a value. As a Consumer it is void-compatible and the boolean result is ignored; as a Function it is value-compatible and returns true. DEMO: run SyntaxForms. Question: is 'x -> { x.trim(); }' valid as a Function<String,String>? Answer: no, a block needs return.");

  // ===== 4 Target typing =====
  s = newSlide("CONTENT", "Theory", "Target typing: the context decides the type");
  codeBlock(s, `// the SAME text, three target types
Predicate<Transaction> p =
    t -> t.amount().compareTo(LIMIT) > 0;
Function<Transaction, Boolean> f =
    t -> t.amount().compareTo(LIMIT) > 0;
HighValueCheck d =
    t -> t.amount().compareTo(LIMIT) > 0;
Supplier<String> s = () -> "ok"; // no checked
Callable<String> c = () -> "ok"; // may throw
Object o = () -> "x";
// error: incompatible types:
//   Object is not a functional interface`, 0.5, 1.05, 5.6, 3.5, { label: "theory/TargetTyping", fontSize: 10.5, name: "typing code" });
  s.addText("Contexts that give a target type", { x: 6.35, y: 1.05, w: 3.15, h: 0.35, fontSize: 14, bold: true, color: C.text2, margin: 0, isTextBox: true, objectName: "ctx heading" });
  const ctx = [["Assignment", "Predicate<T> p = …"], ["Method argument", "filter(t -> …) → 11"], ["Return statement", "return t -> …  → [T010, T023]"], ["Conditional ?:", "strict ? rule : t -> true → 60"], ["Cast", "(Supplier<String>) () -> …"]];
  ctx.forEach(([h, d], i) => {
    const y = 1.48 + i * 0.6;
    s.addText(String(i + 1), { shape: pres.shapes.OVAL, x: 6.35, y: y + 0.08, w: 0.34, h: 0.34, fill: { color: C.accent1 }, line: { color: C.accent1 }, fontSize: 11, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "ctx num " + i });
    s.addText([{ text: h, options: { bold: true, color: C.text2, breakLine: true } }, { text: d, options: { fontFace: MONO, fontSize: 10, color: C.text1 } }], { x: 6.8, y, w: 2.7, h: 0.52, fontSize: 12, margin: 0, valign: "middle", isTextBox: true, objectName: "ctx text " + i });
  });
  outputBox(s, "Predicate: true · Function<_,Boolean>: true · HighValueCheck: true (T003)", 0.5, 4.65, 9.0, 0.42, "typing output");
  s.addNotes("~3 min. A lambda has no type of its own. The compiler looks at where the lambda appears, the target type, and checks the lambda against that interface's single abstract method. That is why exactly the same text becomes a Predicate, a Function returning Boolean, or our own HighValueCheck interface; for T003 all three answer true. The same applies to Supplier versus Callable: same text, but only the Callable version may throw a checked exception. The right-hand list shows the five contexts that supply a target type, with real results from TargetTyping. Without a context there is no type: assigning a lambda to Object fails with 'Object is not a functional interface', and our test proves it with the real compiler. DEMO: run TargetTyping. Question: how would you fix the Object line? Answer: cast it to a functional interface.");

  // ===== 5 Capture =====
  pres.addSection({ title: "Capture and scope" });
  s = newSlide("CONTENT", "Capture and scope", "Capturing variables: effectively final");
  codeBlock(s, `// OK: rate is never re-assigned -> effectively final
BigDecimal rate = new BigDecimal(percent).movePointLeft(2);
return amount -> amount.multiply(rate)
                       .setScale(2, RoundingMode.HALF_UP);

// does NOT compile
int count = 0;
ids.forEach(id -> count++);
// error: local variables referenced from a lambda
//   expression must be final or effectively final

for (Flight f : flights) labels.add(() -> f.code());
for (int i = 0; ...; i++) { int position = i + 1; ... }`, 0.5, 1.05, 5.7, 3.55, { label: "theory/VariableCapture", fontSize: 10.5, name: "capture code" });
  card(s, 6.45, 1.05, 3.05, 2.3, C.background2, "why card");
  iconCircle(s, I.bag, 6.6, 1.2, 0.48, C.accent1, "backpack");
  s.addText([{ text: "Why?", options: { bold: true, color: C.text2, fontSize: 15, breakLine: true } }, { text: "A lambda carries a COPY of each captured value, like a backpack. If the local could change, the copy would be stale, and a lambda may run later or on another thread.", options: { fontSize: 11.5, color: C.text1 } }],
    { x: 7.15, y: 1.15, w: 2.25, h: 2.1, margin: 0, valign: "top", isTextBox: true, objectName: "why text" });
  outputBox(s, "cashback: 4.00\nfor-each: [SQ318, SQ12, TR808]\ncopy: [1.SQ318, 2.SQ12, 3.TR808]", 6.45, 3.5, 3.05, 1.1, "capture output");
  s.addText("Fields are not copied: a lambda reads this.field live. Static and instance fields need no 'final'.", { x: 0.5, y: 4.72, w: 9, h: 0.35, fontSize: 12, italic: true, color: C.accent5, margin: 0, isTextBox: true, objectName: "fields note" });
  s.addNotes("~4 min. A lambda may use local variables from the enclosing method only if they are final or effectively final, meaning they are never re-assigned after initialisation. You do not need the final keyword; the compiler works it out. rate is assigned once, so the cashback lambda can capture it: five percent of 80.00 is 4.00. count++ re-assigns count, so the compiler rejects it with the message shown. Why the rule? The lambda captures a copy of the value, like packing it in a backpack. If the local could still change, the lambda's copy would be stale, and the lambda may run later, maybe on another thread. Loops: each enhanced-for iteration has a fresh variable, so capture works; a classic for loop's i changes, so copy it first. DEMO: run VariableCapture. Question: why can a lambda change an instance field but not a local?");

  // ===== 6 Smells =====
  s = newSlide("CONTENT", "Capture and scope", "Workarounds that are smells");
  codeBlock(s, `// SMELL 1: AtomicInteger
AtomicInteger counter = new AtomicInteger();
txns.forEach(t -> {
    if (t.type() == DEBIT) {
        counter.incrementAndGet();
    }
});

// SMELL 2: one-element array (not even thread-safe)
int[] counter = {0};
txns.forEach(t -> { if (...) counter[0]++; });`, 0.5, 1.05, 4.9, 3.0, { label: "Compiles... but hides shared mutable state", fontSize: 10.5, name: "smell code" });
  codeBlock(s, `// GOOD: let the stream compute it
long debits = txns.stream()
    .filter(t -> t.type() == DEBIT)
    .count();`, 5.6, 1.05, 3.9, 1.65, { label: "Fix", fontSize: 10.5, name: "fix code" });
  outputBox(s, "count 45 · Atomic 45 · int[] 45", 5.6, 2.85, 3.9, 0.45, "smell output");
  s.addText(bullets(["Same answer today, but the intent is hidden", "The array version races if the stream is parallel", "A captured counter is a sign you want reduce or count"], 13), { x: 5.6, y: 3.45, w: 3.9, h: 1.3, margin: 0, valign: "top", isTextBox: true, objectName: "smell bullets" });
  s.addText("Rule: if you need to change something from inside a lambda, ask which terminal operation computes it for you.", { x: 0.5, y: 4.25, w: 4.9, h: 0.8, fontSize: 12.5, italic: true, color: C.text2, margin: 0, valign: "top", isTextBox: true, objectName: "smell rule" });
  s.addNotes("~3 min. When developers hit the effectively-final error, the internet suggests two tricks. Wrap the counter in an AtomicInteger, or in a one-element array. Both compile, because the reference itself never changes, only its contents. And both give the right answer here: 45 debits. But they are smells. They hide shared mutable state inside what looks like a pure pipeline, the intent of 'count the debits' is buried in an if and an increment, and the array version is not even thread-safe, so it silently gives wrong answers the day someone adds parallel. The fix is almost always a terminal operation: count, sum, reduce or collect. We go deeper in L09 and L18. DEMO: run VariableCapture and compare the three numbers. Question: which terminal operation would replace a captured BigDecimal total?");

  // ===== 7 this & scope =====
  s = newSlide("CONTENT", "Capture and scope", "this and scope: lambda vs anonymous class");
  codeBlock(s, `class ThisAndScope {
    private final String name;   // "payment-service"

    Supplier<String> lambdaThis() {
        return () -> this.name;       // enclosing object
    }
    Supplier<String> anonymousThis() {
        return new Supplier<>() {
            private final String name =
                    "anonymous object";
            public String get() { return this.name; }
        };
    }
}`, 0.5, 1.05, 5.4, 3.3, { label: "theory/ThisAndScope", fontSize: 10.5, name: "scope code" });
  const cmp = [["", "Lambda", "Anonymous class"], ["this", "enclosing instance", "the anonymous object"], ["toString()", "outer object's", "its own"], ["New scope?", "No", "Yes"], ["Param = local name", "compile error", "allowed (shadows)"]];
  s.addTable(cmp.map((r, i) => r.map((c, j) => ({ text: c, options: i === 0 ? { bold: true, color: C.background1, fill: { color: C.text2 } } : { fill: { color: i % 2 ? C.background2 : C.background1 }, color: j === 0 ? C.text2 : C.text1, bold: j === 0, fontSize: 10.5 } }))), { x: 6.1, y: 1.05, w: 3.4, colW: [1.0, 1.25, 1.15], fontSize: 11, rowH: 0.48, border: { type: "solid", pt: 0.5, color: "D5E3DA" }, valign: "middle", margin: [2, 4, 2, 4], objectName: "scope table" });
  outputBox(s, "lambda: payment-service · anonymous: anonymous object", 0.5, 4.45, 5.4, 0.45, "scope output");
  s.addText("String id = \"x\"; f = id -> id.trim();  →  variable id is already defined", { x: 6.1, y: 3.65, w: 3.4, h: 0.75, fontSize: 11, fontFace: MONO, color: C.accent4, margin: 0, valign: "top", isTextBox: true, objectName: "shadow error" });
  s.addNotes("~3 min. This is a favourite interview question. Inside a lambda, this refers to the enclosing instance, because a lambda does not introduce a new scope; it is just a block of code inside the method. Inside an anonymous class, this refers to the anonymous object itself, because an anonymous class is a real class with its own members. So the lambda prints payment-service and the anonymous class prints its own field, anonymous object. The same applies to unqualified method calls such as toString. A consequence of 'no new scope': a lambda parameter cannot reuse the name of a local variable in the method. The compiler says 'variable id is already defined'. An anonymous class method parameter may shadow it. DEMO: run ThisAndScope. Question: which one would you choose if you need the object to have its own state?");

  // ===== 8 var & _ =====
  s = newSlide("CONTENT", "Capture and scope", "var in lambda parameters, and what comes next");
  codeBlock(s, `BinaryOperator<BigDecimal> ADD = (var a, var b) -> a.add(b);
Function<Transaction, String> LABEL =
        (final var t) -> t.id() + "/" + t.currency();
Function<Transaction, BigDecimal> AMOUNT =
        (@Audited var t) -> t.amount();

(var a, b) -> a + b
// error: invalid lambda parameter declaration
//   (cannot mix 'var' and implicitly-typed parameters)`, 0.5, 1.05, 5.9, 2.85, { label: "theory/VarInLambdas", fontSize: 10.5, name: "var code" });
  badge(s, "Java 11", 5.6, 1.1, { w: 0.7 });
  outputBox(s, "(var a, var b): 165.50 · (final var t): T010/USD · (@Audited var t): 533.03", 0.5, 4.05, 9.0, 0.45, "var output");
  card(s, 6.65, 1.05, 2.85, 1.35, C.background2, "var why");
  s.addText([{ text: "Why var?", options: { bold: true, color: C.text2, breakLine: true } }, { text: "Only to add final or an annotation while keeping the type inferred.", options: { fontSize: 11.5 } }], { x: 6.8, y: 1.1, w: 2.6, h: 1.25, fontSize: 13, color: C.text1, margin: 0, valign: "middle", isTextBox: true, objectName: "var why text" });
  card(s, 6.65, 2.55, 2.85, 1.35, "FFF4E0", "beyond card");
  s.addText([{ text: "Beyond Java 21", options: { bold: true, color: C.accent2, breakLine: true } }, { text: "(a, _) -> a  unnamed variable: preview in 21, final in Java 22.", options: { fontSize: 11.5 } }], { x: 6.8, y: 2.6, w: 2.6, h: 1.25, fontSize: 13, color: C.text1, margin: 0, valign: "middle", isTextBox: true, objectName: "beyond text" });
  s.addText("All parameters use var, or none do. Do not use var just to look modern: t -> … is clearer.", { x: 0.5, y: 4.62, w: 9, h: 0.4, fontSize: 12.5, italic: true, color: C.text2, margin: 0, isTextBox: true, objectName: "var rule" });
  s.addNotes("~2 min. Java 11 allowed var in lambda parameters. It sounds pointless, since the types are already inferred, and usually it is. It exists for one reason: you cannot put a modifier or an annotation on a bare inferred parameter like t. With var you can write final var t, or put an annotation such as a nullness or audit annotation on it, and the type is still inferred. The rule is all or nothing: you cannot mix var with implicitly typed parameters, and the compiler error is shown; our test reproduces it. Beyond Java 21: the unnamed variable underscore lets you mark a parameter as unused, like a comma underscore. It is a preview in 21, disabled by default, and final in Java 22. DEMO: run VarInLambdas. Question: when would you actually use var in a lambda in your project?");

  // ===== 9 Checked exceptions =====
  pres.addSection({ title: "Exceptions" });
  s = newSlide("CONTENT", "Exceptions", "Checked exceptions: the problem and 4 patterns");
  codeBlock(s, `raw.stream().map(s -> Amounts.parse(s))
// error: unreported exception InvalidAmountException;
//        must be caught or declared to be thrown`, 0.5, 1.05, 9.0, 1.0, { label: "Function.apply declares no 'throws'", fontSize: 10.5, name: "checked code" });
  const pats = [["1 try/catch in the lambda", "Works, but the lambda grows to 7 lines.", "[120.00, 45.50, 999.99]"], ["2 custom SAM with throws", "ThrowingFunction<T,R,E> - caller handles E.", "caught: Invalid amount: abc"], ["3 wrap once, unwrap at the edge", "map(unchecked(Amounts::parse)), keep the cause.", "cause: InvalidAmountException"], ["4 turn failure into a value", "Optional now, Result type in L17.", "skip invalid: [120.00, 75.00]"]];
  pats.forEach(([h, d, out], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.5 + col * 4.6, y = 2.2 + row * 1.42;
    card(s, x, y, 4.4, 1.28, C.background2, "pattern " + i);
    s.addText([{ text: h, options: { bold: true, color: C.text2, breakLine: true } }, { text: d, options: { fontSize: 11.5, color: C.text1, breakLine: true } }, { text: out, options: { fontFace: MONO, fontSize: 10.5, color: C.accent1 } }], { x: x + 0.15, y: y + 0.05, w: 4.1, h: 1.18, fontSize: 13.5, margin: 0, valign: "middle", isTextBox: true, objectName: "pattern text " + i });
  });
  s.addNotes("~4 min. The most common practical problem with lambdas. Our Amounts.parse throws a checked InvalidAmountException, like many real APIs for I/O, JDBC or parsing. Function.apply does not declare throws, so calling parse inside map does not compile. Four patterns, with real output from CheckedExceptions on the inputs 120.00, abc, minus 10.00 and 75. One: try/catch inside the lambda; it works but the lambda becomes seven lines. Two: a custom functional interface that declares throws, like L02 suggested; the caller catches the checked exception. Three: wrap once with a helper that converts it to an unchecked exception but keeps the original as the cause, and unwrap at the edge of your system. Four: turn failure into a value, Optional today and a proper Result type in L17. Question: which pattern fits a batch file where one bad line must not stop the run?");

  // ===== 10 Under the hood =====
  s = newSlide("CONTENT", "Exceptions", "Lambdas vs anonymous classes under the hood");
  const uh = [["", "Anonymous class", "Lambda"], ["Compiled to", "Outer$1.class", "no extra .class file"], ["Bytecode", "new + constructor call", "invokedynamic + private method"], ["At run time", "a normal class", "a hidden class [Java 15]"], ["isAnonymousClass()", "true", "false"], ["isHidden()", "false", "true"], ["Each evaluation", "always a new object", "unspecified: do not rely on identity"], ["Own state / this", "yes", "no"]];
  s.addTable(uh.map((r, i) => r.map((c, j) => ({ text: c, options: i === 0 ? { bold: true, color: C.background1, fill: { color: C.text2 } } : { fill: { color: i % 2 ? C.background2 : C.background1 }, color: j === 0 ? C.text2 : C.text1, bold: j === 0, fontFace: (j > 0 && /\(|\$|\.class/.test(c)) ? MONO : THEME.bodyFontFace, fontSize: 11 } }))), { x: 0.5, y: 1.05, w: 6.0, colW: [1.7, 2.15, 2.15], fontSize: 11.5, rowH: 0.42, border: { type: "solid", pt: 0.5, color: "D5E3DA" }, valign: "middle", margin: [2, 5, 2, 5], objectName: "hood table" });
  outputBox(s, "anonymous: anonymousClass=true, hidden=false\nlambda: anonymousClass=false, hidden=true", 0.5, 4.5, 6.0, 0.6, "hood output");
  card(s, 6.75, 1.05, 2.75, 4.05, C.background2, "hood card");
  iconCircle(s, I.cog, 6.9, 1.2, 0.48, C.accent1, "cog");
  s.addText([{ text: "What it means for you", options: { bold: true, color: C.text2, breakLine: true } }, { text: "Fewer classes to load, and the JVM can optimise the call site.", options: { breakLine: true } }, { text: " ", options: { breakLine: true } }, { text: "Never use == or synchronized on a lambda.", options: { breakLine: true } }, { text: " ", options: { breakLine: true } }, { text: "Need state or more than one method? Use a class.", options: {} }],
    { x: 6.9, y: 1.8, w: 2.5, h: 3.2, fontSize: 12.5, color: C.text1, margin: 0, valign: "top", isTextBox: true, objectName: "hood text" });
  s.addNotes("~3 min. High level only; this is not a JVM internals course. An anonymous class is a real class: the compiler writes a separate file such as LambdaVsAnonymous dollar 1 dot class, and every evaluation creates a new object. A lambda produces no extra class file. The compiler puts the body in a private method and emits an invokedynamic instruction; the first time it runs, the JVM spins up a hidden class, a Java 15 feature, to implement the interface. Our test checks both facts: the dollar-1 class file exists, a dollar-2 does not, and the lambda's class reports isHidden true. Practical consequences: fewer classes to load, and never rely on the identity of a lambda, so no equals checks, double-equals or synchronizing on it. DEMO: run LambdaVsAnonymous. Question: when is an anonymous class still the right choice?");

  // ===== 11 Refactoring =====
  pres.addSection({ title: "Worked example" });
  s = newSlide("CONTENT", "Worked example", "Refactor: anonymous classes → lambdas → records");
  codeBlock(s, `// after/LambdaPaymentValidator
public static List<String> validate(List<Payment> ps) {
  return ps.stream()
    .flatMap(p -> RULES.stream()
        .map(rule -> rule.check(p))
        .filter(Objects::nonNull)
        .map(msg -> p.id() + ": " + msg))
    .toList();
}`, 0.5, 1.05, 4.4, 2.8, { label: "AFTER  ·  Java 8 lambdas", fontSize: 10.5, name: "after code" });
  codeBlock(s, `record Rule(String message,
            Predicate<Payment> violatedBy) { }
record ValidationError(String paymentId,
                       String message) { }

List<Rule> RULES = List.of(
  new Rule("amount must be positive",
      Predicate.not(Validator::isPositive)),
  new Rule("failed payments ...",
      Validator::isFailed), ...);`, 5.1, 1.05, 4.4, 2.8, { label: "MODERN  ·  records [16], no null", fontSize: 10.5, name: "modern code" });
  badge(s, "Java 16", 8.7, 1.1, { w: 0.7 });
  outputBox(s, "Legacy = Lambda = Modern:  P003 failed · P003 PayPal limit · P005 approval · P012 failed", 0.5, 4.0, 9.0, 0.45, "refactor output");
  s.addText("ValidatorRefactoringTest proves all three versions return exactly the same 4 errors.", { x: 0.5, y: 4.6, w: 9, h: 0.4, fontSize: 13, italic: true, color: C.text2, margin: 0, isTextBox: true, objectName: "refactor note" });
  s.addNotes("~3 min. Now the refactoring from slide 2, in two steps. Step one, Java 8: keep the PaymentValidation interface, turn each anonymous class into a one-line lambda, and extract the only two-condition rule into a named method isPayPalOverLimit. The validate method becomes a pipeline; flatMap appears here as a preview of L07. Step two, modern Java: get rid of null as a signal. A Rule record pairs a message with the predicate that violates it, and a ValidationError record replaces the formatted string. Rules become data, use method references to named predicates, and Predicate.not for the positive check. ValidatorRefactoringTest proves all three versions return exactly the same four errors, which is the most important rule of refactoring: behaviour does not change. DEMO: run all three validators. Question: what does a record give us over the 'id: message' string?");

  // ===== 12 Best practices & pitfalls =====
  s = newSlide("CONTENT", "Worked example", "Best practices and pitfalls");
  const dos = [["Do", "Keep lambdas to one expression; extract longer logic into a named method", C.accent1, I.check], ["Do", "Prefer method references when they read better: Objects::nonNull", C.accent1, I.check], ["Do", "Keep lambdas free of side effects in map and filter", C.accent1, I.check], ["Do", "Wrap checked exceptions once, at the edge, keeping the cause", C.accent1, I.check]];
  const donts = [["Don't", "Capture counters with AtomicInteger or int[]", C.accent4, I.times], ["Don't", "Write 10-line block lambdas", C.accent4, I.times], ["Don't", "Catch and ignore checked exceptions to make it compile", C.accent4, I.times], ["Don't", "Compare lambdas with == or lock on them", C.accent4, I.times]];
  [[dos, 0.5], [donts, 5.1]].forEach(([list, x]) => {
    list.forEach(([k, t, col, ic], i) => {
      const y = 1.05 + i * 0.95;
      card(s, x, y, 4.4, 0.82, col === C.accent1 ? C.background2 : "FBECEC", k + " card " + i);
      iconCircle(s, ic, x + 0.15, y + 0.19, 0.44, col, k + i);
      s.addText([{ text: k + "  ", options: { bold: true, color: col } }, { text: t, options: { color: C.text1 } }], { x: x + 0.72, y: y + 0.04, w: 3.55, h: 0.74, fontSize: 12.5, margin: 0, valign: "middle", isTextBox: true, objectName: k + " text " + i });
    });
  });
  s.addText("Rule of thumb: if a lambda needs more than about 3 lines, give it a name.", { x: 0.5, y: 4.9, w: 9, h: 0.3, fontSize: 12.5, italic: true, color: C.text2, margin: 0, isTextBox: true, objectName: "rule of thumb" });
  s.addNotes("~3 min. These are the coding standards we apply in every lesson from now on. Keep lambdas to one expression; as soon as a lambda needs more than about three lines, extract it into a named private method and refer to it with a method reference, which is the subject of L04. Keep lambdas in map and filter free of side effects; side effects belong in forEach or at the edges of the system. For checked exceptions, wrap once, at the boundary, and always keep the original exception as the cause so the stack trace survives. On the right, the mistakes we see most in code reviews: captured counters, ten-line block lambdas, empty catch blocks written just to make the compiler happy, and relying on the identity of a lambda. Question: which of these have you seen in your team's code this year?");

  // ===== 13 Interview =====
  pres.addSection({ title: "Practice" });
  s = newSlide("CONTENT", "Practice", "Interview questions");
  const qa = [
    ["What does 'effectively final' mean?", "Never re-assigned after initialisation. The compiler treats it as final, so a lambda may capture it."],
    ["Why must captured locals be effectively final?", "The lambda captures a copy of the value. A changing local would make the copy stale and unsafe across threads."],
    ["What is 'this' inside a lambda?", "The enclosing instance. A lambda adds no new scope; an anonymous class does."],
    ["How do you call a method that throws a checked exception in map()?", "Custom SAM with throws, wrap into unchecked (keep the cause), or return Optional/Result."],
    ["Is a lambda an anonymous class?", "No. No extra .class file; invokedynamic creates a hidden class at run time. Different this and scope rules."],
  ];
  qa.forEach(([q, a], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = i === 4 ? 0.5 : 0.5 + col * 4.6, y = 1.0 + row * 1.38, w = i === 4 ? 9.0 : 4.4;
    card(s, x, y, w, 1.22, C.background2, "qa card " + i);
    s.addText("Q" + (i + 1), { shape: pres.shapes.OVAL, x: x + 0.12, y: y + 0.14, w: 0.42, h: 0.42, fill: { color: C.text2 }, line: { color: C.text2 }, fontSize: 11, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "q badge " + i });
    s.addText([{ text: q, options: { bold: true, color: C.text2, breakLine: true } }, { text: a, options: { color: C.text1, fontSize: 12 } }], { x: x + 0.65, y: y + 0.06, w: w - 0.8, h: 1.1, fontSize: 13, margin: 0, valign: "middle", isTextBox: true, objectName: "qa text " + i });
  });
  s.addNotes("~3 min. Five interview questions on lambdas. Give the class ten seconds per question, then reveal. For question 1, a strong candidate adds that you do not need to write final. For question 2, listen for two ideas: the value is copied, and the lambda may run later or on another thread. For question 3, ask for the contrast with anonymous classes and the shadowing rule. For question 4, a senior answer names at least two patterns and says where to unwrap. For question 5, high level is enough: no extra class file, invokedynamic, hidden class, plus the behavioural differences in this and scope. Follow-up for senior candidates: why is relying on lambda identity a bug? Question: which answer would you have got wrong before today?");

  // ===== 14 Pros & cons =====
  s = newSlide("CONTENT", "Practice", "Pros and cons of lambdas");
  const pros = ["Short: the code is the business rule", "No extra class files; JVM can optimise", "Natural this: no Outer.this needed", "Safe capture: values, not variables", "Work with any functional interface", "Easy to compose and pass around"];
  const cons = ["No checked exceptions in java.util.function", "Effectively-final rule surprises beginners", "Stack traces show lambda$main$0 names", "No own state, no second method", "Long block lambdas hurt readability", "Hard to set breakpoints in one-liners"];
  [[pros, "Pros", C.accent1, I.plus, 0.5, C.background2], [cons, "Cons / limitations", C.accent4, I.minus, 5.1, "FBECEC"]].forEach(([list, h, col, ic, x, bg]) => {
    card(s, x, 1.0, 4.4, 3.65, bg, h + " card");
    iconCircle(s, ic, x + 0.2, 1.15, 0.5, col, h);
    s.addText(h, { x: x + 0.85, y: 1.15, w: 3.3, h: 0.5, fontSize: 18, bold: true, color: col, margin: 0, valign: "middle", isTextBox: true, objectName: h + " heading" });
    s.addText(bullets(list, 14.5).map(r => { r.options.paraSpaceAfter = 9; return r; }), { x: x + 0.25, y: 1.85, w: 3.95, h: 2.7, margin: 0, valign: "top", isTextBox: true, objectName: h + " list" });
  });
  s.addNotes("~2 min. A balanced view of lambdas themselves. The pros: the code is short and is the business rule; there are no extra class files; this means what you expect it to mean, with no Outer.this; capturing values rather than variables makes lambdas safe to pass around and run later; and they work with any functional interface, old or new. The cons: checked exceptions do not fit the standard interfaces, as we saw. The effectively-final rule surprises beginners. Stack traces show synthetic names like lambda dollar main dollar zero, which is one more reason to extract longer logic into named methods. A lambda has no state of its own and only one method. And one-liners are harder to debug, though IntelliJ can set a breakpoint on a single lambda, covered in L18. Question: which con matters most in your production support work?");

  // ===== 15 Summary =====
  pres.addSection({ title: "Wrap-up" });
  s = newSlide("DARK_TITLE", "Wrap-up", "Summary");
  const sum = ["(params) -> expression or { block with return }", "Target typing: the context decides the interface", "Captured locals must be effectively final; no counter hacks", "this = enclosing instance; no new scope, no shadowing", "Checked exceptions: custom SAM, wrap with cause, or a value"];
  s.addText(bullets(sum, 14, C.background1), { x: 0.5, y: 2.1, w: 5.2, h: 2.9, margin: 0, valign: "top", isTextBox: true, objectName: "summary bullets" });
  card(s, 6.0, 0.6, 3.5, 2.05, "143F32", "exercise card");
  iconCircle(s, I.code, 6.2, 0.78, 0.45, C.accent2, "exercise");
  s.addText([{ text: "Exercise (~20 min)", options: { bold: true, color: C.accent2, breakLine: true } }, { text: "Refactor LegacyPaymentScreening: anonymous classes → lambdas, no AtomicInteger counter. Remove @Disabled.", options: { color: C.background1, fontSize: 12 } }],
    { x: 6.75, y: 0.75, w: 2.65, h: 1.8, fontSize: 14, margin: 0, valign: "top", isTextBox: true, objectName: "exercise text" });
  card(s, 6.0, 2.85, 3.5, 2.05, "143F32", "next card");
  iconCircle(s, I.rocket, 6.2, 3.03, 0.45, C.accent1, "next");
  s.addText([{ text: "Next: Lesson 04", options: { bold: true, color: C.accent2, breakLine: true } }, { text: "Method References: static, bound, unbound and constructor references.", options: { color: C.background1, fontSize: 12 } }],
    { x: 6.75, y: 3.0, w: 2.65, h: 1.8, fontSize: 14, margin: 0, valign: "top", isTextBox: true, objectName: "next text" });
  s.addNotes("~3 min. Recap the five points with the class. Then the exercise: LegacyPaymentScreening contains three validation rules as anonymous classes, an anonymous Comparator, and a flaggedCount method that uses an anonymous Consumer with an AtomicInteger counter. Learners rewrite everything in Exercise03 as lambdas, extract the two-condition PayNow rule into a named method, and replace the counter with filter plus count. Exercise03Test compares every result with the legacy code: P005 PayNow over 1,000.00, P006 refunded and P008 pending, three flagged payments, and P005, P010, P008 as the three largest. Give 20 minutes, then walk through Solution03. Next lesson: method references, the shorter form of many lambdas we wrote today. Question: which lambda from today could already be a method reference?");

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
})();
