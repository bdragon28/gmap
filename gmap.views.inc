<?php
// $Id$

/**
 * @file
 * GMap views support.
 */

/**
 * Implementation of hook_views_handlers().
 */
/*
function gmap_views_handlers() {
  return array(
    'info' => array(
      'path' => drupal_get_path('module', 'gmap'),
    ),
    'handlers' => array(
      'gmap_plugin_style_gmap' => array(
        'parent' => 'views_plugin_style',
      ),
    ),
  );
}

*/


function template_preprocess_gmap_view_gmap(&$vars) {
  $vars['map_object'] = $vars['rows'];
  // Rows is actually our map object.
  unset($vars['rows']);

  // Theme the map.
  $vars['map'] = theme('gmap', array('#settings' => $vars['map_object']));
}
