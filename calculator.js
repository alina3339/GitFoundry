/* ════════════════════════════════════════════════
   GitFoundry Savings Calculator
   Vanilla JS · no dependencies · no build step
   Loaded with defer — runs once per page.
   ════════════════════════════════════════════════ */

(function () {
  'use strict';

  const BUILD_COST = 349; // Professional tier, one-time

  const slider   = document.getElementById('calc-monthly');
  if (!slider) return; // module not present on this page — exit silently

  const display  = document.getElementById('calc-monthly-display');
  const beEl     = document.getElementById('calc-breakeven');
  const y1El     = document.getElementById('calc-y1');
  const y2El     = document.getElementById('calc-y2');
  const y3El     = document.getElementById('calc-y3');

  /**
   * Format a signed integer as £123 or £-123
   * Negative = user is still in the red after the one-time build fee.
   */
  function fmtMoney(n) {
    const rounded = Math.round(n);
    const sign = rounded < 0 ? '-' : '';
    return `<sup>£</sup>${sign}${Math.abs(rounded)}`;
  }

  /**
   * Apply a visual state class so the token colour tracks the sign.
   */
  function setState(el, value) {
    el.classList.remove('is-positive', 'is-negative');
    if (value > 0) el.classList.add('is-positive');
    else if (value < 0) el.classList.add('is-negative');
  }

  function update() {
    const monthly = parseFloat(slider.value) || 0;

    // Display current slider value
    display.textContent = monthly;

    // Break-even
    if (monthly === 0) {
      beEl.textContent = '—';
      beEl.classList.remove('is-positive', 'is-negative');
    } else {
      const months = BUILD_COST / monthly;
      // Round up — you're only "ahead" after the month completes
      const rounded = Math.ceil(months);
      beEl.textContent = `${rounded} mo`;
      beEl.classList.add('is-positive');
    }

    // Net savings at each horizon (positive = money kept vs platform)
    const y1 = (monthly * 12)  - BUILD_COST;
    const y2 = (monthly * 24)  - BUILD_COST;
    const y3 = (monthly * 36)  - BUILD_COST;

    y1El.innerHTML = fmtMoney(y1); setState(y1El, y1);
    y2El.innerHTML = fmtMoney(y2); setState(y2El, y2);
    y3El.innerHTML = fmtMoney(y3); setState(y3El, y3);
  }

  // Listen for both input (live drag) and change (keyboard arrows)
  slider.addEventListener('input', update);
  slider.addEventListener('change', update);

  // Initial render
  update();
})();
