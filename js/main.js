(function () {
  'use strict';

  /* ─────────────────────────────────────────────
     FormSubmit.co endpoint (delivers to vojtovyvelkeklady@gmail.com).
     Zdarma a bez limitu. Aktivace: při první odeslané poptávce přijde
     na e-mail potvrzovací odkaz — po kliknutí už poptávky chodí rovnou.
     Přílohy (fotky/PDF) jsou v ceně; pokud by se přesto nepřipojily,
     odeslání se zopakuje bez souborů a zákazník je vyzván je poslat
     e-mailem — textová poptávka projde vždy.
     Tip proti spamu: po aktivaci lze e-mail v URL nahradit náhodným
     aliasem (https://formsubmit.co/ajax/<hash>), který FormSubmit vygeneruje.
  ───────────────────────────────────────────── */
  const FORM_EMAIL = 'vojtovyvelkeklady@gmail.com';
  const FORM_AJAX = 'https://formsubmit.co/ajax/' + FORM_EMAIL;   // doručení poptávky na e-mail (zdarma, bez limitu)

  /* ─────────────────────────────────────────────
     Cloudinary – bezplatné úložiště fotek z poptávky.
     Fotky se nahrají do cloudu a do e-mailu přijdou klikací odkazy
     (přílohy e-mailem zadarmo spolehlivě nefungují, odkaz ano).
     Vyplň po založení bezplatného účtu na cloudinary.com:
       CLOUDINARY_CLOUD  = "Cloud name" z dashboardu (Programmable Media)
       CLOUDINARY_PRESET = název UNSIGNED upload presetu (Settings → Upload)
     Dokud je prázdné, fotky se nenahrávají a zákazník je vyzván
     poslat je e-mailem; textová poptávka projde vždy.
  ───────────────────────────────────────────── */
  const CLOUDINARY_CLOUD = 'oybvoyl9';
  const CLOUDINARY_PRESET = 'vojtovyvk';

  const products = {
    1: {
      title: 'Stolek z dřevěného kotouče',
      meta: 'Masivní dřevo · Kovové nohy',
      desc: 'Kotouč masivního dřeva na černých kovových nohách. Povrch i hranu doladíme podle vás: můžete ho mít celý s kůrou, úplně bez kůry, s kůrou po obvodu a čelem vybroušeným do hladka, nebo s vypáleným motivem podle vaší představy. Výšku nohou volíme podle vás a nohy jsou zasazené přímo do dřeva, ne jen přišroubované zespodu, takže drží pevně a spoj působí čistě. Každý kotouč je originál, kresba letokruhů se nikdy neopakuje.',
      price: 'od 2 000 Kč',
      images: ['assets/images/image2.png', 'assets/images/image1.jpeg', 'assets/images/image3.png'],
      type: 'stolek'
    },
    2: {
      title: 'Vyvýšený záhon na míru',
      meta: 'Dřevo dle výběru · Rozměry na míru',
      desc: 'Vyvýšený záhon přesně na míru vašemu místu, ať už jde na terasu, na zahradu, nebo k domu. Délku i výšku uděláme podle vás. Materiál volíme podle toho, jak dlouho chcete, aby vám záhon vydržel, a od toho se odvíjí i cena a výsledná barva dřeva. Nejdostupnější provedení začíná na 1 500 Kč, je to nejméně odolná varianta, která vydrží zhruba do pěti let. Za trvanlivější dřevo, které vydrží výrazně déle, si připlatíte, a rádi vám poradíme, co se pro vaše použití vyplatí. Zevnitř je záhon vyložený drenážní fólií, která chrání dřevo před vlhkostí ze zeminy a prodlužuje jeho životnost. Rohy zpevňujeme masivními sloupky, aby záhon udržel tvar i naplněný zeminou.',
      price: 'od 1 500 Kč',
      images: ['assets/images/image6.jpeg', 'assets/images/image5.jpeg', 'assets/images/image7.jpeg', 'assets/images/image8.jpeg', 'assets/images/image9.jpeg'],
      type: 'zahon'
    }
  };

  const filters = { category: 'all', wood: 'all' };

  document.getElementById('year').textContent = new Date().getFullYear();

  /* ── Header scroll state ── */
  const header = document.getElementById('header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── Mobile nav ── */
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');

  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('open');
    document.body.classList.toggle('nav-open', !expanded);
  });

  document.querySelectorAll('.nav-list a').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('open');
      document.body.classList.remove('nav-open');
    });
  });

  /* ── Scroll reveal ── */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach(el => observer.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  /* ── Product filters ── */
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.closest('[data-filter-group]').dataset.filterGroup;
      const value = btn.dataset.filter;

      btn.closest('.filter-buttons').querySelectorAll('.filter-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      filters[group] = value;
      applyFilters();
    });
  });

  function applyFilters() {
    document.querySelectorAll('.product-card').forEach(card => {
      const matchCategory = filters.category === 'all' || card.dataset.category === filters.category;
      const matchWood = filters.wood === 'all' || card.dataset.wood === filters.wood;
      card.classList.toggle('hidden', !(matchCategory && matchWood));
    });
  }

  /* ── Product modal ── */
  const modal = document.getElementById('product-modal');
  const modalClose = document.getElementById('modal-close');
  const typeSelect = document.getElementById('type');

  const figure = document.getElementById('modal-figure');
  const mainImg = document.getElementById('modal-image');
  const thumbs = document.getElementById('modal-thumbs');
  const counter = document.getElementById('modal-counter');

  // Stav otevřené galerie: fotky produktu a pořadí té zobrazené
  let gallery = [];
  let galleryIndex = 0;
  let galleryTitle = '';

  function showImage(i) {
    if (!gallery.length) return;
    galleryIndex = (i + gallery.length) % gallery.length;   // dokola: za poslední je zase první

    mainImg.src = gallery[galleryIndex];
    mainImg.alt = gallery.length > 1
      ? galleryTitle + ' – fotka ' + (galleryIndex + 1) + ' z ' + gallery.length
      : galleryTitle;

    thumbs.querySelectorAll('.modal-thumb').forEach((el, idx) => {
      el.classList.toggle('active', idx === galleryIndex);
    });

    counter.textContent = (galleryIndex + 1) + ' / ' + gallery.length;
  }

  function openProduct(id) {
      const product = products[id];
      if (!product) return;

      document.getElementById('modal-title').textContent = product.title;
      document.getElementById('modal-meta').textContent = product.meta;
      document.getElementById('modal-desc').textContent = product.desc;
      document.getElementById('modal-price').textContent = product.price;

      gallery = product.images || (product.image ? [product.image] : []);
      galleryTitle = product.title;
      figure.classList.toggle('single', gallery.length < 2);

      // Náhledy galerie (jen pokud je víc fotek)
      thumbs.innerHTML = '';
      if (gallery.length > 1) {
        gallery.forEach((src, i) => {
          const t = document.createElement('button');
          t.type = 'button';
          t.className = 'modal-thumb';
          t.setAttribute('aria-label', 'Fotka ' + (i + 1));
          t.innerHTML = '<img src="' + src + '" alt="" loading="lazy">';
          t.addEventListener('click', () => showImage(i));
          thumbs.appendChild(t);
        });
      }

      showImage(0);
      modal.showModal();
  }

  document.getElementById('modal-prev').addEventListener('click', () => showImage(galleryIndex - 1));
  document.getElementById('modal-next').addEventListener('click', () => showImage(galleryIndex + 1));

  modal.addEventListener('keydown', (e) => {
    if (gallery.length < 2) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); showImage(galleryIndex - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); showImage(galleryIndex + 1); }
  });

  /* ── Přejetí prstem mezi fotkami (mobil) ── */
  let touchStartX = 0;
  let touchStartY = 0;
  let swiping = false;

  figure.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1 || gallery.length < 2) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    swiping = true;
  }, { passive: true });

  figure.addEventListener('touchend', (e) => {
    if (!swiping) return;
    swiping = false;

    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;

    // Jen vodorovné tahy, ať svislé posouvání stránky funguje dál
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      showImage(galleryIndex + (dx < 0 ? 1 : -1));
    }
  }, { passive: true });

  document.querySelectorAll('[data-open-product]').forEach(el => {
    el.addEventListener('click', () => openProduct(el.dataset.openProduct));
    // Klávesnice pro prvky, které nejsou nativní tlačítko (např. fotka s role="button")
    if (el.tagName !== 'BUTTON') {
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openProduct(el.dataset.openProduct);
        }
      });
    }
  });

  modalClose.addEventListener('click', () => modal.close());
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.close(); });

  document.getElementById('modal-cta').addEventListener('click', () => {
    modal.close();
    const title = document.getElementById('modal-title').textContent;
    const product = Object.values(products).find(p => p.title === title);
    if (product && typeSelect) typeSelect.value = product.type;
  });

  /* ── File upload (multiple + removable) ── */
  const fileInput = document.getElementById('attachment');
  const fileListEl = document.getElementById('file-list');
  const fileDrop = document.getElementById('file-drop');
  let chosenFiles = [];

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' kB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function syncInput() {
    const dt = new DataTransfer();
    chosenFiles.forEach(f => dt.items.add(f));
    fileInput.files = dt.files;
  }

  function renderFiles() {
    fileListEl.innerHTML = '';
    chosenFiles.forEach((file, index) => {
      const li = document.createElement('li');
      li.className = 'file-chip';

      const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      icon.setAttribute('class', 'file-chip-icon');
      icon.setAttribute('viewBox', '0 0 24 24');
      icon.setAttribute('fill', 'none');
      icon.setAttribute('stroke', 'currentColor');
      icon.setAttribute('stroke-width', '1.25');
      icon.innerHTML = '<path d="M14 3v5h5"/><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>';

      const name = document.createElement('span');
      name.className = 'file-chip-name';
      name.textContent = file.name;

      const size = document.createElement('span');
      size.className = 'file-chip-size';
      size.textContent = formatSize(file.size);

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'file-chip-remove';
      remove.setAttribute('aria-label', 'Odebrat ' + file.name);
      remove.innerHTML = '&times;';
      remove.addEventListener('click', () => {
        chosenFiles.splice(index, 1);
        syncInput();
        renderFiles();
      });

      li.append(icon, name, size, remove);
      fileListEl.appendChild(li);
    });
  }

  function addFiles(list) {
    Array.from(list).forEach(f => {
      const dup = chosenFiles.some(x => x.name === f.name && x.size === f.size);
      if (!dup) chosenFiles.push(f);
    });
    syncInput();
    renderFiles();
  }

  if (fileInput) {
    fileInput.addEventListener('change', () => addFiles(fileInput.files));

    ['dragenter', 'dragover'].forEach(ev =>
      fileDrop.addEventListener(ev, (e) => { e.preventDefault(); fileDrop.classList.add('dragover'); })
    );
    ['dragleave', 'dragend', 'drop'].forEach(ev =>
      fileDrop.addEventListener(ev, (e) => { e.preventDefault(); fileDrop.classList.remove('dragover'); })
    );
    fileDrop.addEventListener('drop', (e) => {
      if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files);
    });
  }

  /* ── Contact form ── */
  const form = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');
  const submitBtn = form.querySelector('button[type="submit"]');

  function setStatus(msg, kind) {
    formStatus.textContent = msg;
    formStatus.className = 'form-status' + (kind ? ' ' + kind : '');
  }

  async function post(data) {
    data.append('_captcha', 'false');
    data.append('_template', 'table');
    data.append('_subject', 'Nová poptávka z webu');
    return fetch(FORM_AJAX, {
      method: 'POST',
      body: data,
      headers: { Accept: 'application/json' }
    });
  }

  const cloudinaryReady = Boolean(CLOUDINARY_CLOUD && CLOUDINARY_PRESET);

  // Nahraje jeden soubor na Cloudinary a vrátí veřejný odkaz
  async function uploadToCloudinary(file) {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', CLOUDINARY_PRESET);
    const res = await fetch('https://api.cloudinary.com/v1_1/' + CLOUDINARY_CLOUD + '/auto/upload', {
      method: 'POST',
      body: fd
    });
    if (!res.ok) throw new Error('Cloudinary upload failed');
    const data = await res.json();
    return data.secure_url;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (form._honey.value) return; // honeypot

    const name = form.name.value.trim();
    const contact = form.contact.value.trim();
    const type = form.type.value;
    const message = form.message.value.trim();

    if (!name || !contact || !type || !message) {
      setStatus('Vyplňte prosím jméno, kontakt, typ i popis.', 'error');
      return;
    }

    submitBtn.disabled = true;

    // Fotky napřed nahrajeme do cloudu; do e-mailu pak přijdou odkazy
    let photoLinks = '';
    let photosFailed = false;
    if (chosenFiles.length && cloudinaryReady) {
      setStatus('Nahrávám fotky…', '');
      try {
        const urls = [];
        for (const f of chosenFiles) urls.push(await uploadToCloudinary(f));
        photoLinks = urls.join('\n');
      } catch (err) {
        photosFailed = true;
      }
    } else if (chosenFiles.length) {
      photosFailed = true; // Cloudinary zatím nenastaven
    }

    setStatus('Odesílám poptávku…', '');

    try {
      const data = new FormData();
      data.append('name', name);
      data.append('contact', contact);
      data.append('type', type);
      data.append('message', message);
      if (photoLinks) data.append('Fotky', photoLinks);

      const response = await post(data);

      if (response.ok) {
        const msg = photosFailed
          ? 'Poptávku máme. Fotky se ale nepodařilo nahrát – pošlete nám je prosím na e-mail. Ozveme se do dvou pracovních dnů.'
          : 'Děkujeme za poptávku. Ozveme se vám do dvou pracovních dnů.';
        setStatus(msg, 'success');
        form.reset();
        chosenFiles = [];
        renderFiles();
      } else {
        setStatus('Poptávku se nepodařilo odeslat. Zkuste to prosím znovu, nebo nám napište přímo na e-mail.', 'error');
      }
    } catch (err) {
      setStatus('Poptávku se nepodařilo odeslat. Zkontrolujte připojení a zkuste to znovu.', 'error');
    } finally {
      submitBtn.disabled = false;
    }
  });
})();
