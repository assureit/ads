$(function() {
	var ase = new ASE(document.getElementById("ase"));

	var $id    = $('#signup-userid');
	var $pass1 = $('#signup-pass');
	var $pass2 = $('#signup-pass2');

	var varify = function(){
		if($id.val().length > 0 && $pass1.val().length > 0 && $pass1.val() == $pass2.val()){
			$('#sign-up-form .btn').removeAttr("disabled");
		}else{
			$('#sign-up-form .btn').attr("disabled", "disabled");
		}
	};
	$id.keyup(varify);
	$pass1.keyup(varify);
	$pass2.keyup(varify);
	
	// hide url bar for ipod touch
	setTimeout(function(){
		window.scrollTo(0, 0);
	}, 0);
});
