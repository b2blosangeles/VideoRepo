var opt = req.param('opt'), ret = {}, vid = req.param('vid');
var exec = require('child_process').exec;

var Nedb = require(env.root_path + '/package/nedb/node_modules/nedb');
var dbc = {
	db: new Nedb({ filename:  env.space_path + '/_db/youtube_downloaded.db', autoload: true }),
	insert:function(vid, callback) {
 		var me = this;
 		me.db.insert({vid : vid, status:0, defaultThumbnail:''}, callback);		
	},
	update:function(vid, v, callback) {
 		var me = this;
 		me.db.update({vid : vid}, { $set: v}, { multi: true }, function(err, numReplaced) {  
		    if (typeof callback == 'function') {
		    	callback(err, numReplaced);
		    }
		});		
	},
	remove:function(vid, callback) {
 		var me = this;
 		me.db.remove({vid : vid}, { multi: true }, function(err, numReplaced) {  
		    if (typeof callback == 'function') {
		    	callback(err, numReplaced);
		    }
		});		
	},
	compact:function(callback) {
		var me = this;	
		this.db.persistence.persistCachedDatabase(function() {
			if (typeof callback == 'function') {
				callback();
			}	 
		})
	}		
};

// --- Check if image exist on list
function handleImageExist(res, docs) {
	var CP = new pkg.crowdProcess();
	var fs = require('fs');
	var _f = {};
	for(d in docs) {
		_f[d] = (function(d) {
				return function(cbk) {
					fs.stat(env.space_path + '/thumbnail/' +docs[d].vid + '_0.png', function(err, stat) {
						if(err == null) {
							docs[d].doneImage = 1;    
						} else {
							docs[d].doneImage = 0;
						}
						cbk(docs[d].vid);
					});
				}
		})(d);	
	}

	CP.serial(
		_f,
		function(data) {
			res.send(docs);
		},
		100000
	);

}	



if (req.body.opt) {
	opt = req.body.opt;
}
if (req.body.vid) {
	vid = req.body.vid;
}

switch (opt) {
	case 'add':
		if (!vid) {
			res.send({error:'Missing vid'});
			return ture;
		}	
		dbc.db.find({vid : vid}, function(err, docs) {  
			var cnt = 0;
			if (!docs || !docs.length) {
				dbc.insert(vid);
				res.send({vid:vid});
			} else {
				res.send({error:'Existed vid ' + vid});
			}
		 });		
		break;
	case 'getList':
		dbc.db.find({status:8}, function(err, docs) {  
			res.send(docs);
		 });		
		break;	
	case 'getAll':
		dbc.db.find({status:{$ne:null}}, function(err, docs) {  
			handleImageExist(res, docs);
		 });		
		break;			
	case 'getScheduled':
		dbc.db.find({status:0}, function(err, docs) {  
			res.send(docs);
		 });		
		break;		
	case 'delete':
		if (!vid) {
			res.send({error:'Missing vid'});
			return ture;
		}
		
		dbc.remove((vid=='all')?{$ne: ''}:vid, function(err, docs) {  
			var VID;
			if (vid =='all') VID = '*';
			else VID = vid;
			var cmd = 'rm ' +  env.space_path + '/videos/' + VID + '.mp4; rm '+  env.space_path + '/thumbnail/' + VID + '_* .png';

			exec(cmd, function(error, stdout, stderr) {
				res.send({count:docs});
			});			
			
		});		
		break;	

	case 'compact':

		dbc.compact(function(err, docs) {  
			res.send({status:true});
		 });		
		break;	
		
	case 'updateDefaultThumbnail':
		var updated = new Date().getTime();
		dbc.update(vid, {defaultThumbnail:req.body.defaultThumbnail, updated:updated}, function(err, numReplaced){
			res.send({updated:updated});
		});
		break		

	case 'updateVideoRec':
		req.body.data.updated = new Date().getTime();
		dbc.update(vid, req.body.data, function(err, numReplaced){
			res.send({updated:req.body.data.updated});
		});
		break	
		
	default:
		res.send({error:'Incorrect opt'});
		//return ture;
}

