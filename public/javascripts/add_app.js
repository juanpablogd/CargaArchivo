$("#cambioClave-btn").click(function() {
  
  $("#claveModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  $('#old_pass').val('');
  $('#newpass1').val('');
  $('#newpass2').val('');
  return false;
});

$("#masivo_inverso").click(function() {
  
  //$("#masivo_inverso").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});
Func.IntevaloLogin();


$("#CambiarClave").click(function() {
	var old_pass = $('#old_pass').val();
	var newpass1 = $('#newpass1').val();
    var newpass2 = $('#newpass2').val();
    
    if(old_pass==""){
    	alert("Ingrese la contraseña anterior!");
        $("#old_pass").focus();
        return false;
    }else if(newpass1== ""||newpass2== "") {
        alert("Ingrese la nueva contraseña!");
        $("#newpass1").focus();
        return false;
    }else if(newpass1!= newpass2) {
        alert("Las contraseñas no son iguales!");
        $("#newpass1").focus();
        return false;
    }else{
    	var login=Func.DataLogin();
        var data= {id:login.id,pass:old_pass,pasnew:newpass2};
		var DataAES =Func.Ecrypted(data);
		console.log(DataAES);
      	socket.emit('CambioPass',{aes:DataAES,idSkt:GeoCode.idSkt});
        socket.on('SetCambioUsuario',function(data){
        	var DataAES =Func.Decrypted(data);
      		console.log(DataAES);  
      		if(DataAES.cambio=="0"){
      			alert("Clave anterior errada!!");
      		}else if(DataAES.cambio=="ok"){
      			 $("#claveModal").modal("hide");
      			return true;	
      		}
        });
    }
	return false;
});

$("#cerrarSession-btn").click(function() {
 	Func.CerrarAPP();
});

/*
*
*	JP
*
*/
//console.log(Func.Decrypted(sessionStorage.dt).perfil);
if(Func.Decrypted(sessionStorage.dt).perfil==1){ //SI ES PERFIL ADMINISTRADOR
	$("#cambioClave-btn").before('<li id="listaUsr-btn"><a href="#"><i class="fa fa-users fa-fw"></i> Administrar Usuarios</a></li>');
	$("#listaUsr-btn").click(function(){
			Config.listaUsuarios();
	});
	Config.listaUsuarios=function(){
		$.each(BootstrapDialog.dialogs, function(id, dialog){
			dialog.close();
		});
		var $text = $('<div></div>');
			$text.append( '<div class="form-group">'+
							  '<button type="button" class="btn btn-primary" id="btnAddUsuario"><spam class="glyphicon glyphicon-plus"></spam>&nbsp;Adicionar Usuario</button>'+
                          '</div>'+
                          '<table class="table"><thead>'+
						      '<tr>'+
						        '<th>Nombre</th>'+
								'<th>Perfil</th>'+
								'<th>Activo</th>'+
						        '<th>Editar</th>'+
						        '<th>Eliminar</th>'+
						      '</tr>'+
						    '</thead>'+
								'<tbody id="listadoUsuarios"></tbody>'+
							'</table>'
						);
		
        BootstrapDialog.show({
        	title: 'Usuarios',
        	type: BootstrapDialog.TYPE_PRIMARY,
            message: $text,
            onshown: function(dialogRef){	//console.log("Evento onshown");
		        $("#btnAddUsuario").click(function() {	//console.log("Click Adicionar");
		        	dialogRef.close();
		        	Config.addUsuario();
		        });	//var data= {id:login.id,pass:old_pass,pasnew:newpass2};	var DataAES =Func.Ecrypted(data);
				socket.emit('listaUsuario',{idSkt:GeoCode.idSkt});
				socket.on('Usrs',function(data){	//console.log(data.length);
					var numUsrs = data.length;
					if(numUsrs>=30){
						$("#btnAddUsuario").hide();
					}else{
						$("#btnAddUsuario").show();
					}
					//Limpia el cuerpo de la Tabla
					$("#listadoUsuarios").empty();
					$.each( data, function( key, value ) {		//console.log(value.datos );
						$("#listadoUsuarios").append('<tr id="f'+value.datos.id+'">'+
        						'<td>'+value.datos.usuario+'</td>'+
								'<td>'+value.datos.perfil+'</td>'+
								'<td>'+value.datos.activo+'</td>'+
        						'<td class="btn_editar" d="'+value.datos.id+'" n="'+value.datos.nombre+'" u="'+value.datos.usuario+'" c="'+value.datos.clave+'" p="'+value.datos.id_perfil+'" a="'+value.datos.id_activo+'"><spam class="glyphicon glyphicon-tasks"></spam></td>'+
                				'<td class="btn_eliminar" d="'+value.datos.id+'" n="'+value.datos.usuario+'"><spam class="glyphicon glyphicon-erase"></spam></td>'+
							'</tr>');  
					});
					
					$(".btn_editar").click(function(){	console.log("Click btn_editar");
						var id = $(this).attr('d');
						Func.setmpId(id);
						Config['tmp_nombre'] = $(this).attr('n');
						Config['tmp_usuario'] = $(this).attr('u');	//console.log(Config['tmp_usuario']);
						Config['tmp_clave'] = $(this).attr('c');	
						Config['tmp_perfil'] = $(this).attr('p');	//console.log(Config['tmp_perfil']);
						Config['tmp_activo'] = $(this).attr('a');
			        	dialogRef.close();
			        	Config.editaUsuario();
					});
					$(".btn_eliminar").click(function(){	console.log("Click btn_eliminar");
						var id = $(this).attr('d');			//console.log(id);
						var nom = $(this).attr('n');		//console.log(nom);
						Func.setmpId(id);
						Func.setmpNom(nom);
						dialogRef.close();
						Config.eliminaUsuario();
					});
				});
            }
        });
	};
	Config.eliminaUsuario=function(){
		BootstrapDialog.show({
			title: 'Eliminar',
            message: 'Seguro desea eliminar el Usuario '+Func.getmpNom(),
            buttons: [{
                icon: 'glyphicon glyphicon-erase',
                label: 'Eliminar',
                title: 'Eliminar',
                cssClass: 'btn-danger',
                action: function(dialogItself){
					var data= {id:Func.getmpId()};
					var DataAES =Func.Ecrypted(data);
					socket.emit('delUsuario',{aes:DataAES,idSkt:GeoCode.idSkt});
					socket.on('delUsuarioResp',function(data){	//console.log(data);
						var DataAES =Func.Decrypted(data); //console.log(DataAES);  
						if(DataAES.resp=="ok"){
							Func.msjExito("Usuario Eliminado correctamente!");
							dialogItself.close();
							Config.listaUsuarios();
							return true;	
						}else{
							Func.msjAlerta("No se puede Elimina el Usuario");
						}
					});
                    //dialogItself.close();
                }
            },{
                icon: 'glyphicon glyphicon-th-list',
                label: 'Listado',
                title: 'Listado',
                cssClass: 'btn-info',
                action: function(dialogItself){
                    dialogItself.close();
					Config.listaUsuarios();
                }
            }, {
                label: 'Cancelar',
                action: function(dialogItself){
                    dialogItself.close();
                }
            }]
        });
	}
	Config.addUsuario=function(){
		var $text = $('<div></div>');
			$text.append( '<div class="form-group">'+
							  '<button type="button" class="btn btn-primary" id="btnListaUsuarios"><spam class="glyphicon glyphicon-th-list"></spam>&nbsp;Listado Usuarios</button>'+
							'</div>'+
							'<div class="form-group">'+
							  '<label for="fnombre">Nombre</label><input type="text" class="form-control" id="fnombre">'+
							'</div>'+
							'<div class="form-group">'+
							  '<label for="fusuario">Usuario</label><input type="text" class="form-control" id="fusuario">'+
							'</div>'+
							'<div class="form-group">'+
							  '<label for="fclave">Clave</label><input type="password" class="form-control" id="fclave">'+
							'</div>'+
							'<div class="form-group">'+
							  '<label for="fclave2">Repita la Clave</label><input type="password" class="form-control" id="fclave2">'+
							'</div>'+
							'<div class="form-group">'+
							  '<label for="fperfil">Perfil</label><select class="form-control" id="fperfil">'+
							  '<option value="">--Seleccione--</option>'+
							  '<option value="1">Administrador</option>'+
							  '<option value="2">Usuario</option>'+
							  '</select>'+
							'</div>'+
							'<h6><span id="txtLon" class="label label-info"></span>  <span id="txtLat" class="label label-info"></span></h6>'+
							'<div class="form-group">'+
							  '<button type="button" class="btn btn-primary btn-block"  id="btnGuardarUsuario">Guardar</button>'+
							'</div>'
						);
		
        BootstrapDialog.show({
        	title: 'Nuevo Usuario',
        	type: BootstrapDialog.TYPE_PRIMARY,
            message: $text,
            onshown: function(dialogRef){
		        $("#btnListaUsuarios").click(function() {
		        	dialogRef.close();
					Config.listaUsuarios();
		        });
		        $("#btnGuardarUsuario").click(function() {
		        	var nombre = $('#fnombre').val();
		        	var usuario= $('#fusuario').val();
		        	var clave= $('#fclave').val();
		        	var clave2= $('#fclave2').val();
		        	var perfil= $('#fperfil').val();
			  		if(nombre == ""){
			  			Func.msjAlerta("Debe ingresar un Nombre");
			  			setTimeout(function() { $('#fnombre').focus();}, 500);
			  			return;
			  		}else if(usuario == false){
			  			Func.msjAlerta("Debe ingresar un nombre de Usuario");
			  			setTimeout(function() { $('#fusuario').focus();}, 500);
			  			return;
			  		}else if(clave==""){
			  			Func.msjAlerta("Debe digitar una clave");
			  			setTimeout(function() { $('#fclave').focus();}, 500);
			  			return;
			  		}else if(clave2==""){
			  			Func.msjAlerta("Digite la clave nuevamente");
			  			setTimeout(function() { $('#fclave2').focus();}, 500);
			  			return;
			  		}else if(clave != clave2){
			  			Func.msjAlerta("Clave debe ser iguales");
			  			setTimeout(function() { $('#fclave2').focus();}, 500);
			  			return;
			  		}else if(clave.length<5){
			  			Func.msjAlerta("Clave debe ser mínimo de 5 carácteres");
			  			setTimeout(function() { $('#fclave2').focus();}, 500);
			  			return;
			  		}else if(perfil==""){
			  			Func.msjAlerta("Seleccione el Perfil");
			  			setTimeout(function() { $('#fperfil').focus();}, 500);
			  			return;
			  		};	//var imei = AppConfig.getImei();	
			  		console.log("FORMULARIO OK!!!!!!!!!!!!!");
					var data= {nombre:nombre,usuario:usuario,clave:clave,perfil:perfil};
					var DataAES =Func.Ecrypted(data);
		
					socket.emit('setUsuario',{aes:DataAES,idSkt:GeoCode.idSkt});
					socket.on('setUsuarioResp',function(data){	console.log(data);
						var DataAES =Func.Decrypted(data); console.log(DataAES);  
						if(DataAES.resp=="ok"){
							Func.msjExito("Usuario adicionado correctamente!");
							dialogRef.close();
							Config.listaUsuarios();
							return true;	
						}else{
							Func.msjAlerta("No se puedo adicionar el Usuario");
						}
					});
		        });
            }
        });
	};
	Config.editaUsuario=function(){
		var $text = $('<div></div>');
			$text.append( '<div class="form-group">'+
							  '<button type="button" class="btn btn-primary" id="btnListaUsuarios"><spam class="glyphicon glyphicon-th-list"></spam>&nbsp;Listado Usuarios</button>'+
							'</div>'+
							'<div class="form-group">'+
							  '<label for="fnombre">Nombre</label><input type="text" class="form-control" id="fnombre" value="'+Config['tmp_nombre']+'">'+
							'</div>'+
							'<div class="form-group">'+
							  '<label for="fusuario">Usuario</label><input type="text" class="form-control" id="fusuario" value="'+Config['tmp_usuario']+'">'+
							'</div>'+
							'<div class="form-group">'+
							  '<label for="fclave">Clave</label><input type="password" class="form-control" id="fclave" value="'+Config['tmp_clave']+'">'+
							'</div>'+
							'<div class="form-group">'+
							  '<label for="fclave2">Repita la Clave</label><input type="password" class="form-control" id="fclave2" value="'+Config['tmp_clave']+'">'+
							'</div>'+
							'<div class="form-group">'+
							  '<label for="fperfil">Perfil</label><select class="form-control" id="fperfil">'+
							  '<option value="">--Seleccione--</option>'+
							  '<option value="1">Administrador</option>'+
							  '<option value="2">Usuario</option>'+
							  '</select>'+
							'</div>'+
							'<div class="form-group">'+
							  '<label for="factivo">Activo</label><select class="form-control" id="factivo">'+
							  '<option value="">--Seleccione--</option>'+
							  '<option value="1">Activo</option>'+
							  '<option value="2">Inactivo</option>'+
							  '</select>'+
							'</div>'+
							'<h6><span id="txtLon" class="label label-info"></span>  <span id="txtLat" class="label label-info"></span></h6>'+
							'<div class="form-group">'+
							  '<button type="button" class="btn btn-primary btn-block"  id="btnGuardarUsuario">Actualizar</button>'+
							'</div>'
						);
		
        BootstrapDialog.show({
        	title: 'Editar Usuario',
        	type: BootstrapDialog.TYPE_PRIMARY,
            message: $text,
            onshown: function(dialogRef){
				$("#factivo").val(Config['tmp_activo']);
				$("#fperfil").val(Config['tmp_perfil']);
		        $("#btnListaUsuarios").click(function() {
		        	dialogRef.close();
					Config.listaUsuarios();
		        });
		        $("#btnGuardarUsuario").click(function() {
		        	var nombre = $('#fnombre').val();
		        	var usuario= $('#fusuario').val();
		        	var clave= $('#fclave').val();
		        	var clave2= $('#fclave2').val();
		        	var perfil= $('#fperfil').val();
					var activo= $('#factivo').val();
			  		if(nombre == ""){
			  			Func.msjAlerta("Debe ingresar un Nombre");
			  			setTimeout(function() { $('#fnombre').focus();}, 500);
			  			return;
			  		}else if(usuario == false){
			  			Func.msjAlerta("Debe ingresar un nombre de Usuario");
			  			setTimeout(function() { $('#fusuario').focus();}, 500);
			  			return;
			  		}else if(clave==""){
			  			Func.msjAlerta("Debe digitar una clave");
			  			setTimeout(function() { $('#fclave').focus();}, 500);
			  			return;
			  		}else if(clave2==""){
			  			Func.msjAlerta("Digite la clave nuevamente");
			  			setTimeout(function() { $('#fclave2').focus();}, 500);
			  			return;
			  		}else if(clave != clave2){
			  			Func.msjAlerta("Clave debe ser iguales");
			  			setTimeout(function() { $('#fclave2').focus();}, 500);
			  			return;
			  		}else if(clave.length<5){
			  			Func.msjAlerta("Clave debe ser mínimo de 5 carácteres");
			  			setTimeout(function() { $('#fclave2').focus();}, 500);
			  			return;
			  		}else if(perfil==""){
			  			Func.msjAlerta("Seleccione el Perfil");
			  			setTimeout(function() { $('#fperfil').focus();}, 500);
			  			return;						
			  		}else if(activo==""){
			  			Func.msjAlerta("Seleccione el estado");
			  			setTimeout(function() { $('#factivo').focus();}, 500);
			  			return;
			  		};	//var imei = AppConfig.getImei();	
			  		console.log("FORMULARIO OK!!!!!!!!!!!!!");
					var data= {id:Func.getmpId(),nombre:nombre,usuario:usuario,clave:clave,perfil:perfil,activo:activo};
					var DataAES =Func.Ecrypted(data);
		
					socket.emit('updUsuario',{aes:DataAES,idSkt:GeoCode.idSkt});
					socket.on('updUsuarioResp',function(data){	console.log(data);
						var DataAES =Func.Decrypted(data); console.log(DataAES);  
						if(DataAES.resp=="ok"){
							Func.msjExito("Usuario Actualizado correctamente!");
							dialogRef.close();
							Config.listaUsuarios();
							return true;	
						}else{
							Func.msjAlerta("No se puedo actualizar el Usuario");
						}
					});
		        });
            }
        });
	};
}