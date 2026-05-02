// Recipe metadata for favourites system
const recipeData = {
  lasagna:       { title: 'The Best Homemade Lasagna',        cat: 'Italian · Pasta',       time: '1 hr 20 min', servings: 8,  img: '/assets/images/lasanga.jpeg' },
  beefstew:      { title: 'Rich & Hearty Beef Stew',          cat: 'Beef · Comfort Food',   time: '2 hr 30 min', servings: 6,  img: '/assets/images/brew.jpeg' },
  padthai:       { title: 'Authentic Pad Thai',               cat: 'Thai · Quick',          time: '20 min',      servings: 2,  img: '/assets/images/thai.jpeg' },
  butterchicken: { title: 'Creamy Butter Chicken',            cat: 'Indian · Curry',        time: '35 min',      servings: 4,  img: '/assets/images/butter.jpeg' },
  garlicbread:   { title: 'Cheesy Garlic Bread',              cat: 'Sides · Bread',         time: '15 min',      servings: 6,  img: '/assets/images/garlic.jpeg' },
  lavacake:      { title: 'Molten Chocolate Lava Cakes',      cat: 'Desserts · Chocolate',  time: '25 min',      servings: 4,  img: '/assets/images/choco.jpeg' },
  friedrice:     { title: 'Better-Than-Takeout Fried Rice',   cat: 'Asian · Rice',          time: '15 min',      servings: 3,  img: '/assets/images/fried.jpeg' },
  tacos:         { title: 'Crispy Beef Tacos',                cat: 'Mexican · Quick',       time: '25 min',      servings: 4,  img: '/assets/images/tacos.jpeg' },
  mushroompasta: { title: 'Creamy Mushroom Pasta',            cat: 'Vegetarian · Pasta',    time: '20 min',      servings: 2,  img: '/assets/images/pasta.jpeg' },
  mangoLassi:    { title: 'Mango Lassi',                      cat: 'Indian · Mocktail',     time: '5 min',       servings: 2,  img: '/assets/images/mango.jpeg' },
  masalachai:    { title: 'Masala Chai',                      cat: 'Indian · Hot Drink',    time: '10 min',      servings: 2,  img: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&q=80' },
  limonata:      { title: 'Sparkling Limonata',               cat: 'Italian · Mocktail',    time: '8 min',       servings: 4,  img: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=600&q=80' },
  matcharose:    { title: 'Matcha Rose Latte',                cat: 'Japanese · Hot/Iced',   time: '7 min',       servings: 1,  img: 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?w=600&q=80' }
};

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  // Update reading progress
  updateReadingProgress();
  // If favourites page, refresh it
  if (id === 'favourites') renderFavouritesPage();
}

function scrollToDrinks() {
  showPage('home');
  setTimeout(() => {
    const el = document.getElementById('drinks-section');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

// Search functionality
document.addEventListener('DOMContentLoaded', () => {
  // Initialize dynamic scaling for all recipes
  initDynamicRecipes();
  
  // Initialize quiz logic
  initQuiz();
  
  // Initialize smart substitutions
  initSubstitutions();
  
  // Initialize cooking timers
  initCookingTimers();
  
  // Initialize nutrition calculator
  initNutrition();

  // New features
  initDarkMode();
  initFavouriteButtons();
  initReadingProgress();
  initScrollToTop();
  initStatCounters();
  initSettings();

  const searchInput = document.getElementById('search-input');
  const viewallHeader = document.querySelector('#viewall .viewall-header h1');
  const viewallSub = document.querySelector('#viewall .viewall-header p');
  const originalHeaderText = viewallHeader ? viewallHeader.textContent : 'All Recipes';
  const originalSubText = viewallSub ? viewallSub.textContent : '';
  
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      
      // If user starts typing, show the "View All" page to display results
      if (query.length > 0) {
        showPage('viewall');
        if (viewallHeader) viewallHeader.textContent = 'Search Results';
        if (viewallSub) viewallSub.textContent = 'Showing results for "' + query + '"';
      } else {
        if (viewallHeader) viewallHeader.textContent = originalHeaderText;
        if (viewallSub) viewallSub.textContent = originalSubText;
      }
      
      // Filter all cards in the viewall-grid
      const cards = document.querySelectorAll('#viewall .card, #viewall .name-card');
      let foundAny = false;

      cards.forEach(card => {
        const titleEl = card.querySelector('.card-title, .name-card-title');
        if (titleEl) {
          const title = titleEl.textContent.toLowerCase();
          if (title.includes(query)) {
            card.style.display = 'flex';
            foundAny = true;
          } else {
            card.style.display = 'none';
          }
        }
      });

      // Handle "No results" feedback
      let noResultsMsg = document.getElementById('no-results-message');
      if (!foundAny && query.length > 0) {
        if (!noResultsMsg) {
          noResultsMsg = document.createElement('p');
          noResultsMsg.id = 'no-results-message';
          noResultsMsg.style.textAlign = 'center';
          noResultsMsg.style.padding = '40px';
          noResultsMsg.style.color = '#888';
          noResultsMsg.style.fontSize = '18px';
          noResultsMsg.textContent = 'No recipes found matching "' + query + '"';
          const grid = document.querySelector('#viewall .viewall-grid');
          if (grid) grid.after(noResultsMsg);
        } else {
          noResultsMsg.textContent = 'No recipes found matching "' + query + '"';
          noResultsMsg.style.display = 'block';
        }
      } else if (noResultsMsg) {
        noResultsMsg.style.display = 'none';
      }
    });
  }
  
});

function updateQty(btn, delta, event) {
  if (event) event.stopPropagation();
  const valEl = btn.parentElement.querySelector('.qty-val');
  let current = parseInt(valEl.textContent);
  let next = current + delta;
  if (next < 1) next = 1;
  valEl.textContent = next;
  
  // Calculate scaling factor
  const baseServings = parseInt(valEl.getAttribute('data-base-servings')) || next;
  const ratio = next / baseServings;

  // Update ingredients if present
  const recipeSection = btn.closest('.recipe-page-inner');
  if (recipeSection) {
    const ingQtyEls = recipeSection.querySelectorAll('.ing-qty');
    ingQtyEls.forEach(el => {
      const baseVal = parseFloat(el.getAttribute('data-base'));
      if (!isNaN(baseVal)) {
        let newVal = baseVal * ratio;
        // Format nicely: 1 decimal place if needed, otherwise whole number
        el.textContent = newVal % 1 === 0 ? newVal : newVal.toFixed(1);
        
        // Add visual flash
        el.classList.add('updated');
        setTimeout(() => el.classList.remove('updated'), 300);
      }
    });

    // Update time values
    const timeQtyEls = recipeSection.querySelectorAll('.time-qty');
    timeQtyEls.forEach(el => {
      const baseMins = parseInt(el.getAttribute('data-base-mins'));
      if (!isNaN(baseMins)) {
        let newMins = Math.round(baseMins * ratio);
        if (newMins >= 60) {
          const hrs = Math.floor(newMins / 60);
          const mins = newMins % 60;
          el.textContent = `${hrs} hr${hrs > 1 ? 's' : ''} ${mins > 0 ? mins + ' min' : ''}`.trim();
        } else {
          el.textContent = `${newMins} min`;
        }
        el.classList.add('updated');
        setTimeout(() => el.classList.remove('updated'), 300);
      }
    });

    // Update Nutrition values
    const nutVals = recipeSection.querySelectorAll('.nut-val');
    nutVals.forEach(el => {
      const baseVal = parseFloat(el.getAttribute('data-base'));
      if (!isNaN(baseVal)) {
        let newVal = baseVal * next;
        const unit = el.classList.contains('nut-cal') ? '' : 'g';
        el.textContent = Math.round(newVal) + unit;
        el.classList.add('updated');
        setTimeout(() => el.classList.remove('updated'), 300);
      }
    });
    const nutTitle = recipeSection.querySelector('.nutrition-title-servings');
    if (nutTitle) {
      nutTitle.textContent = `for ${next} Serving${next > 1 ? 's' : ''}`;
    }
  }

  // Visual effect
  const card = btn.closest('.card, .name-card');
  if (card && delta > 0) {
    card.style.transform = 'scale(1.02)';
    setTimeout(() => {
      card.style.transform = '';
    }, 100);
  }
}

function initDynamicRecipes() {
  const recipes = document.querySelectorAll('.recipe-page-inner');
  recipes.forEach(recipe => {
    const metaBar = recipe.querySelector('.recipe-meta-bar');
    if (!metaBar) return;

    // 1. Setup Servings & Times in Meta Bar
    const metaItems = metaBar.querySelectorAll('.meta-item');
    metaItems.forEach(item => {
      const labelEl = item.querySelector('.meta-label');
      if (!labelEl) return;
      
      const label = labelEl.textContent.trim();
      const valueEl = item.querySelector('.meta-value');
      if (!valueEl) return;
      
      if (label === 'Servings') {
        if (valueEl.querySelector('.qty-controls')) return;
        const baseVal = parseInt(valueEl.textContent) || 1;
        valueEl.innerHTML = `<span class="qty-controls">
          <button class="qty-btn" onclick="updateQty(this, -1, event)">-</button>
          <span class="qty-val" data-base-servings="${baseVal}">${baseVal}</span>
          <button class="qty-btn" onclick="updateQty(this, 1, event)">+</button>
        </span>`;
      }
      
      if (['Prep Time', 'Cook Time', 'Total Time'].includes(label)) {
        if (valueEl.querySelector('.time-qty')) return;
        const timeText = valueEl.textContent;
        let totalMins = 0;
        const hrMatch = timeText.match(/(\d+)\s*hr/);
        const minMatch = timeText.match(/(\d+)\s*min/);
        if (hrMatch) totalMins += parseInt(hrMatch[1]) * 60;
        if (minMatch) totalMins += parseInt(minMatch[1]);
        
        if (totalMins > 0) {
          valueEl.innerHTML = `<span class="time-qty" data-base-mins="${totalMins}">${timeText}</span>`;
        }
      }
    });

    // 2. Setup Ingredients Scaling (Auto-wrap numbers in <li>)
    // We only target the first <ul> found in recipe-content (usually ingredients)
    const ingredientsList = recipe.querySelector('.recipe-content ul');
    if (ingredientsList) {
      const listItems = ingredientsList.querySelectorAll('li');
      listItems.forEach(li => {
        if (li.querySelector('.ing-qty')) return;
        
        // Regex to find numbers (integers or decimals)
        // We use a lookahead/lookbehind approach or simple replace
        // This will wrap standalone numbers
        li.innerHTML = li.innerHTML.replace(/(\d+(\.\d+)?)/g, (match) => {
          // Avoid wrapping if it looks like part of a larger word or already in a tag
          return `<span class="ing-qty" data-base="${match}">${match}</span>`;
        });
      });
    }
  });

  // 3. Setup Grid Cards (Featured, Category, etc.)
  const cardMetas = document.querySelectorAll('.card-meta, .name-card-meta');
  cardMetas.forEach(meta => {
    const spans = meta.querySelectorAll('span');
    spans.forEach(span => {
      if (span.textContent.includes('👥')) {
        if (span.querySelector('.qty-controls')) return;
        const text = span.textContent.replace('👥', '').trim();
        const baseVal = parseInt(text) || 1;
        span.innerHTML = `👥 <span class="qty-controls">
          <button class="qty-btn" onclick="updateQty(this, -1, event)">-</button>
          <span class="qty-val" data-base-servings="${baseVal}">${baseVal}</span>
          <button class="qty-btn" onclick="updateQty(this, 1, event)">+</button>
        </span>`;
      }
    });
  });
}

// ── QUIZ LOGIC ──
const quizQuestions = [
  {
    question: "How much time do you have for prep & cooking?",
    options: [
      { text: "⚡ Under 30 mins (Fast & Easy)", value: "quick" },
      { text: "🥘 Around 1 hour (Classic)", value: "medium" },
      { text: "⏳ I have all day! (Slow & Low)", value: "long" }
    ]
  },
  {
    question: "What's the spice level today?",
    options: [
      { text: "🍦 Keep it cool (Mild)", value: "mild" },
      { text: "🌶 A little kick (Medium)", value: "spicy" },
      { text: "🔥 Bring the heat!", value: "hot" }
    ]
  },
  {
    question: "Which main ingredient are you in the mood for?",
    options: [
      { text: "🍗 Chicken", value: "chicken" },
      { text: "🥩 Beef", value: "beef" },
      { text: "🍝 Pasta / Vegetarian", value: "veggie" }
    ]
  },
  {
    question: "What's the vibe of the meal?",
    options: [
      { text: "🛋 Comforting & Hearty", value: "comfort" },
      { text: "✨ Light & Zesty", value: "light" },
      { text: "🌏 Authentic & Bold", value: "bold" }
    ]
  },
  {
    question: "Favorite cuisine style?",
    options: [
      { text: "🍜 Asian", value: "asian" },
      { text: "🍝 Italian / European", value: "european" },
      { text: "🌮 Mexican / American", value: "american" }
    ]
  }
];

let currentQuestionIndex = 0;
let userAnswers = [];

function initQuiz() {
  const wrapper = document.getElementById('quiz-questions-wrapper');
  if (!wrapper) return;
  renderQuestion();
}

function renderQuestion() {
  const wrapper = document.getElementById('quiz-questions-wrapper');
  const progressBar = document.getElementById('quiz-progress-bar');
  const question = quizQuestions[currentQuestionIndex];
  if (!question) return;

  progressBar.style.width = ((currentQuestionIndex) / quizQuestions.length * 100) + '%';
  
  wrapper.innerHTML = `
    <div class="quiz-question-box">
      <h3>${question.question}</h3>
      <div class="quiz-options">
        ${question.options.map((opt, i) => `
          <div class="quiz-option" onclick="handleQuizAnswer('${opt.value}')">
            ${opt.text}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function handleQuizAnswer(value) {
  userAnswers.push(value);
  currentQuestionIndex++;
  
  if (currentQuestionIndex < quizQuestions.length) {
    renderQuestion();
  } else {
    showQuizResult();
  }
}

function showQuizResult() {
  document.getElementById('quiz-container').style.display = 'none';
  document.getElementById('quiz-result').style.display = 'block';
  document.getElementById('quiz-progress-bar').style.width = '100%';
  
  const resultId = calculateRecommendation();
  const resultContainer = document.getElementById('recommended-dish-container');
  
  const sourceCard = document.querySelector(`.card[onclick*="showPage('${resultId}')"]`);
  if (sourceCard) {
    const clone = sourceCard.cloneNode(true);
    clone.style.display = 'flex';
    clone.style.width = '100%';
    // Ensure the clone works
    clone.onclick = function() { showPage(resultId); };
    resultContainer.innerHTML = '';
    resultContainer.appendChild(clone);
  } else {
    resultContainer.innerHTML = `<p style="color:var(--rust);font-weight:700;">We recommend: ${resultId.toUpperCase()}!</p>`;
  }
}

function calculateRecommendation() {
  const answers = userAnswers;
  if (answers[0] === 'quick') {
    if (answers[4] === 'asian') return 'padthai';
    if (answers[2] === 'veggie') return 'mushroompasta';
    if (answers[4] === 'american') return 'tacos';
    return 'friedrice';
  }
  if (answers[2] === 'beef') {
    if (answers[0] === 'long') return 'beefstew';
    return 'lasagna';
  }
  if (answers[4] === 'asian' && answers[2] === 'chicken') return 'butterchicken';
  return 'lasagna';
}

function restartQuiz() {
  currentQuestionIndex = 0;
  userAnswers = [];
  document.getElementById('quiz-container').style.display = 'block';
  document.getElementById('quiz-result').style.display = 'none';
  renderQuestion();
}

// ── SMART SUBSTITUTIONS ENGINE ──
const ingredientSubs = {
  "buttermilk": "Mix 1 cup milk + 1 tbsp lemon juice",
  "soy sauce": "Use Tamari or liquid aminos",
  "fish sauce": "Use soy sauce + lime juice",
  "parmesan": "Use Pecorino or nutritional yeast",
  "heavy cream": "Use milk + melted butter",
  "mozzarella": "Use mild cheddar or provolone",
  "butter": "Use oil or margarine",
  "garlic cloves": "Use 1/4 tsp garlic powder per clove",
  "onion": "Use shallots or leeks",
  "yoghurt": "Use sour cream or buttermilk",
  "lemon juice": "Use lime juice or white vinegar",
  "tamarind paste": "Use lime juice + brown sugar",
  "red wine": "Use beef stock + 1 tbsp vinegar",
  "oat milk": "Use whole milk or soy milk",
  "rose syrup": "Use 1 tsp rose water + 1 tsp sugar"
};

function initSubstitutions() {
  const recipes = document.querySelectorAll('.recipe-content');
  recipes.forEach(recipe => {
    const listItems = recipe.querySelectorAll('ul li');
    listItems.forEach(li => {
      let content = li.innerHTML;
      Object.keys(ingredientSubs).forEach(ingredient => {
        const regex = new RegExp(`(\\b${ingredient}\\b)`, 'gi');
        if (content.match(regex)) {
          // Fix: Using a function replacement to ensure the original text is preserved correctly
          content = content.replace(regex, (match) => `<span class="sub-trigger" title="💡 Suggestion: ${ingredientSubs[ingredient]}">${match}</span>`);
        }
      });
      li.innerHTML = content;
    });
  });
}

// ── COOKING TIMERS ──
function initCookingTimers() {
  const recipeContents = document.querySelectorAll('.recipe-content ol');
  recipeContents.forEach(ol => {
    const listItems = ol.querySelectorAll('li');
    listItems.forEach(li => {
      let content = li.innerHTML;
      const regex = /(\d+)\s*(min|minute|minutes|hr|hour|hours)\b/gi;
      const matches = [...content.matchAll(regex)];
      
      if (matches.length > 0) {
        let buttonsHtml = ' <span style="display:inline-block; margin-left:8px;">';
        matches.forEach(m => {
          let amount = m[1];
          let unit = m[2];
          let mins = parseInt(amount);
          if (unit.toLowerCase().startsWith('hr') || unit.toLowerCase().startsWith('hour')) {
            mins = mins * 60;
          }
          let secs = mins * 60;
          let label = matches.length > 1 ? `⏱ Start (${amount} ${unit})` : `⏱ Start Timer`;
          buttonsHtml += `<span style="white-space:nowrap; margin-right:6px;"><button class="timer-btn" onclick="toggleTimer(this, ${secs})">${label}</button><span class="timer-display" style="display:none;"></span></span>`;
        });
        buttonsHtml += '</span>';
        
        li.innerHTML = content + buttonsHtml;
      }
    });
  });
}

function toggleTimer(btn, totalSeconds) {
  const display = btn.nextElementSibling;
  
  // If timer is running, stop it
  if (btn.dataset.intervalId) {
    clearInterval(parseInt(btn.dataset.intervalId));
    delete btn.dataset.intervalId;
    btn.innerHTML = btn.dataset.originalText;
    btn.style.background = '';
    btn.style.borderColor = '';
    display.style.display = 'none';
    return;
  }

  // Start the timer
  btn.dataset.originalText = btn.innerHTML;
  btn.innerHTML = '⏹ Stop';
  // Optional styling change when active
  btn.style.background = 'var(--brown)';
  btn.style.borderColor = 'var(--text-dark)';
  
  display.style.display = 'inline-flex';
  display.classList.remove('timer-done');
  
  let remaining = totalSeconds;
  
  const updateDisplay = () => {
    const h = Math.floor(remaining / 3600);
    const m = Math.floor((remaining % 3600) / 60);
    const s = remaining % 60;
    if (h > 0) {
      display.innerHTML = `⏱ ${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    } else {
      display.innerHTML = `⏱ ${m}:${s.toString().padStart(2, '0')}`;
    }
  };
  
  updateDisplay();
  
  const interval = setInterval(() => {
    remaining--;
    if (remaining <= 0) {
      clearInterval(interval);
      delete btn.dataset.intervalId;
      btn.innerHTML = btn.dataset.originalText;
      btn.style.background = '';
      btn.style.borderColor = '';
      display.innerHTML = "🔔 Done!";
      display.classList.add('timer-done');
    } else {
      updateDisplay();
    }
  }, 1000);
  
  btn.dataset.intervalId = interval;
}

// ── NUTRITION CALCULATOR ──
const nutritionDatabase = {
  "lasagna": { cal: 650, pro: 35, carb: 55, fat: 30 },
  "beefstew": { cal: 480, pro: 42, carb: 35, fat: 20 },
  "padthai": { cal: 520, pro: 25, carb: 68, fat: 18 },
  "butterchicken": { cal: 680, pro: 38, carb: 15, fat: 45 },
  "garlicbread": { cal: 280, pro: 8, carb: 32, fat: 14 },
  "lavacake": { cal: 550, pro: 6, carb: 60, fat: 35 },
  "friedrice": { cal: 420, pro: 15, carb: 65, fat: 12 },
  "tacos": { cal: 450, pro: 28, carb: 35, fat: 22 },
  "mushroompasta": { cal: 490, pro: 18, carb: 68, fat: 15 },
  "mangolassi": { cal: 220, pro: 8, carb: 40, fat: 4 },
  "masalachai": { cal: 120, pro: 4, carb: 18, fat: 3 },
  "limonata": { cal: 80, pro: 0, carb: 20, fat: 0 },
  "matcharose": { cal: 150, pro: 6, carb: 15, fat: 5 }
};

function initNutrition() {
  const recipes = document.querySelectorAll('.recipe-page-inner');
  recipes.forEach(recipe => {
    const page = recipe.closest('.page');
    if (!page) return;
    
    const pageId = page.id;
    const data = nutritionDatabase[pageId] || { cal: 350, pro: 15, carb: 40, fat: 15 };
    
    const metaBar = recipe.querySelector('.recipe-meta-bar');
    if (metaBar) {
      // Find initial servings
      const servingsVal = recipe.querySelector('.qty-val');
      const initialServings = servingsVal ? parseInt(servingsVal.textContent) : 1;
      
      const calTotal = data.cal * initialServings;
      const proTotal = data.pro * initialServings;
      const carbTotal = data.carb * initialServings;
      const fatTotal = data.fat * initialServings;

      const nutritionBox = document.createElement('div');
      nutritionBox.className = 'nutrition-box';
      nutritionBox.innerHTML = `
        <div class="nutrition-title">Total Nutrition <span class="nutrition-title-servings" style="color:var(--rust); font-size:14px;">for ${initialServings} Serving${initialServings > 1 ? 's' : ''}</span></div>
        <div class="nutrition-grid">
          <div class="nut-item"><div class="nut-val nut-cal" data-base="${data.cal}">${calTotal}</div><div class="nut-label">Calories</div></div>
          <div class="nut-item"><div class="nut-val nut-pro" data-base="${data.pro}">${proTotal}g</div><div class="nut-label">Protein</div></div>
          <div class="nut-item"><div class="nut-val nut-carb" data-base="${data.carb}">${carbTotal}g</div><div class="nut-label">Carbs</div></div>
          <div class="nut-item"><div class="nut-val nut-fat" data-base="${data.fat}">${fatTotal}g</div><div class="nut-label">Fats</div></div>
        </div>
      `;
      metaBar.after(nutritionBox);
    }
  });
}

// ── NEWSLETTER VALIDATION ──
function subscribeNewsletter(btn) {
  const input = document.getElementById('nl-email');
  if (!input) return;
  
  const email = input.value.trim();
  
  if (email === '') {
    alert('Please enter an email address.');
    return;
  }
  
  if (!email.includes('@')) {
    alert('Please enter a valid email address containing an "@" symbol.');
    return;
  }
  
  alert('Thanks for subscribing! 🎉');
  input.value = ''; // clear the input after success
}


// ── TOAST NOTIFICATION ──
function showToast(msg, duration = 2800) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// ── DARK MODE ──
function initDarkMode() {
  const isDark = localStorage.getItem('rte-dark-mode') === 'true';
  if (isDark) {
    document.body.classList.add('dark-mode');
    const btn = document.getElementById('dark-mode-btn');
    if (btn) btn.textContent = '☀️';
  }
}

function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem('rte-dark-mode', isDark);
  const btn = document.getElementById('dark-mode-btn');
  if (btn) btn.textContent = isDark ? '☀️' : '🌙';
  showToast(isDark ? '🌙 Dark mode on' : '☀️ Light mode on', 2000);
}

// ── FAVOURITES ──
function getFavourites() {
  return JSON.parse(localStorage.getItem('rte-favourites') || '[]');
}

function saveFavourites(favs) {
  localStorage.setItem('rte-favourites', JSON.stringify(favs));
  updateFavNavCount();
}

function updateFavNavCount() {
  const favs = getFavourites();
  const countEl = document.getElementById('fav-nav-count');
  if (!countEl) return;
  if (favs.length > 0) {
    countEl.textContent = favs.length;
    countEl.style.display = 'inline';
  } else {
    countEl.style.display = 'none';
  }
}

function toggleFavourite(recipeId, btn) {
  let favs = getFavourites();
  const idx = favs.indexOf(recipeId);
  if (idx === -1) {
    favs.push(recipeId);
    if (btn) {
      btn.textContent = '❤️';
      btn.classList.add('active');
    }
    showToast('❤️ Saved to Favourites!');
  } else {
    favs.splice(idx, 1);
    if (btn) {
      btn.textContent = '🤍';
      btn.classList.remove('active');
    }
    showToast('🤍 Removed from Favourites');
  }
  saveFavourites(favs);
}

function initFavouriteButtons() {
  updateFavNavCount();
  const favs = getFavourites();
  
  // 1. Add fav + share bar to every recipe page
  document.querySelectorAll('.recipe-page-inner').forEach(inner => {
    const page = inner.closest('.page');
    if (!page) return;
    const recipeId = page.id;
    const data = recipeData[recipeId];
    if (!data) return;
    const h1 = inner.querySelector('.recipe-content h1');
    if (!h1 || h1.parentElement.querySelector('.recipe-fav-bar')) return;
    const isFav = favs.includes(recipeId);
    const bar = document.createElement('div');
    bar.className = 'recipe-fav-bar';
    bar.innerHTML = `
      <button class="fav-btn ${isFav ? 'active' : ''}" onclick="toggleFavourite('${recipeId}', this)" title="Save to favourites">${isFav ? '❤️' : '🤍'}</button>
      <button class="share-btn" onclick="shareRecipe('${recipeId}')">📤 Share Recipe</button>
    `;
    h1.after(bar);
  });

  // 2. Add floating heart to all cards in grids
  document.querySelectorAll('.card').forEach(card => {
    const imgWrap = card.querySelector('.card-img-wrap');
    if (!imgWrap || imgWrap.querySelector('.floating-fav-btn')) return;
    
    // Determine recipe ID from card's onclick showPage('...')
    const onclickStr = card.getAttribute('onclick') || '';
    const match = onclickStr.match(/showPage\('([^']+)'\)/);
    if (!match) return;
    const recipeId = match[1];
    
    const isFav = favs.includes(recipeId);
    const floatBtn = document.createElement('button');
    floatBtn.className = `floating-fav-btn ${isFav ? 'active' : ''}`;
    floatBtn.innerHTML = isFav ? '❤️' : '🤍';
    floatBtn.title = 'Add to Favourites';
    floatBtn.onclick = (e) => {
      e.stopPropagation();
      toggleFavourite(recipeId, floatBtn);
      // Update UI state
      floatBtn.innerHTML = getFavourites().includes(recipeId) ? '❤️' : '🤍';
      floatBtn.classList.toggle('active', getFavourites().includes(recipeId));
    };
    imgWrap.appendChild(floatBtn);
  });
}

function renderFavouritesPage() {
  const favs = getFavourites();
  const grid = document.getElementById('favs-grid');
  const empty = document.getElementById('favs-empty');
  const subtitle = document.getElementById('favs-subtitle');
  if (!grid) return;
  grid.innerHTML = '';
  if (favs.length === 0) {
    if (empty) empty.style.display = 'block';
    if (subtitle) subtitle.style.display = 'none';
    return;
  }
  if (empty) empty.style.display = 'none';
  if (subtitle) {
    subtitle.style.display = '';
    subtitle.textContent = `${favs.length} saved recipe${favs.length > 1 ? 's' : ''} — all in one place.`;
  }
  favs.forEach(id => {
    const d = recipeData[id];
    if (!d) return;
    const card = document.createElement('div');
    card.className = 'card';
    card.style.cursor = 'pointer';
    card.innerHTML = `
      <div class="card-img-wrap" onclick="showPage('${id}')">
        <img class="card-img" src="${d.img}" alt="${d.title}" onerror="this.style.background='#c0502a';this.removeAttribute('src')">
      </div>
      <div class="card-body">
        <div class="card-cat">${d.cat}</div>
        <div class="card-title">${d.title}</div>
        <div class="card-meta"><span>⏱ ${d.time}</span><span>👥 ${d.servings}</span></div>
        <button class="fav-btn active" onclick="event.stopPropagation();toggleFavourite('${id}', this); setTimeout(renderFavouritesPage, 50);" style="margin-top:8px;font-size:16px;">❤️ Unsave</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ── SHARE RECIPE ──
function shareRecipe(recipeId) {
  const data = recipeData[recipeId];
  const title = data ? data.title : recipeId;
  const url = `${window.location.origin}${window.location.pathname}#${recipeId}`;
  const text = `🍽️ Check out this recipe: ${title} — ${url}`;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text)
      .then(() => showToast('📋 Link copied to clipboard!'))
      .catch(() => showToast('⚠️ Could not copy link'));
  } else {
    showToast('📋 Share: ' + url, 4000);
  }
}

// ── READING PROGRESS BAR ──
function initReadingProgress() {
  window.addEventListener('scroll', updateReadingProgress, { passive: true });
}

function updateReadingProgress() {
  const bar = document.getElementById('reading-progress-bar');
  if (!bar) return;
  const activePage = document.querySelector('.page.active');
  const isRecipePage = activePage && activePage.querySelector('.recipe-page-inner');
  if (!isRecipePage) {
    bar.style.width = '0%';
    return;
  }
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  bar.style.width = Math.min(progress, 100) + '%';
}

// ── SCROLL TO TOP BUTTON ──
function initScrollToTop() {
  window.addEventListener('scroll', () => {
    const btn = document.getElementById('scroll-top-btn');
    if (!btn) return;
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });
}

// ── ANIMATED STAT COUNTERS ──
function initStatCounters() {
  const statEls = document.querySelectorAll('.stat-number');
  if (!statEls.length) return;

  const parseStatValue = (text) => {
    const cleaned = text.replace(/[^0-9.]/g, '');
    return parseFloat(cleaned) || 0;
  };

  const formatStatValue = (original, current) => {
    if (original.includes('M+')) return Math.round(current) + 'M+';
    if (original.includes('+')) return Math.round(current).toLocaleString() + '+';
    if (original.includes('.')) return current.toFixed(1);
    return Math.round(current).toLocaleString();
  };

  const animateStat = (el, target, original) => {
    const duration = 1800;
    const startTime = performance.now();
    const easeOut = t => 1 - Math.pow(1 - t, 3);
    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = target * easeOut(progress);
      el.textContent = formatStatValue(original, current);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = original;
    };
    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const originalText = el.dataset.original || el.textContent;
        el.dataset.original = originalText;
        const target = parseStatValue(originalText);
        animateStat(el, target, originalText);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statEls.forEach(el => observer.observe(el));
}

// ── SETTINGS SYSTEM ──
function initSettings() {
  // Load saved settings
  const name = localStorage.getItem('rte-user-name') || '';
  const email = localStorage.getItem('rte-user-email') || '';
  const fontSize = localStorage.getItem('rte-font-size') || 'medium';
  const units = localStorage.getItem('rte-units') || 'metric';
  const servings = localStorage.getItem('rte-default-servings') || '4';
  const newsletter = localStorage.getItem('rte-newsletter') !== 'false';
  const reminders = localStorage.getItem('rte-reminders') === 'true';

  // Populate UI
  const nameInput = document.getElementById('set-name');
  const emailInput = document.getElementById('set-email');
  const servingsInput = document.getElementById('set-servings');
  const darkModeToggle = document.getElementById('set-dark-mode');
  const nlToggle = document.getElementById('set-nl');
  const reminderToggle = document.getElementById('set-reminders');

  if (nameInput) nameInput.value = name;
  if (emailInput) emailInput.value = email;
  if (servingsInput) servingsInput.value = servings;
  if (darkModeToggle) darkModeToggle.checked = document.body.classList.contains('dark-mode');
  if (nlToggle) nlToggle.checked = newsletter;
  if (reminderToggle) reminderToggle.checked = reminders;

  // Apply font size
  updateFontSize(fontSize, false);

  // Set radio buttons
  const fontRadios = document.querySelectorAll(`input[name="font-size"][value="${fontSize}"]`);
  if (fontRadios.length) fontRadios[0].checked = true;

  const unitRadios = document.querySelectorAll(`input[name="units"][value="${units}"]`);
  if (unitRadios.length) unitRadios[0].checked = true;
}

function saveAccountSettings() {
  const name = document.getElementById('set-name').value;
  const email = document.getElementById('set-email').value;
  localStorage.setItem('rte-user-name', name);
  localStorage.setItem('rte-user-email', email);
  showToast('✅ Profile saved successfully!');
}

function updateFontSize(size, notify = true) {
  document.body.classList.remove('font-small', 'font-medium', 'font-large');
  document.body.classList.add(`font-${size}`);
  localStorage.setItem('rte-font-size', size);
  if (notify) showToast(`🔤 Font size set to ${size}`);
}

function updateUnits(unit) {
  localStorage.setItem('rte-units', unit);
  showToast(`⚖️ Units set to ${unit}`);
}

function resetSettings() {
  if (confirm('Are you sure you want to restore all settings to default?')) {
    localStorage.removeItem('rte-user-name');
    localStorage.removeItem('rte-user-email');
    localStorage.removeItem('rte-font-size');
    localStorage.removeItem('rte-units');
    localStorage.removeItem('rte-default-servings');
    localStorage.removeItem('rte-newsletter');
    localStorage.removeItem('rte-reminders');
    localStorage.removeItem('rte-dark-mode');
    
    // Reset classes and reload
    document.body.classList.remove('dark-mode', 'font-small', 'font-large');
    location.reload();
  }
}

// Sync dark mode toggle in settings if it exists
const originalToggleDarkMode = toggleDarkMode;
window.toggleDarkMode = function() {
  originalToggleDarkMode();
  const setDarkModeToggle = document.getElementById('set-dark-mode');
  if (setDarkModeToggle) {
    setDarkModeToggle.checked = document.body.classList.contains('dark-mode');
  }
};
