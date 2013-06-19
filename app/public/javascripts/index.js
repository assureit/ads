$(function () {
    var ads = new ADS(document.getElementById("ase"));
    ads.initDefaultEventListeners();
    var $id = $('#signup-userid');
    var $pass1 = $('#signup-pass');
    var $pass2 = $('#signup-pass2');
    function verify() {
        if($id.val().length > 0 && $pass1.val().length > 0 && $pass1.val() == $pass2.val()) {
            $('#sign-up-form .btn').removeAttr("disabled");
        } else {
            $('#sign-up-form .btn').attr("disabled", "disabled");
        }
    }
    ;
    $id.keyup(verify);
    $pass1.keyup(verify);
    $pass2.keyup(verify);
    setTimeout(function () {
        window.scrollTo(0, 0);
    }, 0);
});
