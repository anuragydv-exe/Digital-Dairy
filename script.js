(function () {
  var SPECIES = {
    cow: {
      name: 'Cow',
      lead: 'Heat-hardy Indian breeds and high-yield European dairy cattle.',
      blurb: 'Indigenous zebu breeds and exotic dairy cattle, from A2 milk to the highest yields.',
      breeds: [
        { n: 'Gir', o: 'Gujarat, India', t: 'Indigenous', y: [6, 12], f: [4.5, 4.7], d: 'Red to spotted coat, domed forehead and long curled ears. Tolerates heat well and is popular for A2 milk.' },
        { n: 'Sahiwal', o: 'Punjab region, India and Pakistan', t: 'Indigenous', y: [8, 16], f: [4.5, 5.0], d: 'Loose-skinned, reddish-brown and calm. Heat tolerant, tick resistant and one of the best Indian dairy breeds.' },
        { n: 'Red Sindhi', o: 'Sindh region, now Pakistan', t: 'Indigenous', y: [6, 10], f: [4.5, 5.0], d: 'Deep red, compact and hardy. Does well in hot climates and is widely used in crossbreeding.' },
        { n: 'Tharparkar', o: 'Thar desert, Rajasthan', t: 'Indigenous', y: [6, 10], f: [4.5, 4.8], d: 'White to grey coat. A dual-purpose breed suited to dry regions and low-input feeding.' },
        { n: 'Rathi', o: 'Bikaner, Rajasthan', t: 'Indigenous', y: [6, 12], f: [4.5, 5.0], d: 'Brown with white patches. Gives good milk in arid conditions and is often called the Kamdhenu of Rajasthan.' },
        { n: 'Kankrej', o: 'Gujarat and Rajasthan', t: 'Indigenous', y: [5, 8], f: [4.5, 4.8], d: 'Silver-grey with lyre-shaped horns. Dual-purpose, and the bullocks are strong draught animals.' },
        { n: 'Holstein Friesian', o: 'Friesland, Netherlands and Germany', t: 'Exotic', y: [25, 40], f: [3.4, 3.8], d: 'Black and white. The highest-yielding dairy breed in the world, and it needs good feed, shade and cooling in summer.' },
        { n: 'Jersey', o: 'Jersey island, Channel Islands', t: 'Exotic', y: [15, 25], f: [4.8, 5.5], d: 'Small, fawn-coloured and efficient. Handles warm climates better than Holstein and is common in crossbreeding.' }
      ]
    },
    buffalo: {
      name: 'Buffalo',
      lead: 'India’s main source of high-fat milk for ghee, paneer and curd.',
      blurb: 'Rich, high-fat milk and heavy-bodied animals that dominate milk production in north and west India.',
      breeds: [
        { n: 'Murrah', o: 'Haryana and Punjab, India', t: 'Indigenous', y: [8, 16], f: [7.0, 8.0], d: 'Jet black with tightly curled horns. The leading dairy buffalo of India.' },
        { n: 'Jaffarabadi', o: 'Gujarat (Gir forest, Kutch)', t: 'Indigenous', y: [8, 12], f: [8.0, 9.0], d: 'One of the heaviest buffalo breeds, with a large head and drooping horns. The milk has very high fat.' },
        { n: 'Nili-Ravi', o: 'Punjab, India and Pakistan', t: 'Indigenous', y: [8, 12], f: [6.5, 7.5], d: 'Black with white markings on the face and legs, often wall-eyed. Bred along the Sutlej and Ravi rivers.' },
        { n: 'Mehsana', o: 'Mehsana, Gujarat', t: 'Indigenous', y: [6, 10], f: [6.5, 7.5], d: 'Developed from Murrah and Surti stock. Known for regular calving and steady milk yield.' },
        { n: 'Surti', o: 'Kheda and Vadodara, Gujarat', t: 'Indigenous', y: [5, 8], f: [8.0, 10.0], d: 'Medium-sized with sickle-shaped horns. A small body with milk fat among the highest.' },
        { n: 'Bhadawari', o: 'Agra and Etawah, Uttar Pradesh', t: 'Indigenous', y: [3, 5], f: [8.0, 13.0], d: 'Copper-coloured with a pale band on the neck. Low volume but the richest fat, prized for ghee.' },
        { n: 'Nagpuri', o: 'Vidarbha, Maharashtra', t: 'Indigenous', y: [4, 6], f: [7.0, 8.0], d: 'Black with white patches and long sword-shaped horns. Hardy and suited to hot, dry regions.' }
      ]
    },
    goat: {
      name: 'Goat',
      lead: 'Compact dairy animals that suit small holdings and backyard keepers.',
      blurb: 'Smaller animals with easily digested milk, kept by small farmers and in towns.',
      breeds: [
        { n: 'Jamunapari', o: 'Etawah, Uttar Pradesh', t: 'Indigenous', y: [2, 3], f: [4.5, 5.5], d: 'Tall, with a Roman nose and long ears. Gives good milk and is also kept for meat.' },
        { n: 'Beetal', o: 'Punjab, India and Pakistan', t: 'Indigenous', y: [1.5, 2.5], f: [4.5, 5.5], d: 'Black or brown with white spots and long drooping ears. A popular dairy goat of Punjab.' },
        { n: 'Barbari', o: 'Uttar Pradesh, Haryana, Rajasthan', t: 'Indigenous', y: [1, 1.5], f: [4.5, 5.5], d: 'Small and compact, white with brown spots. Often has twins and suits small and urban keepers.' },
        { n: 'Saanen', o: 'Saanen valley, Switzerland', t: 'Exotic', y: [3, 6], f: [3.0, 3.5], d: 'Pure white with a heavy, steady milk yield. Often called the Holstein of the goat world.' },
        { n: 'Alpine', o: 'French Alps', t: 'Exotic', y: [3, 5], f: [3.3, 4.0], d: 'Hardy and found in many colours. Gives steady milk across a long lactation.' },
        { n: 'Toggenburg', o: 'Toggenburg valley, Switzerland', t: 'Exotic', y: [3, 4], f: [3.0, 3.5], d: 'Fawn to brown with white stripes on the face. One of the oldest dairy goat breeds and tolerates cold well.' },
        { n: 'Anglo-Nubian', o: 'Britain', t: 'Exotic', y: [2, 3.5], f: [4.5, 5.5], d: 'Roman nose and long floppy ears. Milk volume is lower but the fat content is higher.' }
      ]
    }
  };
  var KEYS = ['cow', 'buffalo', 'goat'];
  var managerMode = false;

  function activateCustomer(name) {
    managerMode = false;
    delete document.documentElement.dataset.mode;
    try { sessionStorage.setItem('digitalDairyCustomerName', name); } catch (e) {}
    document.getElementById('login-screen').hidden = true;
    document.getElementById('manager-login-screen').hidden = true;
    document.getElementById('site-app').hidden = false;
    document.getElementById('manager-panel').hidden = true;
    document.getElementById('customer-greeting').textContent = 'Hello, ' + name;
    document.getElementById('order-name').value = name;
    apply(parse(location.hash));
    window.scrollTo(0, 0);
  }

  function activateManager() {
    managerMode = true;
    document.documentElement.dataset.mode = 'manager';
    try { sessionStorage.removeItem('digitalDairyCustomerName'); } catch (e) {}
    document.getElementById('login-screen').hidden = true;
    document.getElementById('manager-login-screen').hidden = true;
    document.getElementById('site-app').hidden = false;
    document.getElementById('manager-panel').hidden = false;
    if (document.getElementById('manager-panel').parentElement !== viewBreeds) {
      viewBreeds.insertBefore(document.getElementById('manager-panel'), document.getElementById('cats'));
    }
    document.getElementById('customer-greeting').textContent = 'Hello, Manager';
    apply(parse(location.hash));
    window.scrollTo(0, 0);
  }

  function showManagerLogin() {
    document.getElementById('login-screen').hidden = true;
    document.getElementById('manager-login-screen').hidden = false;
    document.getElementById('manager-password').focus();
  }

  function showCustomerLogin() {
    document.getElementById('manager-login-screen').hidden = true;
    document.getElementById('login-screen').hidden = false;
    document.getElementById('customer-name').focus();
  }

  document.getElementById('login-form').addEventListener('submit', async function (event) {
    event.preventDefault();
    var form = event.currentTarget;
    var status = document.getElementById('login-status');
    var button = document.getElementById('login-submit');
    var name = form.elements.name.value.trim();
    var phone = form.elements.phone.value.trim();
    if (!name || !phone || !form.elements.consent.checked) {
      status.className = 'login-status error';
      status.textContent = 'Enter your name and phone number, then agree to the notice.';
      return;
    }
    button.disabled = true;
    button.textContent = 'Saving…';
    status.className = 'login-status';
    status.textContent = 'Saving your customer details…';
    try {
      var response = await fetch('/api/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, phone: phone, consent: true })
      });
      var text = await response.text();
      var payload = {};
      try { payload = text ? JSON.parse(text) : {}; } catch (e) {}
      if (!response.ok && !payload.error && (response.status === 404 || response.status === 405)) {
        throw new Error('This preview has no customer server. Use the Render site, or run the Node app and open http://localhost:3000.');
      }
      if (!response.ok) throw new Error(payload.error || 'Could not save your details. Please try again.');
      if (!payload.name) throw new Error('The customer service returned an unexpected response.');
      activateCustomer(payload.name);
    } catch (error) {
      status.className = 'login-status error';
      status.textContent = error.message || 'Could not connect. Please try again later.';
    } finally {
      button.disabled = false;
      button.textContent = 'Continue';
    }
  });

  document.getElementById('open-manager-login').addEventListener('click', showManagerLogin);
  document.getElementById('back-to-customer-login').addEventListener('click', showCustomerLogin);

  document.getElementById('manager-login-form').addEventListener('submit', async function (event) {
    event.preventDefault();
    var form = event.currentTarget;
    var status = document.getElementById('manager-login-status');
    var button = document.getElementById('manager-login-submit');
    button.disabled = true;
    status.className = 'login-status';
    status.textContent = 'Logging in…';
    try {
      var response = await fetch('/api/manager/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: form.elements.password.value })
      });
      var payload = await response.json().catch(function () { return {}; });
      if (!response.ok) throw new Error(payload.error || 'Could not log in.');
      form.reset();
      activateManager();
    } catch (error) {
      status.className = 'login-status error';
      status.textContent = error.message || 'Could not log in.';
    } finally {
      button.disabled = false;
    }
  });

  document.getElementById('sign-out').addEventListener('click', async function () {
    if (managerMode) {
      try { await fetch('/api/manager/logout', { method: 'POST' }); } catch (e) {}
    }
    managerMode = false;
    delete document.documentElement.dataset.mode;
    try { sessionStorage.removeItem('digitalDairyCustomerName'); } catch (e) {}
    document.getElementById('customer-greeting').textContent = '';
    document.getElementById('site-app').hidden = true;
    document.getElementById('manager-panel').hidden = true;
    document.getElementById('login-screen').hidden = false;
    document.getElementById('login-form').reset();
    document.getElementById('login-status').textContent = '';
    window.scrollTo(0, 0);
    document.getElementById('customer-name').focus();
  });

  function dash(a, b) { return a === b ? String(a) : a + '–' + b; }
  function yieldText(a) { return dash(a[0], a[1]); }
  function fatText(a) { return a[0] === a[1] ? a[0].toFixed(1) : a[0].toFixed(1) + '–' + a[1].toFixed(1); }
  function span(breeds, k, i) {
    var vals = breeds.map(function (b) { return b[k][i]; });
    return i === 0 ? Math.min.apply(null, vals) : Math.max.apply(null, vals);
  }
  function plural(n) { return n + (n === 1 ? ' breed' : ' breeds'); }

  function setInventory(data) {
    var milk = Number(data.milkLitres) || 0;
    var capacity = Number(data.milkCapacity) || Math.max(milk, 1000);
    var paneer = Number(data.paneerKg) || 0;
    var ghee = Number(data.gheeKg) || 0;
    var curd = Number(data.curdKg) || 0;
    var cows = Number(data.cows) || 0;
    var buffaloes = Number(data.buffaloes) || 0;
    var goats = Number(data.goats) || 0;
    var animals = cows + buffaloes + goats;
    document.getElementById('available-milk').textContent = milk.toLocaleString();
    document.getElementById('available-paneer').textContent = paneer.toLocaleString();
    document.getElementById('available-ghee').textContent = ghee.toLocaleString();
    document.getElementById('available-curd').textContent = curd.toLocaleString();
    document.getElementById('paneer-level').style.height = (paneer > 0 ? Math.max(12, Math.min(100, paneer)) : 0) + '%';
    document.getElementById('ghee-level').style.height = (ghee > 0 ? Math.max(12, Math.min(100, ghee)) : 0) + '%';
    document.getElementById('curd-level').style.height = (curd > 0 ? Math.max(12, Math.min(100, curd)) : 0) + '%';
    document.getElementById('order-stock-milk').textContent = milk > 0 ? milk.toLocaleString() + ' L available' : 'Currently unavailable';
    document.getElementById('order-stock-paneer').textContent = paneer > 0 ? paneer.toLocaleString() + ' kg available' : 'Currently unavailable';
    document.getElementById('order-stock-ghee').textContent = ghee > 0 ? ghee.toLocaleString() + ' kg available' : 'Currently unavailable';
    document.getElementById('order-stock-curd').textContent = curd > 0 ? curd.toLocaleString() + ' kg available' : 'Currently unavailable';
    document.getElementById('animal-count').textContent = animals.toLocaleString();
    document.getElementById('cow-count').textContent = cows.toLocaleString();
    document.getElementById('buffalo-count').textContent = buffaloes.toLocaleString();
    document.getElementById('goat-count').textContent = goats.toLocaleString();
    document.getElementById('milk-level').style.setProperty('--milk-fill', Math.min(100, (milk / capacity) * 100) + '%');
    document.getElementById('manager-milk').value = milk;
    document.getElementById('manager-paneer').value = paneer;
    document.getElementById('manager-ghee').value = ghee;
    document.getElementById('manager-curd').value = curd;
    document.getElementById('manager-capacity').value = capacity;
    document.getElementById('manager-cows').value = cows;
    document.getElementById('manager-buffaloes').value = buffaloes;
    document.getElementById('manager-goats').value = goats;
  }

  async function loadInventory() {
    var status = document.getElementById('availability-status');
    try {
      var response = await fetch('/api/inventory');
      var data = await response.json().catch(function () { return {}; });
      if (!response.ok) throw new Error(data.error || 'Could not load availability.');
      setInventory(data);
      status.textContent = 'Updated by the dairy manager.';
    } catch (error) {
      document.getElementById('available-milk').textContent = '—';
      document.getElementById('available-paneer').textContent = '—';
      document.getElementById('available-ghee').textContent = '—';
      document.getElementById('available-curd').textContent = '—';
      document.getElementById('order-stock-milk').textContent = 'Availability unavailable';
      document.getElementById('order-stock-paneer').textContent = 'Availability unavailable';
      document.getElementById('order-stock-ghee').textContent = 'Availability unavailable';
      document.getElementById('order-stock-curd').textContent = 'Availability unavailable';
      document.getElementById('animal-count').textContent = '—';
      document.getElementById('cow-count').textContent = '—';
      document.getElementById('buffalo-count').textContent = '—';
      document.getElementById('goat-count').textContent = '—';
      status.textContent = 'Availability is not available right now.';
    }
  }

  document.getElementById('inventory-form').addEventListener('submit', async function (event) {
    event.preventDefault();
    var form = event.currentTarget;
    var status = document.getElementById('inventory-status');
    var button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    status.className = 'login-status';
    status.textContent = 'Saving…';
    try {
      var response = await fetch('/api/manager/inventory', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milkLitres: Number(form.elements.milkLitres.value),
          milkCapacity: Number(form.elements.milkCapacity.value),
          paneerKg: Number(form.elements.paneerKg.value),
          gheeKg: Number(form.elements.gheeKg.value),
          curdKg: Number(form.elements.curdKg.value),
          cows: Number(form.elements.cows.value),
          buffaloes: Number(form.elements.buffaloes.value),
          goats: Number(form.elements.goats.value)
        })
      });
      var data = await response.json().catch(function () { return {}; });
      if (!response.ok) throw new Error(data.error || 'Could not save availability.');
      setInventory(data);
      document.getElementById('availability-status').textContent = 'Updated by the dairy manager.';
      status.textContent = 'Availability saved.';
    } catch (error) {
      status.className = 'login-status error';
      status.textContent = error.message || 'Could not save availability.';
    } finally {
      button.disabled = false;
    }
  });

  document.querySelectorAll('.shop-product').forEach(function (card) {
    card.addEventListener('click', function () {
      document.querySelectorAll('.shop-product').forEach(function (item) {
        var selected = item === card;
        item.classList.toggle('selected', selected);
        item.setAttribute('aria-pressed', selected ? 'true' : 'false');
        item.querySelector('.shop-add').textContent = selected ? 'Selected' : 'Add';
      });
      var product = card.getAttribute('data-product');
      document.getElementById('order-product').value = product;
      document.getElementById('order-unit').textContent = product === 'Milk' ? '(litres)' : '(kg)';
      document.getElementById('order-quantity').step = product === 'Milk' ? '0.1' : '0.1';
      document.getElementById('order-status').textContent = '';
    });
  });

  document.getElementById('order-form').addEventListener('submit', async function (event) {
    event.preventDefault();
    var form = event.currentTarget;
    var status = document.getElementById('order-status');
    var button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    status.className = 'login-status';
    status.textContent = 'Placing your order…';
    try {
      var response = await fetch('/api/orders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.elements.name.value.trim(),
          phone: form.elements.phone.value.trim(),
          product: form.elements.product.value,
          quantity: Number(form.elements.quantity.value)
        })
      });
      var data = await response.json().catch(function () { return {}; });
      if (!response.ok) throw new Error(data.error || 'Could not place your order.');
      form.elements.quantity.value = '';
      status.textContent = 'Order request sent to the dairy manager.';
    } catch (error) {
      status.className = 'login-status error';
      status.textContent = error.message || 'Could not place your order.';
    } finally {
      button.disabled = false;
    }
  });

  /* Home: ledger */
  var total = 0, rows = '';
  KEYS.forEach(function (k) {
    var s = SPECIES[k], b = s.breeds;
    total += b.length;
    rows += '<tr><td>' + s.name + '</td><td>' + b.length + '</td><td>' +
      fatText([span(b, 'f', 0), span(b, 'f', 1)]) + '</td><td>' +
      yieldText([span(b, 'y', 0), span(b, 'y', 1)]) + '</td></tr>';
  });
  document.getElementById('glance-body').innerHTML = rows;
  document.getElementById('glance-note').textContent = total + ' breeds across 3 animals. Ranges cover all breeds listed for each animal.';

  /* Home: animal cards */
  document.getElementById('species-cards').innerHTML = KEYS.map(function (k) {
    var s = SPECIES[k];
    var animalIcon = { cow: '🐄', buffalo: '🐃', goat: '🐐' }[k];
    return '<a class="sp t-' + k + '" href="#breeds-' + k + '" data-go="breeds-' + k + '">' +
      '<span class="animal-mini" role="img" aria-label="' + s.name + '">' + animalIcon + '</span>' +
      '<span class="sp-copy"><span class="count">' + plural(s.breeds.length) + '</span>' +
      '<h3>' + s.name + '</h3><span class="go">Explore breeds →</span></span></a>';
  }).join('');

  /* Breeds: accordion */
  var chevron = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
  document.getElementById('cats').innerHTML = KEYS.map(function (k) {
    var s = SPECIES[k];
    var cards = s.breeds.map(function (b) {
      return '<li class="card breed-card" tabindex="0" role="button" data-animal="' + k + '" data-breed="' + b.n + '">' +
        '<div class="card-top"><h3>' + b.n + '</h3><span class="tag ' + (b.t === 'Exotic' ? 'exo' : 'ind') + '">' + b.t + '</span></div>' +
        '<p class="origin">' + b.o + '</p>' +
        '<dl class="stats"><div><dt>Milk yield</dt><dd>' + yieldText(b.y) + '<small>L/day</small></dd></div>' +
        '<div><dt>Milk fat</dt><dd>' + fatText(b.f) + '<small>%</small></dd></div></dl>' +
        '<p class="note">' + b.d + '</p><span class="detail-link">View care &amp; breed details →</span></li>';
    }).join('');
    return '<article class="cat">' +
      '<h2><button type="button" class="cat-btn t-' + k + '" id="btn-' + k + '" data-toggle="' + k + '" aria-expanded="false" aria-controls="panel-' + k + '">' +
        '<span class="cat-text"><span class="cat-name">' + s.name + '</span><span class="cat-lead">' + s.lead + '</span></span>' +
        '<span class="cat-side"><span class="cat-count">' + plural(s.breeds.length) + '</span>' + chevron + '</span>' +
      '</button></h2>' +
      '<div class="panel" id="panel-' + k + '" role="region" aria-labelledby="btn-' + k + '" hidden>' +
        '<ul class="grid">' + cards + '</ul></div></article>';
  }).join('');


  var CARE = {
    cow: {
      icon:'🐄', title:'Cow care guide', temp:'About 10–25°C is generally comfortable; provide shade, airflow and plenty of clean water in hot weather.',
      food:'Green fodder, dry roughage (hay/straw), and a balanced concentrate mix according to body weight and milk output. Provide mineral mixture and salt.',
      avoid:'Mouldy or rotten feed, contaminated water, sudden feed changes and excessive grain. Do not feed unknown poisonous plants.',
      routine:'Offer fodder in several meals through the day. Keep clean water available all day. Dairy cows are commonly milked twice daily at regular times; adjust feed with a dairy nutritionist.',
      milk:'Breed card shows a typical daily range under good management. Yield changes with lactation stage, age, health, feed and climate.',
      risks:'Mastitis, foot-and-mouth disease (FMD), lumpy skin disease, tick-borne diseases, milk fever and digestive problems. Vaccination, deworming and testing should follow the local veterinarian’s schedule.',
      season:'Usually manages a range of seasons, but heat stress reduces feed intake and milk. Summer: shade, fans/sprinklers where appropriate and water. Winter: dry bedding and protection from cold wind.'
    },
    buffalo: {
      icon:'🐃', title:'Buffalo care guide', temp:'Around 15–25°C is often comfortable. Buffalo are more heat-sensitive because they dissipate heat less easily; provide shade, ventilation and safe cooling/wallowing facilities.',
      food:'Good-quality green fodder plus dry roughage and a balanced concentrate based on body weight and milk yield. Add mineral mixture and salt; keep clean water freely available.',
      avoid:'Mouldy feed, stagnant/dirty water, abrupt diet changes and excess concentrate. Avoid overcrowding and prolonged direct sun.',
      routine:'Split fodder across the day and keep water available at all times. Regular, calm milking—often twice daily—supports hygiene and udder health.',
      milk:'Buffalo milk is usually richer in fat than cow milk. The breed card gives a broad daily yield range; actual production varies with feed, lactation and management.',
      risks:'Mastitis, FMD, haemorrhagic septicaemia, black quarter, parasitic/tick problems and reproductive disorders. Use veterinarian-guided vaccination, parasite control and prompt treatment.',
      season:'Hot humid weather is especially challenging. Summer needs shade, airflow and safe bathing/cooling; in winter provide dry shelter and protect young or sick animals from cold.'
    },
    goat: {
      icon:'🐐', title:'Goat care guide', temp:'Many breeds do well around 10–30°C when dry and well ventilated. Avoid damp, poorly ventilated housing, extreme heat and cold drafts.',
      food:'Browse, tree leaves known to be safe, green fodder, hay and a suitable concentrate/mineral mix. Goats are browsers; offer clean roughage and clean water daily.',
      avoid:'Mouldy feed, wet/dirty bedding, sudden high-grain feeding and toxic plants. Do not let goats depend only on kitchen waste or one type of leaf.',
      routine:'Divide feed into morning and evening portions, with roughage available. Feed kids, pregnant/lactating does and adult goats according to age and condition; provide clean water at all times.',
      milk:'Milk yield is lower in volume than most dairy cows and buffaloes. The breed card gives a typical range; it depends on breed, litter size, lactation and nutrition.',
      risks:'PPR, enterotoxaemia, FMD, goat pox, pneumonia, internal parasites and contagious mastitis. Vaccination, deworming and hoof care need a local veterinary plan.',
      season:'Dry, mild weather is generally easiest. During monsoon keep the shed dry and reduce parasite exposure; in summer provide shade and water; in winter keep bedding dry.'
    }
  };
  function showBreedDetail(animalKey, breedName) {
    var animal = SPECIES[animalKey], care = CARE[animalKey];
    var breed = animal.breeds.find(function (item) { return item.n === breedName; });
    if (!breed) return;
    var detail = document.getElementById('breed-detail');
    detail.hidden = false;
    detail.innerHTML = '<div class="detail-head t-' + animalKey + '">' +
      '<div class="detail-animal" role="img" aria-label="' + animal.name + '">' + care.icon + '</div>' +
      '<div><p class="eyebrow">Breed profile</p><h2>' + breed.n + '</h2><p>' + breed.o + ' · ' + breed.t + '</p></div>' +
      '<button class="close-detail" type="button" aria-label="Close details">×</button></div>' +
      '<p class="detail-summary">' + breed.d + '</p>' +
      '<div class="detail-stats"><div><span>Milk per day</span><strong>' + yieldText(breed.y) + ' L</strong></div><div><span>Milk fat</span><strong>' + fatText(breed.f) + '%</strong></div></div>' +
      '<h3>' + care.title + '</h3><div class="care-grid">' +
      '<article><h4>🌡️ Temperature &amp; weather</h4><p>' + care.temp + '</p><p>' + care.season + '</p></article>' +
      '<article><h4>🌿 What it should eat</h4><p>' + care.food + '</p><p><b>Avoid:</b> ' + care.avoid + '</p></article>' +
      '<article><h4>🕒 Feeding &amp; milking routine</h4><p>' + care.routine + '</p></article>' +
      '<article><h4>🥛 Milk production</h4><p>' + care.milk + '</p></article>' +
      '<article class="health-card"><h4>🩺 Common diseases &amp; prevention</h4><p>' + care.risks + '</p></article></div>' +
      '<p class="care-note">Care figures are general educational guidance, not a veterinary prescription. Exact feed quantity and treatment depend on age, body weight, pregnancy, milk yield and local conditions. Consult a veterinarian for illness or a farm-specific ration.</p>';
    detail.scrollIntoView({behavior: reduced() ? 'auto' : 'smooth', block:'start'});
  }

  document.addEventListener('click', function (e) {
    var breedCard = e.target.closest('[data-breed]');
    if (breedCard) {
      showBreedDetail(breedCard.getAttribute('data-animal'), breedCard.getAttribute('data-breed'));
      return;
    }
    if (e.target.closest('.close-detail')) {
      var panel = document.getElementById('breed-detail');
      panel.hidden = true;
    }
  });
  document.addEventListener('keydown', function(e) {
    var card = e.target.closest && e.target.closest('[data-breed]');
    if (card && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      showBreedDetail(card.getAttribute('data-animal'), card.getAttribute('data-breed'));
    }
  });

  /* Routing: #home, #breeds, #breeds-cow, #breeds-buffalo, #breeds-goat */
  var viewHome = document.getElementById('view-home');
  var viewBreeds = document.getElementById('view-breeds');
  var current = null;

  function parse(h) {
    h = (h || '').replace(/^#/, '');
    if (h === 'breeds') return { page: 'breeds', cat: null };
    if (h.indexOf('breeds-') === 0 && SPECIES[h.slice(7)]) return { page: 'breeds', cat: h.slice(7) };
    return { page: 'home', cat: null };
  }
  function apply(state) {
    var changed = current !== state.page;
    viewHome.hidden = state.page !== 'home';
    viewBreeds.hidden = state.page !== 'breeds';
    var nh = document.getElementById('nav-home'), nb = document.getElementById('nav-breeds');
    if (state.page === 'home') { nh.setAttribute('aria-current', 'page'); nb.removeAttribute('aria-current'); }
    else { nb.setAttribute('aria-current', 'page'); nh.removeAttribute('aria-current'); }
    KEYS.forEach(function (k) {
      var open = state.cat === k;
      document.getElementById('btn-' + k).setAttribute('aria-expanded', open ? 'true' : 'false');
      document.getElementById('panel-' + k).hidden = !open;
    });
    current = state.page;
    return changed;
  }
  function setHash(h) { try { if (location.hash !== '#' + h) location.hash = h; } catch (e) {} }
  function reduced() { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }

  document.addEventListener('click', function (e) {
    var go = e.target.closest('[data-go]');
    if (go) {
      e.preventDefault();
      var h = go.getAttribute('data-go');
      var changed = apply(parse(h));
      setHash(h);
      if (changed) {
        window.scrollTo(0, 0);
        var t = document.getElementById(current === 'home' ? 'home-title' : 'breeds-title');
        if (t) t.focus({ preventScroll: true });
      }
      return;
    }
    var tg = e.target.closest('[data-toggle]');
    if (tg) {
      var k = tg.getAttribute('data-toggle');
      var opening = tg.getAttribute('aria-expanded') !== 'true';
      var h2 = opening ? 'breeds-' + k : 'breeds';
      apply(parse(h2));
      setHash(h2);
      if (opening) tg.scrollIntoView({ block: 'start', behavior: reduced() ? 'auto' : 'smooth' });
    }
  });
  window.addEventListener('hashchange', function () {
    if (apply(parse(location.hash))) window.scrollTo(0, 0);
  });
  async function initialiseAccess() {
    try {
      var response = await fetch('/api/manager/session');
      var data = await response.json();
      if (response.ok && data.manager) {
        activateManager();
        return;
      }
    } catch (e) {}
    var savedName = '';
    try { savedName = sessionStorage.getItem('digitalDairyCustomerName') || ''; } catch (e) {}
    if (savedName) activateCustomer(savedName);
    else {
      document.getElementById('login-screen').hidden = false;
      document.getElementById('site-app').hidden = true;
    }
  }
  loadInventory();
  initialiseAccess();
})();
