import sys, pathlib
from playwright.sync_api import sync_playwright
src, out = sys.argv[1], sys.argv[2]
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page()
    pg.goto(pathlib.Path(src).resolve().as_uri()); pg.wait_for_timeout(500)
    pg.evaluate("document.fonts.ready")
    # report any element overflowing its page or box
    print(pg.evaluate("""() => { const bad=[]; document.querySelectorAll('.box, .note, pre, .page, .card, .sk').forEach(e=>{ if(e.scrollHeight>e.clientHeight+1 || e.scrollWidth>e.clientWidth+1) bad.push(e.className+':'+(e.textContent||'').trim().slice(0,30)+' '+e.scrollWidth+'/'+e.clientWidth+' '+e.scrollHeight+'/'+e.clientHeight)}); return bad; }"""))
    pg.pdf(path=out, format="A4", print_background=True, prefer_css_page_size=True)
    b.close()
