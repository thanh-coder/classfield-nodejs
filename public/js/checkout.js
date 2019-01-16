Stripe.setDefaultPublishableKey("pk_test_jdtlHBpJTZegCuielgXXDFJL");
var $form=$("#checkout-form");
$form.submit(function(event){
    $("#charge-error").removeAttr("hidden");

    $form.find("button").prop('disabled',true);
    Stribe.card.createToken({
        number:$('#card-number').val(),
        cvc:$('#card-cvc').val(),
        exp_month:$('#card-expiry-month').val(),
        exp_year:$('#card-expiry-year').val(),
        name:$('#card-name').val()
    },stripeResponseHandler)
    return false;
})

function stripeResponseHandler(status, response) {
    if (response.error) {
        // show the errors on the form
        $("#charge-error").text(response.error.message);
        $("#charge-error").removeAttr("hidden");
        $form.find('button').prop('disabled',false)
    } else {
        // var form$ = $("#payment-form");
        // token contains id, last4, and card type
        var token = response['id'];
        // insert the token into the form so it gets submitted to the serverfunction stripeResponseHandler(status, response) 
        form$.append("<input type='hidden' name='stripeToken' value='" + token + "'/>");
        // and submit
        form$.get(0).submit();
    }
}