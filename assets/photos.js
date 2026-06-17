/* ============================================================
   BoineeloMove — photography loader
   Hero slides + cards use curated Unsplash stock photography.
   Slugs map to destination names used via data-label / data-photo.
   ============================================================ */
(function(){
  "use strict";

  /* ── Stock photo map (Unsplash) ─────────────────────────────────────── */
  var DEST_PHOTOS = {
    /* hero slides */
    "cape-town":     "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1800&h=1100&fit=crop&q=85&auto=format",
    "zanzibar":      "uploads/gallery/picture-jambiani-zanzibar-spice-island-hotel-resort-44.jpg",
    "dubai":         "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1800&h=1100&fit=crop&q=85&auto=format",
    "morocco":       "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=1800&h=1100&fit=crop&q=85&auto=format",
    "maldives":      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1800&h=1100&fit=crop&q=85&auto=format",
    "bali":          "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1800&h=1100&fit=crop&q=85&auto=format",
    "namibia":       "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1800&h=1100&fit=crop&q=85&auto=format",
    "mauritius":     "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?w=1800&h=1100&fit=crop&q=85&auto=format",
    "thailand":      "https://images.unsplash.com/photo-1528181304800-259b08848526?w=1800&h=1100&fit=crop&q=85&auto=format",
    "mozambique":    "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1800&h=1100&fit=crop&q=85&auto=format",
    /* cards & sections */
    "group-trip":    "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=1200&h=1000&fit=crop&q=85&auto=format",
    "private-trip":  "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200&h=1000&fit=crop&q=85&auto=format",
    "travel-moment": "https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=1100&h=880&fit=crop&q=85&auto=format",
    "experience":    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1100&h=880&fit=crop&q=85&auto=format",
    "itinerary":     "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1100&h=880&fit=crop&q=85&auto=format",
    "community":     "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1100&h=880&fit=crop&q=85&auto=format",
    "wellness":      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1100&h=880&fit=crop&q=85&auto=format",
    /* about page */
    "hero-about":    "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1800&h=900&fit=crop&q=85&auto=format",
    "real-about":    "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=1200&h=1000&fit=crop&q=85&auto=format",
    "real-ceo":      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=900&h=1100&fit=crop&q=85&auto=format",
    /* other page heroes */
    "hero-group":    "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=1800&h=900&fit=crop&q=85&auto=format",
    "hero-private":  "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1800&h=900&fit=crop&q=85&auto=format",
    "hero-gallery":  "https://images.unsplash.com/photo-1590077428593-a55bb07c4665?w=1800&h=900&fit=crop&q=85&auto=format",
    "hero-contact":  "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1800&h=900&fit=crop&q=85&auto=format"
  };

  /* ── picsum fallback seeds ───────────────────────────────────────────── */
  var PICSUM_SEEDS = {
    "cape-town":12, "zanzibar":18, "dubai":7, "morocco":21,
    "maldives":11, "bali":5, "namibia":6, "mauritius":9,
    "thailand":3, "mozambique":14, "group-trip":27, "private-trip":13,
    "travel-moment":8, "experience":4, "itinerary":19, "community":23,
    "wellness":16, "hero-about":29, "hero-group":30,
    "hero-private":17, "hero-gallery":22, "hero-contact":25
  };

  /* ── Testimonial avatars ─────────────────────────────────────────────── */
  var AVATARS = [
    "https://randomuser.me/api/portraits/women/68.jpg",
    "https://randomuser.me/api/portraits/women/44.jpg",
    "https://randomuser.me/api/portraits/men/32.jpg",
    "https://randomuser.me/api/portraits/women/90.jpg",
    "https://randomuser.me/api/portraits/men/51.jpg",
    "https://randomuser.me/api/portraits/women/12.jpg"
  ];

  function picsumUrl(slug, w, h){
    var seed = PICSUM_SEEDS[slug] || 10;
    return "https://picsum.photos/seed/" + seed + "/" + w + "/" + h;
  }

  function resized(url, w, h){
    return url.replace(/w=1800/, "w=" + w).replace(/h=1100/, "h=" + h);
  }

  function getSlug(el){
    var s = el.getAttribute("data-photo");
    if(s) return s;
    var label = el.getAttribute("data-label");
    if(!label) return null;
    var t = label
      .replace(/[\[\]]/g,"")
      .replace(/—.*$/,"")
      .replace(/-+\s*photo/i,"")
      .replace(/photo/i,"")
      .trim().toLowerCase();
    return t.replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  }

  /* expose for site.js hero rail */
  window.BMPhoto = {
    url: function(slug, w, h){
      var u = DEST_PHOTOS[slug];
      return u ? resized(u, w || 900, h || 600) : picsumUrl(slug, w || 900, h || 600);
    }
  };

  function fillImg(frame, slug, w, h){
    var url      = DEST_PHOTOS[slug];
    var primary  = url ? resized(url, w, h) : null;
    var fallback = picsumUrl(slug, w, h);
    var img = document.createElement("img");
    img.alt = slug ? slug.replace(/-/g," ") : "BoineeloMove";
    img.loading = "lazy";
    var triedFallback = false;
    img.addEventListener("error", function(){
      if(!triedFallback && img.src !== fallback){
        triedFallback = true;
        img.src = fallback;
      } else {
        frame.classList.add("is-empty");
      }
    });
    img.addEventListener("load", function(){ frame.classList.remove("is-empty"); });
    img.src = primary || fallback;
    frame.insertBefore(img, frame.firstChild);
  }

  /* ── destination / editorial frames ─────────────────────────────────── */
  document.querySelectorAll(".frame[data-photo], .frame[data-label]").forEach(function(frame){
    if(frame.closest(".hpreview")) return;
    if(frame.hasAttribute("data-avatar")) return;
    if(frame.querySelector("img")) return;
    var slug = getSlug(frame);
    if(!slug) return;
    var w = 1100, h = 1200;
    if(frame.closest(".trip-card"))         { w = 1200; h = 900;  }
    else if(frame.closest(".tl-img"))       { w = 1100; h = 880;  }
    else if(frame.closest(".split__panel")) { w = 1200; h = 1000; }
    else if(frame.closest(".dest-card"))    { w = 1000; h = 1300; }
    else if(frame.closest(".pagehero"))     { w = 1800; h = 900;  }
    else if(frame.closest(".cta-band"))     { w = 1800; h = 900;  }
    fillImg(frame, slug, w, h);
  });

  /* ── hero slide full-bleed backgrounds ───────────────────────────────── */
  document.querySelectorAll(".hslide[data-photo]").forEach(function(slide){
    var slug = slide.getAttribute("data-photo");
    var bg   = slide.querySelector(".hslide__bg");
    if(!bg) return;
    var img  = document.createElement("img");
    img.className = "hslide__photo";
    img.alt = "";
    img.setAttribute("aria-hidden","true");
    var pos = slide.getAttribute("data-img-pos");
    if(pos) img.style.objectPosition = pos;
    var url      = DEST_PHOTOS[slug];
    var fallback = picsumUrl(slug, 1800, 1100);
    var triedFallback = false;
    img.addEventListener("error", function(){
      if(!triedFallback && img.src !== fallback){
        triedFallback = true;
        img.src = fallback;
      } else {
        img.style.display = "none";
      }
    });
    img.src = url || fallback;
    bg.appendChild(img);
  });

  /* ── avatars ─────────────────────────────────────────────────────────── */
  document.querySelectorAll("[data-avatar]").forEach(function(frame, i){
    var url = AVATARS[(parseInt(frame.getAttribute("data-avatar"),10) || i) % AVATARS.length];
    var img = document.createElement("img");
    img.alt = "Traveller";
    img.loading = "lazy";
    img.addEventListener("error", function(){ frame.classList.add("is-empty"); });
    img.addEventListener("load",  function(){ frame.classList.remove("is-empty"); });
    img.src = url;
    frame.insertBefore(img, frame.firstChild);
  });

})();
