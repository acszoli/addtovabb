/* Add Tovább – főoldal prototípus
 * Önálló, függőségmentes JavaScript. Az adatok (kártyák, csomagok, GYIK) mintaadatok:
 * élesben a szerverről / CMS-ből kell betölteni őket. */
(function () {
  'use strict';

  /* ---------- Beállítások ---------- */
  var COLLECTION_DATE = new Date('2026-12-07T10:00:00').getTime();
  var DATE_LABEL = '2026. december 7.';
  var BASE_PROGRESS = 62; // % – élesben a valós teljesítettségből számolandó
  var PAGE_SIZE = 12;

  /* ---------- Állapot ---------- */
  var state = {
    view: 'home',
    modal: null,
    step: 'confirm',
    user: null,
    authTab: 'reg',
    authErr: '',
    codeSent: false,
    editing: false,
    f: { aName: '', aEmail: '', aPhone: '', aCode: '', eName: '', eEmail: '', ePhone: '' },
    listType: 'child',
    pledges: {},
    drawer: false,
    howOpen: false,
    subEmail: '',
    subDone: false,
    listFilter: 'all',
    query: '',
    listLimit: PAGE_SIZE,
    faq: -1,
    ceg: { name: '', size: '', email: '', err: false, done: false }
  };

  /* ---------- Segédek ---------- */
  function $(id) { return document.getElementById(id); }
  function pad(n) { return String(n).padStart(2, '0'); }
  function validEmail(v) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v); }
  function validPhone(v) { return (String(v).match(/\d/g) || []).length >= 9 && /^[+\d\s()\/-]+$/.test(String(v).trim()); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }
  function isPledged(id) { return Object.prototype.hasOwnProperty.call(state.pledges, id); }
  function scrollToId(id) {
    var el = $(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
  function icon(path, color, size, sw) {
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="' + color +
      '" stroke-width="' + (sw || 2) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + path + '"></path></svg>';
  }
  var CHECK = 'M5 12.5l4.5 4.5L19 7';
  var GIFT_ICON = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="9" width="16" height="11" rx="2"></rect><path d="M12 9v11M3 9h18M12 9c-2-4-6-4-5-1.5M12 9c2-4 6-4 5-1.5"></path></svg>';
  var ARROW = 'M5 12h14M13 6l6 6-6 6';

  /* ---------- Adatok (minta) ---------- */
  var kids = [
    { id: '#150', group: 'g1518', kind: 'Ajándékcsomag · fiú', age: '15–18 éves', title: 'Ajándékcsomag fiúknak', sub: '15–18 éves korig', wishes: ['Tisztálkodási és illatszerek', 'Iskolaszer', 'Fiús kiegészítők', 'Csokoládé', 'Ékszer', 'Könyv'], tint: '#D9E4F3', ink: '#2B4466', face: 'boy', special: false, homeName: '' },
    { id: '#458', group: 'g410', kind: 'Gyerek kívánsága', age: '6–7 éves', title: 'Egyszerűbb, játékos ajándékoknak örül', sub: '6–7 éves korosztálynak való ajándékok', wishes: ['Plüss', 'Színező', 'Egyszerűbb puzzle', 'Kisautó', 'Játékbaba', 'Duplo', 'Építőjáték', 'Fejlesztő játék', 'Memóriajáték'], tint: '#EEB1A0', ink: '#5E2B25', face: 'star', special: true, homeName: 'Éltes' },
    { id: '#151', group: 'g03', kind: 'Ajándékcsomag · lány', age: '0–3 éves', title: 'Ajándékcsomag lányoknak', sub: '0–3 éves korig', wishes: ['Tisztálkodási szerek', 'Ruhák', 'Lányos kiegészítők', 'Babajáték', 'Babakönyv'], tint: '#FBE4DD', ink: '#8E3F40', face: 'girl', special: false, homeName: '' },
    { id: '#203', group: 'g410', kind: 'Gyerek kívánsága', age: '4–5 éves', title: 'Építeni és rajzolni szeretne', sub: 'Mintakártya', wishes: ['Építőkocka', 'Rajzfüzet', 'Zsírkréta', 'Mesekönyv'], tint: '#D9E4F3', ink: '#2B4466', face: 'boy', special: false, homeName: '' },
    { id: '#412', group: 'g410', kind: 'Gyerek kívánsága', age: '7–8 éves', title: 'Autózni és építeni szeretne', sub: 'Mintakártya', wishes: ['Kisautó-pálya', 'Lego', 'Kirakó', 'Társasjáték'], tint: '#E3E9F4', ink: '#3A5273', face: 'boy', special: false, homeName: '' },
    { id: '#366', group: 'g1114', kind: 'Gyerek kívánsága', age: '11–14 éves', title: 'Alkotni és zenét hallgatni szeretne', sub: 'Mintakártya', wishes: ['Fejhallgató', 'Rajzkészlet', 'Naptár', 'Tolltartó'], tint: '#FBE4DD', ink: '#8E3F40', face: 'girl', special: false, homeName: '' }
  ];
  var tpl = [
    { age: '0–3 éves', group: 'g03', face: 'girl', title: 'Babajátékok és kényelmes ruhák', wishes: ['Plüss', 'Csörgő', 'Body', 'Babakönyv'], tint: '#FBE4DD', ink: '#8E3F40' },
    { age: '4–5 éves', group: 'g410', face: 'boy', title: 'Mesélni és építeni szeret', wishes: ['Mesekönyv', 'Építőkocka', 'Zsírkréta'], tint: '#D9E4F3', ink: '#2B4466' },
    { age: '6–7 éves', group: 'g410', face: 'girl', title: 'Babázni és színezni szeret', wishes: ['Játékbaba', 'Színező', 'Hajcsatok', 'Puzzle'], tint: '#FBE4DD', ink: '#8E3F40' },
    { age: '8–10 éves', group: 'g410', face: 'boy', title: 'Sportolni és olvasni szeret', wishes: ['Focilabda', 'Sapka és sál', 'Kalandkönyv'], tint: '#E3E9F4', ink: '#3A5273' },
    { age: '11–14 éves', group: 'g1114', face: 'girl', title: 'Rajzolni és naplót írni szeret', wishes: ['Napló', 'Színes tollak', 'Hajgumik', 'Sál'], tint: '#FBE4DD', ink: '#8E3F40' },
    { age: '11–14 éves', group: 'g1114', face: 'boy', title: 'Játszani és mozogni szeretne', wishes: ['Társasjáték', 'Kesztyű', 'Sporttáska'], tint: '#D9E4F3', ink: '#2B4466' },
    { age: '15–18 éves', group: 'g1518', face: 'girl', title: 'Ajándékcsomag lányoknak', wishes: ['Tisztálkodási szerek', 'Iskolaszer', 'Kiegészítők', 'Könyv'], tint: '#FBE4DD', ink: '#8E3F40' },
    { age: '15–18 éves', group: 'g1518', face: 'boy', title: 'Ajándékcsomag fiúknak', wishes: ['Tisztálkodási szerek', 'Iskolaszer', 'Sapka', 'Csokoládé'], tint: '#D9E4F3', ink: '#2B4466' }
  ];
  for (var gi = 0; gi < 12; gi++) {
    var t = tpl[gi % tpl.length];
    kids.push({
      id: '#' + (160 + gi), group: t.group,
      kind: t.title.indexOf('Ajándékcsomag') === 0 ? 'Ajándékcsomag' : 'Gyerek kívánsága',
      age: t.age, title: t.title, sub: 'Mintakártya', wishes: t.wishes,
      tint: t.tint, ink: t.ink, face: t.face, special: false, homeName: ''
    });
  }
  var pkgs = [
    { id: 'CS-1', pkg: true, kind: 'Otthoni csomag', age: 'Teljes otthon', title: 'Tisztálkodási csomag', sub: 'Mindennapi higiéniai alapok', wishes: ['Szappan és tusfürdő', 'Fogkrém és fogkefe', 'Sampon', 'Törölköző'], icon: 'M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z' },
    { id: 'CS-2', pkg: true, kind: 'Otthoni csomag', age: 'Teljes otthon', title: 'Iskolaszer-csomag', sub: 'Egy tanévre való alapfelszerelés', wishes: ['Füzetek', 'Ceruzák és filctollak', 'Tolltartó', 'Rajzblokk'], icon: 'M4 20l1-4L16 5l3 3L8 19zM14 7l3 3' },
    { id: 'CS-3', pkg: true, kind: 'Otthoni csomag', age: 'Teljes otthon', title: 'Ágynemű- és háztartási csomag', sub: 'Meleg, tiszta otthon', wishes: ['Ágynemű', 'Takaró', 'Párnahuzat', 'Háztartási termékek'], icon: 'M3 18V8M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5' }
  ];
  var pkgList = ['Szappan és tusfürdő', 'Fogkrém és fogkefe', 'Sampon', 'Törölköző', 'Füzetek', 'Ceruzák és filctollak', 'Tolltartó', 'Rajzblokk', 'Ágynemű', 'Takaró', 'Párnahuzat', 'Háztartási termékek'];
  var allItems = kids.concat(pkgs);
  allItems.forEach(function (c) { c.type = c.pkg ? 'home' : (c.kind.indexOf('Ajándékcsomag') === 0 ? 'pack' : 'child'); });
  function byIds(ids) { return ids.map(function (id) { return allItems.filter(function (k) { return k.id === id; })[0]; }); }
  function countOf(t) { return allItems.filter(function (c) { return c.type === t; }).length; }
  var homeChild = ['#203', '#458', '#366'];
  var homePack = ['#150', '#151', '#166'];
  var tabDefs = [
    { key: 'child', label: 'Gyerekek kívánságai', sub: ' kártya · egy konkrét gyereknek' },
    { key: 'pack', label: 'Ajándékcsomag', sub: ' csomag · fiúknak és lányoknak' },
    { key: 'home', label: 'Csomag otthonoknak', sub: ' csomag · egész otthonnak' }
  ];
  var leads = {
    child: 'Egy konkrét gyerek kívánságlistája: válassz egy kártyát, és vedd meg, amit kért. Csak olyan kártyák látszanak, amelyeket még lehet vállalni.',
    pack: 'Fiúknak vagy lányoknak szóló, korosztályra szabott ajándékcsomagok: ha nem egy konkrét gyereknek vásárolnál.',
    home: 'Az egész otthonnak szóló közös csomagok: tisztálkodási szerek, iskolaszer, ágynemű és háztartási alapok.'
  };

  var steps = [
    { n: '1', title: 'A gyerekek kívánnak', text: 'A gyerekotthonok összegyűjtik, milyen ajándékot szeretnének a náluk élők.', tint: '#FBE4DD', icon: 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z' },
    { n: '2', title: 'Felkerülnek az oldalra', text: 'A kívánságlistán megismerheted az egyes gyerekek kéréseit.', tint: '#D9E4F3', icon: 'M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM8 9h8M8 13h8M8 17h5' },
    { n: '3', title: 'Te választasz', text: 'Kiválasztasz egy vagy több gyereket, és vállalod, hogy beszerzed a kívánságot.', tint: '#EEB1A0', icon: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8 12.5l3 3 5-6' },
    { n: '4', title: 'Leadod az ajándékot', text: 'A gyűjtési napon új, még becsomagolatlan ajándékkal érkezel.', tint: '#E3E9F4', icon: 'M5 9h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1zM12 9v11M3 9h18M12 9c-2-4-6-4-5-1.5M12 9c2-4 6-4 5-1.5' },
    { n: '5', title: 'Mi eljuttatjuk', text: 'A szervezők ellenőrzik, becsomagolják, és karácsony előtt eljuttatják.', tint: '#FBE4DD', icon: 'M4 11l8-7 8 7v9H4zM10 20v-6h4v6' }
  ];
  var cegSteps = [
    { n: '1', title: 'Indítsatok csapatot', text: 'Egy kolléga vagy közösségi tag elindítja a közös gyűjtést, és meghívja a többieket.' },
    { n: '2', title: 'Vállaljatok együtt', text: 'Mindenki látja, melyik kívánságot ki vállalta, így nincs dupla ajándék.' },
    { n: '3', title: 'Adjátok le egyszerre', text: 'Egy időpontban, egy helyen, a gyűjtési napon: a többit a szervezők intézik.' }
  ];
  var cegPerks = ['Közös kívánságlista a csapatnak', 'Letölthető belső levélminta és plakát', 'Összesítő az elért eredményről', 'Személyes segítség a szervezőktől'];
  var paths = [
    { act: 'list', title: 'Magánszemélyként', text: 'Válassz egy gyereket, vedd meg a kívánságait, és add le a gyűjtési napon. Az egész pár perc.', cta: 'Kívánságok megtekintése', tint: '#E3EBF6', icon: 'M5 9h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1zM12 9v11M3 9h18M12 9c-2-4-6-4-5-1.5M12 9c2-4 6-4 5-1.5' },
    { act: 'ceg', title: 'Cégként vagy közösségként', text: 'Gyűjtsetek együtt, és teljesítsetek akár több kívánságot is. Segítünk a szervezésben.', cta: 'Egyeztetést kérek', tint: '#FBE6DF', icon: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M17 11a2.5 2.5 0 1 0 0-5M17 14c2.5 0 4 2 4 5' },
    { act: 'contact', title: 'Gyermekotthonként', text: 'Jelezd az otthonod gyerekeinek kívánságait és az általános szükségleteket a szervezőknek.', cta: 'Kapcsolatfelvétel', tint: '#FBE4DD', icon: 'M4 11l8-7 8 7v9H4zM10 20v-6h4v6' }
  ];
  var faqDefs = [
    { q: 'Milyen ajándékot vegyek?', a: 'Új, még becsomagolatlan ajándékot, a kártyán szereplő kívánságok alapján. A csomagolást a szervezők végzik.' },
    { q: 'Mikor és hol adhatom le?', a: 'A gyűjtési napon, személyesen: [leadási hely és időpont]. A leadás előtt emlékeztetőt küldünk.' },
    { q: 'Lemondhatom a vállalást?', a: 'Igen, a leadás előtt bármikor, a Vállalásaim panelben. A kívánság visszakerül a listára, és más is vállalhatja.' },
    { q: 'Találkozom a gyerekkel?', a: 'Nem. Az ajándékot a szervezők juttatják el a gyermekotthonokba, így a gyerekek adatai védettek maradnak.' }
  ];
  var listDefs = [
    { key: 'all', label: 'Mind' }, { key: 'g03', label: '0–3 éves' }, { key: 'g410', label: '4–10 éves' },
    { key: 'g1114', label: '11–14 éves' }, { key: 'g1518', label: '15–18 éves' }
  ];

  /* ---------- Sablonok ---------- */
  var AV_HEAD = '<svg width="76" height="76" viewBox="0 0 100 100" fill="none" stroke="#1E2A3C" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
  var AV_FACE = '<circle cx="41" cy="52" r="2.4" fill="#1E2A3C" stroke="none"></circle><circle cx="59" cy="52" r="2.4" fill="#1E2A3C" stroke="none"></circle><path d="M42 62q8 7 16 0"></path>';
  function faceSvg(c) {
    var s = AV_HEAD;
    if (c.face === 'girl') {
      s += '<path d="M16 100c0-22 14-32 34-32s34 10 34 32z" fill="#E07D7E"></path><circle cx="22" cy="42" r="9" fill="#5B3A29"></circle><circle cx="78" cy="42" r="9" fill="#5B3A29"></circle><circle cx="50" cy="48" r="24" fill="#F2C3A0"></circle><path d="M26 44c0-18 12-27 24-27s24 9 24 27c-7-9-15-13-24-13s-17 4-24 13z" fill="#5B3A29"></path>' + AV_FACE + '<circle cx="35" cy="58" r="4" fill="#EEB1A0" stroke="none" opacity="0.75"></circle><circle cx="65" cy="58" r="4" fill="#EEB1A0" stroke="none" opacity="0.75"></circle>';
    } else if (c.face === 'star') {
      s += '<path d="M16 100c0-22 14-32 34-32s34 10 34 32z" fill="#EEB1A0"></path><circle cx="50" cy="48" r="24" fill="#F2C3A0"></circle><circle cx="31" cy="30" r="9" fill="#2A1A12"></circle><circle cx="44" cy="24" r="9" fill="#2A1A12"></circle><circle cx="58" cy="24" r="9" fill="#2A1A12"></circle><circle cx="70" cy="31" r="9" fill="#2A1A12"></circle><path d="M27 40c6-8 14-10 23-10s17 2 23 10c-6-3-14-5-23-5s-17 2-23 5z" fill="#2A1A12"></path>' + AV_FACE + '<circle cx="35" cy="58" r="4" fill="#E07D7E" stroke="none" opacity="0.7"></circle><circle cx="65" cy="58" r="4" fill="#E07D7E" stroke="none" opacity="0.7"></circle><path transform="translate(33 -58)" d="M50 80c-6-4-9-8-9-12a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 4-3 8-9 12z" fill="#E07D7E" stroke-width="2.5"></path>';
    } else {
      s += '<path d="M16 100c0-22 14-32 34-32s34 10 34 32z" fill="#4D688E"></path><circle cx="50" cy="48" r="24" fill="#F2C3A0"></circle><path d="M26 44c0-18 12-27 24-27s24 9 24 27c-7-9-15-13-24-13s-17 4-24 13z" fill="#5B3A29"></path>' + AV_FACE + '<circle cx="35" cy="58" r="4" fill="#EEB1A0" stroke="none" opacity="0.75"></circle><circle cx="65" cy="58" r="4" fill="#EEB1A0" stroke="none" opacity="0.75"></circle>';
    }
    return s + '</svg>';
  }

  var THEMES = {
    boy: { bg: '#E3EBF6', fg: '#1E2A3C', tagBg: '#4D688E', tagFg: '#FFFFFF', tagText: 'Fiú', ageFg: '#2B4466', kindFg: '#4D688E', subFg: '#4D688E', chipFg: '#2A3C55', moreFg: '#2B4466', dashBd: '#7C9CC6', dot: '#4D688E', btn: '#396A95', btnSh: 'rgba(57,106,149,0.38)', deco1: 'rgba(255,255,255,0.55)', deco2: 'rgba(124,156,198,0.28)', shadow: 'none' },
    girl: { bg: '#FBE4DD', fg: '#1E2A3C', tagBg: '#EEB1A0', tagFg: '#5E2B25', tagText: 'Lány', ageFg: '#8E3F40', kindFg: '#8E3F40', subFg: '#6B2E27', chipFg: '#6B2E27', moreFg: '#8E3F40', dashBd: '#E07D7E', dot: '#E07D7E', btn: '#FF6D78', btnSh: 'rgba(255,109,120,0.38)', deco1: 'rgba(255,255,255,0.55)', deco2: 'rgba(238,177,160,0.4)', shadow: 'none' },
    home: { bg: '#F4EFE8', fg: '#2E2A26', tagBg: '#8C7B6B', tagFg: '#FFFFFF', tagText: 'Otthoni csomag', ageFg: '#5E4F43', kindFg: '#8C7B6B', subFg: '#6B5D51', chipFg: '#5E4F43', moreFg: '#5E4F43', dashBd: '#BFB1A3', dot: '#8C7B6B', btn: '#FF6D78', btnSh: 'rgba(255,109,120,0.38)', deco1: 'rgba(255,255,255,0.6)', deco2: 'rgba(140,123,107,0.14)', shadow: 'none' },
    sp: { bg: '#7DD0C5', fg: '#12303A', tagBg: '#1E4A55', tagFg: '#FFFFFF', tagText: 'Különleges figyelem', ageFg: '#1E4A55', kindFg: '#12303A', subFg: '#12303A', chipFg: '#12303A', moreFg: '#12303A', dashBd: '#1E4A55', dot: '#1E4A55', btn: '#00818F', btnSh: 'rgba(0,129,143,0.38)', deco1: 'rgba(255,255,255,0.3)', deco2: 'rgba(30,74,85,0.14)', shadow: '0 18px 40px rgba(56,125,139,0.3)' }
  };

  function cardHTML(c) {
    var mine = isPledged(c.id);
    var t = THEMES[c.pkg ? 'home' : (c.special ? 'sp' : (c.face === 'girl' ? 'girl' : 'boy'))];
    var chips = c.wishes.slice(0, 4).map(function (w) {
      return '<span style="background:#fff;color:' + t.chipFg + ';font-size:14px;font-weight:600;padding:6px 12px;border-radius:999px">' + esc(w) + '</span>';
    }).join('');
    var rest = c.wishes.length - 4;
    if (rest > 0) chips += '<span style="background:transparent;color:' + t.moreFg + ';font-size:14px;font-weight:700;padding:4px 12px;border-radius:999px;border:2px dashed ' + t.dashBd + '">+' + rest + ' további</span>';
    var heart = c.special ? icon('M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z', '#FFFFFF', 16, 2).replace('fill="none"', 'fill="#E07D7E"') : '';
    var note = c.special
      ? '<div style="position:relative;display:flex;align-items:flex-start;gap:10px;background:rgba(255,255,255,0.6);color:#1E2A3C;font-size:14px;font-weight:700;padding:12px 14px;border-radius:16px">' +
        '<span style="flex:none;display:flex;margin-top:2px">' + icon('M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 8v.01', '#1E4A55', 18, 2.2) + '</span>' + 'Kérjük, olvasd el figyelmesen a kívánságokat, és ezek közül válassz.</div>'
      : '';
    var home = c.homeName ? '<span style="margin-left:auto;font-weight:600">Otthon: ' + esc(c.homeName) + '</span>' : '';
    var button = mine
      ? '<button class="ghost" type="button" data-act="pledge" data-id="' + esc(c.id) + '" style="display:flex;align-items:center;justify-content:center;gap:10px;min-height:54px;width:100%;background:#fff;color:#2B4466;font-weight:800;font-size:17px;border:2px solid ' + t.btn + ';border-radius:18px">' + icon('M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8 12.5l3 3 5-6', '#2B4466', 20, 2.4) + 'Te vállaltad: nézd meg</button>'
      : '<button class="btn" type="button" data-act="pledge" data-id="' + esc(c.id) + '" style="--sh:' + t.btnSh + ';display:flex;align-items:center;justify-content:center;gap:10px;min-height:54px;width:100%;background:' + t.btn + ';color:#FFFFFF;font-weight:800;font-size:17px;border:none;border-radius:18px">' + GIFT_ICON + 'Megajándékozom</button>';
    return '<article class="card pop" style="position:relative;overflow:hidden;background:' + t.bg + ';border-radius:32px;padding:26px;display:flex;flex-direction:column;gap:16px;box-shadow:' + t.shadow + '">' +
      '<div style="position:absolute;right:-50px;top:-50px;width:190px;height:190px;border-radius:50%;background:' + t.deco1 + '"></div>' +
      '<div style="position:absolute;right:50px;top:96px;width:64px;height:64px;border-radius:50%;background:' + t.deco2 + '"></div>' +
      '<div style="position:relative;display:flex;align-items:center;justify-content:space-between;gap:12px">' +
        '<div style="display:inline-flex;align-items:center;gap:8px;background:' + t.tagBg + ';color:' + t.tagFg + ';font-weight:800;font-size:12px;letter-spacing:0.04em;white-space:nowrap;text-transform:uppercase;padding:7px 14px 7px 12px;border-radius:12px 12px 12px 4px">' + heart + t.tagText + '</div>' +
        '<div style="flex:none;background:#fff;color:' + t.ageFg + ';font-weight:800;font-size:14px;padding:6px 14px;border-radius:999px">' + esc(c.age) + '</div>' +
      '</div>' +
      '<div style="position:relative;display:flex;align-items:center;gap:16px">' +
        '<div style="flex:none;width:84px;height:84px;border-radius:26px;background:#fff;overflow:hidden;display:flex;align-items:flex-end;justify-content:center">' + (c.pkg ? icon(c.icon, '#8C7B6B', 46, 1.8).replace('aria-hidden="true"', 'aria-hidden="true" style="margin-bottom:19px"') : faceSvg(c)) + '</div>' +
        '<div><div style="font-family:\'Fredoka\',sans-serif;font-weight:600;font-size:34px;line-height:1;color:' + t.fg + '">' + esc(c.id) + '</div>' +
        '<div style="margin-top:4px;font-size:14px;font-weight:700;color:' + t.kindFg + '">' + esc(c.kind) + '</div></div>' +
      '</div>' +
      '<div style="position:relative"><h3 style="margin:0;font-family:\'Fredoka\',sans-serif;font-weight:600;font-size:24px;line-height:1.2;color:' + t.fg + '">' + esc(c.title) + '</h3>' +
      '<div style="margin-top:4px;color:' + t.subFg + '">' + esc(c.sub) + '</div></div>' + note +
      '<div style="position:relative;display:flex;flex-wrap:wrap;gap:8px">' + chips + '</div>' +
      '<div style="position:relative;margin-top:auto;display:flex;flex-direction:column;gap:14px">' +
        (mine || c.homeName ? '<div style="display:flex;align-items:center;gap:8px;font-size:14px;font-weight:700;color:' + t.chipFg + '">' +
          (mine ? '<span style="width:10px;height:10px;border-radius:50%;background:#E07D7E"></span><span>Te vállaltad</span>' : '') + home + '</div>' : '') +
        button +
        (!mine && !state.user ? '<div style="display:flex;align-items:center;justify-content:center;gap:6px;font-size:13px;font-weight:700;color:' + t.chipFg + '">' + '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="' + t.chipFg + '" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"></rect><path d="M8 11V8a4 4 0 0 1 8 0v3"></path></svg>Vállaláshoz belépés szükséges</div>' : '') +
      '</div></article>';
  }

  /* ---------- Renderelés ---------- */
  function renderTimer() {
    var diff = Math.max(0, COLLECTION_DATE - Date.now());
    $('t-days').textContent = pad(Math.floor(diff / 86400000));
    $('t-hours').textContent = pad(Math.floor((diff % 86400000) / 3600000));
    $('t-minutes').textContent = pad(Math.floor((diff % 3600000) / 60000));
    $('t-seconds').textContent = pad(Math.floor((diff % 60000) / 1000));
  }

  function renderProgress() {
    var p = Math.min(100, BASE_PROGRESS + Object.keys(state.pledges).length);
    $('progress-num').textContent = p + '%';
    $('progress-bar').style.width = p + '%';
  }

  function renderBadge() {
    var n = Object.keys(state.pledges).length;
    var b = $('pledge-badge');
    b.hidden = n === 0;
    b.textContent = n;
  }

  function renderStatic() {
    $('date-label').textContent = DATE_LABEL;
    $('cta-child').textContent = 'Összes gyerek kívánsága (' + countOf('child') + ')';
    $('cta-pack').textContent = 'Összes ajándékcsomag (' + countOf('pack') + ')';
    $('cta-home').textContent = 'Összes otthoni csomag (' + countOf('home') + ')';
    $('steps').innerHTML = steps.map(function (s) {
      return '<div class="step reveal" style="position:relative;box-sizing:border-box;min-height:240px;background:#FFFFFF;border-radius:24px;padding:40px 20px;box-shadow:0 6px 9px rgba(30,42,60,0.05);display:flex;flex-direction:column;gap:8px">' +
        '<div style="position:relative;display:flex;align-items:center;justify-content:space-between">' +
        '<div style="width:48px;height:48px;border-radius:50%;background:' + s.tint + ';display:flex;align-items:center;justify-content:center">' + icon(s.icon, '#1E2A3C', 26, 2) + '</div>' +
        '<div aria-hidden="true" style="position:absolute;right:0;top:-72px;font-family:\'Fredoka\',sans-serif;font-weight:400;font-size:120px;line-height:1;opacity:0.5;color:#C6D3E6;pointer-events:none">' + s.n + '</div></div>' +
        '<h3 style="margin:0;font-family:\'Fredoka\',sans-serif;font-weight:600;font-size:20px;line-height:25px">' + esc(s.title) + '</h3>' +
        '<p style="margin:0;font-size:15px;line-height:22.5px;color:#4D688E">' + esc(s.text) + '</p></div>';
    }).join('');

    $('pkg-list').innerHTML = pkgList.map(function (w) {
      return '<span style="display:inline-flex;align-items:center;gap:10px;font-size:15px;font-weight:600;color:#1E2A3C">' + icon(CHECK, '#4D688E', 18, 2.6).replace('aria-hidden="true"', 'aria-hidden="true" style="flex:none"') + esc(w) + '</span>';
    }).join('');

    $('ceg-steps').innerHTML = cegSteps.map(function (s) {
      return '<div class="glass" style="display:flex;gap:16px;align-items:flex-start;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.22);border-radius:22px;padding:18px 20px">' +
        '<div style="flex:none;width:44px;height:44px;border-radius:50%;background:#00C8B6;color:#FFFFFF;font-family:\'Fredoka\',sans-serif;font-weight:600;font-size:22px;display:flex;align-items:center;justify-content:center">' + s.n + '</div>' +
        '<div style="display:flex;flex-direction:column;gap:2px;min-width:0"><div style="font-family:\'Fredoka\',sans-serif;font-weight:600;font-size:20px;line-height:25px">' + esc(s.title) + '</div>' +
        '<div style="font-size:16px;line-height:24px;color:#E5ECF6">' + esc(s.text) + '</div></div></div>';
    }).join('');

    $('ceg-perks').innerHTML = cegPerks.map(function (k) {
      return '<div style="display:flex;gap:10px;align-items:center;font-weight:700;font-size:16px">' + icon(CHECK, '#FFFFFF', 20, 2.4).replace('aria-hidden="true"', 'aria-hidden="true" style="flex:none"') + esc(k) + '</div>';
    }).join('');

    $('paths').innerHTML = paths.map(function (p) {
      return '<button class="path reveal" type="button" data-act="' + p.act + '" style="flex:1 1 300px;min-width:0;min-height:343px;box-sizing:border-box;text-align:left;color:#1E2A3C;background:#FFFFFF;border:none;border-radius:28px;padding:30px;display:flex;flex-direction:column;align-items:flex-start;gap:14px;box-shadow:0 14px 18px rgba(30,42,60,0.1)">' +
        '<div style="width:64px;height:64px;border-radius:22px;display:flex;align-items:center;justify-content:center;background:' + p.tint + '">' + icon(p.icon, '#1E2A3C', 34, 2) + '</div>' +
        '<div style="font-family:\'Fredoka\',sans-serif;font-weight:600;font-size:26px;line-height:30px">' + esc(p.title) + '</div>' +
        '<div style="font-size:16px;line-height:24px;color:#4D688E">' + esc(p.text) + '</div>' +
        '<div style="margin-top:auto;display:inline-flex;align-items:center;gap:8px;font-weight:800;font-size:17px;color:#B5474A">' + esc(p.cta) + icon(ARROW, '#4D688E', 18, 2.6) + '</div></button>';
    }).join('');
  }

  function renderHomeCards() {
    $('home-child').innerHTML = byIds(homeChild).map(cardHTML).join('');
    $('home-pack').innerHTML = byIds(homePack).map(cardHTML).join('');
  }

  function renderFaq() {
    var box = $('faqs');
    if (!box.children.length) {
      box.innerHTML = faqDefs.map(function (d, i) {
        return '<div style="border-top:1px solid #E1E8F1">' +
          '<button class="faq" type="button" data-act="faq" data-i="' + i + '" aria-expanded="false" style="width:100%;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px 8px;font-size:17px;font-weight:800;text-align:left;color:#1E2A3C;background:#fff;border:none;border-radius:12px">' +
          esc(d.q) + '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4D688E" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:none;transition:transform .25s ease;transform:rotate(0deg)"><path d="M6 9l6 6 6-6"></path></svg></button>' +
          '<div class="faqp" aria-hidden="true" style="grid-template-rows:0fr;opacity:0"><div><div style="padding:0 8px 18px;color:#4D688E;font-size:16px">' + esc(d.a) + '</div></div></div></div>';
      }).join('');
    }
    Array.prototype.forEach.call(box.children, function (row, i) {
      var open = state.faq === i;
      row.querySelector('.faq').setAttribute('aria-expanded', String(open));
      row.querySelector('svg').style.transform = open ? 'rotate(180deg)' : 'rotate(0deg)';
      var p = row.querySelector('.faqp');
      p.style.gridTemplateRows = open ? '1fr' : '0fr';
      p.style.opacity = open ? '1' : '0';
      p.setAttribute('aria-hidden', String(!open));
    });
  }

  function renderSub() {
    $('sub-box').innerHTML = state.subDone
      ? '<div class="pop" style="background:rgba(255,255,255,0.6);font-weight:800;color:#7F2930;padding:16px 18px;border-radius:16px">Köszönjük! Szólunk, amikor a következő gyűjtés indul.</div>'
      : '<form id="sub-form" novalidate style="display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end">' +
        '<label for="subemail" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">E-mail-cím</label>' +
        '<input id="subemail" type="email" placeholder="E-mail-címed" value="' + esc(state.subEmail) + '" style="flex:1 1 200px;min-width:0;height:52px;box-sizing:border-box;padding:0 18px;font-family:\'Nunito\',sans-serif;font-size:16px;color:#1E2A3C;background:#FFFFFF;border:none;border-radius:16px">' +
        '<button class="btn" type="submit" style="--sh:rgba(255,109,120,.38);height:52px;padding:0 32px;font-size:16px;font-weight:800;color:#FFFFFF;background:#FF6D78;border:none;border-radius:16px">Értesítést kérek</button></form>';
  }

  function inputField(id, label, type, value, placeholder) {
    return '<div><label for="' + id + '" style="display:block;font-weight:800;font-size:15px;margin-bottom:6px">' + label + '</label>' +
      '<input id="' + id + '" type="' + type + '" value="' + esc(value) + '"' + (placeholder ? ' placeholder="' + placeholder + '"' : '') +
      ' style="width:100%;min-height:50px;padding:0 16px;font-family:\'Nunito\',sans-serif;font-size:16px;color:#1E2A3C;background:#fff;border:2px solid #B7C6D6;border-radius:14px"></div>';
  }

  function renderCeg() {
    var c = state.ceg;
    $('ceges-kapcsolat').innerHTML = c.done
      ? '<div class="pop" style="text-align:center;padding:20px 0"><div style="margin:0 auto;width:72px;height:72px;border-radius:50%;background:#E3EBF6;display:flex;align-items:center;justify-content:center">' + icon(CHECK, '#4D688E', 38, 2.4) + '</div>' +
        '<h3 style="margin:16px 0 0;font-family:\'Fredoka\',sans-serif;font-weight:600;font-size:26px">Köszönjük, jelentkeztetek!</h3>' +
        '<p style="margin:8px 0 0;color:#4D688E">Hamarosan felvesszük veletek a kapcsolatot, és közösen megtervezzük a gyűjtést.</p></div>'
      : '<form id="ceg-form" novalidate><h3 style="margin:0;font-family:\'Fredoka\',sans-serif;font-weight:600;font-size:28px;line-height:32px">Kérj egyeztetést</h3>' +
        '<p style="margin:0;line-height:24px;color:#4D688E">Pár adat elég, a többit személyesen beszéljük meg.</p>' +
        '<div style="padding-top:20px;display:flex;flex-direction:column;gap:14px">' +
        inputField('cegname', 'Cég vagy közösség neve', 'text', c.name) +
        inputField('cegsize', 'Hányan vennétek részt?', 'text', c.size, 'pl. 20 fő') +
        inputField('cegemail', 'E-mail-cím', 'email', c.email) +
        (c.err ? '<div style="font-size:14px;font-weight:700;color:#B3261E">Kérjük, add meg a nevet és egy érvényes e-mail-címet.</div>' : '') +
        '<button class="btn" type="submit" style="--sh:rgba(255,109,120,.38);height:54px;font-size:17px;font-weight:800;color:#FFFFFF;background:#FF6D78;border:none;border-radius:16px">Egyeztetést kérek</button></div></form>';
  }

  function renderList() {
    $('list-tabs').innerHTML = tabDefs.map(function (d) {
      var on = state.listType === d.key;
      return '<button type="button" role="tab" data-act="tab" data-key="' + d.key + '" aria-selected="' + on + '" style="flex:1 1 220px;min-width:0;display:flex;flex-direction:column;align-items:flex-start;gap:2px;text-align:left;padding:14px 20px;font-family:\'Nunito\',sans-serif;border:none;border-radius:16px;cursor:pointer;background:' + (on ? '#FFFFFF' : 'transparent') + ';box-shadow:' + (on ? '0 6px 14px rgba(30,42,60,0.12)' : 'none') + '">' +
        '<span style="font-family:\'Fredoka\',sans-serif;font-weight:600;font-size:20px;line-height:25px;color:' + (on ? '#1E2A3C' : '#4D688E') + '">' + d.label + '</span>' +
        '<span style="font-size:14px;font-weight:700;color:' + (on ? '#FF6D78' : '#7C9CC6') + '">' + countOf(d.key) + d.sub + '</span></button>';
    }).join('');
    $('list-lead').textContent = leads[state.listType];
    $('list-age-wrap').hidden = state.listType === 'home';

    $('list-filters').innerHTML = listDefs.map(function (d) {
      var on = state.listFilter === d.key;
      return '<button class="chip" type="button" data-act="filter" data-key="' + d.key + '" aria-pressed="' + on + '" style="font-size:15px;font-weight:800;padding:12px 20px;border-radius:999px;background:' + (on ? '#FF6D78' : '#FFFFFF') + ';color:' + (on ? '#FFFFFF' : '#2B4466') + ';border:1.5px solid ' + (on ? '#FF6D78' : '#D9E4F3') + '">' + esc(d.label) + '</button>';
    }).join('');

    var q = state.query.trim().toLowerCase();
    var filtered = allItems.filter(function (c) {
      if (c.type !== state.listType) return false;
      if (state.listType !== 'home' && state.listFilter !== 'all' && c.group !== state.listFilter) return false;
      if (!q) return true;
      return (c.title + ' ' + c.wishes.join(' ') + ' ' + c.id).toLowerCase().indexOf(q) !== -1;
    });
    var shown = filtered.slice(0, state.listLimit);
    var remaining = Math.max(0, filtered.length - shown.length);

    $('list-info').textContent = filtered.length + ' kívánság látható';
    $('list-cards').innerHTML = shown.map(cardHTML).join('');
    $('list-empty').innerHTML = filtered.length === 0
      ? '<div class="pop" style="margin-top:28px;text-align:center;padding:40px 24px;background:#F4F7FB;border-radius:24px"><div style="font-family:\'Fredoka\',sans-serif;font-weight:600;font-size:24px">Erre most nincs szabad kívánság.</div>' +
        '<p style="margin:8px 0 18px;color:#4D688E">Próbálj másik korosztályt vagy keresést.</p>' +
        '<button class="btn" type="button" data-act="reset" style="--sh:rgba(255,109,120,.38);min-height:50px;padding:0 26px;font-size:16px;font-weight:800;color:#FFFFFF;background:#FF6D78;border:none;border-radius:16px">Szűrők törlése</button></div>'
      : '';
    $('list-more').innerHTML = remaining > 0
      ? '<div style="padding-top:40px;display:flex;flex-direction:column;align-items:center;gap:16px"><button class="ghost" type="button" data-act="more" style="display:inline-flex;align-items:center;gap:10px;height:58px;padding:0 32px;font-size:17px;font-weight:800;color:#2B4466;background:#FFFFFF;border:2px solid #4D688E;border-radius:18px">További kívánságok betöltése' + icon('M6 9l6 6 6-6', '#2B4466', 20, 2.6) + '</button>' +
        '<div style="font-size:16px;font-weight:700;color:#4D688E">' + remaining + ' kívánság még vár betöltésre</div></div>'
      : '';
  }

  function authInput(id, k, label, type, ph) {
    return '<div><label for="' + id + '" style="display:block;font-weight:800;font-size:15px;margin-bottom:6px">' + label + '</label>' +
      '<input id="' + id + '" data-k="' + k + '" type="' + type + '" value="' + esc(state.f[k]) + '"' + (ph ? ' placeholder="' + ph + '"' : '') +
      ' style="width:100%;min-height:50px;box-sizing:border-box;padding:0 16px;font-family:\'Nunito\',sans-serif;font-size:16px;color:#1E2A3C;background:#fff;border:2px solid #B7C6D6;border-radius:14px"></div>';
  }
  var CLOSE_X = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E2A3C" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"></path></svg>';
  function closeBtn(act) {
    return '<button class="ghost" type="button" data-act="' + act + '" aria-label="Bezárás" style="flex:none;width:44px;height:44px;display:flex;align-items:center;justify-content:center;background:#fff;border:2px solid #E1E8F1;border-radius:50%">' + CLOSE_X + '</button>';
  }
  var BTN_RED = 'font-family:\'Nunito\',sans-serif;font-size:17px;font-weight:800;color:#FFFFFF;background:#C34F52;border:none;border-radius:16px';
  var BTN_OUT = 'min-height:54px;padding:0 24px;font-family:\'Nunito\',sans-serif;font-size:17px;font-weight:800;color:#1E2A3C;background:#fff;border:2px solid #1E2A3C;border-radius:16px';
  function errBox() { return state.authErr ? '<div style="font-size:14px;font-weight:700;color:#B3261E">' + esc(state.authErr) + '</div>' : ''; }

  function renderModal() {
    var root = $('modal-root');
    if (!state.modal) { root.innerHTML = ''; return; }
    var item = allItems.filter(function (x) { return x.id === state.modal; })[0];
    var inner;
    if (state.step === 'auth') {
      var reg = state.authTab === 'reg';
      var tab = function (key, label, on) {
        return '<button type="button" data-act="auth-tab" data-key="' + key + '" aria-pressed="' + on + '" style="flex:1 1 0;height:44px;font-family:\'Nunito\',sans-serif;font-size:15px;font-weight:800;border-radius:999px;border:none;cursor:pointer;background:' + (on ? '#FFFFFF' : 'transparent') + ';color:' + (on ? '#2B4466' : '#4D688E') + '">' + label + '</button>';
      };
      inner = '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px"><h2 id="dlgtitle" style="margin:0;font-family:\'Fredoka\',sans-serif;font-weight:600;font-size:28px;line-height:1.2">Lépj be a vállaláshoz</h2>' + closeBtn('modal-close') + '</div>' +
        '<p style="margin:8px 0 0;font-size:15px;color:#4D688E">Így tudunk emlékeztetőt küldeni a leadás előtt, és te is követheted az ajándékod útját.</p>' +
        '<div style="margin-top:18px;display:flex;gap:6px;padding:4px;background:#F4F7FB;border-radius:999px">' + tab('reg', 'Regisztráció', reg) + tab('login', 'Belépés', !reg) + '</div>' +
        (reg
          ? '<form id="reg-form" novalidate style="margin-top:18px;display:flex;flex-direction:column;gap:14px">' +
            authInput('regname', 'aName', 'Név', 'text') + authInput('regemail', 'aEmail', 'E-mail-cím', 'email', 'pelda@email.hu') + authInput('regphone', 'aPhone', 'Telefonszám', 'tel', '+36 30 123 4567') +
            '<div style="margin-top:-6px;font-size:13px;color:#4D688E">A telefonszámot csak a leadási emlékeztetőhöz használjuk.</div>' + errBox() +
            '<div style="display:flex;flex-wrap:wrap;gap:12px"><button class="btn" type="submit" style="flex:1 1 200px;min-height:54px;' + BTN_RED + '">Regisztrálok és folytatom</button>' +
            '<button class="ghost" type="button" data-act="modal-close" style="' + BTN_OUT + '">Mégsem</button></div></form>'
          : '<form id="login-form" novalidate style="margin-top:18px;display:flex;flex-direction:column;gap:14px">' +
            authInput('logemail', 'aEmail', 'E-mail-cím', 'email', 'pelda@email.hu') +
            (state.codeSent ? '<div style="font-size:14px;color:#4D688E">Elküldtünk egy belépőkódot a megadott e-mail-címre. (Prototípus: bármilyen 4 számjegy jó.)</div>' + authInput('logcode', 'aCode', 'Belépőkód', 'text', '1234') : '') + errBox() +
            '<div style="display:flex;flex-wrap:wrap;gap:12px"><button class="btn" type="submit" style="flex:1 1 200px;min-height:54px;' + BTN_RED + '">' + (state.codeSent ? 'Belépek' : 'Kód küldése') + '</button>' +
            '<button class="ghost" type="button" data-act="modal-close" style="' + BTN_OUT + '">Mégsem</button></div></form>');
    } else if (state.step === 'confirm') {
      inner = '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px">' +
        '<h2 id="dlgtitle" style="margin:0;font-family:\'Fredoka\',sans-serif;font-weight:600;font-size:28px;line-height:1.2">Vállalod ezt a kívánságot?</h2>' + closeBtn('modal-close') + '</div>' +
        '<div style="margin-top:18px;background:#F4F7FB;border-radius:20px;padding:18px 20px"><div style="font-family:\'Fredoka\',sans-serif;font-weight:600;font-size:20px">' + esc(item.id) + ' · ' + esc(item.age) + '</div>' +
        '<div style="margin-top:2px;font-weight:700">' + esc(item.title) + '</div>' +
        '<div style="margin-top:8px;font-size:15px;color:#4D688E">' + esc(item.wishes.join(', ')) + '</div></div>' +
        '<p style="margin:16px 0 0;font-size:15px;color:#4D688E">A vállalás után a Vállalásaim panelben követheted az ajándék útját, és emlékeztetőt küldünk a leadás előtt.</p>' +
        '<div style="margin-top:14px;font-size:14px;color:#4D688E">Belépve: <strong style="color:#1E2A3C">' + esc(state.user.name) + '</strong> · ' + esc(state.user.email) + '</div>' +
        '<div style="margin-top:22px;display:flex;flex-wrap:wrap;gap:12px">' +
        '<button class="btn" type="button" data-act="confirm" style="flex:1 1 200px;min-height:54px;' + BTN_RED + '">Vállalom</button>' +
        '<button class="ghost" type="button" data-act="modal-close" style="' + BTN_OUT + '">Mégsem</button></div>';
    } else {
      inner = '<div style="text-align:center"><div class="pop" style="margin:0 auto;width:84px;height:84px;border-radius:50%;background:#E3EBF6;display:flex;align-items:center;justify-content:center">' +
        '<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#4D688E" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" fill="#D9E4F3"></path></svg></div>' +
        '<h2 id="dlgtitle" style="margin:18px 0 0;font-family:\'Fredoka\',sans-serif;font-weight:600;font-size:30px;line-height:1.2">Köszönjük, hogy vállaltad!</h2>' +
        '<p style="margin:10px 0 0;font-size:17px;color:#4D688E">A ' + esc(item.id) + ' kívánságot lefoglaltuk neked. Az ajándékot új, becsomagolatlan állapotban a gyűjtési napon kell leadnod: <strong style="color:#1E2A3C">' + DATE_LABEL + '</strong>.</p>' +
        '<div style="margin-top:24px;display:flex;flex-wrap:wrap;justify-content:center;gap:12px">' +
        '<button class="btn" type="button" data-act="to-drawer" style="min-height:54px;padding:0 26px;' + BTN_RED + '">Vállalásaim megtekintése</button>' +
        '<button class="ghost" type="button" data-act="modal-close" style="' + BTN_OUT + '">Még egyet választok</button></div></div>';
    }
    root.innerHTML = '<div class="fade" data-act="modal-backdrop" style="position:fixed;inset:0;z-index:100;background:rgba(27,38,56,0.55);display:flex;align-items:center;justify-content:center;padding:16px">' +
      '<div class="pop" role="dialog" aria-modal="true" aria-labelledby="dlgtitle" style="width:100%;max-width:520px;max-height:100%;overflow:auto;box-sizing:border-box;background:#fff;border-radius:28px;padding:32px;box-shadow:0 30px 80px rgba(27,38,56,0.35)">' + inner + '</div></div>';
  }

  function renderDrawer() {
    var root = $('drawer-root');
    if (!state.drawer) { root.innerHTML = ''; return; }
    var ids = Object.keys(state.pledges);
    var labels = ['Vállalva', 'Megvetted', 'Leadtad'];
    var status = ['Vállalva', 'Megvetted', 'Leadva'];
    var list = ids.map(function (id) {
      var item = allItems.filter(function (x) { return x.id === id; })[0];
      var s = state.pledges[id];
      var bars = labels.map(function (l, i) {
        return '<div style="flex:1;min-width:0"><div style="height:8px;border-radius:999px;background:' + (i <= s ? '#4D688E' : '#D9E4F3') + '"></div>' +
          '<div style="margin-top:6px;font-size:13px;font-weight:700;color:' + (i <= s ? '#2B4466' : '#8A9BB3') + '">' + l + '</div></div>';
      }).join('');
      var actions = '';
      if (s < 2) {
        actions += '<button class="btn" type="button" data-act="advance" data-id="' + esc(id) + '" style="min-height:46px;padding:0 20px;font-size:15px;font-weight:800;color:#FFFFFF;background:#C34F52;border:none;border-radius:14px">' + (s === 0 ? 'Megvettem az ajándékot' : 'Leadtam az ajándékot') + '</button>' +
          '<button class="ghost" type="button" data-act="cancel" data-id="' + esc(id) + '" style="min-height:46px;padding:0 18px;font-size:15px;font-weight:800;color:#B3261E;background:#fff;border:2px solid #E1E8F1;border-radius:14px">Lemondom</button>';
      } else {
        actions = '<div style="font-weight:800;color:#2B4466">Köszönjük, hogy teljesítetted a kívánságot!</div>';
      }
      return '<div class="pop" style="border:2px solid #E1E8F1;border-radius:22px;padding:20px">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px"><div>' +
        '<div style="font-family:\'Fredoka\',sans-serif;font-weight:600;font-size:20px">' + esc(item.id) + ' · ' + esc(item.age) + '</div>' +
        '<div style="font-weight:700">' + esc(item.title) + '</div></div>' +
        '<div style="flex:none;background:#E3EBF6;color:#2B4466;font-weight:800;font-size:13px;padding:5px 12px;border-radius:999px">' + status[s] + '</div></div>' +
        '<div style="margin-top:16px;display:flex;align-items:center;gap:8px">' + bars + '</div>' +
        '<div style="margin-top:16px;display:flex;flex-wrap:wrap;gap:10px;align-items:center">' + actions + '</div></div>';
    }).join('');
    var u = state.user;
    var profile = '';
    if (u && !state.editing) {
      profile = '<div style="margin-top:20px;background:#F4F7FB;border-radius:20px;padding:18px 20px"><div style="display:flex;align-items:center;gap:12px">' +
        '<div style="flex:none;width:44px;height:44px;border-radius:50%;background:#FFCBC1;color:#7F2930;display:flex;align-items:center;justify-content:center;font-family:\'Fredoka\',sans-serif;font-weight:600;font-size:20px">' + esc(u.name.trim().charAt(0).toUpperCase()) + '</div>' +
        '<div style="min-width:0"><div style="font-weight:800;font-size:17px">' + esc(u.name) + '</div><div style="font-size:14px;color:#4D688E;word-break:break-all">' + esc(u.email) + '</div><div style="font-size:14px;color:#4D688E">' + esc(u.phone) + '</div></div></div>' +
        '<div style="margin-top:14px;display:flex;flex-wrap:wrap;gap:10px">' +
        '<button class="ghost" type="button" data-act="edit-start" style="min-height:40px;padding:0 16px;font-size:14px;font-weight:800;color:#2B4466;background:#fff;border:2px solid #D9E4F3;border-radius:12px">Adataim módosítása</button>' +
        '<button class="ghost" type="button" data-act="logout" style="min-height:40px;padding:0 16px;font-size:14px;font-weight:800;color:#B3261E;background:#fff;border:2px solid #D9E4F3;border-radius:12px">Kijelentkezés</button></div></div>';
    } else if (u && state.editing) {
      profile = '<form id="edit-form" novalidate style="margin-top:20px;background:#F4F7FB;border-radius:20px;padding:18px 20px;display:flex;flex-direction:column;gap:12px">' +
        authInput('edname', 'eName', 'Név', 'text') + authInput('edemail', 'eEmail', 'E-mail-cím', 'email') + authInput('edphone', 'ePhone', 'Telefonszám', 'tel') + errBox() +
        '<div style="display:flex;gap:10px"><button class="btn" type="submit" style="min-height:44px;padding:0 20px;font-size:15px;font-weight:800;color:#FFFFFF;background:#C34F52;border:none;border-radius:12px">Mentés</button>' +
        '<button class="ghost" type="button" data-act="edit-cancel" style="min-height:44px;padding:0 18px;font-size:15px;font-weight:800;color:#1E2A3C;background:#fff;border:2px solid #D9E4F3;border-radius:12px">Mégsem</button></div></form>';
    }
    var empty = '';
    if (!u) {
      empty = '<div style="margin-top:28px;text-align:center;padding:32px 16px;background:#F4F7FB;border-radius:24px"><div style="font-family:\'Fredoka\',sans-serif;font-weight:600;font-size:22px">Lépj be a vállalásaidhoz</div>' +
        '<p style="margin:8px 0 18px;color:#4D688E">Belépés után itt látod a vállalt ajándékaidat és az adataidat.</p>' +
        '<button class="btn" type="button" data-act="open-auth" style="min-height:50px;padding:0 26px;font-size:16px;font-weight:800;color:#FFFFFF;background:#C34F52;border:none;border-radius:16px">Belépés / regisztráció</button></div>';
    } else if (ids.length === 0) {
      empty = '<div style="margin-top:28px;text-align:center;padding:32px 16px;background:#F4F7FB;border-radius:24px"><div style="font-family:\'Fredoka\',sans-serif;font-weight:600;font-size:22px">Még nem vállaltál ajándékot.</div>' +
        '<p style="margin:8px 0 18px;color:#4D688E">Válassz egy kívánságot, és itt követheted az útját.</p>' +
        '<button class="btn" type="button" data-act="list-child" style="min-height:50px;padding:0 26px;font-size:16px;font-weight:800;color:#FFFFFF;background:#C34F52;border:none;border-radius:16px">Kívánságok megtekintése</button></div>';
    }
    root.innerHTML = '<div class="fade" data-act="drawer-backdrop" style="position:fixed;inset:0;z-index:90;background:rgba(27,38,56,0.45);display:flex;justify-content:flex-end">' +
      '<aside class="slide" role="dialog" aria-modal="true" aria-label="Vállalásaim" style="width:100%;max-width:460px;box-sizing:border-box;height:100%;overflow:auto;background:#fff;padding:28px;box-shadow:-20px 0 60px rgba(27,38,56,0.25)">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px"><h2 style="margin:0;font-family:\'Fredoka\',sans-serif;font-weight:600;font-size:30px">Vállalásaim</h2>' + closeBtn('drawer-close') + '</div>' +
      profile + empty + '<div style="margin-top:20px;display:flex;flex-direction:column;gap:16px">' + list + '</div></aside></div>';
  }

  function renderCards() {
    renderHomeCards();
    renderList();
    renderBadge();
    renderProgress();
    renderModal();
    renderDrawer();
  }

  /* ---------- Navigáció ---------- */
  function showView(view) {
    state.view = view;
    $('view-home').hidden = view !== 'home';
    $('view-list').hidden = view !== 'list';
  }
  function goList(type) {
    state.drawer = false;
    if (type) { state.listType = type; state.listFilter = 'all'; state.listLimit = PAGE_SIZE; state.query = ''; var qq = $('q'); if (qq) qq.value = ''; }
    showView('list');
    renderList();
    renderDrawer();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function goHome() {
    showView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function goSection(id) {
    if (state.view !== 'home') {
      showView('home');
      setTimeout(function () { scrollToId(id); }, 80);
    } else {
      scrollToId(id);
    }
  }

  /* ---------- Események ---------- */
  function setMenu(open) {
    var m = $('mobmenu'); if (!m) return;
    m.hidden = !open;
    $('burger').setAttribute('aria-expanded', String(open));
    $('burger-open').hidden = open;
    $('burger-close').hidden = !open;
  }
  document.addEventListener('click', function (e) {
    var mm = $('mobmenu');
    if (mm && !mm.hidden && e.target.closest('#mobmenu a, [data-act="drawer-open"]')) setMenu(false);
    var lst = e.target.closest('a[data-act^="list-"]');
    if (lst) e.preventDefault();
    var nav = e.target.closest('[data-nav]');
    if (nav) { e.preventDefault(); state.drawer = false; renderDrawer(); goSection(nav.getAttribute('data-nav')); return; }

    var el = e.target.closest('[data-act]');
    if (!el) return;
    var act = el.getAttribute('data-act');
    var id = el.getAttribute('data-id');

    if ((act === 'modal-backdrop' || act === 'drawer-backdrop') && e.target !== el) return;
    if (el.tagName === 'A') e.preventDefault();

    switch (act) {
      case 'home': state.drawer = false; renderDrawer(); goHome(); break;
      case 'menu': setMenu($('mobmenu').hidden); break;
      case 'list': case 'list-child': goList('child'); break;
      case 'list-pack': goList('pack'); break;
      case 'list-home': goList('home'); break;
      case 'tab': state.listType = el.getAttribute('data-key'); state.listFilter = 'all'; state.listLimit = PAGE_SIZE; renderList(); break;
      case 'ceg': goSection('cegeknek'); break;
      case 'contact': scrollToId('kapcsolat'); break;
      case 'pledge':
        if (isPledged(id)) { state.drawer = true; renderDrawer(); }
        else { state.modal = id; state.step = state.user ? 'confirm' : 'auth'; state.authErr = ''; state.codeSent = false; renderModal(); }
        break;
      case 'confirm':
        state.pledges[state.modal] = 0;
        state.step = 'done';
        renderCards();
        break;
      case 'auth-tab': state.authTab = el.getAttribute('data-key'); state.authErr = ''; state.codeSent = false; state.f.aCode = ''; renderModal(); break;
      case 'open-auth': state.modal = 'auth'; state.step = 'auth'; state.drawer = false; state.authErr = ''; state.codeSent = false; renderDrawer(); renderModal(); break;
      case 'edit-start': state.editing = true; state.authErr = ''; state.f.eName = state.user.name; state.f.eEmail = state.user.email; state.f.ePhone = state.user.phone; renderDrawer(); break;
      case 'edit-cancel': state.editing = false; state.authErr = ''; renderDrawer(); break;
      case 'logout': state.user = null; state.pledges = {}; state.drawer = false; state.editing = false; renderCards(); break;
      case 'modal-close':
      case 'modal-backdrop': state.modal = null; state.step = 'confirm'; state.authErr = ''; renderModal(); break;
      case 'to-drawer': state.modal = null; state.step = 'confirm'; state.drawer = true; renderModal(); renderDrawer(); break;
      case 'drawer-open': state.drawer = true; renderDrawer(); break;
      case 'drawer-close':
      case 'drawer-backdrop': state.drawer = false; renderDrawer(); break;
      case 'advance': state.pledges[id] = Math.min(2, state.pledges[id] + 1); renderDrawer(); break;
      case 'cancel': delete state.pledges[id]; renderCards(); break;
      case 'filter': state.listFilter = el.getAttribute('data-key'); state.listLimit = PAGE_SIZE; renderList(); break;
      case 'more': state.listLimit += 6; renderList(); break;
      case 'reset': state.listFilter = 'all'; state.query = ''; state.listLimit = PAGE_SIZE; $('q').value = ''; renderList(); break;
      case 'faq': var i = Number(el.getAttribute('data-i')); state.faq = state.faq === i ? -1 : i; renderFaq(); break;
    }
  });

  function finishAuth(user) {
    state.user = user; state.authErr = ''; state.codeSent = false; state.f.aName = ''; state.f.aPhone = ''; state.f.aCode = '';
    if (state.modal && state.modal !== 'auth') { state.step = 'confirm'; }
    else { state.modal = null; state.step = 'confirm'; state.drawer = true; }
    renderCards();
  }

  document.addEventListener('submit', function (e) {
    if (e.target.id === 'sub-form') {
      e.preventDefault();
      state.subEmail = $('subemail').value;
      if (validEmail(state.subEmail)) { state.subDone = true; renderSub(); }
    } else if (e.target.id === 'reg-form' || e.target.id === 'login-form') {
      e.preventDefault();
      var f = state.f;
      if (e.target.id === 'reg-form') {
        if (!f.aName.trim()) { state.authErr = 'Kérjük, add meg a neved.'; renderModal(); return; }
        if (!validEmail(f.aEmail)) { state.authErr = 'Kérjük, érvényes e-mail-címet adj meg.'; renderModal(); return; }
        if (!validPhone(f.aPhone)) { state.authErr = 'Kérjük, érvényes telefonszámot adj meg, pl. +36 30 123 4567.'; renderModal(); return; }
        finishAuth({ name: f.aName.trim(), email: f.aEmail.trim(), phone: f.aPhone.trim() });
      } else {
        if (!validEmail(f.aEmail)) { state.authErr = 'Kérjük, érvényes e-mail-címet adj meg.'; renderModal(); return; }
        if (!state.codeSent) { state.codeSent = true; state.authErr = ''; renderModal(); return; }
        if (!/^\d{4,}$/.test(f.aCode.trim())) { state.authErr = 'A belépőkód legalább 4 számjegy.'; renderModal(); return; }
        finishAuth({ name: 'Minta Anna', email: f.aEmail.trim(), phone: '+36 30 123 4567' });
      }
    } else if (e.target.id === 'edit-form') {
      e.preventDefault();
      var g = state.f;
      if (!g.eName.trim()) { state.authErr = 'Kérjük, add meg a neved.'; renderDrawer(); return; }
      if (!validEmail(g.eEmail)) { state.authErr = 'Kérjük, érvényes e-mail-címet adj meg.'; renderDrawer(); return; }
      if (!validPhone(g.ePhone)) { state.authErr = 'Kérjük, érvényes telefonszámot adj meg.'; renderDrawer(); return; }
      state.user = { name: g.eName.trim(), email: g.eEmail.trim(), phone: g.ePhone.trim() };
      state.editing = false; state.authErr = ''; renderDrawer();
    } else if (e.target.id === 'ceg-form') {
      e.preventDefault();
      var c = state.ceg;
      c.name = $('cegname').value; c.size = $('cegsize').value; c.email = $('cegemail').value;
      if (c.name.trim() && validEmail(c.email)) { c.done = true; c.err = false; } else { c.err = true; }
      renderCeg();
    }
  });

  document.addEventListener('input', function (e) {
    var k = e.target.getAttribute && e.target.getAttribute('data-k');
    if (k) { state.f[k] = e.target.value; return; }
    if (e.target.id === 'q') {
      state.query = e.target.value;
      state.listLimit = PAGE_SIZE;
      renderList();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (state.modal) { state.modal = null; state.step = 'confirm'; state.authErr = ''; renderModal(); }
    else if (state.drawer) { state.drawer = false; renderDrawer(); }
  });

  /* ---------- Indítás ---------- */
  renderStatic();
  renderCards();
  renderFaq();
  renderSub();
  renderCeg();
  renderTimer();
  setInterval(renderTimer, 1000);
})();
