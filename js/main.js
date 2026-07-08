(function () {
  'use strict';

  const products = {
    1: {
      title: 'Jídelní stůl z dubu',
      meta: 'Dub · Stoly',
      desc: 'Masivní jídelní stůl z jednoho kusu dubového dřeva. Tlustá deska, pevné nohy, olejová úprava. Každý stůl je unikát, kresba dřeva se nikdy neopakuje.',
      price: 'od 45 000 Kč',
      image: 'assets/images/placeholder-product.svg',
      type: 'stoly'
    },
    2: {
      title: 'Vestavěná skříň',
      meta: 'Ořech · Skříně',
      desc: 'Vestavěná skříň na míru vašeho prostoru. Ořechové dřevo, precizní spoje, vnitřní uspořádání podle vašich potřeb.',
      price: 'od 80 000 Kč',
      image: 'assets/images/placeholder-product.svg',
      type: 'skrine'
    },
    3: {
      title: 'Kuchyně na míru',
      meta: 'Dub · Kuchyně',
      desc: 'Kompletní kuchyně z masivního dubu. Spodní i horní skříňky, pracovní deska, úchytky na míru. Navrhneme podle vašeho prostoru.',
      price: 'od 120 000 Kč',
      image: 'assets/images/placeholder-product.svg',
      type: 'kuchyne'
    },
    4: {
      title: 'Schodiště z jasanu',
      meta: 'Jasan · Schody',
      desc: 'Schodiště z masivního jasanu. Pevná konstrukce, hladké stupně, povrchová úprava odolná proti opotřebení.',
      price: 'od 65 000 Kč',
      image: 'assets/images/placeholder-product.svg',
      type: 'schody'
    },
    5: {
      title: 'Konferenční stolek',
      meta: 'Ořech · Stoly',
      desc: 'Kompaktní konferenční stolek z ořechového masivu. Ideální doplněk obývacího pokoje: pevný, elegantní, trvanlivý.',
      price: 'od 18 000 Kč',
      image: 'assets/images/placeholder-product.svg',
      type: 'stoly'
    },
    6: {
      title: 'Knihovna z dubu',
      meta: 'Dub · Skříně',
      desc: 'Regálová knihovna z masivního dubu. Nastavitelné police, pevná konstrukce. Vyrábíme na míru rozměrům vaší místnosti.',
      price: 'od 35 000 Kč',
      image: 'assets/images/placeholder-product.svg',
      type: 'skrine'
    }
  };

  const filters = { category: 'all', wood: 'all' };

  document.getElementById('year').textContent = new Date().getFullYear();

  /* Mobile nav */
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');

  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('open');
  });

  document.querySelectorAll('.nav-list a').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('open');
    });
  });

  /* Scroll fade-in */
  const fadeElements = document.querySelectorAll('.fade-in');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    fadeElements.forEach(el => observer.observe(el));
  } else {
    fadeElements.forEach(el => el.classList.add('visible'));
  }

  /* Product filters */
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

  /* Product modal */
  const modal = document.getElementById('product-modal');
  const modalClose = document.getElementById('modal-close');
  const typeSelect = document.getElementById('type');

  document.querySelectorAll('[data-open-product]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.openProduct;
      const product = products[id];
      if (!product) return;

      document.getElementById('modal-title').textContent = product.title;
      document.getElementById('modal-meta').textContent = product.meta;
      document.getElementById('modal-desc').textContent = product.desc;
      document.getElementById('modal-price').textContent = product.price;
      document.getElementById('modal-image').src = product.image;
      document.getElementById('modal-image').alt = product.title;

      modal.showModal();
    });
  });

  modalClose.addEventListener('click', () => modal.close());

  modal.addEventListener('click', e => {
    if (e.target === modal) modal.close();
  });

  document.getElementById('modal-cta').addEventListener('click', () => {
    modal.close();
    if (typeSelect && products) {
      const title = document.getElementById('modal-title').textContent;
      const product = Object.values(products).find(p => p.title === title);
      if (product) typeSelect.value = product.type;
    }
  });

  /* Contact form */
  // Formspree: sign up free at https://formspree.io, create a form that
  // delivers to vojtovyvelkeklady@gmail.com, then replace YOUR_FORM_ID below
  // with the ID Formspree gives you (e.g. https://formspree.io/f/abcdwxyz).
  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';

  const form = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const name = form.name.value.trim();
    const contact = form.contact.value.trim();
    const type = form.type.value;
    const message = form.message.value.trim();

    if (!name || !contact || !type || !message) {
      formStatus.textContent = 'Vyplňte prosím všechna povinná pole.';
      formStatus.className = 'form-status error';
      return;
    }

    if (form._gotcha.value) return; // honeypot: bots only

    if (FORMSPREE_ENDPOINT.includes('YOUR_FORM_ID')) {
      formStatus.textContent = 'Formulář zatím není napojený na odeslání e-mailu. Dokončete prosím nastavení Formspree.';
      formStatus.className = 'form-status error';
      return;
    }

    submitBtn.disabled = true;
    formStatus.textContent = 'Odesíláme poptávku…';
    formStatus.className = 'form-status';

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });

      if (response.ok) {
        formStatus.textContent = 'Děkujeme za poptávku. Ozveme se vám do dvou pracovních dnů.';
        formStatus.className = 'form-status success';
        form.reset();
      } else {
        formStatus.textContent = 'Poptávku se nepodařilo odeslat. Zkuste to prosím znovu nebo nám napište přímo na e-mail.';
        formStatus.className = 'form-status error';
      }
    } catch (err) {
      formStatus.textContent = 'Poptávku se nepodařilo odeslat. Zkontrolujte připojení a zkuste to znovu.';
      formStatus.className = 'form-status error';
    } finally {
      submitBtn.disabled = false;
    }
  });

  /* Header shadow on scroll */
  const header = document.getElementById('header');
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        header.style.borderBottomColor = window.scrollY > 20
          ? 'rgba(110, 90, 68, 0.25)'
          : 'rgba(110, 90, 68, 0.15)';
        ticking = false;
      });
      ticking = true;
    }
  });
})();
