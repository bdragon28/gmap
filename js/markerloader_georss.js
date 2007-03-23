/**
 * GMap Marker Loader
 * GeoRSS markers.
 * This doesn't work at the moment.
 */
/* $Id$ */

Drupal.gmap.addHandler('gmap', function(elem) {
  var obj = this;
  var feed, i, j, marker;
  if (obj.vars.feed) {
    // Inject markers as soon as the icon loader is ready.
    obj.bind('iconsready',function() {
      for (i=0; i<obj.vars.feed.length; i++) {
        feed = obj.vars.feed[i];
        
        // This sucks, but jQuery and IE don't get along here.
        GDownloadUrl(feed.url, function(data, responseCode) {
          var xml = GXml.parse(data);
          var offset = 0;
          var items = xml.getElementsByTagName('item');
          // Ugly.
          var f = function(name,ns) {
            var item = items[j].getElementsByTagName(name);
            if (item.length<1) {
              // Try again with prefix.
              if (ns) {
                item = items[j].getElementsByTagName(ns+':'+name);
              }
              else {
                return false;
              }
            }
            if (item.length>0) {
              return item[0].firstChild.nodeValue;
            }
            else {
              return false;
            }
          };

          for (j=0;j<items.length;j++) {
            marker = {};
            marker.opts = {};
            marker.opts.title = f('title');
            if (obj.vars.markermode == 0) {
              marker.text = f('description');
            }
            else {
              marker.link = f('link');
            }
            marker.latitude = f('lat','geo') || f('latitude','geourl') || f('latitude','icbm');
            marker.longitude = f('lon','geo') || f('longitude','geourl') || f('longitude','icbm');
            marker.markername = feed.markername;
            marker.offset = offset;
            offset++;
            // Pass around the object, bindings can change it if necessary.
            obj.change('preparemarker',-1,marker);
            // And add it.
            obj.change('addmarker',-1,marker);
          };
        });
      }
      obj.change('markersready',-1);
    });
  }
});
