// Click a post image to view it full screen. Images inside links keep their
// link. The viewer is a native <dialog>, so Esc closes it and focus returns to
// the image; a click anywhere or the close button closes it too.
(function () {
  var images = document.querySelectorAll('.post-content img');
  if (!images.length) return;

  var dialog = document.createElement('dialog');
  dialog.className = 'lightbox';
  dialog.setAttribute('aria-label', 'Image viewer');
  dialog.innerHTML = '<button type="button" class="lightbox__close" aria-label="Close"><i class="icon icon-xmark"></i></button><img class="lightbox__image" alt="">';
  document.body.appendChild(dialog);
  var full = dialog.querySelector('.lightbox__image');

  dialog.addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('close', function () {
    document.documentElement.classList.remove('lightbox-open');
  });

  function open(img) {
    full.src = img.currentSrc || img.src;
    full.alt = img.alt;
    document.documentElement.classList.add('lightbox-open');
    dialog.showModal();
  }

  for (var i = 0; i < images.length; i++) {
    var img = images[i];
    if (img.closest('a')) continue;
    img.classList.add('zoomable');
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', 'Enlarge image' + (img.alt ? ': ' + img.alt : ''));
    img.addEventListener('click', function () { open(this); });
    img.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open(this);
      }
    });
  }
})();
