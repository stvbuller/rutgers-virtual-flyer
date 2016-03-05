// Scripts for Rutgers Virtual Flyer
$(document).ready(function() {

  // Triggers modal launch
  $('.modal-trigger').leanModal();

  // Materialize parallax
  $('.parallax').parallax();

  // To scroll directly to latest reviews
  $('.scrollspy').scrollSpy();

  // For dropdown menu
  $('select').material_select();

  // Activate side-nav for mobile
  $(".button-collapse").sideNav();

  // For messages to appear on page from req.query.msg
  $('.tooltipped').tooltip({delay: 50});
  
  $('.deleteBtn').on('click', function(e) {
    e.preventDefault();
    var id = $(this).data('id');
    var that = $(this);
    $.ajax({
      url: '/deleteReview/' + id,
      type: 'DELETE',
      success: function(result) {
        that.parent(".review").fadeOut();
      }
    })
  })

}); //end of doc.ready

