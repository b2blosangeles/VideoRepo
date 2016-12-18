var Nedb = require(env.root_path + '/package/nedb/node_modules/nedb');
var ytdl = require(env.root_path + '/package/ytdl-core/node_modules/ytdl-core');
var CP = new pkg.crowdProcess();


var dbc = {
	db: new Nedb({ filename:  env.space_path + '/_db/youtube_downloaded.db', autoload: true }),
	compact:function(callback) {
		var me = this;	
		me.db.persistence.persistCachedDatabase(function() {
		})
	}	
};

var _f = {};
_f['SP'] = function(cbk) {
	dbc.db.find({updated: {$lt : new Date().getTime() - 300000},  status:1}, function(err, docs0) {
		if ((docs0) && (docs0.length > 0)) {
			dbc.db.update({updated: {$lt : new Date().getTime() - 300000},  status:1},  {$set: {status:9}}, function(err, numReplaced) {  
				if (numReplaced > 0) {
					io.emit('SCALL', {t:'delete', list:docs0});
				}	
				cbk(numReplaced);
			 });
		} else {
			cbk(true);
		}
	});	
 };

_f['S0'] = function(cbk) {
	dbc.db.find({status:1}, function(err, docs) {  
		if (docs[0]) {
			CP.exit = true;
			cbk({error:'channel is busy with ' + docs[0]['vid'] + ' -- ' + docs[0]['updated']});
		} else {			
			cbk(true);
		}	
		
		
	 });	
 };	

_f['S1'] = function(cbk) {
	dbc.db.find({status:0}, function(err, docs) {  		
		if (!docs[0]) {
			CP.exit = true;
			cbk({error:'empty queue.'});
		} else {
			cbk(docs[0]);
		}	
	 });	
 };	




_f['S2'] = function(cbk) {
	var rec = CP.data.S1;
	if (!rec.haveInfo) {
		ytdl.getInfo('https://www.youtube.com/embed/'+rec.vid, {},  function(err, info){
			if (err) {
				CP.exit = true;
				dbc.db.update({vid :rec.vid}, {$set: {status:7, updated:new Date().getTime()}}, {multi: true}, function(err, numReplaced) {  
					io.emit('SCALL', {t:'err', rec:rec});
					cbk({error:err.message});	
				});			

			} else {
				var dt = {status:1, haveInfo:true, title:info.title, description:info.description, 
					  iurlhq:info.iurlhq, length:info.length_seconds,  updated:new Date().getTime()};
				// var dt = {title:info.title, haveInfo:true, description:info.description, iurlhq:info.iurlhq, length:info.length_seconds};

				dbc.db.update({vid :rec.vid}, 
					{$set: dt},   
					{multi: true}, function(err, numReplaced) { 
					io.emit('SCALL', {t:'success', rec:rec});
					cbk(dt);	
				});	
			}	

		});
	} else {
		cbk(false);
	}
	
};

_f['S3'] = function(cbk) {
	var rec = CP.data.S1;

	 var video = ytdl('https://www.youtube.com/embed/'+rec.vid);	

	var fs = require('fs');
	
	video.pipe(fs.createWriteStream(env.space_path + '/videos/' + rec.vid + '.mp4'));
	
	video.on('data', function(info) {	
		dbc.db.update({vid :rec.vid}, {$set: {status:1, updated:new Date().getTime()}}, {multi: true}, function(err, numReplaced) {  
			io.emit('SCALL', {t:'update', rec:rec});
		});
	}); 

	video.on('end', function() {
		dbc.db.update({vid :rec.vid}, {$set: {status:8, updated:new Date().getTime()}}, {multi: true}, function(err, numReplaced) {  
			io.emit('SCALL', {t:'success', rec:rec});
		});
		
	});	
		
	video.on('error', function() {
		dbc.db.update({vid :rec.vid}, {$set: {status:7, updated:new Date().getTime()}}, {multi: true}, function(err, numReplaced) {  
			io.emit('SCALL', {t:'err', rec:rec});
		});
		
	});
	cbk(true);	
};

_f['S4'] = function(cbk) {
	cbk(1);
};
CP.serial(
	_f,
	function(data) {
		res.send(data);
	},
	10000
);
return true;
