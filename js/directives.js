app.filter('cut', function () {
        return function (value, wordwise, max, tail) {
		
	    if (!value) return '';
	    value = value.replace(/([^\s]+)/g, 
		function myFunction(x){
		    if (x.length > 30) {
		    	return x.replace(/\./g, ' ').replace(/\,/g, ', ');
	    		} else {
				return x;
			}
	    	});	
		
            max = parseInt(max, 10);
            if (!max) return value;
            if (value.length <= max) return value;

            value = value.substr(0, max);
            if (wordwise) {
                var lastspace = value.lastIndexOf(' ');
                if (lastspace != -1) {
                  //Also remove . and , so its gives a cleaner result.
                  if (value.charAt(lastspace-1) == '.' || value.charAt(lastspace-1) == ',') {
                    lastspace = lastspace - 1;
                  }
                  value = value.substr(0, lastspace);
                }
            }

            return value + (tail || ' …');
        };
});

app.filter('range', function() {
  return function(input, total) {
    total = parseInt(total);
    for (var i=0; i<total; i++)
      input.push(i);
    return input;
  };
});

app.directive('itemList', function() {
    return {
	restrict:'E',    
        template:_TPL_['view/item_list.html']
    };
}); 
app.directive('itemListIcons', function() {
    return {
	restrict:'E',    
        template:_TPL_['view/item_list_icons.html']
    };
}); 
app.directive('adminItem', function() {
    return {
	restrict:'E',    
        template:_TPL_['view/item_admin.html']
    };
}); 

app.directive('topSection', function() {
    return {
	restrict:'E',    
        template:_TPL_['view/top_section.html']
    };
}); 

app.directive('mainFrame', function() {
    return {
	restrict:'E',    
        template:_TPL_['view/main_frame.html']
    };
}); 

app.directive('itemMainVideo', function() {
    return {
	restrict:'E',    
        template:_TPL_['view/item_main_video.html']
    };
}); 

app.directive('itemAdminLoadingStatus', function() {
    return {
	restrict:'E',    
        template:_TPL_['view/item_admin_loading_status.html']
    };
}); 

app.directive('adminModalObject', function() {
    return {
	restrict:'E',    
        template:_TPL_['view/admin/modal_object.html']
    };
}); 

app.directive('adminDefaultImage', function() {
    return {
	restrict:'E',    
        template:_TPL_['view/admin/default_image.html']
    };
}); 

app.directive('adminEditor', function() {
    return {
	restrict:'E',    
        template:_TPL_['view/admin/editor.html']
    };
}); 

app.directive('adminMasterBox', function() {
    return {
	restrict:'E',    
        template:_TPL_['view/admin/master_box.html']
    };
}); 