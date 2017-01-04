var express = require('express');
var app = express();
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
var Converter = require("csvtojson").Converter;
var moment = require('moment');
var CryptoJS = require("crypto-js");
var pg = require('pg');
var http = require('http').Server(app);
var io = require('socket.io')(http);


http.listen(3000, function() {
    console.log('Server listening on port 3000');
});

var Config={
	cxPG : { //console.log('Sincronizo'+moment().format('DD-MM-YYYY HH:mm'));
		user: 'postgres',
		password: 'p0s76r3s',
		database: 'fedearroz',
		host: '127.0.0.1',
		port: 5432,
		application_name: 'Geocodificardor Cali',
		max: 10, //set pool max size to 20
		min: 2, //set min pool size to 4
		idleTimeoutMillis: 1000 //close idle clients after 1 second
	},
	claveAES:'1erf2a5f1e87g1'	
};


var Func={
	Decrypted:function (message) {
		var decrypted =JSON.parse(CryptoJS.AES.decrypt(message,Config.claveAES).toString(CryptoJS.enc.Utf8));
		return decrypted; 
	},
	Ecrypted:function (json){
		var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(json), Config.claveAES);
		return ciphertext.toString();
	}
};


var pool = new pg.Pool(Config.cxPG);

var data = {
    titpreAnio: function(fila) {
        var tx = undefined;
        var titulos = Object.keys(fila);
        for (var i = 0; i < titulos.length; i++) { //console.log(titulos[i]);
            var t = titulos[i].toString().toUpperCase().trim();
            if (t == "ANIO") { tx = titulos[i]; break;}
            if (t == "AÑO") { tx = titulos[i]; break;
            }
        }
        if (tx == undefined) { //console.log("Revisa valores");
            for (var i = 0; i < titulos.length; i++) {
                var t = fila[titulos[i]].toString().toUpperCase().trim();
                if (t == "ANIO") { tx = titulos[i]; break; }
                if (t == "AÑO") { tx = titulos[i]; break; }
            }
        }
        return tx;
    },
	titpreMes: function(fila) {
        var tx = undefined;
        var titulos = Object.keys(fila);
        for (var i = 0; i < titulos.length; i++) { //console.log(titulos[i]);
            var t = titulos[i].toString().toUpperCase().trim();
            if (t == "MES") { tx = titulos[i]; break;}
        }
        if (tx == undefined) { //console.log("Revisa valores");
            for (var i = 0; i < titulos.length; i++) {
                var t = fila[titulos[i]].toString().toUpperCase().trim();
                if (t == "MES") { tx = titulos[i]; break; }
            }
        }
        return tx;
    },
	titpreTipo: function(fila) {
        var tx = undefined;
        var titulos = Object.keys(fila);
        for (var i = 0; i < titulos.length; i++) { //console.log(titulos[i]);
            var t = titulos[i].toString().toUpperCase().trim();
            if (t == "TIPO") { tx = titulos[i]; break;}
        }
        if (tx == undefined) { //console.log("Revisa valores");
            for (var i = 0; i < titulos.length; i++) {
                var t = fila[titulos[i]].toString().toUpperCase().trim();
                if (t == "TIPO") { tx = titulos[i]; break; }
            }
        }
        return tx;
    },
	titpreEstacion: function(fila) {
        var tx = undefined;
        var titulos = Object.keys(fila);
        for (var i = 0; i < titulos.length; i++) { //console.log(titulos[i]);
            var t = titulos[i].toString().toUpperCase().trim();
            if (t == "ESTACION") { tx = titulos[i]; break;}
            if (t == "ESTACIÓN") { tx = titulos[i]; break;}
        }
        if (tx == undefined) { //console.log("Revisa valores");
            for (var i = 0; i < titulos.length; i++) {
                var t = fila[titulos[i]].toString().toUpperCase().trim();
            if (t == "ESTACION") { tx = titulos[i]; break;}
            if (t == "ESTACIÓN") { tx = titulos[i]; break;}
            }
        }
        return tx;
    },
	tituloX: function(fila){
		var tx = undefined;
		var titulos = Object.keys(fila);
		for(var i= 0;i<titulos.length;i++){	//console.log(titulos[i]);
			var t = titulos[i].toString().toUpperCase().trim();
			if(t=="X"){ tx = titulos[i];break; }
			if(t=="CX"){ tx = titulos[i];break; }
			if(t=="LON"){ tx = titulos[i];break; }
			if(t=="LONG"){ tx = titulos[i];break; }
			if(t=="LONGITUD"){ tx = titulos[i];break; }
		}
		if(tx == undefined){	//console.log("Revisa valores");
			for(var i= 0;i<titulos.length;i++){
				var t = fila[titulos[i]].toString().toUpperCase().trim();
				if(t=="X"){ tx = titulos[i];break; }
				if(t=="CX"){ tx = titulos[i];break; }
				if(t=="LON"){ tx = titulos[i];break; }
				if(t=="LONG"){ tx = titulos[i];break; }
				if(t=="LONGITUD"){ tx = titulos[i];break; }
			}
		}
		return tx;
	},
    tituloY: function(fila) {
		var ty = undefined;
		var titulos = Object.keys(fila);
		for(var i= 0;i<titulos.length;i++){
			var v = titulos[i].toString().toUpperCase().trim();
			if(v=="Y"){ ty = titulos[i];break; }
			if(v=="CY"){ ty = titulos[i];break; }
			if(v=="LAT"){ ty = titulos[i];break; }
			if(v=="LATITUD"){ ty = titulos[i];break; }
		}
		if(ty == undefined){
			for(var i= 0;i<titulos.length;i++){
				var v = fila[titulos[i]].toString().toUpperCase().trim();
				if(v=="Y"){ ty = titulos[i];break; }
				if(v=="CY"){ ty = titulos[i];break; }
				if(v=="LAT"){ ty = titulos[i];break; }
				if(v=="LATITUD"){ ty = titulos[i];break; }
			}
		}
		return ty;
    },
	titpreBajo: function(fila) {
        var tx = undefined;
        var titulos = Object.keys(fila);
        for (var i = 0; i < titulos.length; i++) { //console.log(titulos[i]);
            var t = titulos[i].toString().toUpperCase().trim();
            if (t == "BAJO") { tx = titulos[i]; break;}
        }
        if (tx == undefined) { //console.log("Revisa valores");
            for (var i = 0; i < titulos.length; i++) {
                var t = fila[titulos[i]].toString().toUpperCase().trim();
                if (t == "BAJO") { tx = titulos[i]; break; }
            }
        }
        return tx;
    },
	titpreNormal: function(fila) {
        var tx = undefined;
        var titulos = Object.keys(fila);
        for (var i = 0; i < titulos.length; i++) { //console.log(titulos[i]);
            var t = titulos[i].toString().toUpperCase().trim();
            if (t == "NORMAL") { tx = titulos[i]; break;}
        }
        if (tx == undefined) { //console.log("Revisa valores");
            for (var i = 0; i < titulos.length; i++) {
                var t = fila[titulos[i]].toString().toUpperCase().trim();
                if (t == "NORMAL") { tx = titulos[i]; break; }
            }
        }
        return tx;
    },
	titpreSobre: function(fila) {
        var tx = undefined;
        var titulos = Object.keys(fila);
        for (var i = 0; i < titulos.length; i++) { //console.log(titulos[i]);
            var t = titulos[i].toString().toUpperCase().trim();
            if (t == "SOBRE") { tx = titulos[i]; break;}
        }
        if (tx == undefined) { //console.log("Revisa valores");
            for (var i = 0; i < titulos.length; i++) {
                var t = fila[titulos[i]].toString().toUpperCase().trim();
                if (t == "SOBRE") { tx = titulos[i]; break; }
            }
        }
        return tx;
    },
    dataPrediccion: function(jsonArray){
    	var BreakException = {};
		var contador = 0; //console.log(jsonArray);
        var anio, mes, tipo, estacion, latitud, longitud, bajo, normal, sobre;
/*                    //ELIMINA GeoCode ANTERIOR DEL USUARIO
                    pool.query("DELETE FROM  t_geocode_tmp_inv WHERE id_usr = $1;", [id_usr],
                        function(err, result) {
                            if (err) return console.error('Error Eliminando datos cordenada', err);
                        }
                    );	*/
        try {
            jsonArray.forEach(function(fila) {
                if (contador == 0) { //console.log(fila);
                    anio = data.titpreAnio(fila); //console.log("ColumnaX: "+longitud);
                    mes = data.titpreMes(fila);
                    tipo = data.titpreTipo(fila);
                    estacion = data.titpreEstacion(fila);
                    latitud = data.tituloY(fila);
                    longitud = data.tituloX(fila);
                    bajo = data.titpreBajo(fila);
                    normal = data.titpreNormal(fila);
                    sobre = data.titpreSobre(fila);	//console.log("ColumnaY: "+latitud);
                } else {
                    if (anio == undefined || mes == undefined || estacion == undefined || latitud == undefined || longitud == undefined || bajo == undefined || normal == undefined || sobre == undefined) throw BreakException;
                } //console.log(fila[longitud] + " " + fila[latitud]);
                if (fila[longitud] != null && fila[latitud] != null) { //console.log("inserta");
                    pool.query("INSERT INTO t_prediccion(anio,mes,tipo,estacion,longitud,latitud,bajo,normal,sobre) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9);", [fila[anio],fila[mes],fila[tipo],fila[estacion],fila[longitud].replace(",", "."), fila[latitud].replace(",", "."),fila[bajo].replace(",", "."),fila[normal].replace(",", "."),fila[sobre].replace(",", ".")],
                        function(err, result) {
                            if (err) return console.error('Error insertando Dato', err);
                            contador++;   
                            if(contador==jsonArray.length){
                            	
                            }                                    
                        }); //console.log(fila);
                }

            });
        } catch (e) {
            console.log(e);
            console.log("Archivo No Valido");
            if (e !== BreakException) throw e;
        }
        console.log("Json Archivo: " + moment().format('h:mm:s:SSSS'));
        console.log("------------------------------------------------");
    },
    leerArchivo: function(rutaArchivo, tema) {
        console.log(rutaArchivo + " " + tema);
        var converter = new Converter({
            constructResult: true,
            delimiter: ';',
            ignoreEmpty: true,
            checkColumn: true,
            noheader: false
        });
        converter.fromFile(rutaArchivo, function(err, jsonArray) {
            if (jsonArray != undefined) {
                if (jsonArray.length > 0) {
                	if(tema=="pre") data.dataPrediccion(jsonArray);

                }
            } else {
                console.log("No se pudo leer el archivo");
            }
        });
    }
};
var acceso={
	login:function(data){
		var dt=Func.Decrypted(data.aes);
		console.log(dt);
		var sql=' select id,nombre,perfil from public.t_usuario '+
			" where upper(usuario)=upper('"+dt.usr+"') and clave='"+dt.pas+"' and activo=1;";
		console.log(sql);	
		pool.query(sql,
            function(err, result) {
                if (err) {
                    return console.error('error running query', err);
                }               
                console.log(result.rows[0]);
                if(result.rows[0]){
		            var json=Func.Ecrypted(result.rows[0]);
		            
		            io.to(data.idSkt).emit('SetLoginUsuario', json);
                }else{
                	io.to(data.idSkt).emit('SetLoginUsuario', '');
                }
        });
	},
	CambioClave:function(data){
		var dt=Func.Decrypted(data.aes);
		console.log(dt);
		var sql='select id '+
		'from public.t_usuario '+
		"where id="+dt.id+" and clave='"+dt.pass+"' and activo=1 ";
		console.log(sql);	
		pool.query(sql,
         function(err, result) {
                if (err) {
                    return console.error('error running query', err);
                }               
                if(result.rows[0]){
                	var sql='update public.t_usuario '+
					" set clave='"+dt.pasnew+"' "+
					' where  id='+dt.id;
					console.log(sql);
					pool.query(sql,function(err, result) {
				    		var json=Func.Ecrypted({cambio:'ok'});    
		            		io.to(data.idSkt).emit('SetCambioUsuario', json);    	
				     });				    
                }else{
                	var json=Func.Ecrypted({cambio:'0'});
                	io.to(data.idSkt).emit('SetCambioUsuario', json);
                }
        });
	},
	getUsuarios:function(data){		//var dt=Func.Decrypted(data.aes);console.log(dt);
		var sql= "SELECT array_to_json(array_agg(d)) as datos FROM ( "+ 
					"SELECT COALESCE(row_to_json(t), '[]') as datos FROM "+
					"( " +
						"select u.id,u.nombre,usuario,u.clave,p.perfil,u.perfil id_perfil,activo id_activo,CASE WHEN (activo = 1) THEN 'Si' ELSE 'No' END AS activo "+
						"from t_usuario u inner join p_perfil p on u.perfil = p.id order by usuario"+
					")t"+
				")d";	//console.log(sql);
		pool.query(sql,
         function(err, res) {
                if (err) {
                    return console.error('error running query', err);
                }               
                io.to(data.idSkt).emit('Usrs', res.rows[0].datos);
        });
	},
	addUsuario:function(data){
		var dt=Func.Decrypted(data.aes);
		console.log(dt);
		var sql="INSERT INTO public.t_usuario (nombre,usuario,clave,activo,perfil) VALUES ('"+
		dt.nombre+"','"+dt.usuario+"','"+dt.clave+"','1','"+dt.perfil+"')";
		console.log(sql);	
		pool.query(sql,
         function(err, result) {
                if (err) {
					var json=Func.Ecrypted({resp:err});    
					io.to(data.idSkt).emit('setUsuarioResp', json);
                    return console.error('error running query', err);
                }               
				var json=Func.Ecrypted({resp:'ok'});    
				io.to(data.idSkt).emit('setUsuarioResp', json);
        });
	},
	updUsuario:function(data){
		var dt=Func.Decrypted(data.aes);
		console.log(dt);
		var sql="UPDATE public.t_usuario SET nombre='"+dt.nombre+"',usuario='"+dt.usuario+"',clave='"+dt.clave+"',activo='"+dt.activo+"',perfil='"+dt.perfil+"' WHERE id ='"+dt.id+"'";
		console.log(sql);	
		pool.query(sql,
         function(err, result) {
                if (err) {
					var json=Func.Ecrypted({resp:err});    
					io.to(data.idSkt).emit('updUsuarioResp', json);
                    return console.error('error running query', err);
                }               
				var json=Func.Ecrypted({resp:'ok'});    
				io.to(data.idSkt).emit('updUsuarioResp', json);
        });
	},
	delUsuario:function(data){
		var dt=Func.Decrypted(data.aes);
		console.log(dt);
		var sql="DELETE FROM public.t_usuario WHERE id ='"+dt.id+"'";
		console.log(sql);	
		pool.query(sql,
         function(err, result) {
                if (err) {
					var json=Func.Ecrypted({resp:err});    
					io.to(data.idSkt).emit('delUsuarioResp', json);
                    return console.error('error running query', err);
                }               
				var json=Func.Ecrypted({resp:'ok'});    
				io.to(data.idSkt).emit('delUsuarioResp', json);
        });
	}
};
var GeoCode={
	InitData:function(){
		app.use(express.static(path.join(__dirname, 'public')));

		app.get('/login', function(req, res) {
		    res.sendFile(path.join(__dirname, 'views/index.html'));
		});

		app.get('/', function(req, res) {
		    res.sendFile(path.join(__dirname, 'views/cargar_archivo.html'));
		});
		
		app.post('/upload/:tipo', function(req, res) {
				var tipo = req.params.tipo;
			    console.log("Tipo: " + tipo);
			
			    // create an incoming form object 
			    var form = new formidable.IncomingForm();
			    var rutaArchivo, nombreArchivo;
			
			    // specify that we want to allow the user to upload multiple files in a single request
			    form.multiples = true;
			
			    // store all uploads in the /uploads directory
			    form.uploadDir = path.join(__dirname, '/uploads');
			
			    // every time a file has been uploaded successfully,
			    // rename it to it's orignal name
			    form.on('file', function(field, file) {
			        fs.rename(file.path, path.join(form.uploadDir, file.name));
			        nombreArchivo = file.name;
			        rutaArchivo = path.join(form.uploadDir, nombreArchivo);
			    });
			
			    // log any errors that occur
			    form.on('error', function(err) {
			        console.log('An error has occured: \n' + err);
			    });
			
			    // once all the files have been uploaded, send a response to the client
			    form.on('end', function() {
			        res.end(nombreArchivo);
			        console.log(moment().format('h:mm:s:SSSS'));
			        setTimeout(function() {
			            data.leerArchivo(rutaArchivo, tipo);
			        }, 100);
			    });
			
			    // parse the incoming request containing the form data
			    form.parse(req); //console.log(form.parse(req));
			
		});

	},
	socket:[],
	InitSocket:function (){
		var _this=this;
		io.on('connection', function (sckt) {
		  console.log('conecta id');
		  console.log(sckt.id);
		  sckt.on('usuario', function (usr, fn) {
		    console.log(sckt.id);
		    fn(sckt.id);
		  });
		  sckt.on('LoginUsuario', function (data) {
		  	 console.log('LoginUsuario');
		     acceso.login(data);
		   });
		   
		   sckt.on('CambioPass', function (data) {
		  	 console.log('CambioPass');
		  	 console.log(data);
		     acceso.CambioClave(data);
		   });
		   
		   sckt.on('listaUsuario', function (data) {
		  	 console.log('listaUsuario');	//console.log(data);
		     acceso.getUsuarios(data);
		   });
		   
		   sckt.on('setUsuario', function (data) {
		  	 console.log('setUsuario');	console.log(data);
		     acceso.addUsuario(data);
		   });
		   
		   sckt.on('updUsuario', function (data) {
		  	 console.log('updUsuario');	console.log(data);
		     acceso.updUsuario(data);
		   });
		   
		   sckt.on('delUsuario', function (data) {
		  	 console.log('delUsuario');	console.log(data);
		     acceso.delUsuario(data);
		   });
		   
		});
	},
	Init:function(){
		this.InitData();
		this.InitSocket();	
	}	
};

GeoCode.Init();

