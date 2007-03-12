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
          for (j=0;j<items.length;j++) {
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

            marker = {};
            marker.opts = {};
            marker.opts.title = f('title');
            marker.description = f('description');
            marker.latitude = f('lat','geo') || f('latitude','geourl') || f('latitude','icbm');
            marker.longitude = f('lon','geo') || f('longitude','geourl') || f('longitude','icbm');
            marker.markername = feed.markername;
            marker.offset = offset;
            offset++;
            alert(dump(marker));
            // Pass around the object, bindings can change it if necessary.
            obj.change('preparemarker',-1,marker);
            // And add it.
            obj.change('addmarker',-1,marker);
          };
        });
      }
    });
  }
});
/*

              marker.markername = feed.markername;
              marker.offset = offset;
              offset++;
              alert(dump(marker));
              // Pass around the object, bindings can change it if necessary.
              obj.change('preparemarker',-1,marker);
              // And add it.
              obj.change('addmarker',-1,marker);

            });
              
            //alert($('/rss/channel/item',data).text());
            //alert(data);
          }
        }); */
/*      for (i=0; i<obj.vars.markers.length; i++) {
        marker = obj.vars.markers[i];
        if(!marker.opts) marker.opts = {};
        // @@@ Geocoding? General stuff?
        // Sorted. JS objects are by reference.
        // Pass around the object, bindings can change it if necessary.
        obj.change('preparemarker',-1,marker);
        // And add it.
        obj.change('addmarker',-1,marker); */
/*      }
    });
  }
});
*/



function createMarkerFromRSS(item,icon) {
  var title = item.getElementsByTagName("title")[0].childNodes[0].nodeValue;

  var description = item.getElementsByTagName("description")[0].childNodes[0].nodeValue;
  var link = item.getElementsByTagName("link")[0].childNodes[0].nodeValue;

  //SC Good practice is not to have to check for which browser - so just use specified NS in all cases
  if (navigator.userAgent.toLowerCase().indexOf("msie") < 0) {
    //SC   Non IE specific code (uses spec in MZ)
    if (item.getElementsByTagName("lat").length>0) {
      item.getElementsByTagName("lat")[0].normalize();
      if (item.getElementsByTagName("lat")[0].hasChildNodes()) {
        var lat = item.getElementsByTagName("lat")[0].childNodes[0].nodeValue;
        var lng = item.getElementsByTagName("long")[0].childNodes[0].nodeValue;
      }
    } else {
          if (item.getElementsByTagName("latitude").length>0) {
        item.getElementsByTagName("latitude")[0].normalize();
        if (item.getElementsByTagName("latitude")[0].hasChildNodes()) {
          var lat = item.getElementsByTagName("latitude")[0].childNodes[0].nodeValue;
          var lng = item.getElementsByTagName("longitude")[0].childNodes[0].nodeValue;
        }
      }
    }
  } else {
//SC  IE specific code - has to have specified NS in tagname wont work in MZ code
//SC  When checking for presence or NULL - IE considers .length attribute false
//SC   used active check like hasChildNodes
    if (null != item.getElementsByTagName("geourl:latitude")) {
//SC  The normalise function is not available (I think?) to IE so needs to be extracted
      var lat = item.getElementsByTagName("geourl:latitude")[0].childNodes[0].nodeValue;
      var lng = item.getElementsByTagName("geourl:longitude")[0].childNodes[0].nodeValue;
    } else {
      if (null != item.getElementsByTagName("icbm:latitude")) {
        var lat = item.getElementsByTagName("icbm:latitude")[0].childNodes[0].nodeValue;
        var lng = item.getElementsByTagName("icbm:longitude")[0].childNodes[0].nodeValue;
      } else {
        if (null != item.getElementsByTagName("geo:lat")) {
          //SC Be aware that with responseText it is likely that corrupted tags will
          // get through and you end up with badly formed numbers. As I suspect can happen here. 
          // thats why I left the geo tag til last - as that is still up in the air.
          var lat = item.getElementsByTagName("geo:lat")[0].childNodes[0].nodeValue;
          var lng = item.getElementsByTagName("geo:long")[0].childNodes[0].nodeValue;     
        }
      }
    }
  }
//SC  Finally we have it all to go ahead - we could concatenate HTML from description later.
  var point = new GLatLng(parseFloat(lat), parseFloat(lng));
  var html = "<a href=\"" + link + "\">" + title + "</a>";
  var marker=createGMarker(point, html, icon, title, link);

return marker;
}

function parseGeoRSS(map, rssurl,icon) {

  var request = GXmlHttp.create();
  request.open("GET", rssurl, true);
  request.onreadystatechange = function() {
    if (request.readyState == 4) {
//SC    var xmlDoc = request.responseXML;       IE does not respond to responseXML if not good
//SC                                              Google suggest their own interface for this
      var xmlDoc = GXml.parse(request.responseText);
//SC    var items = xmlDoc.documentElement.getElementsByTagName("item");    IE considers the
//SC                                                                        documentElement false
      var items = xmlDoc.getElementsByTagName("item");    
      for (var i = 0; i < items.length; i++) {
   
        var marker = createMarkerFromRSS(items[i], icon);
        map.addOverlay(marker);
      }

    }
  }
  request.send(null);
}