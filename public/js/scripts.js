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

  // Star Rating
  function starRating(ratingFromDb){
    if(ratingFromDb === 1) {
      $('#star-rating').append('<i class="fa fa-star"></i>');
    }
  };

  starRating();

}); //end of doc.ready

