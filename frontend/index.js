function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
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
  
  // Auto-fetch all dishes for the Chef Picks page on initial load
  performChefSearch();
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

async function performChefSearch() {
  const query = document.getElementById('chef-search-input').value.trim();
  const container = document.getElementById('chef-search-results');
  
  container.innerHTML = '<p style="color:#888;">Searching...</p>';
  
  try {
    const url = query ? `http://localhost:8000/api/dishes?q=${encodeURIComponent(query)}` : 'http://localhost:8000/api/dishes';
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    
    const dishes = await response.json();
    
    if (dishes.length === 0) {
      container.innerHTML = `<p style="color:#888;">No dishes found matching "${query}".</p>`;
      return;
    }
    
    container.innerHTML = '';
    
    dishes.forEach(dish => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-img-wrap" onclick="alert('Recipe details coming soon for ${dish.name}!')">
          <img class="card-img" src="${dish.image}" alt="${dish.name}" onerror="this.style.background='#c0502a';this.removeAttribute('src')">
        </div>
        <div class="card-body">
          <div class="card-cat">${dish.category}</div>
          <div class="card-title">${dish.name}</div>
          <div class="card-meta"><span>⏱ ${dish.time}</span><span>👥 ${dish.servings} servings</span></div>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (error) {
    console.error('Failed to search API dishes:', error);
    container.innerHTML = '<p style="color:var(--rust);">⚠️ Search failed. Ensure FastAPI backend is running on port 8000.</p>';
  }
}
