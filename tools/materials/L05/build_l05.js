// L01 slide deck generator - ITGreenZone Java Functional Programming
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa");
const { applyTheme } = require("/root/.claude/skills/synced/2eb53c35-a0c8-4343-9257-776fcd7fed67_dd7dcff0-93ee-4601-a8ce-12573fa09cd9/pptx/scripts/apply_theme.js");

const OUT = process.argv[2] || "L05_Optional_Slides.pptx";
const LESSON = "05";
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
pres.title = "L05 Optional, Done Right";
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
    bug: await icon(fa.FaBug), box: await icon(fa.FaBoxOpen), boxc: await icon(fa.FaBox),
  };

  // ===== 1 Title =====
  pres.addSection({ title: "Introduction" });
  let s = newSlide("DARK_TITLE", "Introduction", "Optional, Done Right");
  s.addText("LESSON 05  ·  MODULE 1 FUNCTIONAL FOUNDATIONS", { x: 0.5, y: 0.6, w: 5.5, h: 0.35, fontSize: 12, bold: true, color: C.accent2, charSpacing: 2, margin: 0, isTextBox: true, objectName: "kicker" });
  s.addText("A return type for “maybe no result”, not a null wrapper for everything", { x: 0.5, y: 2.2, w: 5.0, h: 0.8, fontSize: 16, italic: true, color: C.background2, margin: 0, isTextBox: true, objectName: "subtitle" });
  card(s, 6.0, 0.6, 3.5, 4.3, "143F32", "objectives card");
  s.addText("You will be able to", { x: 6.25, y: 0.75, w: 3.1, h: 0.35, fontSize: 14, bold: true, color: C.accent2, margin: 0, isTextBox: true, objectName: "objectives heading" });
  ["Say what Optional is for, and what it is not for", "Explain orElse vs orElseGet (eager vs lazy)", "Chain map, flatMap and filter without null checks", "Use the Java 9–11 API: or, stream, isEmpty…", "Spot and fix the common anti-patterns"].forEach((o, i) => {
    const y = 1.2 + i * 0.72;
    s.addText(String(i + 1), { shape: pres.shapes.OVAL, x: 6.25, y: y + 0.05, w: 0.36, h: 0.36, fill: { color: C.accent1 }, line: { color: C.accent1 }, fontSize: 12, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "objective number " + (i + 1) });
    s.addText(o, { x: 6.75, y, w: 2.6, h: 0.62, fontSize: 12.5, color: C.background1, valign: "middle", margin: 0, isTextBox: true, objectName: "objective " + (i + 1) });
  });
  s.addNotes("~3 min. Welcome to Lesson 05, the last lesson of Module 1. Optional is the most misused class from Java 8, so this lesson is as much about what not to do as about the API. Optional was designed for one job: to be a method return type that says 'there may be no result'. It is not a general replacement for null, not a field type and not a parameter type. Today we cover creation, the important difference between orElse and orElseGet, chaining with map, flatMap and filter across customer, account and transaction lookups, the Java 9 to 11 additions, the primitive versions, and the anti-patterns that appear in almost every code review. As always, every output comes from the shared dataset. Question to ask: who has seen Optional used as a field in their project?");

  // ===== 2 Problem =====
  pres.addSection({ title: "Theory" });
  s = newSlide("CONTENT", "Theory", "The problem: null checks all the way down");
  codeBlock(s, `Customer customer = findCustomer(customerId);
if (customer != null) {
    Account account = findAccount(customer.id(), type);
    if (account != null) {
        Transaction latest =
                latestTransaction(account.number());
        if (latest != null) {
            return ... + latest.amount();
        }
    }
}
return ... "no data";`, 0.5, 1.05, 5.3, 3.4, { label: "BEFORE  ·  before/LegacyStatementService", fontSize: 10.5, name: "pyramid code" });
  s.addText(bullets(["Nothing in Customer findCustomer(String) says it can return null", "One forgotten check = NullPointerException in production", "The business rule hides inside the nesting"], 13.5), { x: 6.05, y: 1.05, w: 3.45, h: 2.1, margin: 0, valign: "top", isTextBox: true, objectName: "pain bullets" });
  card(s, 6.05, 3.25, 3.45, 1.2, "FBECEC", "hoare card");
  s.addText("Tony Hoare called null references his “billion-dollar mistake”.", { x: 6.2, y: 3.3, w: 3.15, h: 1.1, fontSize: 13, italic: true, color: C.accent4, margin: 0, valign: "middle", isTextBox: true, objectName: "hoare text" });
  outputBox(s, "C001 SAVINGS -> T018 447.37 · C003 FIXED_DEPOSIT -> no data · C999 SAVINGS -> no data", 0.5, 4.6, 9.0, 0.45, "pyramid output");
  s.addNotes("~3 min. This is the classic 'pyramid of doom' from LegacyStatementService. We want the latest transaction on a customer's account of a given type. Each lookup may find nothing, and the legacy code signals that by returning null, so every step needs an if. The signature Customer findCustomer(String) gives no hint that null is possible; the only protection is discipline, and one forgotten check means a NullPointerException in production. The actual rule, customer, then account, then latest transaction, is buried three levels deep. DEMO: run LegacyStatementService. C001's savings account has T018 for 447.37; C003's fixed deposit has no transactions; C999 does not exist. By the end of the lesson the same logic becomes one flat chain with identical output. Question: in your codebase, how do you know whether a method can return null today?");

  // ===== 3 What Optional is =====
  s = newSlide("CONTENT", "Theory", "Optional: a box with zero or one value");
  card(s, 0.5, 1.05, 2.8, 1.55, C.background2, "present card");
  iconCircle(s, I.boxc, 0.65, 1.2, 0.55, C.accent1, "present");
  s.addText([{ text: "Present", options: { bold: true, color: C.accent1, fontSize: 16, breakLine: true } }, { text: "Optional[Alice Tan]", options: { fontFace: MONO, fontSize: 12 } }], { x: 0.65, y: 1.8, w: 2.5, h: 0.75, color: C.text1, margin: 0, valign: "top", isTextBox: true, objectName: "present text" });
  card(s, 3.5, 1.05, 2.8, 1.55, "FBECEC", "empty card");
  iconCircle(s, I.box, 3.65, 1.2, 0.55, C.accent4, "empty");
  s.addText([{ text: "Empty", options: { bold: true, color: C.accent4, fontSize: 16, breakLine: true } }, { text: "Optional.empty", options: { fontFace: MONO, fontSize: 12 } }], { x: 3.65, y: 1.8, w: 2.5, h: 0.75, color: C.text1, margin: 0, valign: "top", isTextBox: true, objectName: "empty text" });
  codeBlock(s, `Optional.of("SGD")            // value must not be null
Optional.ofNullable(legacy()) // null -> empty
Optional.empty()

Optional.of(null)
// -> NullPointerException`, 0.5, 2.8, 5.8, 2.25, { label: "Creating  ·  theory/CreatingOptionals", fontSize: 10.5, name: "create code" });
  badge(s, "Java 8", 5.55, 2.85);
  card(s, 6.55, 1.05, 2.95, 4.0, C.background2, "purpose card");
  s.addText([{ text: "Designed for", options: { bold: true, color: C.text2, fontSize: 15, breakLine: true } }, { text: "method RETURN types where “no result” is normal: findCustomer, findPolicy, latestTransaction.", options: { breakLine: true } }, { text: " ", options: { breakLine: true } }, { text: "Not designed for", options: { bold: true, color: C.accent4, fontSize: 15, breakLine: true } }, { text: "fields, parameters, collections, or replacing every null.", options: {} }],
    { x: 6.7, y: 1.15, w: 2.7, h: 3.8, fontSize: 13, color: C.text1, margin: 0, valign: "top", isTextBox: true, objectName: "purpose text" });
  s.addNotes("~3 min. Think of Optional as a box that holds either exactly one value or nothing. The type itself tells the caller that 'nothing' is a possible, normal outcome, and the compiler forces them to deal with the box before they can use the value. There are three ways to create one. Optional.of for a value you know is not null; passing null throws a NullPointerException immediately, which is a feature. Optional.ofNullable to adapt a legacy API that returns null. Optional.empty for 'no result'. On the right, the design intent from the JDK authors: Optional is a return type for lookups where no result is normal. It was never meant for fields, parameters or collections. DEMO: run CreatingOptionals. Question: which of your repository methods should return Optional tomorrow?");

  // ===== 4 orElse vs orElseGet =====
  s = newSlide("CONTENT", "Theory", "orElse vs orElseGet: eager vs lazy");
  codeBlock(s, `// orElse: the argument is evaluated FIRST, always
findCustomer(id).map(Customer::name)
    .orElse(defaultName(calls));

// orElseGet: the supplier runs ONLY when empty
findCustomer(id).map(Customer::name)
    .orElseGet(() -> defaultName(calls));`, 0.5, 1.05, 5.3, 2.45, { label: "theory/OrElseVsOrElseGet", fontSize: 10.5, name: "orelse code" });
  const hdr = ["Call", "Result", "defaultName() called?"].map(t => ({ text: t, options: { bold: true, color: C.background1, fill: { color: C.text2 } } }));
  const rows = [["orElse(C001)", "Alice Tan", "YES (wasted)"], ["orElseGet(C001)", "Alice Tan", "no"], ["orElse(C999)", "Walk-in customer", "yes"], ["orElseGet(C999)", "Walk-in customer", "yes"]].map((r, i) => r.map((c, j) => ({ text: c, options: { fontFace: j === 0 ? MONO : THEME.bodyFontFace, fontSize: 11, bold: j === 2 && i === 0, color: j === 2 && i === 0 ? C.accent4 : C.text1, fill: { color: i % 2 ? C.background1 : C.background2 } } })));
  s.addTable([hdr, ...rows], { x: 0.5, y: 3.65, w: 5.3, colW: [1.6, 1.85, 1.85], rowH: 0.3, border: { type: "solid", pt: 0.5, color: "D5E3DA" }, valign: "middle", margin: [2, 5, 2, 5], objectName: "orelse table" });
  card(s, 6.05, 1.05, 3.45, 4.0, "FFF4E0", "rule card");
  s.addText([{ text: "Rule", options: { bold: true, color: C.accent2, fontSize: 16, breakLine: true } }, { text: "orElse(constant) is fine:", options: { bold: true, breakLine: true } }, { text: "orElse(\"UNKNOWN\"), orElse(BigDecimal.ZERO)", options: { fontFace: MONO, fontSize: 10.5, breakLine: true } }, { text: " ", options: { breakLine: true } }, { text: "Anything that computes, calls a database or service, logs, or creates objects:", options: { bold: true, breakLine: true } }, { text: "orElseGet(() -> …)", options: { fontFace: MONO, fontSize: 11.5, color: C.accent1, bold: true } }],
    { x: 6.2, y: 1.15, w: 3.15, h: 3.8, fontSize: 13, color: C.text1, margin: 0, valign: "top", isTextBox: true, objectName: "rule text" });
  s.addNotes("~4 min. This is the most important behavioural detail of Optional and a favourite interview question. orElse takes a value, and in Java every method argument is evaluated before the method is called. So orElse(defaultName()) calls defaultName even when the Optional already contains Alice Tan; the result is thrown away. orElseGet takes a Supplier, which only runs when the Optional is empty. The table is real output from OrElseVsOrElseGet: for C001 the eager version calls the default anyway, the lazy one does not; for the unknown C999 both call it. If the default is a constant, orElse is perfectly fine and reads better. If it calls a database, a web service, writes a log or creates a large object, use orElseGet. DEMO: run OrElseVsOrElseGet. Question: what would happen if defaultName threw an exception when the customer exists?");

  // ===== 5 map, filter, flatMap =====
  s = newSlide("CONTENT", "Theory", "Transform: map, filter, flatMap");
  const ops = [["map(f)", "value → f(value); empty stays empty", "findCustomer(\"C004\").map(Customer::city)", "Optional[Jakarta]"], ["filter(p)", "keep the value only if p is true", "findPolicy(\"POL-509\").filter(not expired)", "on 11-07: present · 11-13: empty"], ["flatMap(f)", "f returns Optional: keep it flat", "findCustomer(id).flatMap(c -> findAccount(…))", "Optional[Account]"]];
  ops.forEach(([h, d, ex, out], i) => {
    const y = 1.05 + i * 0.95;
    card(s, 0.5, y, 9.0, 0.82, i % 2 ? C.background1 : C.background2, "op card " + i);
    s.addText(h, { x: 0.65, y, w: 1.35, h: 0.82, fontSize: 16, bold: true, fontFace: MONO, color: C.accent1, margin: 0, valign: "middle", isTextBox: true, objectName: "op name " + i });
    s.addText([{ text: d, options: { bold: true, color: C.text2, breakLine: true } }, { text: ex, options: { fontFace: MONO, fontSize: 10.5 } }], { x: 2.05, y, w: 4.9, h: 0.82, fontSize: 12.5, color: C.text1, margin: 0, valign: "middle", isTextBox: true, objectName: "op desc " + i });
    s.addText(out, { x: 7.0, y, w: 2.4, h: 0.82, fontSize: 11, fontFace: MONO, color: C.text1, margin: 0, valign: "middle", isTextBox: true, objectName: "op out " + i });
  });
  card(s, 0.5, 3.95, 9.0, 1.1, "FBECEC", "nested card");
  s.addText([{ text: "map with an Optional-returning function = a box in a box:  ", options: { bold: true, color: C.accent4 } }, { text: "findCustomer(\"C008\").map(c -> findAccount(c.id(), SAVINGS))  →  Optional[Optional[ACC-1012]]", options: { fontFace: MONO, fontSize: 10.5, color: C.text1 } }],
    { x: 0.65, y: 4.0, w: 8.7, h: 1.0, fontSize: 13, margin: 0, valign: "middle", isTextBox: true, objectName: "nested text" });
  s.addNotes("~3 min. Three operations transform the value inside the box without opening it. map applies a function to the value if there is one; an empty Optional simply stays empty, so there is no null check. filter keeps the value only if a predicate is true: policy POL-509 expires on 12 November, so on the 7th it is active and on the 13th the Optional becomes empty. flatMap is for functions that themselves return an Optional, like our repository lookups. If you use map with such a function you get a box inside a box, Optional of Optional, as the red example shows with real output. flatMap unwraps one level and keeps the chain flat. Streams use the same three ideas in L07. DEMO: run TransformingOptionals. Question: how do you recognise when you need flatMap instead of map?");

  // ===== 6 Chain =====
  s = newSlide("CONTENT", "Theory", "Chaining: customer → account → latest transaction");
  codeBlock(s, `Optional<BigDecimal> latestAmount(String id,
                                  AccountType type) {
    return findCustomer(id)
        .flatMap(c -> findAccount(c.id(), type))
        .flatMap(a -> latestTransaction(a.number()))
        .map(Transaction::amount);
}`, 0.5, 1.05, 6.0, 2.4, { label: "theory/TransformingOptionals", fontSize: 10.5, name: "chain code" });
  const steps = [["Customer?", C.accent3], ["Account?", C.accent1], ["Transaction?", C.accent2], ["amount", C.text2]];
  steps.forEach(([h, col], i) => {
    const x = 0.5 + i * 1.55;
    s.addText(h, { shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.08, x, y: 3.6, w: 1.35, h: 0.5, fill: { color: col }, line: { color: col }, fontSize: 12, bold: true, color: col === C.accent2 ? C.text1 : C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "step " + h });
    if (i < 3) s.addShape(pres.shapes.RIGHT_ARROW, { x: x + 1.37, y: 3.75, w: 0.16, h: 0.2, fill: { color: C.accent5 }, line: { color: C.accent5 }, objectName: "step arrow " + i });
  });
  s.addText("Any step empty → the rest is skipped → Optional.empty", { x: 0.5, y: 4.2, w: 6.0, h: 0.35, fontSize: 12.5, italic: true, color: C.text2, margin: 0, isTextBox: true, objectName: "chain note" });
  const res = [["C001 SAVINGS", "Optional[447.37]"], ["C003 FIXED_DEP.", "empty: no txns"], ["C005 CURRENT", "empty: no account"], ["C999 SAVINGS", "empty: no customer"]];
  s.addTable([[{ text: "Input", options: { bold: true, color: C.background1, fill: { color: C.text2 } } }, { text: "Result", options: { bold: true, color: C.background1, fill: { color: C.text2 } } }], ...res.map((r, i) => r.map((c, j) => ({ text: c, options: { fontFace: MONO, fontSize: 9.5, color: j && i === 0 ? C.accent1 : C.text1, bold: j && i === 0, fill: { color: i % 2 ? C.background1 : C.background2 } } })))], { x: 6.65, y: 1.05, w: 2.85, colW: [1.2, 1.65], rowH: 0.55, border: { type: "solid", pt: 0.5, color: "D5E3DA" }, valign: "middle", margin: [2, 4, 2, 4], objectName: "chain table" });
  s.addNotes("~4 min. Here is the pyramid from slide 2 as one chain. Each repository method returns an Optional, so we connect them with flatMap, and the final step uses map with the record accessor Transaction::amount. Read it top to bottom like a sentence: find the customer, then their account of this type, then its latest transaction, then the amount. If any step finds nothing, the remaining steps are skipped and the result is Optional.empty. The table shows real results for four inputs. C001's savings account gives 447.37. C003 has a fixed deposit, but it has no transactions. C005 has no current account. C999 is not a customer at all. Notice the caller gets one Optional back and decides once what to do about 'nothing'. DEMO: run TransformingOptionals and point at the four chain lines. Question: what would you add to the chain to ignore transactions below 100.00?");

  // ===== 7 Consuming =====
  pres.addSection({ title: "API" });
  s = newSlide("CONTENT", "API", "Getting the value out, or acting on it");
  const cons = [["ifPresent(c)", "Java 8", "ifPresent → Bala Kumar"], ["ifPresentOrElse(c, r)", "Java 9", "Hello Bala Kumar | Customer C999 not found"], ["orElseThrow(supplier)", "Java 8", "Unknown customer C999"], ["orElseThrow()", "Java 10", "NoSuchElementException: No value present"], ["or(supplier)", "Java 9", "C999 or C010 → Optional[Jasmine Ong]"], ["stream()", "Java 9", "flatMap(Optional::stream) → [POL-502, POL-509]"], ["isEmpty()", "Java 11", "unknown(C999) → true"]];
  cons.forEach(([m, v, out], i) => {
    const y = 1.0 + i * 0.57;
    card(s, 0.5, y, 9.0, 0.5, i % 2 ? C.background1 : C.background2, "cons card " + i);
    s.addText(m, { x: 0.65, y, w: 2.55, h: 0.5, fontSize: 12, bold: true, fontFace: MONO, color: C.accent1, margin: 0, valign: "middle", isTextBox: true, objectName: "cons m " + i });
    badge(s, v, 3.25, y + 0.13, { w: 0.75, fill: v === "Java 8" ? C.accent2 : "F6C9C9" });
    s.addText(out, { x: 4.15, y, w: 5.25, h: 0.5, fontSize: 11, fontFace: MONO, color: C.text1, margin: 0, valign: "middle", isTextBox: true, objectName: "cons out " + i });
  });
  s.addText("Avoid get(): it throws on empty. orElseThrow() [10] does the same but its name admits it.", { x: 0.5, y: 5.0, w: 9, h: 0.28, fontSize: 12, italic: true, color: C.accent4, margin: 0, isTextBox: true, objectName: "cons note" });
  s.addNotes("~4 min. Sooner or later you leave the Optional world. ifPresent runs an action only when there is a value. ifPresentOrElse, Java 9, adds the empty branch, so there is no need for an if statement. orElseThrow with a supplier throws your own domain exception, such as 'Unknown customer C999', which is much better than a NullPointerException three layers later. orElseThrow without arguments, Java 10, is identical to get(), but the name is honest about the exception; the JDK team added it because get() was so widely misused. or, Java 9, tries a second source and still returns an Optional. stream, Java 9, turns an Optional into a stream of zero or one element, so flatMap(Optional::stream) drops all the empties from a list of lookups. isEmpty, Java 11, reads better than not isPresent. DEMO: run ConsumingOptionals. Question: which of these would replace most get() calls in your code?");

  // ===== 8 API table =====
  s = newSlide("CONTENT", "API", "API reference with version badges");
  const ah = ["Method", "Returns", "Use", "Since"].map(t => ({ text: t, options: { bold: true, color: C.background1, fill: { color: C.text2 } } }));
  const ar = [
    ["of(T) / ofNullable(T) / empty()", "Optional<T>", "create", "8"],
    ["map(Function<T,R>)", "Optional<R>", "transform the value", "8"],
    ["flatMap(Function<T,Optional<R>>)", "Optional<R>", "chain lookups", "8"],
    ["filter(Predicate<T>)", "Optional<T>", "keep if test passes", "8"],
    ["orElse(T) / orElseGet(Supplier)", "T", "default: eager / lazy", "8"],
    ["orElseThrow(Supplier<X>)", "T", "domain exception", "8"],
    ["isPresent() / ifPresent(Consumer)", "boolean / void", "check / act", "8"],
    ["or(Supplier<Optional<T>>)", "Optional<T>", "fallback source", "9"],
    ["ifPresentOrElse(Consumer, Runnable)", "void", "both branches", "9"],
    ["stream()", "Stream<T>", "0 or 1 element", "9"],
    ["orElseThrow()", "T", "honest get()", "10"],
    ["isEmpty()", "boolean", "!isPresent()", "11"],
  ].map((r, i) => r.map((c, j) => ({ text: j === 3 ? "Java " + c : c, options: Object.assign({ fill: { color: i % 2 ? C.background1 : C.background2 }, color: C.text1 }, j === 0 ? { fontFace: MONO, fontSize: 10, bold: true } : {}, j === 1 ? { fontFace: MONO, fontSize: 10 } : {}, j === 3 ? { bold: true, color: Number(c) > 8 ? C.accent4 : C.accent1 } : {}) })));
  s.addTable([ah, ...ar], { x: 0.5, y: 1.0, w: 9.0, colW: [3.5, 1.7, 2.6, 1.2], fontSize: 11, rowH: 0.3, border: { type: "solid", pt: 0.5, color: "D5E3DA" }, valign: "middle", margin: [2, 5, 2, 5], objectName: "api table" });
  s.addText("Primitive versions: OptionalInt / OptionalLong / OptionalDouble [8] — slide 9.", { x: 0.5, y: 4.95, w: 9, h: 0.28, fontSize: 11.5, italic: true, color: C.accent5, margin: 0, isTextBox: true, objectName: "api note" });
  s.addNotes("~2 min. This is the full reference table, also on the cheat sheet. Green rows are Java 8, red rows came later, so check your production Java version before using them. A quick way to remember the API: create with of, ofNullable or empty; transform with map, flatMap and filter; get out with the orElse family or orElseThrow; act with ifPresent or ifPresentOrElse; and connect to streams with stream. Notice that get() is not in the table. It still exists, but most style guides and IntelliJ's own inspections discourage it; use orElseThrow when you really mean 'there must be a value'. isPresent is there because it is occasionally useful in tests, but in production code it is usually a sign of the anti-pattern on slide 12. Question: which Java 9 to 11 method will you use most?");

  // ===== 9 Primitive optionals =====
  s = newSlide("CONTENT", "API", "OptionalInt, OptionalLong, OptionalDouble");
  codeBlock(s, `OptionalInt mostSeatsLeft = flights.stream()
        .mapToInt(f -> f.seats() - f.booked())
        .max();                        // OptionalInt[63]

OptionalDouble avgLoad = flights.stream()
        .mapToDouble(f -> 100.0 * f.booked() / f.seats())
        .average();                    // 84.1 (%)

OptionalLong largest = flights.stream()
        .mapToLong(Flight::booked).max();  // OptionalLong[455]

List.<Flight>of().stream().mapToInt(...).max()
                                   // OptionalInt.empty`, 0.5, 1.05, 5.8, 3.5, { label: "theory/PrimitiveOptionals", fontSize: 10.5, name: "prim code" });
  badge(s, "Java 8", 5.55, 1.1);
  card(s, 6.55, 1.05, 2.95, 3.5, C.background2, "prim card");
  s.addText(bullets(["Returned by IntStream max(), min(), average(), findFirst()", "No boxing: getAsInt(), orElse(0)", "No map, filter or flatMap", "A double average is fine for load factor; never for money"], 12.5).map(r => { r.options.paraSpaceAfter = 8; return r; }), { x: 6.7, y: 1.15, w: 2.7, h: 3.3, margin: 0, valign: "top", isTextBox: true, objectName: "prim bullets" });
  outputBox(s, "max OptionalInt[63] · getAsInt 63 · avg load 84.1% · empty orElse(0) 0", 0.5, 4.65, 9.0, 0.42, "prim output");
  s.addNotes("~2 min. Primitive streams return primitive optionals, because a maximum or an average does not exist for an empty stream. OptionalInt, OptionalLong and OptionalDouble avoid boxing; you read them with getAsInt, getAsLong, getAsDouble or orElse. They are deliberately small: there is no map, filter or flatMap, so if you need to transform the result, either work on the stream before the terminal operation or box it. Real values: the flight with the most seats left has 63, the average load factor across our eight flights is 84.1 percent, and the largest booking is 455 on SQ318. For an empty list, max returns OptionalInt.empty and orElse(0) gives 0. Note the money rule still applies: a double average is fine for a percentage, but money is always BigDecimal, which we handle in L09 and L12. DEMO: run PrimitiveOptionals. Question: why can't max of an empty IntStream simply return 0?");

  // ===== 10 Before / after =====
  pres.addSection({ title: "Worked example" });
  s = newSlide("CONTENT", "Worked example", "Refactor: null checks → Optional chain");
  codeBlock(s, `Customer customer = findCustomer(id);
if (customer != null) {
  Account account =
      findAccount(customer.id(), type);
  if (account != null) {
    Transaction t = latestTransaction(
        account.number());
    if (t != null) return id + … + t.amount();
  }
}
return id + " " + type + " -> no data";`, 0.5, 1.05, 4.4, 3.2, { label: "BEFORE  ·  null returns, 3 checks", fontSize: 10.5, name: "before code" });
  codeBlock(s, `return findCustomer(id)
    .flatMap(c -> findAccount(c.id(), type))
    .flatMap(a -> latestTransaction(
            a.number()))
    .map(t -> id + " " + type + " -> "
            + t.id() + " " + t.amount())
    .orElse(id + " " + type + " -> no data");`, 5.1, 1.05, 4.4, 3.2, { label: "AFTER  ·  after/OptionalStatementService", fontSize: 10.5, name: "after code" });
  badge(s, "Java 8", 8.75, 1.1);
  outputBox(s, "Both: C001 SAVINGS -> T018 447.37 · C003 FIXED_DEPOSIT -> no data · C005 CURRENT -> no data · C999 SAVINGS -> no data", 0.5, 4.4, 9.0, 0.62, "ba output");
  s.addNotes("~3 min. The full refactoring. On the left the legacy service with null-returning lookups and three nested checks. On the right the same rule with Optional-returning lookups: two flatMaps, one map to format the line, and one orElse for the 'no data' message. orElse is correct here because the default is a cheap string, not a computation with side effects. There are no null checks and no nesting, and the type of every lookup now documents that it may find nothing. StatementRefactoringTest runs both versions for six combinations of customer and account type and proves they return exactly the same text, including the four lines on this slide. DEMO: run LegacyStatementService and OptionalStatementService side by side. Question: if a teammate adds a fourth lookup step, which version is easier to extend safely?");

  // ===== 11 Modern =====
  s = newSlide("CONTENT", "Worked example", "Modern Java (9–21) Optional in action");
  codeBlock(s, `// [9] or: savings first, then current account
Optional<Transaction> latestSavingsOrCurrent(String id) {
    return latestOn(id, SAVINGS)
            .or(() -> latestOn(id, CURRENT));
}
// [9] stream: drop customers with no activity
List<Activity> summary(List<String> ids) {
    return ids.stream()
        .flatMap(id -> latestSavingsOrCurrent(id).stream()
            .map(t -> new Activity(id, t.id(), t.amount())))
        .toList();                                // [16]
}`, 0.5, 1.05, 5.9, 3.5, { label: "modern/ModernStatementService", fontSize: 10.5, name: "modern code" });
  outputBox(s, "C001 T018 447.37\nC003 T028 823.39\nC009 T039 4231.84\nC009: used CURRENT\nC999 isEmpty: true", 6.6, 1.05, 2.9, 2.2, "modern output");
  const mv = [["Java 9", "or, ifPresentOrElse, stream"], ["Java 10", "orElseThrow()"], ["Java 11", "isEmpty()"], ["Java 16", "records as results"]];
  mv.forEach(([v, t], i) => {
    const y = 3.4 + i * 0.3;
    badge(s, v, 6.6, y + 0.02, { w: 0.7 });
    s.addText(t, { x: 7.4, y, w: 2.1, h: 0.28, fontSize: 11, color: C.text1, margin: 0, valign: "middle", isTextBox: true, objectName: "mv " + i });
  });
  s.addNotes("~3 min. The modern service shows the Java 9 to 16 additions working together. latestSavingsOrCurrent uses or: look at the savings account first, and only if that gives nothing, try the current account; the fallback is lazy, like orElseGet, but it stays an Optional. summary uses Optional.stream inside flatMap, so customers without any activity simply disappear from the list, and each result becomes an Activity record. Real output: C001 and C003 come from savings, C009 has no savings account so its current account is used, and C999 is dropped. ifPresentOrElse, isEmpty and the no-argument orElseThrow appear in the main method. This is how Optional looks in a modern Java 21 codebase: short chains, no get, no isPresent. DEMO: run ModernStatementService. Question: why is or better here than orElseGet?");

  // ===== 12 Anti-patterns =====
  pres.addSection({ title: "Standards" });
  s = newSlide("CONTENT", "Standards", "Anti-patterns and their fixes");
  const ap = [["isPresent() + get()", "a null check with extra steps", "map(...).orElse(...)"], ["get() without a check", "NoSuchElementException: No value present", "orElseThrow(() -> new DomainException(...))"], ["Optional field / parameter", "not Serializable; blurs intent; extra object", "nullable field + Optional-returning getter"], ["Optional<List<T>>", "two ways to say 'none'", "return an empty List"], ["return null; from Optional method", "callers will not check: NPE", "return Optional.empty()"], ["Optional.of(maybeNull)", "NullPointerException", "Optional.ofNullable(maybeNull)"]];
  const aph = ["Anti-pattern", "Problem", "Fix"].map(t => ({ text: t, options: { bold: true, color: C.background1, fill: { color: C.text2 } } }));
  s.addTable([aph, ...ap.map((r, i) => r.map((c, j) => ({ text: c, options: { fontFace: j === 1 ? THEME.bodyFontFace : MONO, fontSize: j === 1 ? 11.5 : 10.5, color: j === 0 ? C.accent4 : (j === 2 ? C.accent1 : C.text1), bold: j !== 1, fill: { color: i % 2 ? C.background1 : "FDF3F3" } } })))], { x: 0.5, y: 1.0, w: 9.0, colW: [2.9, 2.8, 3.3], rowH: 0.5, border: { type: "solid", pt: 0.5, color: "E6D5D5" }, valign: "middle", margin: [2, 5, 2, 5], objectName: "anti table" });
  outputBox(s, "get() on empty → No value present · Optional<List>: bad=Optional.empty good=[]", 0.5, 4.6, 9.0, 0.45, "anti output");
  s.addNotes("~4 min. Six anti-patterns, each demonstrated in AntiPatterns.java next to its fix, and all of them compile, which is why they slip through review. One: isPresent followed by get is just a null check with more ceremony; use map and orElse. Two: get without a check throws NoSuchElementException 'No value present'. Three and four: Optional as a field or parameter. Optional is not Serializable, it adds an object per field, and a parameter of type Optional forces every caller to wrap values; keep the field nullable and return Optional from the getter, or overload the method. Five: Optional of List gives two ways to say 'nothing'; an empty list already means none. Six: returning null from an Optional method is the worst of both worlds. And Optional.of on a value that may be null throws immediately; use ofNullable. Question: which of these does IntelliJ flag?");

  // ===== 13 Interview =====
  pres.addSection({ title: "Practice" });
  s = newSlide("CONTENT", "Practice", "Interview questions");
  const qa = [
    ["What is Optional for?", "A return type for 'maybe no result'. Not for fields, parameters or collections."],
    ["orElse vs orElseGet?", "orElse's argument is always evaluated (eager). orElseGet's supplier runs only when empty (lazy)."],
    ["map vs flatMap on Optional?", "map wraps the result; if the function returns Optional you get Optional<Optional>. flatMap keeps it flat."],
    ["Why avoid get()?", "It throws NoSuchElementException on empty. Use orElse/orElseGet, or orElseThrow() [10] to be explicit."],
    ["Optional<List<T>> or List<T>?", "Return an empty List. Optional of a collection gives two ways to say 'none'."],
  ];
  qa.forEach(([q, a], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = i === 4 ? 0.5 : 0.5 + col * 4.6, y = 1.0 + row * 1.38, w = i === 4 ? 9.0 : 4.4;
    card(s, x, y, w, 1.22, C.background2, "qa card " + i);
    s.addText("Q" + (i + 1), { shape: pres.shapes.OVAL, x: x + 0.12, y: y + 0.14, w: 0.42, h: 0.42, fill: { color: C.text2 }, line: { color: C.text2 }, fontSize: 11, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "q badge " + i });
    s.addText([{ text: q, options: { bold: true, color: C.text2, breakLine: true } }, { text: a, options: { color: C.text1, fontSize: 12 } }], { x: x + 0.65, y: y + 0.06, w: w - 0.8, h: 1.1, fontSize: 13.5, margin: 0, valign: "middle", isTextBox: true, objectName: "qa text " + i });
  });
  s.addNotes("~3 min. Five interview questions that come up for almost every Java role. Run them as a quick round. For question 1, strong candidates mention the design intent from the JDK authors and name at least one place Optional should not be used. Question 2 is the most common; ask for an example of when the difference matters, such as a database call or logging in the default. For question 3, ask the candidate to give the type you get when you use map with a repository lookup. For question 4, give credit for mentioning orElseThrow without arguments from Java 10 as the honest alternative. Question 5 tests API design judgement. A senior follow-up: should a JPA entity have an Optional field? Answer: no; return Optional from a repository or getter instead. Question: which one did you answer differently before today?");

  // ===== 14 Pros/cons =====
  s = newSlide("CONTENT", "Practice", "Pros and cons of Optional");
  const pros = ["The return type documents 'maybe nothing'", "Forces the caller to handle the empty case", "Flat chains replace nested null checks", "Lazy defaults with orElseGet and or", "Bridges to streams with stream()", "Domain exceptions via orElseThrow"];
  const consList = ["An extra object per call (usually negligible)", "Not Serializable: bad for fields and DTOs", "Easy to misuse: get, isPresent, fields", "Does not remove null from the language", "Primitive versions have no map/filter", "Over-chaining can hurt readability"];
  [[pros, "Pros", C.accent1, I.plus, 0.5, C.background2], [consList, "Cons / limitations", C.accent4, I.minus, 5.1, "FBECEC"]].forEach(([list, h, col, ic, x, bg]) => {
    card(s, x, 1.0, 4.4, 3.65, bg, h + " card");
    iconCircle(s, ic, x + 0.2, 1.15, 0.5, col, h);
    s.addText(h, { x: x + 0.85, y: 1.15, w: 3.3, h: 0.5, fontSize: 18, bold: true, color: col, margin: 0, valign: "middle", isTextBox: true, objectName: h + " heading" });
    s.addText(bullets(list, 14.5).map(r => { r.options.paraSpaceAfter = 9; return r; }), { x: x + 0.25, y: 1.85, w: 3.95, h: 2.7, margin: 0, valign: "top", isTextBox: true, objectName: h + " list" });
  });
  s.addNotes("~2 min. A balanced view. The main benefit is honesty in the type system: a method that returns Optional tells every caller that nothing may come back, and the compiler makes them deal with it. Chains replace nested null checks, defaults can be lazy, Optional connects to streams, and orElseThrow gives meaningful domain exceptions. The costs: one small extra object per call, which only matters in very hot loops and should be measured. It is not Serializable, which is one of the reasons not to use it in fields or DTOs. It is easy to misuse, as slide 12 shows. It does not remove null from Java; a method returning Optional can still return null if someone writes bad code. Primitive versions are limited, and very long chains can be harder to read than a well-named helper method. Question: which con would worry your team the most?");

  // ===== 15 Summary =====
  pres.addSection({ title: "Wrap-up" });
  s = newSlide("DARK_TITLE", "Wrap-up", "Summary");
  const sum = ["Optional = a return type for 'maybe no result'", "orElse is eager; orElseGet / or are lazy", "map, filter, flatMap: flat chains, no null checks", "Java 9–11: or, ifPresentOrElse, stream, orElseThrow(), isEmpty", "No get(), no isPresent+get, no Optional fields or lists"];
  s.addText(bullets(sum, 14, C.background1), { x: 0.5, y: 2.1, w: 5.2, h: 2.9, margin: 0, valign: "top", isTextBox: true, objectName: "summary bullets" });
  card(s, 6.0, 0.6, 3.5, 2.05, "143F32", "exercise card");
  iconCircle(s, I.code, 6.2, 0.78, 0.45, C.accent2, "exercise");
  s.addText([{ text: "Exercise (~25 min)", options: { bold: true, color: C.accent2, breakLine: true } }, { text: "Replace the null checks in LegacyPolicyService with Optional. Same results, including 4 renewal reminders. Remove @Disabled.", options: { color: C.background1, fontSize: 12 } }],
    { x: 6.75, y: 0.75, w: 2.65, h: 1.8, fontSize: 14, margin: 0, valign: "top", isTextBox: true, objectName: "exercise text" });
  card(s, 6.0, 2.85, 3.5, 2.05, "143F32", "next card");
  iconCircle(s, I.rocket, 6.2, 3.03, 0.45, C.accent1, "next");
  s.addText([{ text: "Next: Module 2 · L06", options: { bold: true, color: C.accent2, breakLine: true } }, { text: "Stream Fundamentals: pipelines, laziness, sources and the full method map.", options: { color: C.background1, fontSize: 12 } }],
    { x: 6.75, y: 3.0, w: 2.65, h: 1.8, fontSize: 14, margin: 0, valign: "top", isTextBox: true, objectName: "next text" });
  s.addNotes("~3 min. Recap the five points; this closes Module 1. Then the exercise. LegacyPolicyService is a policy lookup service full of null checks: find a policy, find its holder, the holder's name or UNKNOWN, the premium or zero, the expiry date if the policy is still active, and renewal reminders for policies expiring within 30 days. Learners rewrite it in Exercise05 with Optional: no null checks, no isPresent and get, no Optional fields or parameters. Exercise05Test compares every method with the legacy version for all ten policies plus an unknown POL-999 and three different dates, and expects four reminders: POL-502, POL-505, POL-508 and POL-509, using a fixed course date of 7 November 2026. Give 25 minutes, then walk through Solution05. Next: Module 2 starts with stream fundamentals. Question: which method do you expect to be the hardest?");

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
})();
