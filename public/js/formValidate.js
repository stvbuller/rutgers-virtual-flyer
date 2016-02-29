//form validation using the jQuery Validation Plugin

//custom validation rules for the signup form
// $("#signup-modal").validate({
//   rules: {
//     firstname: {
//         required: true,
//         minlength: 1
//     },
//     lastname: {
//         required: true,
//         minlength: 1
//     },
//     email: {
//         required: true,
//         email:true
//     },
//     password: {
//     required: true,
//     minlength: 5
//     }
//   },
//   //custom messages
//   messages: {
//     firstname:{
//         required: "Please enter your first name",
//     },
//     lastname:{
//         required: "Please enter your last name",
//     },
//     email:{
//         required: "Please enter your email",
//     },
//     password:{
//         required: "Please enter a password",
//         minlength: "Please enter a password between 5 and 20 characters"
//     }
//   },
//   errorElement : 'div',
//   errorPlacement: function(error, element) {
//     var placement = $(element).data('error');
//     if (placement) {
//       $(placement).append(error)
//     } else {
//       error.insertAfter(element);
//     }
//   }
// });


//custon validation rules for the login form
// $("#formLogin").validate({
//   rules: {
//     email: {
//         required: true,
//         email:true
//     },
//     password: {
//     required: true,
//     minlength: 5
//     }
//   },
//   //custom messages
//   messages:
//     email:{
//         required: "Please enter your email",
//     },
//     password:{
//         required: "Please enter a password",
//         minlength: "Please enter a password between 5 and 20 characters"
//     }
//   },
//   errorElement : 'div',
//   errorPlacement: function(error, element) {
//     var placement = $(element).data('error');
//     if (placement) {
//       $(placement).append(error)
//     } else {
//       error.insertAfter(element);
//     }
//   }
// });
