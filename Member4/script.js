/* ============================================
   RaktSetu — Member 4: Hospital & Healthcare
   Basic JS (30% milestone)
   - simple form submit feedback
   - simple accordion toggle
   No localStorage / real filtering yet — that
   comes in the 100% version.
   ============================================ */

// ---------- Generic form submit handler ----------
document.querySelectorAll('.js-basic-form').forEach(function (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var msgBox = form.querySelector('.form-msg');
    var successText = form.getAttribute('data-success') || 'Submitted successfully.';

    if (msgBox) {
      msgBox.textContent = successText;
      msgBox.classList.add('show', 'success');
    }

    console.log('[RaktSetu] Form submitted:', form.id || form);
    // form.reset(); // uncomment once real handling is added
  });
});

// ---------- Simple accordion (Healthcare Info FAQ) ----------
document.querySelectorAll('.accordion-trigger').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var item = btn.closest('.accordion-item');
    item.classList.toggle('open');
  });
});

// ---------- Active nav link highlight ----------
(function highlightActiveNav() {
  var current = window.location.pathname.split('/').pop();
  document.querySelectorAll('nav.mainnav a').forEach(function (link) {
    if (link.getAttribute('href') === current) {
      link.classList.add('active');
    }
  });
})();