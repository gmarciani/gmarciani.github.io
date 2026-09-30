// Add a "Copy" button to every code block, except the filetree diagrams.
// Deferred, so the blocks exist by the time it runs. The block is wrapped in a
// `copyable` div that holds the button, so the button does not scroll away
// with the code on narrow screens.
(function () {
  var blocks = document.querySelectorAll('pre:not(.filetree) > code');
  for (var i = 0; i < blocks.length; i++) addButton(blocks[i]);

  function addButton(code) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'copyable__button';
    button.innerHTML = '<i class="icon icon-copy"></i><i class="icon icon-check"></i><span>Copy</span>';
    var label = button.lastChild;

    button.addEventListener('click', function () {
      navigator.clipboard.writeText(code.textContent).then(function () {
        button.classList.add('copyable__button--done');
        label.textContent = 'Copied';
        setTimeout(function () {
          button.classList.remove('copyable__button--done');
          label.textContent = 'Copy';
        }, 500);
      });
    });

    var pre = code.parentNode;
    var wrapper = document.createElement('div');
    wrapper.className = 'copyable';
    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);
    wrapper.appendChild(button);
  }
})();
