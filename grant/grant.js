/*
  Scroll-jack timeline.
  The wrapper is made tall enough that scrolling its full height moves the
  pinned track horizontally across all its overflow. Vertical scroll progress
  maps linearly to translateX.
*/
(function () {
  var wrapper = document.getElementById('timeline-wrapper');
  var stage = document.getElementById('timeline-stage');
  var track = document.getElementById('timeline-track');
  var bar = document.querySelector('#timeline-progress .bar');
  var cards = Array.prototype.slice.call(track.querySelectorAll('.month-card'));

  var MOBILE_MAX = 820;
  var startX = 0;       // translateX at progress 0 (first card centered)
  var travel = 0;       // px the track moves from first to last card centered
  var enabled = false;

  function isMobile() {
    return window.matchMedia('(max-width: ' + MOBILE_MAX + 'px)').matches;
  }

  function setup() {
    if (isMobile()) {
      // native vertical stack — clear any inline state from desktop mode
      enabled = false;
      wrapper.style.height = '';
      track.style.transform = '';
      return;
    }
    enabled = true;
    // center the first and last cards in the viewport at progress 0 and 1.
    // offsetLeft is measured against the track and is stable under transform.
    var center = window.innerWidth / 2;
    var first = cards[0];
    var last = cards[cards.length - 1];
    var firstCenter = first.offsetLeft + first.offsetWidth / 2;
    var lastCenter = last.offsetLeft + last.offsetWidth / 2;
    startX = center - firstCenter;
    travel = lastCenter - firstCenter;
    // tall wrapper: one viewport of scroll per viewport of horizontal travel
    wrapper.style.height = (travel + window.innerHeight) + 'px';
    update();
  }

  function update() {
    if (!enabled) return;
    var rect = wrapper.getBoundingClientRect();
    var scrolled = -rect.top;                       // px scrolled into wrapper
    var max = wrapper.offsetHeight - window.innerHeight;
    var progress = Math.min(1, Math.max(0, scrolled / max));

    track.style.transform = 'translateX(' + (startX - travel * progress) + 'px)';
    bar.style.width = (progress * 100) + '%';

    // mark the card nearest viewport center as active
    var centerX = window.innerWidth / 2;
    var best = null, bestDist = Infinity;
    for (var i = 0; i < cards.length; i++) {
      var cr = cards[i].getBoundingClientRect();
      var dist = Math.abs((cr.left + cr.right) / 2 - centerX);
      if (dist < bestDist) { bestDist = dist; best = cards[i]; }
    }
    for (var j = 0; j < cards.length; j++) {
      cards[j].classList.toggle('is-active', cards[j] === best);
    }
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { update(); ticking = false; });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', setup);
  window.addEventListener('load', setup);
  setup();
})();
