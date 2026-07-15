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
      desc: 'Kotouč masivního dřeva na černých kovových nohách. Povrch i hranu doladíme podle vás: můžete ho mít celý s kůrou, úplně bez kůry, nebo s kůrou po obvodu a čelem vybroušeným do hladka, jako na fotkách. Do čela vypálíme motiv podle vaší představy, na fotkách jsou dvě postavičky se srdcem. Každý kotouč je originál, kresba letokruhů se nikdy neopakuje.',
      price: 'od 2 000 Kč',
      images: ['assets/images/image2.png', 'assets/images/image1.jpeg', 'assets/images/image3.png'],
      type: 'stolek'
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

  document.querySelectorAll('[data-open-product]').forEach(btn => {
    btn.addEventListener('click', () => {
      const product = products[btn.dataset.openProduct];
      if (!product) return;

      document.getElementById('modal-title').textContent = product.title;
      document.getElementById('modal-meta').textContent = product.meta;
      document.getElementById('modal-desc').textContent = product.desc;
      document.getElementById('modal-price').textContent = product.price;

      const mainImg = document.getElementById('modal-image');
      const images = product.images || (product.image ? [product.image] : []);
      const setMain = (src) => { mainImg.src = src; mainImg.alt = product.title; };
      if (images.length) setMain(images[0]);

      // Náhledy galerie (jen pokud je víc fotek)
      const thumbs = document.getElementById('modal-thumbs');
      thumbs.innerHTML = '';
      if (images.length > 1) {
        images.forEach((src, i) => {
          const t = document.createElement('button');
          t.type = 'button';
          t.className = 'modal-thumb' + (i === 0 ? ' active' : '');
          t.innerHTML = '<img src="' + src + '" alt="" loading="lazy">';
          t.addEventListener('click', () => {
            setMain(src);
            thumbs.querySelectorAll('.modal-thumb').forEach(el => el.classList.remove('active'));
            t.classList.add('active');
          });
          thumbs.appendChild(t);
        });
      }

      modal.showModal();
    });
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
