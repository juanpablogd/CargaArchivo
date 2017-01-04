
var acceso={
    Init:function(){
    	$("#ingresar").click(function () {
		    if (!$("#usuario").val()) {
		        bootbox.alert("por favor ingrese el nombre de usuario", function () {});
		        $("#usuario").focus();
		    } else if (!$("#contrasena").val()) {
		        bootbox.alert("por favor ingrese la contraseña", function () {});
		        $("#contrasena").focus();
		    } else {
		        var usuario = $("#usuario").val();
		        var login = $("#contrasena").val();
		        var data= {'usr': usuario,'pas': login};
		        console.log(data);
		        var DataAES =Func.Ecrypted(data);
		        console.log(DataAES);
		        socket.emit('LoginUsuario',{aes:DataAES,idSkt:GeoCode.idSkt},function(data){
		        	console.log(data);		        	
		        });
		        socket.on('SetLoginUsuario',function(data){
		        	console.log(data);
		        	if (data.length>0){
		        		var dat=Func.Decrypted(data);
		        		sessionStorage.dt=data;
		        		bootbox.alert("Bienvenido, " + dat.nombre, function () {});
		                window.location.assign(Config.NextLogin);
		            }else{
		                sessionStorage.clear();
		                bootbox.alert("Usuario o Clave incorrectos!", function () {});
		            }
		        });
		    }
		});
   }
};