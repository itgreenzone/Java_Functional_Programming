// L01 slide deck generator - ITGreenZone Java Functional Programming
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa");
const { applyTheme } = require("/root/.claude/skills/synced/2eb53c35-a0c8-4343-9257-776fcd7fed67_dd7dcff0-93ee-4601-a8ce-12573fa09cd9/pptx/scripts/apply_theme.js");

const OUT = process.argv[2] || "L04_MethodReferences_Slides.pptx";
const LESSON = "04";
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
pres.title = "L04 Method References";
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
    bug: await icon(fa.FaBug), link: await icon(fa.FaLink), unlink: await icon(fa.FaUnlink), hammer: await icon(fa.FaHammer), cube: await icon(fa.FaCube), th: await icon(fa.FaTh),
  };

  // ===== 1 Title =====
  pres.addSection({ title: "Introduction" });
  let s = newSlide("DARK_TITLE", "Introduction", "Method References");
  s.addText("LESSON 04  ·  MODULE 1 FUNCTIONAL FOUNDATIONS", { x: 0.5, y: 0.6, w: 5.5, h: 0.35, fontSize: 12, bold: true, color: C.accent2, charSpacing: 2, margin: 0, isTextBox: true, objectName: "kicker" });
  s.addText("When a lambda only calls a method, name the method instead", { x: 0.5, y: 2.2, w: 5.0, h: 0.8, fontSize: 16, italic: true, color: C.background2, margin: 0, isTextBox: true, objectName: "subtitle" });
  card(s, 6.0, 0.6, 3.5, 4.3, "143F32", "objectives card");
  s.addText("You will be able to", { x: 6.25, y: 0.75, w: 3.1, h: 0.35, fontSize: 14, bold: true, color: C.accent2, margin: 0, isTextBox: true, objectName: "objectives heading" });
  ["Name the four kinds, plus array constructors", "Map each reference to its equivalent lambda", "Explain when a bound receiver is evaluated", "Use record accessors like Transaction::amount", "Decide: method reference or lambda?"].forEach((o, i) => {
    const y = 1.2 + i * 0.72;
    s.addText(String(i + 1), { shape: pres.shapes.OVAL, x: 6.25, y: y + 0.05, w: 0.36, h: 0.36, fill: { color: C.accent1 }, line: { color: C.accent1 }, fontSize: 12, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "objective number " + (i + 1) });
    s.addText(o, { x: 6.75, y, w: 2.6, h: 0.62, fontSize: 12.5, color: C.background1, valign: "middle", margin: 0, isTextBox: true, objectName: "objective " + (i + 1) });
  });
  s.addNotes("~3 min. Welcome to Lesson 04, the last syntax lesson before Optional and streams. In L03 many lambdas did nothing except call one method: t -> t.amount(), s -> System.out.println(s), p -> new Receipt(...). Java 8 gives these a shorter, more readable form: the method reference, written with a double colon. Today we cover the four kinds, static, bound instance, unbound instance and constructor, plus array constructors, and for each one we show the exact lambda it replaces. We also cover two subtle behaviours that interviewers love: when the receiver of a bound reference is evaluated, and what happens with null. Finally we learn when a lambda is still the clearer choice. Every printed value is real output from the shared dataset. Question to ask: who already uses System.out::println without thinking about what kind of reference it is?");

  // ===== 2 Problem =====
  pres.addSection({ title: "Theory" });
  s = newSlide("CONTENT", "Theory", "The problem: lambdas that only forward a call");
  codeBlock(s, `payments.stream()
    .filter(p -> p.status() == SUCCESS)
    .sorted((a, b) -> a.amount()
                       .compareTo(b.amount()))
    .map(p -> new Receipt(p.id(), p.amount()))
    .forEach(r -> printer.print(r));`, 0.5, 1.05, 4.4, 2.6, { label: "AFTER L03  ·  after/LambdaSettlementReport", fontSize: 10.5, name: "lambda code" });
  codeBlock(s, `payments.stream()
    .filter(Fees::isSuccessful)
    .sorted(Comparator.comparing(
            Payment::amount))
    .map(Receipt::from)
    .forEach(printer::print);`, 5.1, 1.05, 4.4, 2.6, { label: "L04  ·  modern/MethodReferenceReport", fontSize: 10.5, name: "ref code" });
  badge(s, "Java 8", 8.75, 1.1);
  outputBox(s, "Both: SETTLED | P009 18.80 … SETTLED | P005 1500.00  (8 settled payments)", 0.5, 3.8, 9.0, 0.45, "problem output");
  s.addText("A lambda says HOW to call; a method reference says WHAT is called. The parameters are implied by the target type.", { x: 0.5, y: 4.4, w: 9, h: 0.6, fontSize: 13.5, italic: true, color: C.text2, margin: 0, isTextBox: true, objectName: "problem note" });
  s.addNotes("~3 min. On the left, the settlement report from the L03 style: every lambda only forwards its parameters to one method. The parameter names p, a, b and r add nothing; the reader has to check that they are passed straight through. On the right, the same pipeline with method references: filter by Fees::isSuccessful, sort by Payment::amount, map with the Receipt::from factory, and print with printer::print. It reads like a description of the report. DEMO: run LegacySettlementReport, LambdaSettlementReport and MethodReferenceReport; all three print the same eight settled payments from P009 at 18.80 to P005 at 1,500.00, and ReportRefactoringTest proves it. Key idea: a method reference is not new behaviour. It is a compact way to write a lambda that calls one existing method. Question: which of the four lambdas on the left would you find hardest to read?");

  // ===== 3 Four kinds overview =====
  s = newSlide("CONTENT", "Theory", "The four kinds (plus array constructors)");
  const kinds = [[I.cube, "Static", "Class::staticMethod", "Integer::parseInt", "s -> Integer.parseInt(s)"], [I.link, "Bound instance", "object::method", "printer::print", "r -> printer.print(r)"], [I.unlink, "Unbound instance", "Class::instanceMethod", "String::toUpperCase", "s -> s.toUpperCase()"], [I.hammer, "Constructor", "Class::new", "BigDecimal::new", "s -> new BigDecimal(s)"], [I.th, "Array constructor", "Type[]::new", "String[]::new", "n -> new String[n]"]];
  kinds.forEach(([ic, h, form, ex, lam], i) => {
    const y = 1.0 + i * 0.82;
    card(s, 0.5, y, 9.0, 0.7, i % 2 ? C.background1 : C.background2, "kind " + h);
    iconCircle(s, ic, 0.62, y + 0.12, 0.46, C.accent1, h);
    s.addText(h, { x: 1.2, y, w: 1.75, h: 0.7, fontSize: 14, bold: true, color: C.text2, margin: 0, valign: "middle", isTextBox: true, objectName: "kind name " + i });
    s.addText(form, { x: 2.95, y, w: 2.05, h: 0.7, fontSize: 10.5, fontFace: MONO, color: C.accent5, margin: 0, valign: "middle", isTextBox: true, objectName: "kind form " + i });
    s.addText(ex, { x: 5.0, y, w: 2.15, h: 0.7, fontSize: 11.5, bold: true, fontFace: MONO, color: C.accent1, margin: 0, valign: "middle", isTextBox: true, objectName: "kind example " + i });
    s.addText("= " + lam, { x: 7.2, y, w: 2.25, h: 0.7, fontSize: 10, fontFace: MONO, color: C.text1, margin: 0, valign: "middle", isTextBox: true, objectName: "kind lambda " + i });
  });
  s.addText("All since Java 8. The target type's method decides which parameters go where.", { x: 0.5, y: 5.0, w: 9, h: 0.25, fontSize: 11, italic: true, color: C.accent5, margin: 0, isTextBox: true, objectName: "kinds note" });
  s.addNotes("~3 min. This slide is the map of the lesson. There are four kinds of method reference, plus array constructors as a special case of constructors. Static: Class double-colon static method, all lambda parameters become arguments. Bound instance: an object expression double-colon method, the receiver is fixed and the parameters become arguments. Unbound instance: Class double-colon instance method, the first parameter becomes the receiver. Constructor: Class double-colon new, the parameters become constructor arguments. Array constructor: Type square brackets double-colon new, the int parameter becomes the length. The right column shows the exact lambda each one replaces. The compiler always works from the target type's single abstract method, which decides how many parameters there are and where they go. Question: is String::toUpperCase static or instance? Answer: instance, unbound.");

  // ===== 4 Static =====
  s = newSlide("CONTENT", "Theory", "Kind 1: static method references");
  codeBlock(s, `Function<String, Integer> PARSE = Integer::parseInt;
BinaryOperator<Integer> MAX = Math::max;
Predicate<Object> NOT_NULL = Objects::nonNull;

// your own static helpers are the best targets
Function<BigDecimal, BigDecimal> TRANSFER_FEE =
        Fees::transferFee;
BiFunction<BigDecimal, BigDecimal, BigDecimal> FEE =
        Fees::fee;          // (a, r) -> Fees.fee(a, r)
Predicate<Payment> SUCCESSFUL = Fees::isSuccessful;`, 0.5, 1.05, 5.5, 3.2, { label: "theory/StaticReferences", fontSize: 10.5, name: "static code" });
  outputBox(s, "parseInt(\"120\") → 120 · max(301, 264) → 301 · nonNull(null) → false\ntransferFee(2500.00) → 12.50 · fee(1500.00, 0.25) → 3.75 · isSuccessful → 8", 0.5, 4.4, 9.0, 0.65, "static output");
  card(s, 6.25, 1.05, 3.25, 3.2, C.background2, "static rule card");
  s.addText([{ text: "Rule", options: { bold: true, color: C.text2, fontSize: 15, breakLine: true } }, { text: "All lambda parameters become the method's arguments, in the same order.", options: { breakLine: true } }, { text: " ", options: { breakLine: true } }, { text: "Tip", options: { bold: true, color: C.text2, fontSize: 15, breakLine: true } }, { text: "Extract business rules into small static methods (Fees::isSuccessful). The pipeline then reads like the requirement.", options: {} }],
    { x: 6.4, y: 1.15, w: 2.95, h: 3.0, fontSize: 12.5, color: C.text1, margin: 0, valign: "top", isTextBox: true, objectName: "static rule text" });
  s.addNotes("~2 min. A static method reference is the simplest kind. The lambda's parameters are passed to the static method in order: one parameter for parseInt and nonNull, two for Math.max and our Fees.fee. The most valuable targets are your own static helpers. Fees.transferFee and Fees.isSuccessful give business rules a name; once a rule has a name, a method reference makes the pipeline read like the requirement. That is also how we will avoid long lambdas. DEMO: run StaticReferences. The output shows parseInt of the string 120 gives 120, max of 301 and 264, nonNull of null is false, the 2,500.00 transfer fee is 12.50, a 0.25 percent fee on 1,500.00 is 3.75, and 8 payments are successful. Question: what target type would Math::max need to avoid boxing? Answer: IntBinaryOperator.");

  // ===== 5 Bound =====
  s = newSlide("CONTENT", "Theory", "Kind 2: bound instance references");
  codeBlock(s, `ReceiptPrinter printer =
        new ReceiptPrinter("SETTLED");
payments.stream()
    .filter(Fees::isSuccessful)
    .map(Receipt::from)
    .forEach(printer::print); // r -> printer.print(r)

Predicate<String> IS_SGD = "SGD"::equals;
lines.forEach(System.out::println); // System.out`, 0.5, 1.05, 5.0, 2.65, { label: "theory/BoundReferences", fontSize: 10.5, name: "bound code" });
  outputBox(s, "SETTLED | P001 120.00 · SETTLED | P002 45.50 · SETTLED | P004 89.90", 0.5, 3.85, 5.0, 0.6, "bound output");
  card(s, 5.75, 1.05, 3.75, 1.9, "FFF4E0", "eager card");
  s.addText([{ text: "Receiver evaluated ONCE, at creation", options: { bold: true, color: C.accent2, breakLine: true } }, { text: "reference: newPrinter.get() runs once and the printer is reused", options: { fontSize: 11.5, breakLine: true } }, { text: "lambda: newPrinter.get() runs on every call", options: { fontSize: 11.5 } }],
    { x: 5.9, y: 1.1, w: 3.5, h: 1.8, fontSize: 12.5, color: C.text1, margin: 0, valign: "middle", isTextBox: true, objectName: "eager text" });
  card(s, 5.75, 3.1, 3.75, 1.9, "FBECEC", "null card");
  s.addText([{ text: "Null receiver fails EARLY", options: { bold: true, color: C.accent4, breakLine: true } }, { text: "code::length with code == null → NPE when the reference is created", options: { fontSize: 11.5, breakLine: true } }, { text: "() -> code.length() → NPE only when called", options: { fontSize: 11.5 } }],
    { x: 5.9, y: 3.15, w: 3.5, h: 1.8, fontSize: 12.5, color: C.text1, margin: 0, valign: "middle", isTextBox: true, objectName: "null text" });
  s.addText("receiver evaluation: creating both: new | 2 reference calls: | 2 lambda calls: new new", { x: 0.5, y: 4.6, w: 5.0, h: 0.5, fontSize: 9, fontFace: MONO, color: C.accent5, margin: 0, isTextBox: true, objectName: "eager output" });
  s.addNotes("~4 min. A bound reference fixes the receiver object: printer::print always prints to that one printer, and the stream element becomes the argument. System.out::println is also a bound reference, bound to the System.out object. Two subtle behaviours, both proved by tests. First, the receiver expression is evaluated once, when the reference is created. newPrinter.get()::print creates one printer immediately and reuses it; the equivalent-looking lambda calls newPrinter on every call. The output line at the bottom shows exactly that: one 'new' at creation, none during two reference calls, two during two lambda calls. Second, if the receiver is null, the method reference throws NullPointerException immediately at creation, while the lambda only fails when it is called. DEMO: run BoundReferences. Question: why could the eager evaluation matter for a database connection or a clock?");

  // ===== 6 Unbound =====
  s = newSlide("CONTENT", "Theory", "Kind 3: unbound instance references");
  codeBlock(s, `Function<String, String> UPPER = String::toUpperCase;
                       // s -> s.toUpperCase()
Function<Transaction, BigDecimal> AMOUNT =
        Transaction::amount;      // record accessor
BinaryOperator<BigDecimal> ADD = BigDecimal::add;
                       // (a, b) -> a.add(b)
BiPredicate<String, String> SAME =
        String::equalsIgnoreCase;
Comparator<String> IGNORE_CASE =
        String::compareToIgnoreCase;

accounts.stream().map(Account::balance)
        .reduce(BigDecimal.ZERO, ADD);`, 0.5, 1.05, 5.5, 3.3, { label: "theory/UnboundReferences", fontSize: 10.5, name: "unbound code" });
  const ub = [["(a, b) -> a.add(b)", "BigDecimal::add"], ["first param", "= the receiver"], ["other params", "= the arguments"]];
  s.addText("How the parameters move", { x: 6.25, y: 1.05, w: 3.25, h: 0.35, fontSize: 14, bold: true, color: C.text2, margin: 0, isTextBox: true, objectName: "move heading" });
  s.addText([{ text: "(a, b)", options: { color: C.accent3, bold: true } }, { text: " -> ", options: {} }, { text: "a", options: { color: C.accent4, bold: true } }, { text: ".add(", options: {} }, { text: "b", options: { color: C.accent1, bold: true } }, { text: ")", options: {} }], { x: 6.25, y: 1.5, w: 3.25, h: 0.45, fontSize: 15, fontFace: MONO, color: C.text1, margin: 0, isTextBox: true, objectName: "move lambda" });
  s.addText([{ text: "a", options: { color: C.accent4, bold: true } }, { text: " = receiver, ", options: { fontFace: THEME.bodyFontFace } }, { text: "b", options: { color: C.accent1, bold: true } }, { text: " = argument", options: { fontFace: THEME.bodyFontFace } }], { x: 6.25, y: 1.95, w: 3.25, h: 0.4, fontSize: 13, fontFace: MONO, color: C.text1, margin: 0, isTextBox: true, objectName: "move explain" });
  s.addText(ub[0][1], { x: 6.25, y: 2.4, w: 3.25, h: 0.45, fontSize: 15, bold: true, fontFace: MONO, color: C.accent1, margin: 0, isTextBox: true, objectName: "move ref" });
  badge(s, "Java 16", 6.25, 3.0, { w: 0.75 });
  s.addText("records give free accessors: Transaction::amount, Account::balance", { x: 7.1, y: 2.9, w: 2.4, h: 0.6, fontSize: 11, color: C.text1, margin: 0, isTextBox: true, objectName: "record note" });
  outputBox(s, "UPPER(\"paynow\") → PAYNOW · AMOUNT(T003) → 1221.40 · total balance → 300382.25 · equalsIgnoreCase(sgd, SGD) → true", 0.5, 4.5, 9.0, 0.55, "unbound output");
  s.addNotes("~4 min. The unbound kind is the one that confuses people. The syntax is Class double-colon instance method, so there is no object on the left. Where does the object come from? From the first parameter. String::toUpperCase as a Function takes one String s and calls s.toUpperCase(). BigDecimal::add as a BinaryOperator takes two parameters: the first, a, becomes the receiver and the second, b, the argument, so it means a.add(b). That is why BigDecimal::add fits reduce. Records from Java 16 make this kind extremely common: every component has an accessor, so Transaction::amount and Account::balance are free method references. DEMO: run UnboundReferences: the total of all 15 balances is 300,382.25, the same number as the L01 month-end job. Question: as a Comparator<String>, what does String::compareToIgnoreCase expand to?");

  // ===== 7 Constructor =====
  s = newSlide("CONTENT", "Theory", "Kinds 4 and 5: constructor and array references");
  codeBlock(s, `Supplier<List<Payment>> NEW_LIST = ArrayList::new;
Function<String, BigDecimal> TO_AMOUNT = BigDecimal::new;
BiFunction<String, BigDecimal, Receipt> NEW_RECEIPT =
        Receipt::new;               // record constructor
CustomerFactory NEW_CUSTOMER = Customer::new; // 5 args!

IntFunction<String[]> NEW_STRING_ARRAY = String[]::new;
String[] ids = payments.stream()
        .map(Payment::id).toArray(String[]::new);
TreeSet<String> methods = payments.stream()
        .map(Payment::method)
        .collect(Collectors.toCollection(TreeSet::new));`, 0.5, 1.05, 5.9, 3.3, { label: "theory/ConstructorReferences", fontSize: 10.5, name: "ctor code" });
  card(s, 6.6, 1.05, 2.9, 1.65, C.background2, "factory card");
  s.addText([{ text: "5 parameters?", options: { bold: true, color: C.text2, breakLine: true } }, { text: "The JDK stops at BiFunction, so declare a SAM: CustomerFactory.create(id, name, city, tier, joined).", options: { fontSize: 11.5 } }], { x: 6.75, y: 1.1, w: 2.65, h: 1.55, fontSize: 13, color: C.text1, margin: 0, valign: "middle", isTextBox: true, objectName: "factory text" });
  card(s, 6.6, 2.85, 2.9, 1.5, "FBECEC", "shape card");
  s.addText([{ text: "Shape must match", options: { bold: true, color: C.accent4, breakLine: true } }, { text: "Function<String, Customer> f = Customer::new → invalid constructor reference", options: { fontSize: 11 } }], { x: 6.75, y: 2.9, w: 2.65, h: 1.4, fontSize: 13, color: C.text1, margin: 0, valign: "middle", isTextBox: true, objectName: "shape text" });
  outputBox(s, "BigDecimal::new → 59.90 · toArray → [P001 … P004] · TreeSet::new → [CARD, PAYNOW, PAYPAL]", 0.5, 4.5, 9.0, 0.55, "ctor output");
  s.addNotes("~3 min. A constructor reference passes the lambda's parameters to a constructor. ArrayList::new as a Supplier calls the no-argument constructor; BigDecimal::new as a Function<String, BigDecimal> calls the String constructor; Receipt::new as a BiFunction calls the record's two-argument constructor. The compiler picks the constructor whose parameters match the target type. Customer has five components and the JDK has no five-parameter interface, so we declare our own CustomerFactory; this is the 'more than two parameters' rule from L02. If the shapes do not match, for example Customer::new as a Function<String, Customer>, the compiler says 'invalid constructor reference'. Array constructors use Type square brackets double-colon new; their most common use is toArray(String[]::new). Collectors.toCollection(TreeSet::new) gives a sorted set. DEMO: run ConstructorReferences. Question: why does toArray need String[]::new instead of returning Object[]?");

  // ===== 8 Mapping table =====
  pres.addSection({ title: "Reference" });
  s = newSlide("CONTENT", "Reference", "Mapping table: reference → target → lambda");
  const hdr = ["Kind", "Method reference", "Target type", "Equivalent lambda", "Result"].map(t => ({ text: t, options: { bold: true, color: C.background1, fill: { color: C.text2 } } }));
  const rows = [
    ["Static", "Integer::parseInt", "Function<String,Integer>", "s -> Integer.parseInt(s)", "120"],
    ["Static", "Fees::fee", "BiFunction<BD,BD,BD>", "(a, r) -> Fees.fee(a, r)", "3.75"],
    ["Bound", "printer::print", "Consumer<Receipt>", "r -> printer.print(r)", "SETTLED | …"],
    ["Bound", "\"SGD\"::equals", "Predicate<String>", "s -> \"SGD\".equals(s)", "false (USD)"],
    ["Unbound", "Transaction::amount", "Function<Transaction,BD>", "t -> t.amount()", "1221.40"],
    ["Unbound", "BigDecimal::add", "BinaryOperator<BD>", "(a, b) -> a.add(b)", "300382.25"],
    ["Constructor", "BigDecimal::new", "Function<String,BD>", "s -> new BigDecimal(s)", "59.90"],
    ["Constructor", "Receipt::new", "BiFunction<String,BD,Receipt>", "(id, a) -> new Receipt(id, a)", "Receipt[…]"],
    ["Array", "String[]::new", "IntFunction<String[]>", "n -> new String[n]", "length 3"],
  ].map((r, i) => r.map((c, j) => ({ text: c, options: Object.assign({ fill: { color: i % 2 ? C.background1 : C.background2 }, color: C.text1 }, j === 0 ? { bold: true } : {}, j === 1 ? { fontFace: MONO, bold: true, color: C.accent1, fontSize: 10 } : {}, (j === 2 || j === 3) ? { fontFace: MONO, fontSize: 9.5 } : {}, j === 4 ? { fontFace: MONO, fontSize: 9.5 } : {}) })));
  s.addTable([hdr, ...rows], { x: 0.5, y: 1.0, w: 9.0, colW: [0.95, 1.85, 2.45, 2.5, 1.25], fontSize: 10.5, rowH: 0.36, border: { type: "solid", pt: 0.5, color: "D5E3DA" }, valign: "middle", margin: [2, 4, 2, 4], objectName: "mapping table" });
  s.addText("BD = BigDecimal. All method-reference forms: Java 8. Record accessors: Java 16.", { x: 0.5, y: 4.75, w: 9, h: 0.3, fontSize: 11.5, italic: true, color: C.accent5, margin: 0, isTextBox: true, objectName: "mapping note" });
  s.addNotes("~3 min. This is the reference table for the lesson, also on the cheat sheet. Read it left to right: a method reference only has meaning together with its target type, and the equivalent lambda column shows exactly what the compiler generates the behaviour for. Practise reading it backwards too: given a lambda, which kind of reference could replace it? If the lambda just passes its parameters to a static method, it is static. If it calls a method on a fixed object, it is bound. If it calls a method on its first parameter, it is unbound. If it calls new, it is a constructor reference. Every result in the last column comes from the theory classes and is checked by MethodReferenceKindsTest, which also compares each reference against its lambda for all 60 transactions. Question: which row would change if the target were ToIntFunction instead of Function?");

  // ===== 9 Before/after/modern =====
  pres.addSection({ title: "Worked example" });
  s = newSlide("CONTENT", "Worked example", "Refactor: loops → lambdas → method references");
  codeBlock(s, `List<Payment> settled = new ArrayList<>();
for (Payment p : payments)
    if (p.status() == SUCCESS) settled.add(p);
Collections.sort(settled,
    new Comparator<Payment>() {
      public int compare(Payment a, Payment b) {
        return a.amount().compareTo(b.amount());
      } });
for (Payment p : settled)
    printer.print(new Receipt(p.id(), p.amount()));`, 0.5, 1.05, 4.55, 3.15, { label: "BEFORE  ·  before/LegacySettlementReport", fontSize: 10, name: "legacy code" });
  codeBlock(s, `ReceiptPrinter printer =
        new ReceiptPrinter("SETTLED");
payments.stream()
    .filter(Fees::isSuccessful)
    .sorted(Comparator.comparing(
            Payment::amount))
    .map(Receipt::from)
    .forEach(printer::print);

String[] ids = payments.stream()
    .filter(Fees::isSuccessful)
    .map(Payment::id).toArray(String[]::new);`, 5.2, 1.05, 4.3, 3.15, { label: "MODERN  ·  modern/MethodReferenceReport", fontSize: 10, name: "modern code" });
  outputBox(s, "Legacy = Lambda = Method refs: P009 18.80, P002 45.50, P007 75.00, P004 89.90, P001 120.00, P011 150.00, P010 999.99, P005 1500.00", 0.5, 4.35, 9.0, 0.65, "refactor output");
  s.addNotes("~3 min. The full refactoring on one slide. Before Java 8: a loop to filter into a temporary list, Collections.sort with an anonymous Comparator, and another loop to print. The middle step, with plain lambdas, was on slide 2. The modern version uses five method references, one of each common kind: Fees::isSuccessful is static, Payment::amount is an unbound record accessor used with Comparator.comparing, which we study in L08, Receipt::from is a static factory on a record, printer::print is bound, and String[]::new is an array constructor for toArray. ReportRefactoringTest proves that all three versions produce exactly the same eight lines in the same order, sorted by amount from 18.80 to 1,500.00. DEMO: run the three report classes. Question: why did we add a static factory Receipt.from instead of using Receipt::new here?");

  // ===== 10 Modern =====
  s = newSlide("CONTENT", "Worked example", "Method references in modern Java (11–21)");
  const mod = [["Java 11", "Predicate.not(LambdaOrReference::isDebit)", "negate a reference: 15 credits"], ["Java 16", "Transaction::amount, Account::balance", "record accessors are free targets"], ["Java 16", "map(Payment::id).toList()", "unmodifiable result"], ["Java 8+", "Comparator.comparing(Payment::amount)", "key extractor (L08)"], ["Java 8+", "Collectors.toCollection(TreeSet::new)", "choose the collection (L10)"], ["Java 21", "list.reversed().forEach(System.out::println)", "sequenced collections (L16)"]];
  mod.forEach(([v, c, d], i) => {
    const y = 1.0 + i * 0.66;
    card(s, 0.5, y, 9.0, 0.56, i % 2 ? C.background1 : C.background2, "mod card " + i);
    badge(s, v, 0.65, y + 0.16, { w: 0.75 });
    s.addText(c, { x: 1.55, y, w: 4.7, h: 0.56, fontSize: 12, fontFace: MONO, bold: true, color: C.accent1, margin: 0, valign: "middle", isTextBox: true, objectName: "mod code " + i });
    s.addText(d, { x: 6.3, y, w: 3.1, h: 0.56, fontSize: 12.5, color: C.text1, margin: 0, valign: "middle", isTextBox: true, objectName: "mod desc " + i });
  });
  s.addText("The syntax has not changed since Java 8; what changed is how many good targets exist.", { x: 0.5, y: 5.0, w: 9, h: 0.28, fontSize: 12, italic: true, color: C.text2, margin: 0, isTextBox: true, objectName: "mod note" });
  s.addNotes("~2 min. The method reference syntax itself has not changed since Java 8. What changed is how many good targets the platform gives us. Java 11's Predicate.not lets us negate a method reference without falling back to a lambda: Predicate.not of isDebit gives the 15 credit transactions. Java 16 records give every component a free accessor, which is why Transaction::amount and Account::balance appear everywhere in this course, and Stream.toList pairs naturally with map of a method reference. Comparator.comparing and Collectors.toCollection take method references as their main argument; they are covered in L08 and L10. Java 21's sequenced collections add reversed, getFirst and getLast, which combine well with System.out::println; covered in L16. Question: in your own code, which records could replace getter-heavy classes so that you get these references for free?");

  // ===== 11 Lambda or reference =====
  pres.addSection({ title: "Standards" });
  s = newSlide("CONTENT", "Standards", "Method reference or lambda?");
  const use = [["Use a method reference when…", C.accent1, I.check, ["the lambda only forwards its parameters", "the method name says what happens: Fees::isSuccessful", "it is a record accessor or constructor", "it replaces a 3+ line lambda you extracted to a method"]], ["Keep a lambda when…", C.accent3, I.times, ["there is an extra argument: a -> Fees.fee(a, RATE)", "there is a chain: t -> t.amount().compareTo(LIMIT) > 0", "the reference is ambiguous: i -> i.toString()", "the lambda is shorter and clearer than the reference"]]];
  use.forEach(([h, col, ic, items], ci) => {
    const x = 0.5 + ci * 4.6;
    card(s, x, 1.0, 4.4, 3.55, ci ? "EAF0FB" : C.background2, "use card " + ci);
    iconCircle(s, ic, x + 0.15, 1.12, 0.45, col, "use " + ci);
    s.addText(h, { x: x + 0.7, y: 1.12, w: 3.6, h: 0.45, fontSize: 15, bold: true, color: col, margin: 0, valign: "middle", isTextBox: true, objectName: "use head " + ci });
    s.addText(bullets(items, 13).map(r => { r.options.paraSpaceAfter = 9; return r; }), { x: x + 0.2, y: 1.75, w: 4.05, h: 2.7, margin: 0, valign: "top", isTextBox: true, objectName: "use list " + ci });
  });
  outputBox(s, "a -> Fees.fee(a, RATE) on 1500.00 → 3.75 · lambda vs named reference → 11 = 11", 0.5, 4.65, 9.0, 0.42, "use output");
  s.addNotes("~3 min. Method references are not always better, and the goal is readability, not a style score. Use a method reference when the lambda only forwards its parameters, when the method name explains the intent, and for record accessors and constructors. It is also the natural follow-up when you extract a long lambda into a named method. Keep a lambda when you need an extra argument, which is called partial application: a arrow Fees.fee of a and RATE has no method reference form. Keep it when there is a chain of calls with a comparison, unless you give that logic a name; LambdaOrReference shows the named isHighValue version gives the same 11 results. Keep it when the reference is ambiguous, and whenever the lambda is simply clearer. Question: would you write Function.identity() or x -> x? Most teams accept both; consistency matters more.");

  // ===== 12 Pitfalls =====
  s = newSlide("CONTENT", "Standards", "Pitfalls");
  codeBlock(s, `Function<Integer, String> f = Integer::toString;
// error: incompatible types: invalid method reference
//   reference to toString is ambiguous
//   both method toString(int) in Integer
//   and method toString() in Integer match

// FIX
Function<Integer, String> f1 = i -> i.toString();
Function<Integer, String> f2 = String::valueOf;`, 0.5, 1.05, 5.0, 3.0, { label: "Pitfall 1: ambiguous overloads (real compiler, tested)", fontSize: 10.5, name: "ambig code" });
  const pits = [["Pitfall 2: eager receiver", "factory()::method calls factory() once, at creation, not per call."], ["Pitfall 3: null receiver", "nullRef::method throws NPE immediately, even if never called."], ["Pitfall 4: wrong constructor shape", "Customer::new needs 5 parameters: invalid constructor reference."], ["Pitfall 5: vague names", "this::process hides intent; prefer Fees::isSuccessful."]];
  pits.forEach(([h, d], i) => {
    const y = 1.05 + i * 0.97;
    card(s, 5.7, y, 3.8, 0.85, "FBECEC", "pit card " + i);
    iconCircle(s, I.bug, 5.82, y + 0.2, 0.42, C.accent4, "pit " + i);
    s.addText([{ text: h, options: { bold: true, color: C.accent4, breakLine: true } }, { text: d, options: { fontSize: 11, color: C.text1 } }], { x: 6.35, y: y + 0.03, w: 3.05, h: 0.8, fontSize: 12.5, margin: 0, valign: "middle", isTextBox: true, objectName: "pit text " + i });
  });
  s.addText("Integer has a static toString(int) and an instance toString(). For a Function<Integer,String>, both fit: static (i) and unbound i.toString().", { x: 0.5, y: 4.2, w: 5.0, h: 0.85, fontSize: 12, italic: true, color: C.text2, margin: 0, valign: "top", isTextBox: true, objectName: "ambig explain" });
  s.addNotes("~3 min. Pitfall 1 is the classic. Integer has a static method toString(int) and an instance method toString(). For a Function<Integer, String>, Integer::toString could mean the static method with the parameter as argument, or the unbound instance method with the parameter as receiver. Both fit, so the compiler refuses, and our test reproduces the exact message. Fix it with a lambda or with String::valueOf. Pitfalls 2 and 3 are the bound-receiver behaviours from slide 5: the receiver is evaluated once at creation, and a null receiver fails immediately. Pitfall 4: a constructor reference needs a target type whose parameters match a constructor. Pitfall 5 is about readability: a reference like this::process is legal but tells the reader nothing; good method names are what make method references worth using. Question: why does Integer::parseInt not have the same ambiguity problem?");

  // ===== 13 Interview =====
  pres.addSection({ title: "Practice" });
  s = newSlide("CONTENT", "Practice", "Interview questions");
  const qa = [
    ["What are the kinds of method reference?", "Static, bound instance, unbound instance, constructor; plus array constructor Type[]::new."],
    ["Bound vs unbound?", "Bound fixes the receiver (printer::print). Unbound takes it from the first parameter (String::toUpperCase)."],
    ["When is a bound receiver evaluated?", "Once, when the reference is created. A null receiver throws NPE at creation."],
    ["Why does Integer::toString not compile as Function<Integer,String>?", "Static toString(int) and instance toString() both match: ambiguous."],
    ["How do you use a constructor with 5 parameters as a reference?", "Declare a custom functional interface with 5 parameters, e.g. CustomerFactory, then Customer::new."],
  ];
  qa.forEach(([q, a], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = i === 4 ? 0.5 : 0.5 + col * 4.6, y = 1.0 + row * 1.38, w = i === 4 ? 9.0 : 4.4;
    card(s, x, y, w, 1.22, C.background2, "qa card " + i);
    s.addText("Q" + (i + 1), { shape: pres.shapes.OVAL, x: x + 0.12, y: y + 0.14, w: 0.42, h: 0.42, fill: { color: C.text2 }, line: { color: C.text2 }, fontSize: 11, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "q badge " + i });
    s.addText([{ text: q, options: { bold: true, color: C.text2, breakLine: true } }, { text: a, options: { color: C.text1, fontSize: 12 } }], { x: x + 0.65, y: y + 0.06, w: w - 0.8, h: 1.1, fontSize: 13, margin: 0, valign: "middle", isTextBox: true, objectName: "qa text " + i });
  });
  s.addNotes("~3 min. Five interview questions. Run them as a quick round with ten seconds each. For question 1, many candidates forget array constructor references; give credit for mentioning toArray(String[]::new). For question 2, ask for an example of each from the dataset: printer::print and Transaction::amount. Question 3 separates mid-level from senior candidates: the receiver is evaluated eagerly, and a null receiver fails immediately at creation, unlike the lambda. For question 4, a strong answer explains both candidate methods and gives a fix. For question 5, the answer links back to L02: write your own functional interface when you need more than two parameters, or group the values into a record. Question: which of these would you now ask a candidate in your own interviews?");

  // ===== 14 Pros & cons =====
  s = newSlide("CONTENT", "Practice", "Pros and cons of method references");
  const pros = ["Shorter: no parameter names to read", "Says WHAT is called, not how", "Encourages small, named methods", "Records give free accessor references", "Same runtime mechanism as a lambda", "IDE can navigate to the method"];
  const cons = ["Four kinds: unbound ones confuse beginners", "Ambiguous overloads (Integer::toString)", "Bound receiver evaluated eagerly", "No extra arguments or chains", "Vague names (this::process) hide intent", "Overuse can be cryptic for new readers"];
  [[pros, "Pros", C.accent1, I.plus, 0.5, C.background2], [cons, "Cons / limitations", C.accent4, I.minus, 5.1, "FBECEC"]].forEach(([list, h, col, ic, x, bg]) => {
    card(s, x, 1.0, 4.4, 3.65, bg, h + " card");
    iconCircle(s, ic, x + 0.2, 1.15, 0.5, col, h);
    s.addText(h, { x: x + 0.85, y: 1.15, w: 3.3, h: 0.5, fontSize: 18, bold: true, color: col, margin: 0, valign: "middle", isTextBox: true, objectName: h + " heading" });
    s.addText(bullets(list, 14.5).map(r => { r.options.paraSpaceAfter = 9; return r; }), { x: x + 0.25, y: 1.85, w: 3.95, h: 2.7, margin: 0, valign: "top", isTextBox: true, objectName: h + " list" });
  });
  s.addNotes("~2 min. A balanced view. Method references are shorter, they describe what is called rather than how, and they push the team towards small, well-named methods, which is good design in its own right. Records give us accessor references for free. There is no performance difference compared with the equivalent lambda, and the IDE can jump straight to the referenced method. The costs: four kinds to learn, with unbound references the hardest for beginners; ambiguous overloads; the eager receiver behaviour; no way to pass extra arguments or chain calls; and the risk that heavy use makes code cryptic for readers who are new to Java 8 style. The rule of thumb from slide 11 resolves most of these: use whichever form is clearer for the reader. Question: what guideline would you add to your team's code review checklist?");

  // ===== 15 Summary =====
  pres.addSection({ title: "Wrap-up" });
  s = newSlide("DARK_TITLE", "Wrap-up", "Summary");
  const sum = ["A method reference = a lambda that calls one existing method", "Static, bound, unbound, constructor, array constructor", "Unbound: the first parameter is the receiver", "Bound receiver: evaluated once; null fails at creation", "Keep a lambda for extra arguments, chains, ambiguity"];
  s.addText(bullets(sum, 14, C.background1), { x: 0.5, y: 2.1, w: 5.2, h: 2.9, margin: 0, valign: "top", isTextBox: true, objectName: "summary bullets" });
  card(s, 6.0, 0.6, 3.5, 2.05, "143F32", "exercise card");
  iconCircle(s, I.code, 6.2, 0.78, 0.45, C.accent2, "exercise");
  s.addText([{ text: "Exercise (~20 min)", options: { bold: true, color: C.accent2, breakLine: true } }, { text: "Convert 10 lambdas in Exercise04 to method references where possible. Two must stay lambdas: explain why. Keep Exercise04Test green.", options: { color: C.background1, fontSize: 12 } }],
    { x: 6.75, y: 0.75, w: 2.65, h: 1.8, fontSize: 14, margin: 0, valign: "top", isTextBox: true, objectName: "exercise text" });
  card(s, 6.0, 2.85, 3.5, 2.05, "143F32", "next card");
  iconCircle(s, I.rocket, 6.2, 3.03, 0.45, C.accent1, "next");
  s.addText([{ text: "Next: Lesson 05", options: { bold: true, color: C.accent2, breakLine: true } }, { text: "Optional done right: orElse vs orElseGet, chaining, and the anti-patterns.", options: { color: C.background1, fontSize: 12 } }],
    { x: 6.75, y: 3.0, w: 2.65, h: 1.8, fontSize: 14, margin: 0, valign: "top", isTextBox: true, objectName: "next text" });
  s.addNotes("~3 min. Recap the five points. Then the exercise. Exercise04 contains ten lambdas: a record accessor, a String to BigDecimal conversion, a null check, a BigDecimal sum, a list factory, an array factory, an upper-case conversion, a logger bound to a StringBuilder, a high-value check and an Integer to String conversion. Learners convert each one to a method reference where possible. Eight convert; two must stay lambdas: the high-value check, because it chains calls with a comparison against a constant, and the Integer to String conversion, because Integer::toString is ambiguous. For each one they keep, they write a one-line comment explaining why. Exercise04Test must stay green throughout, which proves behaviour did not change. Give 20 minutes, then compare with Solution04. Next lesson: Optional. Question: which conversion do you expect to be the trickiest?");

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
})();
