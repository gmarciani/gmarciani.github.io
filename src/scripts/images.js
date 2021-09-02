(function($){
  $('img').on('error', function() {
    $(this).attr('src', '/images/brand/failover.svg');
  });
})( jQuery );
