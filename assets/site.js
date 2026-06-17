/* ============================================================
   BoineeloMove — shared interactions
   ============================================================ */
(function(){
  "use strict";

  /* ---- sticky nav style on scroll ---- */
  var nav = document.querySelector('.nav');
  function onScroll(){
    if(!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  /* ---- mobile drawer ---- */
  var burger = document.querySelector('.nav__burger');
  var drawer = document.querySelector('.drawer');
  if(burger && drawer){
    burger.addEventListener('click', function(){ drawer.classList.add('open'); });
    drawer.querySelector('.drawer__close').addEventListener('click', function(){ drawer.classList.remove('open'); });
    drawer.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ drawer.classList.remove('open'); }); });
  }

  /* ---- image fallback -> labelled placeholder ---- */
  document.querySelectorAll('.frame img').forEach(function(img){
    img.addEventListener('error', function(){
      img.closest('.frame').classList.add('is-empty');
    });
    if(img.complete && img.naturalWidth === 0){
      img.closest('.frame').classList.add('is-empty');
    }
  });

  /* ---- scroll reveal (scroll-based + failsafe; robust without IO) ---- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  function checkReveals(){
    var vh = window.innerHeight || document.documentElement.clientHeight;
    for(var i=revealEls.length-1; i>=0; i--){
      var el = revealEls[i];
      var r = el.getBoundingClientRect();
      if(r.top < vh*0.92 && r.bottom > 0){
        el.classList.add('in');
        revealEls.splice(i,1);
      }
    }
  }
  window.addEventListener('scroll', checkReveals, {passive:true});
  window.addEventListener('resize', checkReveals);
  checkReveals();
  setTimeout(checkReveals, 250);
  // ultimate failsafe: if anything is still hidden after 2s, reveal it all
  setTimeout(function(){
    document.querySelectorAll('.reveal:not(.in)').forEach(function(el){ el.classList.add('in'); });
  }, 2000);

  /* ---- FAQ accordion ---- */
  document.querySelectorAll('.faq-item').forEach(function(item){
    var q = item.querySelector('.faq-q');
    var a = item.querySelector('.faq-a');
    if(!q || !a) return;
    q.addEventListener('click', function(){
      var open = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function(o){
        o.classList.remove('open'); o.querySelector('.faq-a').style.maxHeight = null;
      });
      if(!open){ item.classList.add('open'); a.style.maxHeight = a.scrollHeight + 'px'; }
    });
  });

  /* ---- filter tabs (destinations / trips) ---- */
  document.querySelectorAll('[data-filter-group]').forEach(function(group){
    var tabs = group.querySelectorAll('.tab');
    var targetSel = group.getAttribute('data-filter-target');
    var items = document.querySelectorAll(targetSel + ' [data-cat]');
    tabs.forEach(function(tab){
      tab.addEventListener('click', function(){
        tabs.forEach(function(t){ t.classList.remove('active'); });
        tab.classList.add('active');
        var f = tab.getAttribute('data-filter');
        items.forEach(function(it){
          var cats = (it.getAttribute('data-cat')||'').split(' ');
          var show = (f === 'all') || cats.indexOf(f) !== -1;
          it.style.display = show ? '' : 'none';
          if(show){ it.classList.remove('in'); requestAnimationFrame(function(){ it.classList.add('in'); }); }
        });
      });
    });
  });

  /* ---- YouTube carousel ---- */
  (function(){
    var stage = document.querySelector('.yt-stage');
    if(!stage) return;
    var vids = ['mLLG1hsMzaM','itjSJXtmbTI','DcvmuyB1wY0'];
    var active = 0;
    var cards = stage.querySelectorAll('.yt-card');
    function getPos(i){ var d=((i-active)%3+3)%3; return d===0?'center':d===1?'right':'left'; }
    function render(){
      cards.forEach(function(c,i){
        var p=getPos(i);
        c.dataset.pos=p;
        if(p==='center'){
          if(!c.querySelector('iframe')){
            c.innerHTML='<iframe src="https://www.youtube.com/embed/'+vids[i]+'?rel=0" title="BoineeloMove video" frameborder="0" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen></iframe>';
          }
        } else {
          c.innerHTML='<img src="https://img.youtube.com/vi/'+vids[i]+'/mqdefault.jpg" alt="BoineeloMove travel video" />';
        }
      });
    }
    render();
    stage.querySelector('.yt-prev').addEventListener('click',function(e){ e.stopPropagation(); active=(active-1+3)%3; render(); });
    stage.querySelector('.yt-next').addEventListener('click',function(e){ e.stopPropagation(); active=(active+1)%3; render(); });
    cards.forEach(function(c,i){ c.addEventListener('click',function(){ if(c.dataset.pos!=='center'){ active=i; render(); } }); });
  })();

  /* ---- group trips search ---- */
  var gtSearch = document.getElementById('gt-search');
  if(gtSearch){
    var _gtItems = document.querySelectorAll('#gt-grid [data-cat]');
    var _gtTabGroup = document.querySelector('[data-filter-target="#gt-grid"]');
    function _applyGt(){
      var q = gtSearch.value.toLowerCase().trim();
      var activeTab = _gtTabGroup ? _gtTabGroup.querySelector('.tab.active') : null;
      var f = activeTab ? activeTab.getAttribute('data-filter') : 'all';
      _gtItems.forEach(function(it){
        var cats = (it.getAttribute('data-cat')||'').split(' ');
        var tabOk = (f==='all') || cats.indexOf(f)!==-1;
        var searchOk = !q || (it.textContent||'').toLowerCase().indexOf(q)!==-1;
        it.style.display = (tabOk && searchOk) ? '' : 'none';
      });
    }
    gtSearch.addEventListener('input', _applyGt);
    if(_gtTabGroup){
      _gtTabGroup.querySelectorAll('.tab').forEach(function(tab){
        tab.addEventListener('click', _applyGt);
      });
    }
  }

  /* ---- HERO slideshow (Foxico style) ---- */
  var hero = document.querySelector('[data-hero]');
  if(hero){
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hslide'));
    var cards  = Array.prototype.slice.call(hero.querySelectorAll('.hpreview'));
    var dots   = Array.prototype.slice.call(hero.querySelectorAll('.hdot'));
    var idx = 0, timer = null, DUR = 5600;

    function show(n){
      n = (n + slides.length) % slides.length;
      slides.forEach(function(s,i){ s.classList.toggle('active', i===n); });
      dots.forEach(function(d,i){ d.classList.toggle('active', i===n); });
      // preview cards = next destinations in order
      cards.forEach(function(c,i){
        var srcIdx = (n + i + 1) % slides.length;
        c.dataset.refresh = srcIdx;
        var s = slides[srcIdx];
        c.querySelector('.hpreview__name').textContent = s.dataset.name;
        c.querySelector('.hpreview__tag').textContent  = s.dataset.region;
        var f = c.querySelector('.frame');
        f.setAttribute('data-label', '[ ' + s.dataset.name.toUpperCase() + ' — PHOTO ]');
        var url = (window.BMPhoto && s.dataset.photo) ? window.BMPhoto.url(s.dataset.photo, 500, 320) : null;
        if(url){ f.classList.remove('is-empty'); f.style.backgroundImage = 'url("' + url + '")'; f.style.backgroundSize = 'cover'; f.style.backgroundPosition = 'center'; }
        c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop');
      });
      idx = n;
    }
    function next(){ show(idx+1); }
    function start(){ stop(); timer = setInterval(next, DUR); }
    function stop(){ if(timer) clearInterval(timer); }

    dots.forEach(function(d,i){ d.addEventListener('click', function(){ show(i); start(); }); });
    cards.forEach(function(c){ c.addEventListener('click', function(){ if(c.dataset.refresh) { show(parseInt(c.dataset.refresh,10)); start(); } }); });
    var nextBtn = hero.querySelector('[data-hnext]');
    var prevBtn = hero.querySelector('[data-hprev]');
    if(nextBtn) nextBtn.addEventListener('click', function(){ next(); start(); });
    if(prevBtn) prevBtn.addEventListener('click', function(){ show(idx-1); start(); });

    show(0); start();
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
  }

  /* ---- footer year ---- */
  var yr = document.querySelector('[data-year]');
  if(yr) yr.textContent = new Date().getFullYear();

  /* ---- stat counters ---- */
  (function(){
    var statNums = Array.prototype.slice.call(document.querySelectorAll('.stat-num'));
    if(!statNums.length) return;
    var done = false;
    // store targets
    statNums.forEach(function(el){
      var raw = el.textContent.replace(/[^0-9]/g,'');
      el.dataset.target = raw;
    });
    function easeOut(t){ return 1 - Math.pow(1-t, 3); }
    function runCounters(){
      if(done) return;
      var row = document.querySelector('.stats-row');
      if(!row) return;
      var r = row.getBoundingClientRect();
      if(r.top > window.innerHeight * 0.9) return;
      done = true;
      var dur = 1600, start = null;
      function tick(ts){
        if(!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var ep = easeOut(p);
        statNums.forEach(function(el){
          var target = parseInt(el.dataset.target, 10) || 0;
          var cur = Math.round(ep * target);
          var plus = el.querySelector('.stat-plus');
          el.textContent = cur;
          if(plus) el.appendChild(plus);
        });
        if(p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
    window.addEventListener('scroll', runCounters, {passive:true});
    runCounters();
  })();

  /* ---- hero parallax ---- */
  (function(){
    var hero = document.querySelector('.hero');
    if(!hero) return;
    function onParallax(){
      var y = window.scrollY;
      var photos = hero.querySelectorAll('.hslide__photo');
      photos.forEach(function(img){
        img.style.transform = 'translateY(' + (y * 0.18) + 'px)';
      });
    }
    window.addEventListener('scroll', onParallax, {passive:true});
  })();

  /* ---- pagehero parallax (inner pages) ---- */
  (function(){
    var bg = document.querySelector('.pagehero__bg');
    if(!bg) return;
    function onParallax(){
      bg.style.transform = 'translateY(' + (window.scrollY * 0.15) + 'px)';
    }
    window.addEventListener('scroll', onParallax, {passive:true});
    onParallax();
  })();

  /* ---- generic [data-count] counters ---- */
  (function(){
    var counters = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));
    if(!counters.length) return;
    function easeOut(t){ return 1 - Math.pow(1-t, 3); }
    var triggered = [];
    function run(){
      var vh = window.innerHeight || document.documentElement.clientHeight;
      counters.forEach(function(el, i){
        if(triggered[i]) return;
        var r = el.getBoundingClientRect();
        if(r.top > vh * 0.9 || r.bottom < 0) return;
        triggered[i] = true;
        var target = parseInt(el.getAttribute('data-count'), 10) || 0;
        var suffix = el.getAttribute('data-suffix') || '';
        var dur = 2000, start = null;
        function tick(ts){
          if(!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          el.textContent = Math.round(easeOut(p) * target) + suffix;
          if(p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }
    window.addEventListener('scroll', run, {passive:true});
    run();
  })();

  /* ---- gallery lightbox ---- */
  var lbItems = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox]'));
  if(lbItems.length){
    var lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.innerHTML = '<button class="lightbox__close" aria-label="Close">✕</button>' +
                   '<button class="lightbox__nav prev" aria-label="Previous">←</button>' +
                   '<img alt="Gallery image" />' +
                   '<button class="lightbox__nav next" aria-label="Next">→</button>';
    document.body.appendChild(lb);
    var lbImg = lb.querySelector('img'), cur = 0;
    function srcOf(i){ var im = lbItems[i].querySelector('img'); return im ? im.src : null; }
    function open(i){ cur = (i + lbItems.length) % lbItems.length; var s = srcOf(cur); if(s){ lbImg.src = s; lb.classList.add('open'); } }
    function close(){ lb.classList.remove('open'); }
    lbItems.forEach(function(it,i){ it.addEventListener('click', function(e){ e.preventDefault(); open(i); }); });
    lb.querySelector('.lightbox__close').addEventListener('click', close);
    lb.querySelector('.prev').addEventListener('click', function(){ open(cur-1); });
    lb.querySelector('.next').addEventListener('click', function(){ open(cur+1); });
    lb.addEventListener('click', function(e){ if(e.target === lb) close(); });
    document.addEventListener('keydown', function(e){
      if(!lb.classList.contains('open')) return;
      if(e.key === 'Escape') close();
      if(e.key === 'ArrowLeft') open(cur-1);
      if(e.key === 'ArrowRight') open(cur+1);
    });
  }

  /* ---- contact form -> WhatsApp ---- */
  var cform = document.querySelector('[data-enquiry]');
  if(cform){
    cform.addEventListener('submit', function(e){
      e.preventDefault();
      var data = new FormData(cform);
      var name     = (data.get('name')||'').toString().trim();
      var email    = (data.get('email')||'').toString().trim();
      var phone    = (data.get('phone')||'').toString().trim();
      var tripType = (data.get('tripType')||'').toString().trim();
      var dest     = (data.get('destination')||'').toString().trim();
      var when     = (data.get('when')||'').toString().trim();
      var message  = (data.get('message')||'').toString().trim();
      var lines = ['Hi BoineeloMove! I would like to enquire about a trip. Here are my details:',''];
      if(name)     lines.push('Name: ' + name);
      if(email)    lines.push('Email: ' + email);
      if(phone)    lines.push('Phone: ' + phone);
      if(tripType) lines.push('Trip type: ' + tripType);
      if(dest)     lines.push('Destination: ' + dest);
      if(when)     lines.push('When: ' + when);
      if(message)  lines.push('', 'About my trip:', message);
      var waUrl = 'https://wa.me/27645198120?text=' + encodeURIComponent(lines.join('\n'));
      var wrap = cform.parentElement;
      var ok = document.createElement('div');
      ok.className = 'form-success reveal in';
      ok.innerHTML = '<h3 class="serif" style="font-size:30px;">Thank you, ' + (name.split(' ')[0]||'there') + '!</h3>' +
        '<p style="margin:0 0 18px;">Your details are ready' + (dest ? ' about <strong>' + dest + '</strong>' : '') +
        '. Click below to send your enquiry via WhatsApp.</p>' +
        '<a href="' + waUrl + '" target="_blank" rel="noopener" class="btn btn-gold">Send via WhatsApp <span class="arrow">→</span></a>';
      cform.style.display = 'none';
      wrap.appendChild(ok);
      window.open(waUrl, '_blank');
    });
  }
})();

/* ---- DESTINATION SEARCH ---- */
(function(){
  "use strict";

  var TRIPS = [
    { name:'Namibia Desert Escape',         loc:'Namibia · Africa',              price:'From R19,800', type:'group',   page:'group-trips.html',   tags:'namibia africa desert dunes quad camel sandwich atlantic' },
    { name:'Cape Town Ladies Escape',        loc:'Cape Town · South Africa',       price:'From R15,500', type:'group',   page:'group-trips.html',   tags:'cape town south africa table mountain wine sunset cruise quad' },
    { name:'Knysna Villa Retreat',           loc:'Knysna · Garden Route, SA',      price:'From R22,500', type:'group',   page:'group-trips.html',   tags:'knysna garden route south africa villa yacht elephant zipline' },
    { name:'Mauritius Island All-Inclusive', loc:'Mauritius · East Africa',        price:'From R48,400', type:'group',   page:'group-trips.html',   tags:'mauritius island beach all inclusive snorkelling kayak watersport' },
    { name:'Greece Island Escape',           loc:'Greece · Europe',                price:'From R58,200', type:'group',   page:'group-trips.html',   tags:'greece santorini mykonos athens europe island catamaran ferry sunset' },
    { name:'Switzerland Summer Circuit',     loc:'Switzerland · Europe',           price:'From R69,500', type:'group',   page:'group-trips.html',   tags:'switzerland zurich lucerne zermatt alps jungfrau europe chocolate milan' },
    { name:'Italian Grand Tour',             loc:'Rome · Florence · Milan, Italy', price:'From R59,800', type:'group',   page:'group-trips.html',   tags:'italy rome florence milan amalfi positano como lake europe colosseum' },
    { name:'Paris & Barcelona Explorer',     loc:'Paris & Barcelona · Europe',     price:'From R53,500', type:'group',   page:'group-trips.html',   tags:'paris france barcelona spain europe eiffel seine gaudi architecture' },
    { name:'Dubai City & Desert',            loc:'Dubai · UAE',                    price:'From R37,600', type:'group',   page:'group-trips.html',   tags:'dubai uae desert safari yacht city miracle garden burj khalifa' },
    { name:'Dubai & Thailand Dual Escape',   loc:'Dubai & Thailand',               price:'From R44,250', type:'group',   page:'group-trips.html',   tags:'dubai thailand phuket phi phi islands uae asia beach' },
    { name:'Bali Island Adventure',          loc:'Bali · Indonesia',               price:'From R37,500', type:'group',   page:'group-trips.html',   tags:'bali indonesia asia island ubud nusa penida swing nest' },
    { name:'Bali & Singapore Duo',           loc:'Bali & Singapore',               price:'From R45,500', type:'group',   page:'group-trips.html',   tags:'bali singapore indonesia asia gardens by the bay marina' },
    { name:'Maldives Escape',                loc:'Maldives · South Asia',          price:'From R56,000', type:'group',   page:'group-trips.html',   tags:'maldives island beach overwater villa paradise all inclusive south asia' },
    { name:'Maldives & Dubai New Year',      loc:'Maldives & Dubai',               price:'From R64,500', type:'group',   page:'group-trips.html',   tags:'maldives dubai new year island uae yacht celebration' },
    { name:'Zanzibar Private Escape',        loc:'Zanzibar · Tanzania',            price:'On enquiry',   type:'private', page:'private-trips.html', tags:'zanzibar tanzania africa island beach honeymoon private bespoke' },
    { name:'Sabi Sand Private Safari',       loc:'Sabi Sand · South Africa',       price:'On enquiry',   type:'private', page:'private-trips.html', tags:'sabi sand safari south africa wildlife big five game reserve private' },
    { name:'Cape & Winelands Retreat',       loc:'Cape Town · South Africa',       price:'On enquiry',   type:'private', page:'private-trips.html', tags:'cape town winelands south africa private couples romantic' },
    { name:'Custom Private Journey',         loc:'Any destination worldwide',       price:'On enquiry',   type:'private', page:'private-trips.html', tags:'custom private bespoke tailored worldwide honeymoon family couples anniversary milestone' },
  ];

  var CHIPS = ['Cape Town','Dubai','Bali','Greece','Maldives','Italy','Zanzibar'];

  var overlay = document.createElement('div');
  overlay.id = 'search-overlay';
  overlay.className = 'search-overlay';
  overlay.setAttribute('aria-hidden','true');
  overlay.setAttribute('role','dialog');
  overlay.setAttribute('aria-label','Search destinations');
  overlay.innerHTML =
    '<button class="search-overlay__close" id="search-close" aria-label="Close search">&#x2715;</button>'+
    '<div class="search-box">'+
      '<svg class="search-box__ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>'+
      '<input type="search" id="search-input" placeholder="Search destinations — Bali, Greece, Cape Town…" autocomplete="off" spellcheck="false" />'+
    '</div>'+
    '<div class="search-results" id="search-results"></div>'+
    '<div class="search-hint" id="search-hint">'+
      '<span class="search-hint__label">Popular destinations</span>'+
      '<div class="search-chips">'+
        CHIPS.map(function(c){ return '<button class="search-chip">'+c+'</button>'; }).join('')+
      '</div>'+
    '</div>';
  document.body.appendChild(overlay);

  var input   = document.getElementById('search-input');
  var results = document.getElementById('search-results');
  var hint    = document.getElementById('search-hint');

  function openSearch(){
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
    setTimeout(function(){ if(input) input.focus(); }, 180);
  }
  function closeSearch(){
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
    if(input){ input.value = ''; }
    if(results){ results.innerHTML = ''; }
    if(hint){ hint.style.display = ''; }
  }

  var openBtn = document.getElementById('nav-search-btn');
  if(openBtn) openBtn.addEventListener('click', openSearch);
  document.getElementById('search-close').addEventListener('click', closeSearch);
  overlay.addEventListener('click', function(e){ if(e.target === overlay) closeSearch(); });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && overlay.classList.contains('open')) closeSearch();
  });

  overlay.querySelectorAll('.search-chip').forEach(function(chip){
    chip.addEventListener('click', function(){
      if(input){ input.value = chip.textContent; }
      doSearch(chip.textContent);
      if(input) input.focus();
    });
  });

  function hl(text, q){
    if(!q) return text;
    var re = new RegExp('('+q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi');
    return text.replace(re,'<mark style="background:rgba(184,145,42,.35);color:inherit;border-radius:2px;padding:0 1px;">$1</mark>');
  }

  function doSearch(q){
    q = (q || '').trim();
    if(!q){ results.innerHTML = ''; hint.style.display = ''; return; }
    hint.style.display = 'none';
    var ql = q.toLowerCase();
    var hits = TRIPS.filter(function(t){
      return (t.name+' '+t.loc+' '+t.tags).toLowerCase().indexOf(ql) !== -1;
    });
    if(!hits.length){
      results.innerHTML = '<div class="search-empty">No trips found for "'+q+'".<br>Try another destination or <a href="contact.html">enquire directly →</a></div>';
      return;
    }
    results.innerHTML = hits.map(function(t){
      var bc = 'search-result__badge'+(t.type === 'private' ? ' private' : '');
      var bl = t.type === 'group' ? 'Group Trip' : 'Private Trip';
      return '<a href="'+t.page+'" class="search-result">'+
        '<span class="'+bc+'">'+bl+'</span>'+
        '<div class="search-result__body">'+
          '<div class="search-result__name">'+hl(t.name,q)+'</div>'+
          '<div class="search-result__loc">'+hl(t.loc,q)+'</div>'+
        '</div>'+
        '<div class="search-result__price">'+t.price+'</div>'+
        '<span class="search-result__arrow">→</span>'+
      '</a>';
    }).join('');
    results.querySelectorAll('.search-result').forEach(function(r){
      r.addEventListener('click', closeSearch);
    });
  }

  if(input) input.addEventListener('input', function(){ doSearch(this.value); });
})();
