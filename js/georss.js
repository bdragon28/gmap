/* $Id$ */

/**
 * GeoRSS reader
 */

// Bind to gmaps
Drupal.gmap.prototype.handler.gmap.push(function(elem) {
  var obj = this;

  obj.bind('init',function() {
    //@@@ hack
    obj.vars.feeds = [];
    obj.vars.feeds.push("http://crcp-blogger.mit.edu/geoblogger/rss.php");
    // Found feeds
    if (obj.vars.feeds && obj.vars.feeds.length>0) {
   try {
    netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
   } catch (e) {
    alert("Permission UniversalBrowserRead denied.");
   }

      // @@@ locking?
      for(var i=0;i<obj.vars.feeds.length;i++) {
        $.ajax({
          type: 'GET',
          url: obj.vars.feeds[i],
          dataType: 'xml',
          success: function(data) {
            alert('success');
          }
        });
      }
    }
  });
});
