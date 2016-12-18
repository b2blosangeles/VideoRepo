var videoname = req.param('vid');
if (!req.param('vid')) {
	res.send('Missing vid');
	return ture;
}	
var fn = env.space_path + '/videos/' + videoname;


  var fs = require('fs');
  fs.stat(fn, function(err, data) {
    if (err) 
      res.send('it does not exist');
    else {
      var total = data.size;

      var range = req.headers.range;
      if (range) {
      
        var parts = range.replace(/bytes=/, "").split("-");
        var partialstart = parts[0];
        var partialend = parts[1];
      
      
        var start = parseInt(partialstart, 10);
        var end = partialend ? parseInt(partialend, 10) : total-1;
        var chunksize = (end-start)+1;
    
        var file = fs.createReadStream(fn, {start: start, end: end});
        res.writeHead(206, { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': 'video/mp4' });
        file.pipe(res);
      } else {
     
     //   console.log('ALL: ' + total);
    //    res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'video/mp4' });
    //    fs.createReadStream(fn).pipe(res);
        res.send('Need streaming player');
      }

    }
  });

