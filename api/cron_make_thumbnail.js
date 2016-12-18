var Nedb = require(env.root_path + '/package/nedb/node_modules/nedb');
var ytdl = require(env.root_path + '/package/ytdl-core/node_modules/ytdl-core');
var CP = new pkg.crowdProcess();
var exec = require('child_process').exec;



function toHHMMSS(seconds) {
    var h, m, s, result='';
    // HOURs
    h = Math.floor(seconds/3600);
    seconds -= h*3600;
    //if(h){
        result = h<10 ? '0'+h+':' : h+':';
    //}
    // MINUTEs
    m = Math.floor(seconds/60);
    seconds -= m*60;
    result += m<10 ? '0'+m+':' : m+':';
    // SECONDs
    s=seconds%60;
    result += s<10 ? '0'+s : s;
    return result;
}

var dbc = {
	db: new Nedb({ filename:  env.space_path + '/_db/youtube_downloaded.db', autoload: true }),
	compact:function(callback) {
		var me = this;	
		me.db.persistence.persistCachedDatabase(function() {
		//	callback();
		})
	}	
};


function buildFunctionItem(rec) { 
	var VID = rec.vid;
	var length =  parseInt(rec.length);
	return function(cbk) {	
		var CT = new pkg.crowdProcess();
		var _T = [];
		
		var total = 60;

		for (var j = 0; j < total; j++) {
			_T[j] = (function(j) {
				return  function(cbk) {
					var fs = require('fs');
					
					fs.stat(env.space_path + '/thumbnail/' + VID + '_' + j + '.png', function(err, stat) {
						    if(err == null) {
							cbk( env.space_path + '/thumbnail/' + VID + '_' + j + '.png' + ' processed !');
						    } else {
							var cmd = 'ffmpeg -ss ' + 
							toHHMMSS( Math.floor(j * length  / total) ) + ' -i ' + env.space_path + '/videos/' + 
							    VID + '.mp4 -y -s 245x144 -vframes 1 -f image2 ' +
							env.space_path + '/thumbnail/' + VID + '_' + j + '.png';

							exec(cmd, function(error, stdout, stderr) {
							    if (error !== null) {
								cbk('exec error: ' +  error);	
							    } else {
								cbk(env.space_path + '/thumbnail/' + VID + '_' + j + '.png');	

							    }
							});
						}
						
					});
				}	
			})(j);

		}	

		CT.serial(
			_T,
			function(data) {
				cbk(data);
			},
			100000
		);	
	}	
 };	

function updateDBStatus(rec) { 
	var VID = rec.vid;
	var length =  parseInt(rec.length);
	return function(cbk) {	
		dbc.db.update({thumbnail: {$ne : 1},  vid:VID},  {$set: {thumbnail:1}}, function(err, numReplaced) {  
			cbk(numReplaced);
		 });	
	}	
 };	

dbc.db.find({status:8, thumbnail: {$ne : 1}}, function(err, docs) {  		
	if (!docs[0]) {
		res.send({error:'empty queue.'});
	} else {
		var _f = {};
		for (var i = 0; i < docs.length; i++) {
			_f[i] = buildFunctionItem(docs[i]);
			_f['DBUPDATE_'+i] = updateDBStatus(docs[i]);
		}
		CP.serial(
			_f,
			function(data) {
				res.send(data);
				io.emit('SCALL', {t:'success', list:docs});
			},
			100000
		);
	}	
 });

return true;
