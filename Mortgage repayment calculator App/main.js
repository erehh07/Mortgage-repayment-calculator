// ── Element References ──────────────────────────────────────────────────────
const inpAmount   = document.getElementById('inp-amount');
const inpTerm     = document.getElementById('inp-term');
const inpRate     = document.getElementById('inp-rate');
const errAmount   = document.getElementById('err-amount');
const errTerm     = document.getElementById('err-term');
const errRate     = document.getElementById('err-rate');
const errType     = document.getElementById('err-type');
const lblRepay    = document.getElementById('lbl-repayment');
const lblInter    = document.getElementById('lbl-interest');
const optRepay    = document.getElementById('opt-repayment');
const optInter    = document.getElementById('opt-interest');
const outMonthly  = document.getElementById('outMonthly');
const outTotal    = document.getElementById('outTotal');
const stateEmpty  = document.getElementById('stateEmpty');
const stateResults= document.getElementById('stateResults');
const btnCalc     = document.getElementById('btnCalc');
const btnClear    = document.getElementById('btnClear');

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Format a number as GBP currency string.
 * @param {number} n
 * @returns {string}
 */
function formatCurrency(n) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

/**
 * Show or clear an error state on an input + its message element.
 * @param {HTMLInputElement} input
 * @param {HTMLElement} errEl
 * @param {string|null} msg  - Pass null/empty to clear the error.
 */
function setError(input, errEl, msg) {
  errEl.textContent = msg || '';
  if (msg) {
    input.classList.add('error');
  } else {
    input.classList.remove('error');
  }
}

// ── Validation ───────────────────────────────────────────────────────────────

/**
 * Validate all form inputs.
 * @returns {{ amount: number, term: number, rate: number, type: string }|null}
 *   Returns parsed values on success, or null if any field is invalid.
 */
function validate() {
  let valid = true;

  const amount = parseFloat(inpAmount.value);
  const term   = parseFloat(inpTerm.value);
  const rate   = parseFloat(inpRate.value);
  const type   = document.querySelector('input[name="mortgage-type"]:checked')?.value;

  if (!inpAmount.value || isNaN(amount) || amount <= 0) {
    setError(inpAmount, errAmount, 'This field is required');
    valid = false;
  } else {
    setError(inpAmount, errAmount, null);
  }

  if (!inpTerm.value || isNaN(term) || term <= 0) {
    setError(inpTerm, errTerm, 'This field is required');
    valid = false;
  } else {
    setError(inpTerm, errTerm, null);
  }

  if (!inpRate.value || isNaN(rate) || rate <= 0) {
    setError(inpRate, errRate, 'This field is required');
    valid = false;
  } else {
    setError(inpRate, errRate, null);
  }

  if (!type) {
    errType.textContent = 'This field is required';
    valid = false;
  } else {
    errType.textContent = '';
  }

  return valid ? { amount, term, rate, type } : null;
}

// ── Calculations ─────────────────────────────────────────────────────────────

/**
 * Calculate monthly and total repayment for a standard repayment mortgage.
 * Uses the standard amortisation formula:
 *   M = P * [r(1+r)^n] / [(1+r)^n - 1]
 */
function calcRepayment(amount, term, annualRate) {
  const r   = annualRate / 100 / 12;       // monthly rate
  const n   = term * 12;                   // total number of payments
  const pow = Math.pow(1 + r, n);
  const monthly = (amount * r * pow) / (pow - 1);
  return { monthly, total: monthly * n };
}

/**
 * Calculate monthly and total repayment for an interest-only mortgage.
 * Monthly payment = principal × monthly rate (capital is not repaid monthly).
 */
function calcInterestOnly(amount, term, annualRate) {
  const r       = annualRate / 100 / 12;
  const monthly = amount * r;
  return { monthly, total: monthly * term * 12 };
}

// ── Main Actions ─────────────────────────────────────────────────────────────

function calculate() {
  const data = validate();
  if (!data) return;

  const { amount, term, rate, type } = data;
  const result =
    type === 'repayment'
      ? calcRepayment(amount, term, rate)
      : calcInterestOnly(amount, term, rate);

  outMonthly.textContent = formatCurrency(result.monthly);
  outTotal.textContent   = formatCurrency(result.total);

  stateEmpty.style.display = 'none';
  stateResults.classList.add('visible');
}

function clearAll() {
  // Reset inputs
  inpAmount.value = '';
  inpTerm.value   = '';
  inpRate.value   = '';

  // Reset radio buttons and their highlight classes
  optRepay.checked = false;
  optInter.checked = false;
  lblRepay.classList.remove('selected');
  lblInter.classList.remove('selected');

  // Clear all error states
  setError(inpAmount, errAmount, null);
  setError(inpTerm,   errTerm,   null);
  setError(inpRate,   errRate,   null);
  errType.textContent = '';

  // Reset results panel to empty state
  stateEmpty.style.display = '';
  stateResults.classList.remove('visible');
}

// ── Event Listeners ──────────────────────────────────────────────────────────

btnCalc.addEventListener('click', calculate);
btnClear.addEventListener('click', clearAll);

// Radio button selection highlight
optRepay.addEventListener('change', function () {
  lblRepay.classList.add('selected');
  lblInter.classList.remove('selected');
  errType.textContent = '';
});

optInter.addEventListener('change', function () {
  lblInter.classList.add('selected');
  lblRepay.classList.remove('selected');
  errType.textContent = '';
});

// Clear individual field errors on focus
inpAmount.addEventListener('focus', () => setError(inpAmount, errAmount, null));
inpTerm.addEventListener('focus',   () => setError(inpTerm,   errTerm,   null));
inpRate.addEventListener('focus',   () => setError(inpRate,   errRate,   null));
