/**
 * GIcon manager for GMap.
 *
 * Required for markers to operate properly.
 */
/* $Id$ */

/**
 * Get the GIcon corresponding to a setname / sequence.
 * There is only one GIcon for each slot in the sequence.
 * The marker set wraps around when reaching the end of the sequence.
 * @@@ TODO: Move this directly into the preparemarker event binding.
 */
Drupal.gmap.getIcon = function(setname, sequence) {
  var sequences = [];
  var gicons;
  var othimg = ['printImage','mozPrintImage','printShadow','transparent'];
  // If no setname, return google's default icon.
  if (!setname) {
    return G_DEFAULT_ICON;
  }
  // If no sequence, synthesise one.
  if (!sequence) {
    if (!sequences[setname]) {
      sequences[setname] = -1;
    }
    sequences[setname]++;
    sequence = sequences[setname];
  }

  if (!this.gicons) {
    this.gicons = {};
  }
  if (!this.gicons[setname]) {
    if (!Drupal.gmap.icons[setname]) {
      alert('Request for invalid marker set '+setname+'!');
    }
    this.gicons[setname] = [];
    var q = Drupal.gmap.icons[setname];
    for (var i=0; i<q.sequence.length; i++) {
      var t = new GIcon();
      var p = Drupal.gmap.iconpath + q.path;
      t.image = p + q.sequence[i].f;
      if ((typeof(q.shadow)!='string') && (q.shadow.f != '')) {
        t.shadow = p + q.shadow.f;
        t.shadowSize = new GSize(q.shadow.w, q.shadow.h);
      }
      t.iconSize = new GSize(q.sequence[i].w,q.sequence[i].h);
      t.iconAnchor = new GPoint(q.anchorX, q.anchorY);
      t.infoWindowAnchor = new GPoint(q.infoX, q.infoY);
      for (var j=0; j<othimg.length; j++) {
        if ((typeof(q[othimg[j]])=='string') && (q[othimg[j]] != '')) {
          t[othimg[j]] = p + q[othimg[j]];
        }
      }
      // @@@ imageMap?
      this.gicons[setname][i] = t;
    }
    delete q;
    delete Drupal.gmap.icons[setname];
  }
  // TODO: Random, other cycle methods.
  return this.gicons[setname][sequence % this.gicons[setname].length];
};

/**
 * JSON callback to set up the icon defs.
 * When doing the JSON call, the data comes back in a packed format.
 * We need to expand it and file it away in a more useful format.
 */
Drupal.gmap.iconSetup = function(json) {
  Drupal.gmap.icons = {};
  var rootpath = json.path;
  Drupal.gmap.iconpath = rootpath;
  for (var path in json.markers) {
    // Reconstitute files array
    var filef = json.markers[path].f;
    var filew = Drupal.gmap.expandArray(json.markers[path].w,filef.length);
    var fileh = Drupal.gmap.expandArray(json.markers[path].h,filef.length);
    var files = [];
    for (var i = 0; i < filef.length; i++) {
      files[i] = {f : filef[i], w : filew[i], h : fileh[i]};
    }
    delete filef;
    delete filew;
    delete fileh;

    for (ini in json.markers[path].i) {
      jQuery.extend(Drupal.gmap.icons,Drupal.gmap.expandIconDef(json.markers[path].i[ini],path,files));
    }
  }
  // Tell everyone marker icons are ready
  Drupal.gmap.globalChange('iconsready');
};

/**
 * Expand a compressed array.
 * This will pad arr up to len using the last value of the old array.
 */
Drupal.gmap.expandArray = function(arr,len) {
  var d = arr[0];
  for (var i=0; i<len; i++) {
    if (!arr[i]) {
      arr[i] = d;
    }
    else {
      d = arr[i];
    }
  }
  return arr;
};

/**
 * Expand icon definition.
 * This helper function is the reverse of the packer function found in
 * gmap_markerinfo.inc.
 */
Drupal.gmap.expandIconDef = function(c,path,files) {
  var decomp = ['key','name','sequence','anchorX','anchorY','infoX','infoY','shadow',
    'printImage','mozPrintImage','printShadow','transparent'];
  var fallback = ['','',[],0,0,0,0,'','','','',''];
  var imagerep = ['shadow','printImage','mozPrintImage','printShadow','transparent'];
  var defaults = {};
  var sets = [];
  var i, j;
  // Part 1: Defaults / Markersets
  // Expand arrays and fill in missing ones with fallbacks
  for (i = 0; i < decomp.length; i++) {
    if (!c[0][i]) {
      c[0][i] = [ fallback[i] ];
    }
    c[0][i] = Drupal.gmap.expandArray(c[0][i],c[0][0].length);
  }
  for (i = 0; i < c[0][0].length; i++) {
    for (j = 0; j < decomp.length; j++) {
      if (i == 0) {
        defaults[decomp[j]] = c[0][j][i];
      }
      else {
        if (!sets[i-1]) {
          sets[i-1] = {};
        }
        sets[i-1][decomp[j]] = c[0][j][i];
      }
    }
  }
  for (i = 0; i < sets.length; i++) {
    for (j = 0; j < decomp.length; j++) {
      if (sets[i][decomp[j]] == fallback[j]) {
        sets[i][decomp[j]] = defaults[decomp[j]];
      }
    }
  }
  var icons = {};
  for (i = 0; i < sets.length; i++) {
    var key = sets[i].key;
    icons[key] = sets[i];
    icons[key].path = path;
    delete icons[key].key;
    delete sets[i];
    for (j = 0; j < icons[key].sequence.length; j++) {
      icons[key].sequence[j] = files[icons[key].sequence[j]];
    }
    for (j = 0; j < imagerep.length; j++) {
      if (typeof(icons[key][imagerep[j]])=='number') {
        icons[key][imagerep[j]] = files[icons[key][imagerep[j]]];
      }
    }
  }
  return icons;
};

/**
 * We attach ourselves if we find a map somewhere needing markers.
 * Note: Since we broadcast our ready event to all maps, it doesn't
 * matter which one we attached to!
 */
Drupal.gmap.addHandler('gmap', function(elem) {
  var obj = this;
  var attached;
  // Only attach once.
  if (!this.attached) {
    // If all maps on the page are doing their own thing regarding icons,
    // we just skip attaching.
    if (!obj.vars.behavior.customicons) {
      this.attached = true;
      // We'll start our query in the background during init.
      obj.bind("init", function() {
        $.getJSON(Drupal.gmap.querypath + '/markers', Drupal.gmap.iconSetup);
      });
    }
  }

  if (!obj.vars.behavior.customicons) {
    // Provide icons to markers.
    obj.bind('preparemarker', function(marker) {
      marker.opts.icon = Drupal.gmap.getIcon(marker.markername,marker.offset);
    });
  }

});
