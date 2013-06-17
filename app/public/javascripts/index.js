$(function () {
    ads:
ADS = new ADS(document.getElementById("ase"))
    ads.initDefaultEventListeners();
    $id:
string = $('#signup-userid')
    $pass1:
string = $('#signup-pass')
    $pass2:
string = $('#signup-pass2')
    varify(function () {
        if($id.val().length > 0 && $pass1.val().length > 0 && $pass1.val() == $pass2.val()) {
            $('#sign-up-form .btn').removeAttr("disabled");
        } else {
            $('#sign-up-form .btn').attr("disabled", "disabled");
        }
    });
    $id.keyup(varify);
    $pass1.keyup(varify);
    $pass2.keyup(varify);
    setTimeout(function () {
        window.scrollTo(0, 0);
    }, 0);
});
