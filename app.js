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
		password: 'S0f1t3k_pg',
		database: 'fedearroz',
		host: 'sofytek.com.co',
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
    titAnio: function(fila) {
        var tx = undefined;
        var titulos = Object.keys(fila);
        for (var i = 0; i < titulos.length; i++) { //console.log(titulos[i]);
            var t = titulos[i].toString().toUpperCase().trim();
            if (t == "ANIO") { tx = titulos[i]; break;}
            if (t == "AÑO") { tx = titulos[i]; break;}
            if (t == "AGNO") { tx = titulos[i]; break;}
        }
        if (tx == undefined) { //console.log("Revisa valores");
            for (var i = 0; i < titulos.length; i++) {
                var t = fila[titulos[i]].toString().toUpperCase().trim();
                if (t == "ANIO") { tx = titulos[i]; break; }
                if (t == "AÑO") { tx = titulos[i]; break; }
                if (t == "AGNO") { tx = titulos[i]; break; }
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
	titCodepto: function(fila) {
        var tx = undefined;
        var titulos = Object.keys(fila);
        for (var i = 0; i < titulos.length; i++) { //console.log(titulos[i]);
            var t = titulos[i].toString().toUpperCase().trim();
            if (t == "COD_DEPTO") { tx = titulos[i]; break;}
            if (t == "CODDEPTO") { tx = titulos[i]; break;}
        }
        if (tx == undefined) { //console.log("Revisa valores");
            for (var i = 0; i < titulos.length; i++) {
                var t = fila[titulos[i]].toString().toUpperCase().trim();
                if (t == "COD_DEPTO") { tx = titulos[i]; break; }
                if (t == "CODDEPTO") { tx = titulos[i]; break; }
            }
        }
        return tx;
    },
	titDepartamento: function(fila) {
        var tx = undefined;
        var titulos = Object.keys(fila);
        for (var i = 0; i < titulos.length; i++) { //console.log(titulos[i]);
            var t = titulos[i].toString().toUpperCase().trim();
            if (t == "DEPTO") { tx = titulos[i]; break;}
            if (t == "DEPARTAMENTO") { tx = titulos[i]; break;}
        }
        if (tx == undefined) { //console.log("Revisa valores");
            for (var i = 0; i < titulos.length; i++) {
                var t = fila[titulos[i]].toString().toUpperCase().trim();
                if (t == "DEPTO") { tx = titulos[i]; break; }
                if (t == "DEPARTAMENTO") { tx = titulos[i]; break; }
            }
        }
        return tx;
    },
	titSemestre: function(fila) {
        var tx = undefined;
        var titulos = Object.keys(fila);
        for (var i = 0; i < titulos.length; i++) { //console.log(titulos[i]);
            var t = titulos[i].toString().toUpperCase().trim();
            if (t == "SEM") { tx = titulos[i]; break;}
            if (t == "SEMESTRE") { tx = titulos[i]; break;}
        }
        if (tx == undefined) { //console.log("Revisa valores");
            for (var i = 0; i < titulos.length; i++) {
                var t = fila[titulos[i]].toString().toUpperCase().trim();
                if (t == "SEM") { tx = titulos[i]; break; }
                if (t == "SEMESTRE") { tx = titulos[i]; break; }
            }
        }
        return tx;
    },
	titproRiegoSupHa: function(fila) {
        var tx = undefined;
        var titulos = Object.keys(fila);
        for (var i = 0; i < titulos.length; i++) { //console.log(titulos[i]);
            var t = titulos[i].toString().toUpperCase().trim();
            if (t == "RIEGO_SUPERFICIE_HA") { tx = titulos[i]; break;}
            if (t == "RIEGO SUPERFICIE HA") { tx = titulos[i]; break;}
        }
        if (tx == undefined) { //console.log("Revisa valores");
            for (var i = 0; i < titulos.length; i++) {
                var t = fila[titulos[i]].toString().toUpperCase().trim();
                if (t == "RIEGO_SUPERFICIE_HA") { tx = titulos[i]; break; }
                if (t == "RIEGO SUPERFICIE HA") { tx = titulos[i]; break; }
            }
        }
        return tx;
    },
	titproRiegoProT: function(fila) {
        var tx = undefined;
        var titulos = Object.keys(fila);
        for (var i = 0; i < titulos.length; i++) { //console.log(titulos[i]);
            var t = titulos[i].toString().toUpperCase().trim();
            if (t == "RIEGO_PRODUCCION_T") { tx = titulos[i]; break;}
            if (t == "RIEGO PRODUCCION T") { tx = titulos[i]; break;}
        }
        if (tx == undefined) { //console.log("Revisa valores");
            for (var i = 0; i < titulos.length; i++) {
                var t = fila[titulos[i]].toString().toUpperCase().trim();
                if (t == "RIEGO_PRODUCCION_T") { tx = titulos[i]; break; }
                if (t == "RIEGO PRODUCCION T") { tx = titulos[i]; break; }
            }
        }
        return tx;
    },
	titproRiegoRenTHa: function(fila) {
        var tx = undefined;
        var titulos = Object.keys(fila);
        for (var i = 0; i < titulos.length; i++) { //console.log(titulos[i]);
            var t = titulos[i].toString().toUpperCase().trim();
            if (t == "RIEGO_RENDIMIENTO_T_HA") { tx = titulos[i]; break;}
            if (t == "RIEGO RENDIMIENTO T HA") { tx = titulos[i]; break;}
        }
        if (tx == undefined) { //console.log("Revisa valores");
            for (var i = 0; i < titulos.length; i++) {
                var t = fila[titulos[i]].toString().toUpperCase().trim();
                if (t == "RIEGO_RENDIMIENTO_T_HA") { tx = titulos[i]; break; }
                if (t == "RIEGO RENDIMIENTO T HA") { tx = titulos[i]; break; }
            }
        }
        return tx;
    },
	titproRiegoRenMin: function(fila) {
        var tx = undefined;
        var titulos = Object.keys(fila);
        for (var i = 0; i < titulos.length; i++) { //console.log(titulos[i]);
            var t = titulos[i].toString().toUpperCase().trim();
            if (t == "RIEGO_RENDIMIENTO_MIN") { tx = titulos[i]; break;}
            if (t == "RIEGO RENDIMIENTO MIN") { tx = titulos[i]; break;}
        }
        if (tx == undefined) { //console.log("Revisa valores");
            for (var i = 0; i < titulos.length; i++) {
                var t = fila[titulos[i]].toString().toUpperCase().trim();
                if (t == "RIEGO_RENDIMIENTO_MIN") { tx = titulos[i]; break; }
                if (t == "RIEGO RENDIMIENTO MIN") { tx = titulos[i]; break; }
            }
        }
        return tx;
    },
	titproRiegoRenMax: function(fila) {
        var tx = undefined;
        var titulos = Object.keys(fila);
        for (var i = 0; i < titulos.length; i++) { //console.log(titulos[i]);
            var t = titulos[i].toString().toUpperCase().trim();
            if (t == "RIEGO_RENDIMIENTO_MAX") { tx = titulos[i]; break;}
            if (t == "RIEGO RENDIMIENTO MAX") { tx = titulos[i]; break;}
        }
        if (tx == undefined) { //console.log("Revisa valores");
            for (var i = 0; i < titulos.length; i++) {
                var t = fila[titulos[i]].toString().toUpperCase().trim();
                if (t == "RIEGO_RENDIMIENTO_MAX") { tx = titulos[i]; break; }
                if (t == "RIEGO RENDIMIENTO MAX") { tx = titulos[i]; break; }
            }
        }
        return tx;
    },
	titproSecanoSupHa: function(fila) {
        var tx = undefined;
        var titulos = Object.keys(fila);
        for (var i = 0; i < titulos.length; i++) { //console.log(titulos[i]);
            var t = titulos[i].toString().toUpperCase().trim();
            if (t == "SECANO_SUPERFICIE_HA") { tx = titulos[i]; break;}
            if (t == "SECANO SUPERFICIE HA") { tx = titulos[i]; break;}
        }
        if (tx == undefined) { //console.log("Revisa valores");
            for (var i = 0; i < titulos.length; i++) {
                var t = fila[titulos[i]].toString().toUpperCase().trim();
                if (t == "SECANO_SUPERFICIE_HA") { tx = titulos[i]; break; }
                if (t == "SECANO SUPERFICIE HA") { tx = titulos[i]; break; }
            }
        }
        return tx;
    },
	titproSecanoProT: function(fila) {
        var tx = undefined;
        var titulos = Object.keys(fila);
        for (var i = 0; i < titulos.length; i++) { //console.log(titulos[i]);
            var t = titulos[i].toString().toUpperCase().trim();
            if (t == "SECANO_PRODUCCION_T") { tx = titulos[i]; break;}
            if (t == "SECANO PRODUCCION T") { tx = titulos[i]; break;}
        }
        if (tx == undefined) { //console.log("Revisa valores");
            for (var i = 0; i < titulos.length; i++) {
                var t = fila[titulos[i]].toString().toUpperCase().trim();
                if (t == "SECANO_PRODUCCION_T") { tx = titulos[i]; break; }
                if (t == "SECANO PRODUCCION T") { tx = titulos[i]; break; }
            }
        }
        return tx;
    },
	titproSecanoRenTHa: function(fila) {
        var tx = undefined;
        var titulos = Object.keys(fila);
        for (var i = 0; i < titulos.length; i++) { //console.log(titulos[i]);
            var t = titulos[i].toString().toUpperCase().trim();
            if (t == "SECANO_RENDIMIENTO_T_HA") { tx = titulos[i]; break;}
            if (t == "SECANO RENDIMIENTO T HA") { tx = titulos[i]; break;}
        }
        if (tx == undefined) { //console.log("Revisa valores");
            for (var i = 0; i < titulos.length; i++) {
                var t = fila[titulos[i]].toString().toUpperCase().trim();
                if (t == "SECANO_RENDIMIENTO_T_HA") { tx = titulos[i]; break; }
                if (t == "SECANO RENDIMIENTO T HA") { tx = titulos[i]; break; }
            }
        }
        return tx;
    },
	titproSecanoRenMin: function(fila) {
        var tx = undefined;
        var titulos = Object.keys(fila);
        for (var i = 0; i < titulos.length; i++) { //console.log(titulos[i]);
            var t = titulos[i].toString().toUpperCase().trim();
            if (t == "SECANO_RENDIMIENTO_MIN") { tx = titulos[i]; break;}
            if (t == "SECANO RENDIMIENTO MIN") { tx = titulos[i]; break;}
        }
        if (tx == undefined) { //console.log("Revisa valores");
            for (var i = 0; i < titulos.length; i++) {
                var t = fila[titulos[i]].toString().toUpperCase().trim();
                if (t == "SECANO_RENDIMIENTO_MIN") { tx = titulos[i]; break; }
                if (t == "SECANO RENDIMIENTO MIN") { tx = titulos[i]; break; }
            }
        }
        return tx;
    },
	titproSecanoRenMax: function(fila) {
        var tx = undefined;
        var titulos = Object.keys(fila);
        for (var i = 0; i < titulos.length; i++) { //console.log(titulos[i]);
            var t = titulos[i].toString().toUpperCase().trim();
            if (t == "SECANO_RENDIMIENTO_MAX") { tx = titulos[i]; break;}
            if (t == "SECANO RENDIMIENTO MAX") { tx = titulos[i]; break;}
        }
        if (tx == undefined) { //console.log("Revisa valores");
            for (var i = 0; i < titulos.length; i++) {
                var t = fila[titulos[i]].toString().toUpperCase().trim();
                if (t == "SECANO_RENDIMIENTO_MAX") { tx = titulos[i]; break; }
                if (t == "SECANO RENDIMIENTO MAX") { tx = titulos[i]; break; }
            }
        }
        return tx;
    },
    dataPrediccion: function(jsonArray,idCliente){
    	var BreakException = {};
		var contador = 0; //console.log(jsonArray);
        var anio, mes, tipo, estacion, latitud, longitud, bajo, normal, sobre;
        try {	console.log(contador);
            jsonArray.forEach(function(fila) { 
                if (contador == 0) { //console.log(fila);
                    anio = data.titAnio(fila); //console.log("ColumnaX: "+longitud);
                    mes = data.titpreMes(fila);
                    tipo = data.titpreTipo(fila);
                    estacion = data.titpreEstacion(fila);
                    latitud = data.tituloY(fila);
                    longitud = data.tituloX(fila);
                    bajo = data.titpreBajo(fila);
                    normal = data.titpreNormal(fila);
                    sobre = data.titpreSobre(fila);	//console.log("ColumnaY: "+latitud);
                }
                if (anio == undefined || mes == undefined || estacion == undefined || latitud == undefined || longitud == undefined || bajo == undefined || normal == undefined || sobre == undefined) throw BreakException;
                contador++;
                if (fila[anio] != null && fila[mes] != null && fila[estacion] != null && fila[longitud] != null && fila[latitud] != null && fila[bajo] != null && fila[normal] != null  && fila[sobre] != null) { //console.log("inserta");
                    pool.query("INSERT INTO t_prediccion(anio,mes,tipo,estacion,longitud,latitud,bajo,normal,sobre) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9);", [fila[anio],fila[mes],fila[tipo],fila[estacion],fila[longitud].replace(",", "."), fila[latitud].replace(",", "."),fila[bajo].replace(",", "."),fila[normal].replace(",", "."),fila[sobre].replace(",", ".")],
                        function(err, result) {
                            if (err) return console.error('Error insertando Dato', err);
                        }); //console.log(fila);
                }
                if(contador==jsonArray.length){
            		io.to(idCliente).emit('srvCargarchivo', "Carga de información exitosa!");    	
                }
            });
        } catch (e) {
            console.log(e);
            io.to(idCliente).emit('srvCargarchivo', "Formato No Valido");
            console.log("Formato No Valido");
            if (e !== BreakException) throw e;
        }
        console.log("Json Archivo: " + moment().format('h:mm:s:SSSS'));
        console.log("------------------------------------------------");
    },
    dataProduccion: function(jsonArray,idCliente){ console.log("dataProduccion");
    	var BreakException = {};
		var contador = 0; //console.log(jsonArray);
        var cod_depto,departamento,agno,semestre,riego_superficie_ha,riego_produccion_t,riego_rendimiento_t_ha,riego_rendimiento_min,riego_rendimiento_max,
        		secano_superficie_ha,secano_produccion_t,secano_rendimiento_t_ha,secano_rendimiento_min,secano_rendimiento_max;
        try {	console.log(contador);
            jsonArray.forEach(function(fila) { 
                if (contador == 0) { //console.log(fila);
                    cod_depto = data.titCodepto(fila); //console.log("ColumnaX: "+longitud);
                    departamento = data.titDepartamento(fila);
                    agno = data.titAnio(fila);
                    semestre = data.titSemestre(fila);
                    riego_superficie_ha = data.titproRiegoSupHa(fila);
                    riego_produccion_t = data.titproRiegoProT(fila);
                    riego_rendimiento_t_ha = data.titproRiegoRenTHa(fila);
                    riego_rendimiento_min = data.titproRiegoRenMin(fila);
                    riego_rendimiento_max = data.titproRiegoRenMax(fila);	//console.log("ColumnaY: "+latitud);
                    secano_superficie_ha = data.titproSecanoSupHa(fila);
                    secano_produccion_t = data.titproSecanoProT(fila);
                    secano_rendimiento_t_ha = data.titproSecanoRenTHa(fila);
                    secano_rendimiento_min = data.titproSecanoRenMin(fila);
                    secano_rendimiento_max = data.titproSecanoRenMax(fila);	//console.log("ColumnaY: "+latitud);
                }
                if (cod_depto == undefined || departamento == undefined || agno == undefined || semestre == undefined || riego_superficie_ha == undefined || riego_produccion_t == undefined || riego_rendimiento_t_ha == undefined || riego_rendimiento_min == undefined || riego_rendimiento_max == undefined || secano_superficie_ha == undefined || secano_produccion_t == undefined || secano_rendimiento_t_ha == undefined || secano_rendimiento_min == undefined || secano_rendimiento_max == undefined) throw BreakException;
                contador++;
                if (fila[cod_depto] != null && fila[departamento] != null && fila[agno] != null && fila[semestre] != null) { console.log("inserta: " + fila[riego_superficie_ha]);
                    pool.query("INSERT INTO t_produccion(cod_depto, departamento, agno, semestre, riego_superficie_ha, riego_produccion_t, riego_rendimiento_t_ha, riego_rendimiento_min, riego_rendimiento_max,secano_superficie_ha, secano_produccion_t, secano_rendimiento_t_ha, secano_rendimiento_min, secano_rendimiento_max) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14);", 
                    [fila[cod_depto],fila[departamento],fila[agno],fila[semestre],fila[riego_superficie_ha].toString().replace(",", "."), fila[riego_produccion_t].toString().replace(",", "."),fila[riego_rendimiento_t_ha].toString().replace(",", "."),fila[riego_rendimiento_min].toString().replace(",", "."),fila[riego_rendimiento_max].toString().replace(",", "."),fila[secano_superficie_ha].toString().replace(",", "."), fila[secano_produccion_t].toString().replace(",", "."),fila[secano_rendimiento_t_ha].toString().replace(",", "."),fila[secano_rendimiento_min].toString().replace(",", "."),fila[secano_rendimiento_max].toString().replace(",", ".")],
                        function(err, result) {
                            if (err) return console.error('Error insertando Dato', err);
                        }); //console.log(fila);
                }
                if(contador==jsonArray.length){
            		io.to(idCliente).emit('srvCargarchivo', "Carga de información exitosa!");    	
                }
            });
        } catch (e) {
            console.log(e);
            io.to(idCliente).emit('srvCargarchivo', "Formato No Valido");
            console.log("Formato No Valido");
            if (e !== BreakException) throw e;
        }
        console.log("Json Archivo: " + moment().format('h:mm:s:SSSS'));
        console.log("------------------------------------------------");
    },
    leerArchivo: function(rutaArchivo, tema, idCliente) {
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
                	if(tema=="pre") data.dataPrediccion(jsonArray,idCliente);
                	if(tema=="pro") data.dataProduccion(jsonArray,idCliente);
                }
            } else {
                console.log("No se pudo leer el archivo");
                io.to(idCliente).emit('srvCargarchivo', "No se pudo leer el archivo");
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
		
		app.post('/upload/:tipo/:idCliente', function(req, res) {
				var tipo = req.params.tipo;
				var idCliente = req.params.idCliente;
			    console.log("Tipo: " + tipo);
			    console.log("idCliente: " + idCliente);
			
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
			            data.leerArchivo(rutaArchivo, tipo, idCliente);
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

