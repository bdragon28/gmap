<?php
/* $Id$ */
// vim:set ft=php:

/**
 * @file
 * GMap settings form.
 */

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

  $defaults = gmap_defaults();

  $form['gmap_default'] = array(
    '#type' => 'fieldset',
    '#title' => t('Default map settings'),
    // This will store all the defaults in one variable.
    '#tree' => TRUE,
  );
  $form['gmap_default']['map'] = array(
    '#type' => 'gmap',
    '#map' => 'settings_default_map',
    '#settings' => array(
      'behavior' => array(
        'nodrag' => FALSE,
        'nokeyboard' => FALSE,
      ),
    ),
  );
  
  $form['gmap_default']['width'] = array(
    '#type' => 'textfield',
    '#title' => t('Default width'),
    '#default_value' => $defaults['width'],
    '#size' => 25,
    '#maxlength' => 6,
    '#description' => t('The default width of a Google map.'),
  );
  gmap_widget_setup($form['gmap_default']['width'],'width','settings_default_map');
  $form['gmap_default']['height'] = array(
    '#type' => 'textfield',
    '#id' => 'gmap-examplemap-height0',
    '#title' => t('Default height'),
    '#default_value' => $defaults['height'],
    '#size' => 25,
    '#maxlength' => 6,
    '#description' => t('The default height of a Google map.'),
  );
  gmap_widget_setup($form['gmap_default']['height'],'height','settings_default_map');
  $form['gmap_default']['latlong'] = array(
    '#type' => 'gmap_latlon',
    '#map' => 'settings_default_map',
    '#title' => t('Default center'),
    '#default_value' => $defaults['latlong'],
    '#size' => 50,
    '#maxlength' => 255,
    '#description' => t('The default center coordinates of Google map, expressed as a decimal latitude and longitude, separated by a comma.'),
  );
  $form['gmap_default']['zoom'] = array(
    '#type' => 'select',
    '#title' => t('Default zoom'),
    '#default_value' => $defaults['zoom'],
    '#options' => drupal_map_assoc(range(0, 17)),
    '#description' => t('The default zoom level of a Google map.'),
  );
  gmap_widget_setup($form['gmap_default']['zoom'],'zoom','settings_default_map');

  $form['gmap_default']['controltype'] = array(
    '#type' => 'select',
    '#title' => t('Default control type'), 
    '#options' => array('None' => t('None'),'Small' => t('Small'),'Large' => t('Large')),
    '#default_value' => $defaults['controltype'],
  );
  gmap_widget_setup($form['gmap_default']['controltype'],'controltype','settings_default_map');

  $form['gmap_default']['maptype'] = array(
    '#type' => 'select',
    '#title' => t('Default map type'),
    '#default_value' => $defaults['maptype'],
    '#options' => array('Map' => t('Map'),'Satellite' => t('Satellite'),'Hybrid' => t('Hybrid')),
  );
  gmap_widget_setup($form['gmap_default']['maptype'],'maptype','settings_default_map');

  $form['gmap_default']['behavior'] = array(
    '#type' => 'fieldset',
    '#title' => t('Map Behavior flags'),
    '#tree' => TRUE,
    '#description' => t('Behavior flags modify how a map behaves. Disabled flags are for specific purposes and can only be set manually.'),
  );
  $behaviors = module_invoke_all('gmap','behaviors');
  foreach ($behaviors as $k => $v) {
    $form['gmap_default']['behavior'][$k] = array(
      '#type' => 'checkbox',
      '#title' => t('@name : @title',array('@name'=>$k,'@title'=>$v['title'])),
      '#default_value' => isset($defaults['behavior'][$k]) ? $defaults['behavior'][$k] : $v['default'],
      '#description' => isset($v['help']) ? $v['help'] : '',
    );
    if ($v['internal']) {
      $form['gmap_default']['behavior'][$k]['#disabled'] = TRUE;
    }
  }

  $form['gmap_default']['markermode'] = array(
    '#type' => 'radios',
    '#title' => t('Marker action'),
    '#description' => t('Perform this action when a marker is clicked.'),
    '#options' => array(t('Do nothing'),t('Open info window'),t('Open link')),
    '#default_value' => isset($defaults['markermode']) ? $defaults['markermode'] : 0,
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

  $opts = variable_get('gmap_markermanager',array(
    'gmap' => array(),
    'gmarkermanager' => array(),
    'clusterer' => array()));
  
  $opts['gmap'] = array_merge(array(
    // None.
  ),$opts['gmap']);

  $opts['gmarkermanager'] = array_merge(array(
    'borderPadding' => 0,
    'maxZoom' => 4,
    'trackMarkers' => FALSE,
  ),$opts['gmarkermanager']);

  $opts['clusterer'] = array_merge(array(
    'clusterer_file' => 'Clusterer2.js',
    'marker' => 'cluster',
    'max_nocluster' => 150,
    'cluster_min' => 5,
    'max_lines' => 10,
  ),$opts['clusterer']);

  $form['gmap_markermanager'] = array(
    '#type' => 'fieldset',
    '#title' => t('Marker manager'),
    '#tree' => TRUE,
  );
  $form['gmap_markermanager']['gmap_mm_type'] = array(
    '#type' => 'radios',
    '#tree' => FALSE,
    '#required' => TRUE,
    '#options' => array(
      'gmap' => t('No manager (use addOverlay directly)'),
      'gmarkermanager' => t("Google's GMarkerManager"),
      'clusterer' => t("Jef Poskanzer's Clusterer"),
    ),
    '#default_value' => variable_get('gmap_mm_type', 'gmap'),
    '#description' => t('If you are planning on using many markers on a single map, you may want to consider using a marker manager to speed up map rendering.'),
  );

  $form['gmap_markermanager']['gmap'] = array(
    '#type' => 'fieldset',
    '#title' => t('Unmanaged marker settings'),
    '#description' => t('There are no settings for unmanaged markers.'),
  );

  $form['gmap_markermanager']['gmarkermanager'] = array(
    '#type' => 'fieldset',
    '#title' => t('GMarkerManager settings'),
    '#description' => t('GMarkerManager is a new part of the official Google Maps API that provides a marker manager.'),
  );

  $form['gmap_markermanager']['gmarkermanager']['borderPadding'] = array(
    '#type' => 'textfield',
    '#title' => t('Border padding'),
    '#description' => t('Markers located less than this number of pixels from the viewport will be added to the map by the manager (even if they would be fully invisible.)'),
    '#size' => 3,
    '#maxlength' => 3,
    '#default_value' => $opts['gmarkermanager']['borderPadding'],
  );
  $form['gmap_markermanager']['gmarkermanager']['maxZoom'] = array(
    '#type' => 'select',
    '#title' => t('Maximum zoom'),
    '#options' => drupal_map_assoc(range(0, 17)),
    '#description' => t('At the specified zoom level and above, the marker manager will disable itself for additional speed.'),
    '#default_value' => $opts['gmarkermanager']['maxZoom'],
  );
  $form['gmap_markermanager']['gmarkermanager']['trackMarkers'] = array(
    '#type' => 'checkbox',
    '#title' => t('Track markers'),
    '#description' => t('If enabled, the marker manager will track marker movements. Leave off unless you need to move markers around with setPoint.'),
    '#default_value' => $opts['gmarkermanager']['trackMarkers'],
  );
  
  $form['gmap_markermanager']['clusterer'] = array(
    '#type' => 'fieldset',
    '#title' => t('Clusterer settings'),
    '#description' => t("Clusterer is a marker manager written by Jef Poskanzer of acme.com. To use, you must place Clusterer2.js (available ".'<a href="@url">here</a>) into the "thirdparty" folder.',array('@url'=>'http://acme.com/javascript/Clusterer2.js')),
  );
  $form['gmap_markermanager']['clusterer']['clusterer_file'] = array(
    '#type' => 'textfield',
    '#title' => t('Clusterer filename'),
    '#description' => t('Set the name of the Clusterer file in the thirdparty folder.'),
    '#default_value' => $opts['clusterer']['clusterer_file'],
  );
  $form['gmap_markermanager']['clusterer']['marker'] = array(
    '#type' => 'gmap_markerchooser',
    '#title' => t('Marker for clusters'),
    '#description' => t('The marker to use when creating a cluster.'),
    '#default_value' => $opts['clusterer']['marker'],
  );
  $form['gmap_markermanager']['clusterer']['max_nocluster'] = array(
    '#type' => 'textfield',
    '#title' => t('Activate on'),
    '#field_suffix' => t('or more markers'),
    '#description' => t("Clustering is enabled when more than the specified number of markers are visible at the same time."),
    '#size' => 3,
    '#maxlength' => 3,
    '#default_value' => $opts['clusterer']['max_nocluster'],
  );
  $form['gmap_markermanager']['clusterer']['cluster_min'] = array(
    '#type' => 'textfield',
    '#title' => t('Cluster on'),
    '#field_suffix' => t('or more markers'),
    '#description' => t("Minimal number of markers per cluster"),
    '#size' => 2,
    '#maxlength' => 2,
    '#default_value' => $opts['clusterer']['cluster_min'],
  );
  $form['gmap_markermanager']['clusterer']['max_lines'] = array(
    '#type' => 'textfield',
    '#title' => t('Lines per box'),
    '#field_prefix' => t('at most'),
    '#field_suffix' => t('lines'),
    '#description' => t("Maximum number of lines per info box"),
    '#size' => 2,
    '#maxlength' => 2,
    '#default_value' => $opts['clusterer']['max_lines'],
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
