$('.upload-btn').on('click', function (){
    $('#upload-input').click();
    $('.progress-bar').text('0%');
    $('.progress-bar').width('0%');
});

function stringGen(len)
{
    var text = " ";
    var charset = "abcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < len; i++ )
        text += charset.charAt(Math.floor(Math.random() * charset.length));
    return text;
}

var archivo = {
	nombre:'',
	cargaArchivo:function(files){
		  if (files.length > 0){
			// create a FormData object which will be sent as the data payload in the
			// AJAX request
			var formData = new FormData();
			// loop through all the selected files and add them to the formData object
			for (var i = 0; i < files.length; i++) {
			  var file = files[i];
				archivo.nombre  = stringGen(3)+"_"+ file.name;
			  // add the files to formData object for the data payload
			  formData.append('uploads[]', file, archivo.nombre);	//console.log(file);
			}
			console.log(jQuery.isPlainObject(formData));
		  }
		var id_usr = 1;	//SELECCIONAR EL ID DEL USUARIO DEL LOGIN
		$.ajax({
		  url: '/upload/'+$("#tipoData").val(),
		  type: 'POST',
		  data: formData,
		  processData: false,
		  contentType: false,
		  success: function(data){
			  console.log('Cargado Exitosamente:\n' + data);
		  },
		  xhr: function() {
			// create an XMLHttpRequest
			var xhr = new XMLHttpRequest();
			// listen to the 'progress' event
			xhr.upload.addEventListener('progress', function(evt) {

			  if (evt.lengthComputable) {
				// calculate the percentage of upload completed
				var percentComplete = evt.loaded / evt.total;
				percentComplete = parseInt(percentComplete * 100);

				// update the Bootstrap progress bar with the new percentage
				$('.progress-bar').text(percentComplete + '%');
				$('.progress-bar').width(percentComplete + '%');

				// once the upload reaches 100%, set the progress bar text to done
				if (percentComplete === 100) {
				  $('.progress-bar').html('Done');
				}
			  }
			}, false);
			return xhr;
		  }
		});
	}
};

$('#upload-input').on('change', function(){
	var files = $(this).get(0).files;
	archivo.cargaArchivo(files);
});
