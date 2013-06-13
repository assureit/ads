$(function() {
	var ads = new ADS(document.getElementById("ase"));
	ads.initDefaultEventListeners();

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

	$("div.row").on('dragenter', function (e) {
		e.stopPropagation();
		e.preventDefault();
	}).on('dragover', function (e) {
		e.stopPropagation();
		e.preventDefault();
		$(this).addClass('hover');
	}).on('dragleave', function (e) {
		e.stopPropagation();
		e.preventDefault();
		$(this).removeClass('hover');
	}).on('drop', function (e) {
		e.stopPropagation();
		e.preventDefault();
		$(this).removeClass('hover');
		var file = e.originalEvent.dataTransfer.files[0];
		if(file) {
			var reader = new FileReader();
			reader.onerror = function(e) {
				console.log('error', e.target.error.code);
			}
			//読み込み後の処理
			reader.onload = function(e){
				alert(e.target.result);
			};
			reader.readAsText(file, 'shift-jis');
		}
		return false;
	});
});
