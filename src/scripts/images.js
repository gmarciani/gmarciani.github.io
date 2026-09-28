// Swap broken images for the brand failover graphic. This script is deferred,
// so images that already failed before it ran are caught via `complete`.
(function () {
  var FAILOVER = '/images/brand/failover.svg';

  function failover(img) {
    if (img.src.indexOf(FAILOVER) !== -1) return;
    img.src = FAILOVER;
  }

  document.addEventListener('error', function (event) {
    if (event.target.tagName === 'IMG') failover(event.target);
  }, true);

  for (var i = 0; i < document.images.length; i++) {
    var img = document.images[i];
    if (img.complete && img.naturalWidth === 0 && img.src) failover(img);
  }
})();
