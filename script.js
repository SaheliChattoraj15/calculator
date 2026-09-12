/**
 * AURA CALC - End-to-End Enterprise Web Suite
 * Programmatically constructs full 1280px web portal layout & powers 5 distinct calculation engines.
 * DESIGNED AND DEVELOPED BY Saheli Chattoraj
 */

class AuraPlatform {
  constructor() {
    this.currentMode = 'sci';
    this.angleMode = 'DEG';
    this.soundEnabled = localStorage.getItem('aura_sound') !== 'false';
    this.theme = localStorage.getItem('aura_theme') || 'dark';
    
    this.calcInput = '0';
    this.calcExpression = '';
    this.shouldResetInput = false;
    this.history = JSON.parse(localStorage.getItem('aura_history') || '[]');
    
    this.audioCtx = null;
    
    this.initUI();
    this.bindEvents();
    this.setTheme(this.theme);
  }

  initUI() {
    // 1. Sticky Navigation Header across screen width
    document.body.appendChild(this.createStickyHeader());

    const wrapper = document.createElement('div');
    wrapper.className = 'aura-app-wrapper';

    // 2. Full-Width Hero Section
    wrapper.appendChild(this.createHeroSection());

    // 3. 2-Column End-to-End Workspace Layout
    const workspaceLayout = document.createElement('div');
    workspaceLayout.className = 'end-to-end-workspace';

    // Left Column: Calculator Engines
    const leftCol = document.createElement('div');
    leftCol.className = 'main-calc-column';
    leftCol.appendChild(this.createModeTabs());

    const workspaceCard = document.createElement('main');
    workspaceCard.className = 'workspace-card';
    workspaceCard.appendChild(this.createSciView());
    workspaceCard.appendChild(this.createFinView());
    workspaceCard.appendChild(this.createUnitView());
    workspaceCard.appendChild(this.createHealthView());
    workspaceCard.appendChild(this.createProgView());
    leftCol.appendChild(workspaceCard);

    // Right Column: Live History Drawer & Memory Sidebar Widget
    const rightCol = document.createElement('aside');
    rightCol.className = 'sidebar-panel-column';
    rightCol.appendChild(this.createHistorySidebarWidget());
    rightCol.appendChild(this.createQuickToolsWidget());

    workspaceLayout.appendChild(leftCol);
    workspaceLayout.appendChild(rightCol);
    wrapper.appendChild(workspaceLayout);

    // 4. Marketing Features Grid
    wrapper.appendChild(this.createMarketingSection());

    // 5. Formula Reference Library Section
    wrapper.appendChild(this.createFormulaSection());

    // 6. Marketing FAQs Section
    wrapper.appendChild(this.createFaqSection());

    document.body.appendChild(wrapper);

    // 7. Full-Width Footer (DESIGNED AND DEVELOPED BY Saheli Chattoraj)
    document.body.appendChild(this.createFullFooter());

    // Shortcuts Modal
    document.body.appendChild(this.createShortcutsModal());
  }

  // Sticky Navigation Bar
  createStickyHeader() {
    const nav = document.createElement('nav');
    nav.className = 'aura-navbar-sticky';
    nav.innerHTML = `
      <div class="nav-inner">
        <div class="brand-block">
          <div class="brand-icon">A</div>
          <div class="brand-title">AURA <span>CALC</span></div>
        </div>
        <div class="nav-links-menu">
          <a href="#workspace" class="nav-link-item" id="link-sci">Calculators</a>
          <a href="#features" class="nav-link-item">Features</a>
          <a href="#formulas" class="nav-link-item">Formulas</a>
          <a href="#faqs" class="nav-link-item">FAQs</a>
        </div>
        <div class="nav-actions">
          <button class="action-btn" id="btn-sound-toggle" title="Audio Feedback">🔊</button>
          <button class="action-btn" id="btn-theme-toggle" title="Toggle Theme">🌙</button>
          <button class="action-btn" id="btn-shortcuts-toggle" title="Hotkeys">⌨️</button>
          <button class="action-btn btn-primary-cta" id="btn-export-csv">📥 Export CSV</button>
        </div>
      </div>
    `;
    return nav;
  }

  // Hero Section Banner
  createHeroSection() {
    const hero = document.createElement('section');
    hero.className = 'hero-banner-section';
    hero.innerHTML = `
      <div class="hero-pill-badge">v5.0.0 Enterprise Suite • 100% Client-Side Engine</div>
      <h1 class="hero-main-heading">The Omnimath Platform for Professionals</h1>
      <p class="hero-sub-heading">Sub-millisecond high-precision scientific math, loan EMI & compound interest modeling, unit conversions, and bitwise logic — built with total client-side privacy.</p>
    `;
    return hero;
  }

  // Mode Navigation Tabs
  createModeTabs() {
    const tabs = document.createElement('div');
    tabs.className = 'mode-nav-tabs';
    tabs.id = 'workspace';

    const modes = [
      { id: 'sci', label: '🧮 Scientific' },
      { id: 'fin', label: '💰 Financial' },
      { id: 'unit', label: '📏 Units' },
      { id: 'health', label: '📊 Health' },
      { id: 'prog', label: '💻 Programmer' }
    ];

    modes.forEach(m => {
      const btn = document.createElement('button');
      btn.className = `mode-tab-btn ${m.id === this.currentMode ? 'active' : ''}`;
      btn.dataset.mode = m.id;
      btn.textContent = m.label;
      btn.addEventListener('click', () => this.switchMode(m.id));
      tabs.appendChild(btn);
    });

    return tabs;
  }

  // 1. Scientific View
  createSciView() {
    const view = document.createElement('div');
    view.className = 'mode-view mode-sci active';
    view.id = 'view-sci';

    const displayBox = document.createElement('div');
    displayBox.className = 'calc-display-box';
    displayBox.innerHTML = `
      <div class="display-meta-row">
        <span class="expression-text" id="sci-expr"></span>
        <button class="action-btn" id="sci-copy-btn" title="Copy Output" style="padding:2px 6px;font-size:0.7rem;">📋 Copy</button>
      </div>
      <div class="output-value-row">
        <div class="main-output-text" id="sci-output">0</div>
      </div>
      <div class="live-preview-row">
        <span class="preview-text" id="sci-preview"></span>
      </div>
    `;

    const grid = document.createElement('div');
    grid.className = 'sci-keypad-grid';

    const keys = [
      { label: 'DEG', act: 'angle-toggle', cls: 'btn-func', id: 'angle-btn' },
      { label: 'MC', act: 'mem-clear', cls: 'btn-func' },
      { label: 'MR', act: 'mem-read', cls: 'btn-func' },
      { label: 'M+', act: 'mem-add', cls: 'btn-func' },
      { label: 'M-', act: 'mem-sub', cls: 'btn-func' },

      { label: 'sin', act: 'trig', val: 'sin', cls: 'btn-func' },
      { label: 'cos', act: 'trig', val: 'cos', cls: 'btn-func' },
      { label: 'tan', act: 'trig', val: 'tan', cls: 'btn-func' },
      { label: 'ln', act: 'func', val: 'ln', cls: 'btn-func' },
      { label: 'log', act: 'func', val: 'log', cls: 'btn-func' },

      { label: '√', act: 'func', val: 'sqrt', cls: 'btn-func' },
      { label: 'x²', act: 'func', val: 'square', cls: 'btn-func' },
      { label: 'xʸ', act: 'op', val: '^', cls: 'btn-func' },
      { label: 'n!', act: 'func', val: 'fact', cls: 'btn-func' },
      { label: '÷', act: 'op', val: '/', cls: 'btn-op' },

      { label: 'π', act: 'const', val: 'Math.PI', cls: 'btn-func' },
      { label: '7', act: 'num', val: '7', cls: 'btn-num' },
      { label: '8', act: 'num', val: '8', cls: 'btn-num' },
      { label: '9', act: 'num', val: '9', cls: 'btn-num' },
      { label: '×', act: 'op', val: '*', cls: 'btn-op' },

      { label: 'e', act: 'const', val: 'Math.E', cls: 'btn-func' },
      { label: '4', act: 'num', val: '4', cls: 'btn-num' },
      { label: '5', act: 'num', val: '5', cls: 'btn-num' },
      { label: '6', act: 'num', val: '6', cls: 'btn-num' },
      { label: '−', act: 'op', val: '-', cls: 'btn-op' },

      { label: 'AC', act: 'clear-all', cls: 'btn-func', style: 'color:#ef4444' },
      { label: '1', act: 'num', val: '1', cls: 'btn-num' },
      { label: '2', act: 'num', val: '2', cls: 'btn-num' },
      { label: '3', act: 'num', val: '3', cls: 'btn-num' },
      { label: '+', act: 'op', val: '+', cls: 'btn-op' },

      { label: '⌫', act: 'backspace', cls: 'btn-func' },
      { label: '±', act: 'toggle-sign', cls: 'btn-func' },
      { label: '0', act: 'num', val: '0', cls: 'btn-num' },
      { label: '.', act: 'num', val: '.', cls: 'btn-num' },
      { label: '=', act: 'calculate', cls: 'btn-accent' }
    ];

    keys.forEach(k => {
      const btn = document.createElement('button');
      btn.className = `btn-k ${k.cls}`;
      if (k.id) btn.id = k.id;
      if (k.style) btn.style = k.style;
      btn.textContent = k.label;
      btn.dataset.act = k.act;
      if (k.val) btn.dataset.val = k.val;
      btn.addEventListener('click', () => this.handleSciKey(k));
      grid.appendChild(btn);
    });

    view.appendChild(displayBox);
    view.appendChild(grid);
    return view;
  }

  // 2. Financial View
  createFinView() {
    const view = document.createElement('div');
    view.className = 'mode-view mode-fin';
    view.id = 'view-fin';

    const grid = document.createElement('div');
    grid.className = 'financial-grid';

    const emiCard = document.createElement('div');
    emiCard.className = 'tool-card';
    emiCard.innerHTML = `
      <div class="card-header-title">🏦 Loan EMI Calculator</div>
      <div class="form-group"><label>Principal Amount ($ / ₹)</label><input type="number" id="emi-principal" class="form-input" value="100000"></div>
      <div class="form-row-2">
        <div class="form-group"><label>Interest Rate (%)</label><input type="number" id="emi-rate" class="form-input" value="8.5" step="0.1"></div>
        <div class="form-group"><label>Tenure (Years)</label><input type="number" id="emi-tenure" class="form-input" value="5"></div>
      </div>
      <button class="calc-action-btn" id="btn-calc-emi">Calculate EMI</button>
      <div class="card-result-box">
        <div class="result-row"><span>Monthly EMI:</span> <strong id="res-emi-val">$1,957</strong></div>
        <div class="result-row"><span>Total Interest:</span> <strong id="res-emi-interest">$17,396</strong></div>
        <div class="result-row"><span>Total Payment:</span> <strong id="res-emi-total">$117,396</strong></div>
      </div>
    `;

    const ciCard = document.createElement('div');
    ciCard.className = 'tool-card';
    ciCard.innerHTML = `
      <div class="card-header-title">📈 Compound Interest</div>
      <div class="form-group"><label>Initial Deposit ($ / ₹)</label><input type="number" id="ci-principal" class="form-input" value="10000"></div>
      <div class="form-row-2">
        <div class="form-group"><label>Interest Rate (%)</label><input type="number" id="ci-rate" class="form-input" value="7" step="0.1"></div>
        <div class="form-group"><label>Duration (Years)</label><input type="number" id="ci-years" class="form-input" value="10"></div>
      </div>
      <button class="calc-action-btn" id="btn-calc-ci">Calculate Growth</button>
      <div class="card-result-box">
        <div class="result-row"><span>Future Balance:</span> <strong id="res-ci-balance">$19,672</strong></div>
        <div class="result-row"><span>Total Earned:</span> <strong id="res-ci-earned">$9,672</strong></div>
      </div>
    `;

    grid.appendChild(emiCard);
    grid.appendChild(ciCard);
    view.appendChild(grid);
    return view;
  }

  // 3. Unit Converter View
  createUnitView() {
    const view = document.createElement('div');
    view.className = 'mode-view mode-unit';
    view.id = 'view-unit';
    view.innerHTML = `
      <div class="tool-card">
        <div class="card-header-title">📏 Real-Time Unit Converter</div>
        <div class="form-group">
          <label>Category</label>
          <select id="unit-cat-select" class="form-select">
            <option value="length">Length (Meters, Feet, Miles, KM)</option>
            <option value="weight">Mass & Weight (Kg, Lbs, Grams, Oz)</option>
            <option value="storage">Data Storage (Bytes, KB, MB, GB, TB)</option>
          </select>
        </div>
        <div class="form-row-2">
          <div class="form-group"><label>From</label><input type="number" id="unit-input-from" class="form-input" value="1"><select id="unit-select-from" class="form-select"></select></div>
          <div class="form-group"><label>To</label><input type="number" id="unit-input-to" class="form-input" readonly><select id="unit-select-to" class="form-select"></select></div>
        </div>
      </div>
    `;
    return view;
  }

  // 4. Health View
  createHealthView() {
    const view = document.createElement('div');
    view.className = 'mode-view mode-health';
    view.id = 'view-health';
    view.innerHTML = `
      <div class="tool-card">
        <div class="card-header-title">⚖️ Body Mass Index (BMI)</div>
        <div class="form-row-2">
          <div class="form-group"><label>Weight (kg)</label><input type="number" id="bmi-weight" class="form-input" value="70"></div>
          <div class="form-group"><label>Height (cm)</label><input type="number" id="bmi-height" class="form-input" value="175"></div>
        </div>
        <button class="calc-action-btn" id="btn-calc-bmi">Calculate BMI</button>
        <div class="card-result-box">
          <div class="result-row"><span>BMI Score:</span> <strong id="res-bmi-score">22.9</strong></div>
          <div class="result-row"><span>Status:</span> <strong id="res-bmi-status" style="color:#10b981">Normal weight</strong></div>
        </div>
      </div>
    `;
    return view;
  }

  // 5. Programmer View
  createProgView() {
    const view = document.createElement('div');
    view.className = 'mode-view mode-prog';
    view.id = 'view-prog';
    view.innerHTML = `
      <div class="tool-card">
        <div class="card-header-title">💻 Multi-Base & Bitwise Converter</div>
        <div class="form-group"><label>Decimal Entry</label><input type="number" id="prog-input-num" class="form-input" value="255"></div>
        <div class="form-row-2">
          <div class="result-row"><span>DEC:</span> <strong id="prog-dec">255</strong></div>
          <div class="result-row"><span>HEX:</span> <strong id="prog-hex">FF</strong></div>
          <div class="result-row"><span>BIN:</span> <strong id="prog-bin">11111111</strong></div>
          <div class="result-row"><span>OCT:</span> <strong id="prog-oct">377</strong></div>
        </div>
      </div>
    `;
    return view;
  }

  // Right Column Sidebar History Widget
  createHistorySidebarWidget() {
    const widget = document.createElement('div');
    widget.className = 'sidebar-widget-card';
    widget.innerHTML = `
      <div class="widget-title">
        <span>📜 Calculation History</span>
        <button class="action-btn" id="btn-clear-history" style="padding:2px 6px;font-size:0.72rem;color:#ef4444">Clear</button>
      </div>
      <div class="history-log-list" id="sidebar-history-list">
        <div class="empty-log">No recent calculations</div>
      </div>
    `;
    return widget;
  }

  // Right Column Sidebar Quick Tools Widget
  createQuickToolsWidget() {
    const widget = document.createElement('div');
    widget.className = 'sidebar-widget-card';
    widget.innerHTML = `
      <div class="widget-title">⚡ Quick Reference</div>
      <div style="font-size:0.8rem;color:var(--text-sub);line-height:1.4">
        <div><strong>Pi (π):</strong> 3.14159265</div>
        <div><strong>Euler (e):</strong> 2.71828182</div>
        <div><strong>Golden Ratio (φ):</strong> 1.61803398</div>
      </div>
    `;
    return widget;
  }

  // Marketing Section
  createMarketingSection() {
    const sec = document.createElement('section');
    sec.className = 'marketing-section';
    sec.id = 'features';
    sec.innerHTML = `
      <div class="section-heading">Platform Capability Highlights</div>
      <div class="features-grid-3">
        <div class="feature-box">
          <div class="feature-icon">⚡</div>
          <h3>Precision Math Core</h3>
          <p>Sub-millisecond algebraic and trigonometric computation engine with automatic floating point correction.</p>
        </div>
        <div class="feature-box">
          <div class="feature-icon">🔒</div>
          <h3>100% Client-Side Privacy</h3>
          <p>Your inputs and financial models never leave your browser. Zero tracking analytics or third-party cookies.</p>
        </div>
        <div class="feature-box">
          <div class="feature-icon">📲</div>
          <h3>Offline Capable PWA</h3>
          <p>Fully functional offline without an active internet connection. Optimized for mobile, desktop, and tablets.</p>
        </div>
      </div>
    `;
    return sec;
  }

  // Formula Section
  createFormulaSection() {
    const sec = document.createElement('section');
    sec.className = 'marketing-section';
    sec.id = 'formulas';
    sec.innerHTML = `
      <div class="section-heading">📘 Essential Formulas</div>
      <div class="features-grid-3">
        <div class="feature-box">
          <strong style="color:var(--accent-blue)">Quadratic Equation</strong>
          <code style="font-family:var(--font-mono);font-size:0.8rem;margin:0.3rem 0">x = (-b ± √(b² - 4ac)) / 2a</code>
          <p>Roots of polynomial quadratic equations.</p>
        </div>
        <div class="feature-box">
          <strong style="color:var(--accent-blue)">Compound Interest</strong>
          <code style="font-family:var(--font-mono);font-size:0.8rem;margin:0.3rem 0">A = P(1 + r/n)^(nt)</code>
          <p>Future balance with periodic compounding.</p>
        </div>
        <div class="feature-box">
          <strong style="color:var(--accent-blue)">Pythagorean Theorem</strong>
          <code style="font-family:var(--font-mono);font-size:0.8rem;margin:0.3rem 0">a² + b² = c²</code>
          <p>Right-angled triangle side length relationship.</p>
        </div>
      </div>
    `;
    return sec;
  }

  // FAQs Section
  createFaqSection() {
    const sec = document.createElement('section');
    sec.className = 'marketing-section';
    sec.id = 'faqs';
    sec.innerHTML = `
      <div class="section-heading">❓ Frequently Asked Questions</div>
      <div class="feature-box">
        <strong>Is Aura Calc completely free to use?</strong>
        <p>Yes, Aura Calc is 100% free and open for personal, educational, and commercial mathematical calculations.</p>
      </div>
      <div class="feature-box">
        <strong>Is any financial data transmitted to servers?</strong>
        <p>No. All calculations run strictly in your web browser's local memory with total privacy.</p>
      </div>
    `;
    return sec;
  }

  // Full-Width Footer Section (DESIGNED AND DEVELOPED BY Saheli Chattoraj)
  createFullFooter() {
    const footer = document.createElement('footer');
    footer.className = 'aura-footer-full';
    footer.innerHTML = `
      <div class="footer-inner-content">
        <div class="footer-top-grid">
          <div class="footer-brand-info">
            <h3>AURA CALC</h3>
            <p>High-precision omnimath calculation platform for engineers, financial analysts, developers, and students.</p>
          </div>
          <div>
            <div class="footer-col-title">Engines</div>
            <div class="footer-links-list">
              <a href="#workspace" class="footer-link">Scientific Calculator</a>
              <a href="#workspace" class="footer-link">Loan EMI & Compound Interest</a>
              <a href="#workspace" class="footer-link">Unit Converter</a>
              <a href="#workspace" class="footer-link">Programmer Bitwise</a>
            </div>
          </div>
          <div>
            <div class="footer-col-title">Resources</div>
            <div class="footer-links-list">
              <a href="#formulas" class="footer-link">Formula Library</a>
              <a href="#features" class="footer-link">Platform Features</a>
              <a href="#faqs" class="footer-link">FAQs</a>
            </div>
          </div>
          <div>
            <div class="footer-col-title">System</div>
            <div class="footer-links-list">
              <span class="footer-link">v5.0.0 Enterprise Suite</span>
              <span class="footer-link">100% Client-Side Engine</span>
              <span class="footer-link">Zero Data Analytics</span>
            </div>
          </div>
        </div>
        <div class="footer-bottom-bar">
          <div class="developer-signature">DESIGNED AND DEVELOPED BY Saheli Chattoraj</div>
          <div class="footer-copyright">Copyright © 2026 Aura Calc. All rights reserved.</div>
        </div>
      </div>
    `;
    return footer;
  }

  createShortcutsModal() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modal-shortcuts';
    overlay.innerHTML = `
      <div class="modal-box">
        <div class="modal-header">
          <div style="font-weight:700">Keyboard Shortcuts</div>
          <button class="action-btn" id="btn-close-modal">✕</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:0.5rem;font-size:0.8rem">
          <div style="display:flex;justify-content:space-between"><span>Digits 0-9</span> <kbd>0 - 9</kbd></div>
          <div style="display:flex;justify-content:space-between"><span>Operators (+, -, *, /)</span> <kbd>+</kbd> <kbd>-</kbd> <kbd>*</kbd> <kbd>/</kbd></div>
          <div style="display:flex;justify-content:space-between"><span>Evaluate Equals</span> <kbd>Enter</kbd></div>
          <div style="display:flex;justify-content:space-between"><span>Backspace</span> <kbd>Backspace</kbd></div>
          <div style="display:flex;justify-content:space-between"><span>Clear Output</span> <kbd>Esc</kbd></div>
        </div>
      </div>
    `;
    return overlay;
  }

  switchMode(modeId) {
    this.currentMode = modeId;
    document.querySelectorAll('.mode-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === modeId);
    });
    document.querySelectorAll('.mode-view').forEach(view => {
      view.classList.toggle('active', view.id === `view-${modeId}`);
    });
  }

  bindEvents() {
    document.getElementById('btn-theme-toggle')?.addEventListener('click', () => {
      const nextTheme = this.theme === 'dark' ? 'light' : 'dark';
      this.setTheme(nextTheme);
    });

    document.getElementById('btn-sound-toggle')?.addEventListener('click', () => {
      this.soundEnabled = !this.soundEnabled;
      localStorage.setItem('aura_sound', this.soundEnabled.toString());
      document.getElementById('btn-sound-toggle').innerHTML = this.soundEnabled ? '🔊' : '🔇';
    });

    const modal = document.getElementById('modal-shortcuts');
    document.getElementById('btn-shortcuts-toggle')?.addEventListener('click', () => {
      modal.classList.add('open');
    });
    document.getElementById('btn-close-modal')?.addEventListener('click', () => {
      modal.classList.remove('open');
    });

    document.getElementById('btn-export-csv')?.addEventListener('click', () => this.exportCSV());
    document.getElementById('btn-clear-history')?.addEventListener('click', () => this.clearHistory());

    document.getElementById('btn-calc-emi')?.addEventListener('click', () => this.calcEMI());
    document.getElementById('btn-calc-ci')?.addEventListener('click', () => this.calcCI());
    document.getElementById('btn-calc-bmi')?.addEventListener('click', () => this.calcBMI());

    this.setupUnitConverter();
    document.getElementById('prog-input-num')?.addEventListener('input', (e) => this.calcProgBases(e.target.value));

    document.addEventListener('keydown', (e) => this.handleKeyDown(e));

    this.renderSidebarHistory();
  }

  setTheme(theme) {
    this.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('aura_theme', theme);
    document.getElementById('btn-theme-toggle').innerHTML = theme === 'dark' ? '🌙' : '☀️';
  }

  handleSciKey(keyObj) {
    this.playAudioFeedback();
    const act = keyObj.act;
    const val = keyObj.val;

    if (act === 'num') {
      if (this.shouldResetInput) { this.calcInput = ''; this.shouldResetInput = false; }
      if (val === '.') {
        const lastPart = this.calcInput.split(/[\+\-\*\/\^]/).pop();
        if (lastPart.includes('.')) return;
      }
      this.calcInput = (this.calcInput === '0' && val !== '.') ? val : this.calcInput + val;
    } else if (act === 'op') {
      this.calcInput += ` ${val} `;
      this.shouldResetInput = false;
    } else if (act === 'clear-all') {
      this.calcInput = '0';
      this.calcExpression = '';
    } else if (act === 'backspace') {
      if (this.calcInput.length > 1) {
        this.calcInput = this.calcInput.trim().slice(0, -1).trim() || '0';
      } else {
        this.calcInput = '0';
      }
    } else if (act === 'toggle-sign') {
      if (this.calcInput.startsWith('-')) this.calcInput = this.calcInput.substring(1);
      else if (this.calcInput !== '0') this.calcInput = '-' + this.calcInput;
    } else if (act === 'const') {
      this.calcInput = eval(val).toString();
    } else if (act === 'trig') {
      const num = parseFloat(this.calcInput);
      let rad = this.angleMode === 'DEG' ? num * (Math.PI / 180) : num;
      let res = Math[val](rad);
      this.calcExpression = `${val}(${num}${this.angleMode === 'DEG' ? '°' : 'rad'})`;
      this.calcInput = this.formatNum(res);
      this.shouldResetInput = true;
    } else if (act === 'func') {
      const num = parseFloat(this.calcInput);
      let res = 0;
      if (val === 'ln') res = Math.log(num);
      else if (val === 'log') res = Math.log10(num);
      else if (val === 'sqrt') res = Math.sqrt(num);
      else if (val === 'square') res = Math.pow(num, 2);
      else if (val === 'fact') res = this.factorial(num);
      this.calcExpression = `${val}(${num})`;
      this.calcInput = this.formatNum(res);
      this.shouldResetInput = true;
    } else if (act === 'angle-toggle') {
      this.angleMode = this.angleMode === 'DEG' ? 'RAD' : 'DEG';
      document.getElementById('angle-btn').textContent = this.angleMode;
    } else if (act === 'calculate') {
      this.evaluateSci();
    }

    this.updateSciDisplay();
  }

  evaluateSci() {
    try {
      let sanitized = this.calcInput.replace(/\^/g, '**');
      let res = Function(`"use strict"; return (${sanitized})`)();
      this.calcExpression = `${this.calcInput} =`;
      this.calcInput = this.formatNum(res);
      this.shouldResetInput = true;
      this.saveHistory(this.calcExpression, this.calcInput);
    } catch (e) {
      this.calcInput = 'Error';
      this.shouldResetInput = true;
    }
  }

  updateSciDisplay() {
    document.getElementById('sci-expr').textContent = this.calcExpression;
    document.getElementById('sci-output').textContent = this.calcInput;
  }

  calcEMI() {
    const P = parseFloat(document.getElementById('emi-principal').value);
    const R = parseFloat(document.getElementById('emi-rate').value) / 12 / 100;
    const N = parseFloat(document.getElementById('emi-tenure').value) * 12;
    if (isNaN(P) || isNaN(R) || isNaN(N) || N === 0) return;

    const emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
    const totalPay = emi * N;
    const totalInt = totalPay - P;

    document.getElementById('res-emi-val').textContent = `$${Math.round(emi).toLocaleString()}`;
    document.getElementById('res-emi-interest').textContent = `$${Math.round(totalInt).toLocaleString()}`;
    document.getElementById('res-emi-total').textContent = `$${Math.round(totalPay).toLocaleString()}`;
  }

  calcCI() {
    const P = parseFloat(document.getElementById('ci-principal').value);
    const r = parseFloat(document.getElementById('ci-rate').value) / 100;
    const t = parseFloat(document.getElementById('ci-years').value);
    if (isNaN(P) || isNaN(r) || isNaN(t)) return;

    const A = P * Math.pow(1 + r, t);
    const earned = A - P;

    document.getElementById('res-ci-balance').textContent = `$${Math.round(A).toLocaleString()}`;
    document.getElementById('res-ci-earned').textContent = `$${Math.round(earned).toLocaleString()}`;
  }

  calcBMI() {
    const w = parseFloat(document.getElementById('bmi-weight').value);
    const h = parseFloat(document.getElementById('bmi-height').value) / 100;
    if (isNaN(w) || isNaN(h) || h === 0) return;

    const bmi = w / (h * h);
    document.getElementById('res-bmi-score').textContent = bmi.toFixed(1);
    
    let status = 'Normal weight';
    let col = '#10b981';
    if (bmi < 18.5) { status = 'Underweight'; col = '#3b82f6'; }
    else if (bmi >= 25 && bmi < 30) { status = 'Overweight'; col = '#f59e0b'; }
    else if (bmi >= 30) { status = 'Obese'; col = '#ef4444'; }

    const statusEl = document.getElementById('res-bmi-status');
    statusEl.textContent = status;
    statusEl.style.color = col;
  }

  calcProgBases(valStr) {
    const num = parseInt(valStr, 10);
    if (isNaN(num)) return;
    document.getElementById('prog-dec').textContent = num.toString(10);
    document.getElementById('prog-hex').textContent = num.toString(16).toUpperCase();
    document.getElementById('prog-bin').textContent = num.toString(2);
    document.getElementById('prog-oct').textContent = num.toString(8);
  }

  setupUnitConverter() {
    const catSelect = document.getElementById('unit-cat-select');
    const fromSelect = document.getElementById('unit-select-from');
    const toSelect = document.getElementById('unit-select-to');
    const inputFrom = document.getElementById('unit-input-from');
    const inputTo = document.getElementById('unit-input-to');

    const units = {
      length: { Meter: 1, Kilometer: 0.001, Centimeter: 100, Foot: 3.28084, Inch: 39.3701, Mile: 0.000621371 },
      weight: { Kilogram: 1, Gram: 1000, Pound: 2.20462, Ounce: 35.274 },
      storage: { Byte: 1, KB: 1/1024, MB: 1/1048576, GB: 1/1073741824 }
    };

    const populate = () => {
      const cat = catSelect.value;
      if (!units[cat]) return;
      fromSelect.innerHTML = '';
      toSelect.innerHTML = '';
      Object.keys(units[cat]).forEach(u => {
        fromSelect.add(new Option(u, u));
        toSelect.add(new Option(u, u));
      });
      if (toSelect.options.length > 1) toSelect.selectedIndex = 1;
      convert();
    };

    const convert = () => {
      const cat = catSelect.value;
      if (!units[cat]) return;
      const val = parseFloat(inputFrom.value) || 0;
      const rateFrom = units[cat][fromSelect.value];
      const rateTo = units[cat][toSelect.value];
      const baseVal = val / rateFrom;
      inputTo.value = (baseVal * rateTo).toFixed(4);
    };

    catSelect?.addEventListener('change', populate);
    fromSelect?.addEventListener('change', convert);
    toSelect?.addEventListener('change', convert);
    inputFrom?.addEventListener('input', convert);

    populate();
  }

  playAudioFeedback() {
    if (!this.soundEnabled) return;
    try {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
      }
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      const now = this.audioCtx.currentTime;
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.02);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
      osc.start(now);
      osc.stop(now + 0.02);
    } catch (e) {}
  }

  handleKeyDown(e) {
    if (this.currentMode !== 'sci') return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

    const k = e.key;
    if (k >= '0' && k <= '9') this.handleSciKey({ act: 'num', val: k });
    else if (k === '.') this.handleSciKey({ act: 'num', val: '.' });
    else if (['+', '-', '*', '/'].includes(k)) this.handleSciKey({ act: 'op', val: k });
    else if (k === 'Enter' || k === '=') { e.preventDefault(); this.handleSciKey({ act: 'calculate' }); }
    else if (k === 'Backspace') this.handleSciKey({ act: 'backspace' });
    else if (k === 'Escape') this.handleSciKey({ act: 'clear-all' });
  }

  factorial(n) {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
  }

  formatNum(val) {
    if (typeof val !== 'number') return val;
    const fixed = Math.round((val + Number.EPSILON) * 1e12) / 1e12;
    return fixed.toString();
  }

  saveHistory(expr, res) {
    this.history.unshift({ expr, res, date: new Date().toLocaleTimeString() });
    if (this.history.length > 50) this.history.pop();
    localStorage.setItem('aura_history', JSON.stringify(this.history));
    this.renderSidebarHistory();
  }

  renderSidebarHistory() {
    const listEl = document.getElementById('sidebar-history-list');
    if (!listEl) return;

    if (this.history.length === 0) {
      listEl.innerHTML = '<div class="empty-log">No recent calculations</div>';
      return;
    }

    listEl.innerHTML = this.history.map(item => `
      <div class="history-item-row" data-res="${item.res}">
        <span class="history-expr">${item.expr}</span>
        <span class="history-res">${item.res}</span>
      </div>
    `).join('');

    listEl.querySelectorAll('.history-item-row').forEach(el => {
      el.addEventListener('click', () => {
        this.calcInput = el.getAttribute('data-res');
        this.shouldResetInput = false;
        this.updateSciDisplay();
      });
    });
  }

  clearHistory() {
    this.history = [];
    localStorage.removeItem('aura_history');
    this.renderSidebarHistory();
  }

  exportCSV() {
    if (this.history.length === 0) {
      alert('No history recorded to export!');
      return;
    }
    let csv = 'Timestamp,Expression,Result\n';
    this.history.forEach(h => {
      csv += `"${h.date}","${h.expr}","${h.res}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Aura_Calc_History.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.auraApp = new AuraPlatform();
});
