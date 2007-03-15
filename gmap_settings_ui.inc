<?php
/* $Id$ */
// vim:set ft=php:

function _gmap_admin_settings() {
  //note the same google api key variable name as in the googlemap module is used
  //note the name of the variable for center of the map is latlong although the format is actually longitude, latitude

  $form['initialization'] = array(
    '#type' => 'fieldset',
    '#title' => t('Google Map Initialize'),
    '#description' => t('Note about Drupal 5 version: Shaded out controls are controls for unfinished features that existed in the 4.7 version.'),
  );
  $form['initialization']['googlemap_api_key'] = array(
    '#type' => 'textfield', 
    '#title' => t('Google map API key'),
    '#default_value' => variable_get('googlemap_api_key', ''), 
    '#size' => 50, 
    '#maxlength' => 255,
    '#description' => t('Your personal Googlemaps API key.  You must get this for each separate website at <a href="http://www.google.com/apis/maps/">Google Map API website</a>.'),
  );
  $form['initialization']['gmap_method'] = array(
    '#type' => 'select',
    '#disabled' => TRUE,
    '#title' => t('Google map method'),
    '#options'=> array('Static'=>t('Static'), 'Dynamic'=>t('Dynamic'), 'None'=>t('None')),
    '#default_value' => GMAP_LOAD_METHOD,
    '#description' => t('How is the Google Map initialization script run:<br /><strong>Static</strong> - Loaded on every page, <br /><strong>Dynamic</strong> - Initialization script runs only on pages with google maps, but all pages with the gmap filter will not be cached. <br /><strong>None</strong> - Google map initialization script must be loaded some other way.'),
  );
  $form['initialization']['gmap_wms'] = array(
    '#type' => 'checkbox',
    '#title' => t('Enable wms features'),
    '#disabled' => TRUE, //@@@
    '#default_value' => GMAP_WMS,
    '#description' => t('Enables the wms features.  This allows you to use overlays that are defined using wms.  The wms-gs.js (or other acceptable version) must be installed in the gmap directory.'),
  );
  $form['initialization']['gmap_load_zoom_plugin'] = array(
    '#type' => 'checkbox',
    '#title' => t('Enable mousewheel zooming'),
    '#default_value' => variable_get('gmap_load_zoom_plugin',TRUE),
    '#description' => t('Enables the mousewheel.js jQuery plugin, which adds the ability to use the mouse wheel to zoom the map.'),
  );
  if(!file_exists(drupal_get_path('module','gmap').'/thirdparty/mousewheel.js')) {
    variable_set('gmap_load_zoom_plugin',FALSE);
    $form['initialization']['gmap_load_zoom_plugin']['#default_value'] = FALSE;
    $form['initialization']['gmap_load_zoom_plugin']['#value'] = FALSE;
    $form['initialization']['gmap_load_zoom_plugin']['#disabled'] = TRUE;
    $form['initialization']['gmap_load_zoom_plugin']['#description'] += '<br />'. t('<em>The mousewheel.js file was not found. Please download and place in the <b>thirdparty/</b> folder.</em>');
  }
  $form['initialization']['gmap_on_click'] = array(
    '#type' => 'radios',
    '#title' => t('On Click Marker'),
    '#default_value' => variable_get('gmap_on_click',0),
    '#options' => array(t('Open info window'), t('Open link')),
    '#description' => t('For markers that have link associated with them, it can either an info window or go directly to the link.'),
  );

  $defaults = gmap_defaults();

  $form['gmap_default'] = array(
    '#type' => 'fieldset',
    '#title' => t('Default map settings'),
    // This will store all the defaults in one variable.
    '#tree' => TRUE,
  );
  $form['gmap_default']['map'] = array(
    '#type' => 'gmap',
    '#map' => 'examplemap',
    '#settings' => array(
      'behavior' => array(
        'nodrag' => FALSE,
        'nokeyboard' => FALSE,
      ),
    ),
  );
  
  $form['gmap_default']['width'] = array(
    '#type' => 'textfield',
    '#id' => 'gmap-examplemap-width0',
    '#title' => t('Default width'),
    '#default_value' => $defaults['width'],
    '#size' => 25,
    '#maxlength' => 6,
    '#description' => t('The default width of a Google map.'),
  );
  $form['gmap_default']['height'] = array(
    '#type' => 'textfield',
    '#id' => 'gmap-examplemap-height0',
    '#title' => t('Default height'),
    '#default_value' => $defaults['height'],
    '#size' => 25,
    '#maxlength' => 6,
    '#description' => t('The default height of a Google map.'),
  );
  $form['gmap_default']['latlong'] = array(
    '#type' => 'gmap_latlon',
    '#map' => 'examplemap',
    '#title' => t('Default center'),
    '#default_value' => $defaults['latlong'],
    '#size' => 50,
    '#maxlength' => 255,
    '#description' => t('The default center coordinates of Google map, expressed as a decimal latitude and longitude, separated by a comma.'),
  );
  $form['gmap_default']['zoom'] = array(
    '#type' => 'select',
    '#id' => 'gmap-examplemap-zoom0',
    '#title' => t('Default zoom'),
    '#default_value' => $defaults['zoom'],
    '#options' => drupal_map_assoc(range(0, 17)),
    '#description' => t('The default zoom level of a Google map.'),
  );
  $form['gmap_default']['controltype'] = array(
    '#type' => 'select',
    '#title' => t('Default control type'), 
    '#options' => array('None' => t('None'),'Small' => t('Small'),'Large' => t('Large')),
    '#required' => FALSE,
    '#default_value' => $defaults['controltype'],
    '#id' => 'gmap-examplemap-controltype0',
    '#attributes' => array('class' => 'gmap-control'),
  );

  $form['gmap_default']['maptype'] = array(
    '#type' => 'select',
    '#id' => 'gmap-examplemap-maptype0',
    '#title' => t('Default map type'),
    '#default_value' => $defaults['maptype'],
    '#options' => array('Map' => t('Map'),'Satellite' => t('Satellite'),'Hybrid' => t('Hybrid')),
    '#attributes' => array('class' => 'gmap-control'),
  );

  $form['gmap_default']['behavior'] = array(
    '#type' => 'fieldset',
    '#title' => t('Behavior'),
    '#tree' => TRUE,
  );
  $form['gmap_default']['behavior']['nodrag'] = array(
    '#type' => 'checkbox',
    '#title' => t('Disable dragging'),
    '#default_value' => $defaults['behavior']['nodrag'],
    '#description' => t('If checked, disables dragging the map around. Also disables the keyboard handler.'),
  );
  $form['gmap_default']['behavior']['nokeyboard'] = array(
    '#type' => 'checkbox',
    '#title' => t('Disable keyboard handler'),
    '#default_value' => $defaults['behavior']['nokeyboard'],
    '#description' => t('If checked, disables the GKeyboardHandler normally attached to a map.'),
  );
  $form['gmap_default']['line_colors'] = array(
    '#tree' => TRUE,
  );
  $form['gmap_default']['line_colors'][0] = array(
    '#type' => 'textfield',
    '#title' => t('Default Line 1 Color'),
    '#default_value' => $defaults['line_colors'][0],
    '#size' => 12,
    '#maxlength' => 7,
  );
  $form['gmap_default']['line_colors'][1] = array(
    '#type' => 'textfield',
    '#title' => t('Default Line 2 Color'),
    '#default_value' => $defaults['line_colors'][1],
    '#size' => 12,
    '#maxlength' => 7,
  );
  $form['gmap_default']['line_colors'][2] = array(
    '#type' => 'textfield',
    '#title' => t('Default Line 3 Color'),
    '#default_value' => $defaults['line_colors'][2],
    '#size' => 12,
    '#maxlength' => 7,
  );

  $markers = gmap_get_marker_titles();
  
  $form['markermanager'] = array(
    '#type' => 'fieldset',
    '#title' => t('Marker manager'),
    '#tree' => TRUE,
  );
  $form['markermanager']['gmap_mm_type'] = array(
    '#type' => 'radios',
    '#tree' => FALSE,
    '#options' => array(
      'gmap_marker.js' => t('No manager (use addOverlay directly)'),
      'gmarkermanager_marker.js' => t("Google's GMarkerManager"),
      'clusterer_marker.js' => t("Jef Poskanzer's Clusterer"),
    ),
    '#default_value' => variable_get('gmap_mm_type', 'gmap_marker.js'),
    '#description' => t('If you are planning on using many markers on a single map, you may want to consider using a marker manager to speed up map rendering.'),
  );
  
  $form['markermanager']['gmarkermanager'] = array(
    '#type' => 'fieldset',
    '#title' => t('GMarkerManager settings'),
  );

  $form['markermanager']['gmarkermanager']['borderPadding'] = array(
    '#type' => 'textfield',
    '#disabled' => TRUE, //@@@
    '#title' => t('Border padding'),
    '#description' => t('Markers located less than this number of pixels from the viewport will be added to the map by the manager (even if they would be fully invisible.)'),
    '#size' => 3,
    '#maxlength' => 3,
  );
  $form['markermanager']['gmarkermanager']['maxZoom'] = array(
    '#type' => 'select',
    '#disabled' => TRUE, //@@@
    '#title' => t('Maximum zoom'),
    '#options' => drupal_map_assoc(range(0, 17)),
    '#description' => t('At the specified zoom level and above, the marker manager will disable itself for additional speed.'),
  );
  $form['markermanager']['gmarkermanager']['trackMarkers'] = array(
    '#type' => 'checkbox',
    '#disabled' => TRUE, //@@@
    '#title' => t('Track markers'),
    '#description' => t('If enabled, the marker manager will track marker movements. Leave off unless you need to move markers around with setPoint.'),
  );
  
  $form['markermanager']['clusterer'] = array(
    '#type' => 'fieldset',
    '#title' => t('Clusterer settings'),
  );
  
  $form['markermanager']['clusterer']['marker'] = array(
    '#type' => 'gmap_markerchooser',
    '#disabled' => TRUE, //@@@
    '#title' => t('Marker for clusters'),
    '#description' => t('The marker to use when creating a cluster.'),
  );
  
  
  

  $form['clusterer'] = array(
    '#type' => 'fieldset',
    '#title' => t('Clusterer settings'),
  );
  $form['clusterer']['gmap_cluster'] = array(
    '#type' => 'checkbox',
    '#title' => t('Enable clusterer.js'),
    '#default_value' => GMAP_CLUSTER,
    '#disabled' => TRUE, //@@@
    '#description' => t('Enables Jef Poskanzer\'s excellent <a href="@url">clusterer.js</a> script. (useful for a large number of markers on a single map).  This must be installed in the gmap directory of the drupal install.',
      array('@url' => 'http://www.acme.com/javascript/#Clusterer')),
  );
  $form['clusterer']['gmap_cluster_marker'] = array(
    '#type' => 'gmap_markerchooser',
    '#title' => t('Marker for clusters'),
    '#disabled' => TRUE, //@@@
    '#default_value' => variable_get('gmap_cluster_marker', 'cluster'),
  );
  $form['clusterer']['gmap_cluster_max_markers'] = array(
    '#type' => 'textfield',
    '#title' => t("Maximum number of markers"),
    '#disabled' => TRUE, //@@@
    '#default_value' => variable_get('gmap_cluster_max_markers', 150),
    '#size' => 3,
    '#maxlength' => 3,
    '#title' => t("Clustering is enabled when more than the specified number of markers are visible at the same time."),
  );
  $form['clusterer']['gmap_cluster_min_per_cluster'] = array(
    '#type' => 'textfield',
    '#disabled' => TRUE, //@@@
    '#title' => t("Minimal number of markers per cluster"),
    '#default_value' => variable_get('gmap_cluster_min_per_cluster', 5),
    '#size' => 2,
    '#maxlength' => 2,
  );
  $form['clusterer']['gmap_cluster_max_lines'] = array(
    '#type' => 'textfield',
    '#disabled' => TRUE, //@@@
    '#title' => t("Maximum number of lines per info box"),
    '#default_value' => variable_get('gmap_cluster_max_lines', 10),
    '#size' => 2,
    '#maxlength' => 2,
  );

  $form['location'] = array(
    '#type' => 'fieldset',
    '#title' => t('Location settings'),
  );
  $form['location']['gmap_location_map'] = array(
    '#type' => 'textfield',
    '#title' => t('Default location map'),
    '#default_value' => variable_get('gmap_location_map','[gmap|id=locmap|center=40,0|zoom=3|width=100%|height=400px]'),
    '#size' => 50,
    '#description' => t('The gmap macro for the map to be used in the location.module for setting latitude and longitude.'),
  );
  return system_settings_form($form);
}
