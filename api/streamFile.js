var filename = req.param('file');
if (!req.param('file')) {
	res.send('Missing file');
	return ture;
}	
var fn = env.space_path + '/thumbnail/' + filename;
  var fs = require('fs');
  fs.stat(fn, function(err, data) {
    if (err) 
      res.send('it does not exist');
    else {
        var file = fs.createReadStream(fn);
        file.pipe(res);
    }
  });
