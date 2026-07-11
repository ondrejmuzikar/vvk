(function () {
  'use strict';

  /* ─────────────────────────────────────────────
     Formspree endpoint (delivers to vojtovyvelkeklady@gmail.com)
     Note: file attachments require a paid Formspree plan. If the
     account is on the free plan and a customer attaches photos, the
     submit gracefully retries without files and tells them to e-mail
     the photos instead; the text enquiry always gets through.
  ───────────────────────────────────────────── */
  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xjgqqoyv';

  const products = {
    1: {
      title: 'Jídelní stůl z dubu',
      meta: 'Dub · Stoly',
      desc: 'Dubová deska spárovaná z fošen a naolejovaná. Podnož podle vás, dřevěná i kovová. Rozměry sedneme na váš prostor i na počet židlí.',
      price: 'od 45 000 Kč',
      image: 'assets/images/prod-stul.jpg',
      type: 'stoly'
    },
    2: {
      title: 'Vestavěná skříň',
      meta: 'Ořech · Skříně',
      desc: 'Skříň na míru přesně na centimetr, od podlahy až ke stropu. Vnitřek uspořádáme podle toho, co do ní půjde. Tiché dovírání je samozřejmost.',
      price: 'od 80 000 Kč',
      image: 'assets/images/prod-skrin.jpg',
      type: 'skrine'
    },
    3: {
      title: 'Kuchyně na míru',
      meta: 'Dub · Kuchyně',
      desc: 'Dvířka ze dřeva, pevné korpusy a pracovní deska podle výběru. Navrhneme ji tak, aby se v ní dobře vařilo a přitom vypadala.',
      price: 'od 120 000 Kč',
      image: 'assets/images/prod-kuchyne.jpg',
      type: 'kuchyne'
    },
    4: {
      title: 'Schodiště z jasanu',
      meta: 'Jasan · Schody',
      desc: 'Stupně z jasanu, pevná konstrukce a hladké madlo. Pohlídáme, aby nevrzalo a dobře se po něm chodilo naboso.',
      price: 'od 65 000 Kč',
      image: 'assets/images/prod-schody.jpg',
      type: 'schody'
    },
    5: {
      title: 'Konferenční stolek',
      meta: 'Ořech · Stoly',
      desc: 'Menší stolek z ořechu. Poctivý kus do obýváku, který vydrží roky každodenního používání.',
      price: 'od 18 000 Kč',
      image: 'assets/images/prod-stolek.jpg',
      type: 'stoly'
    },
    6: {
      title: 'Knihovna z dubu',
      meta: 'Dub · Skříně',
      desc: 'Knihovna s policemi na míru vaší sbírce. Stavitelné police, pevná záda, rozměry přesně na váš pokoj.',
      price: 'od 35 000 Kč',
      image: 'assets/images/prod-knihovna.jpg',
      type: 'skrine'
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

  /* ── About film: reveal video only once it can play (photo stays otherwise) ── */
  const aboutVideo = document.querySelector('.about-film-media');
  if (aboutVideo) {
    const showVideo = () => aboutVideo.classList.add('is-ready');
    ['loadeddata', 'canplay', 'playing'].forEach(ev =>
      aboutVideo.addEventListener(ev, showVideo, { once: true })
    );
    if (aboutVideo.readyState >= 2) showVideo();
    // Safety net for cached videos / browsers that don't re-fire the event
    setTimeout(() => { if (aboutVideo.readyState >= 2) showVideo(); }, 800);
    aboutVideo.addEventListener('error', () => aboutVideo.remove());
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
      const img = document.getElementById('modal-image');
      img.src = product.image;
      img.alt = product.title;

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
    return fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      body: data,
      headers: { Accept: 'application/json' }
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (form._gotcha.value) return; // honeypot

    const name = form.name.value.trim();
    const contact = form.contact.value.trim();
    const type = form.type.value;
    const message = form.message.value.trim();

    if (!name || !contact || !type || !message) {
      setStatus('Vyplňte prosím jméno, kontakt, typ i popis.', 'error');
      return;
    }

    submitBtn.disabled = true;
    setStatus('Odesílám poptávku…', '');

    try {
      let response = await post(new FormData(form));

      // Retry without files if the (likely file-related) submit failed
      if (!response.ok && chosenFiles.length) {
        const noFiles = new FormData();
        ['name', 'contact', 'type', 'message'].forEach(k => noFiles.append(k, form[k] ? form[k].value : ''));
        const retry = await post(noFiles);
        if (retry.ok) {
          setStatus('Poptávku máme. Fotky se ale nepodařilo připojit, pošlete nám je prosím na e-mail. Ozveme se do dvou pracovních dnů.', 'success');
          form.reset();
          chosenFiles = [];
          renderFiles();
          return;
        }
      }

      if (response.ok) {
        setStatus('Děkujeme za poptávku. Ozveme se vám do dvou pracovních dnů.', 'success');
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
