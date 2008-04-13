<?php
// $Id$

/**
 * @file
 * Encoded polyline utilities.
 */

/**
 * References:
 * [1] http://code.google.com/apis/maps/documentation/polylinealgorithm.html
 * [2] http://facstaff.unca.edu/mcmcclur/GoogleMaps/EncodePolyline/
 * [3] http://mathworld.wolfram.com/
 */

/**
 * Encode a numeric value (steps 3-11 of "Encoding Latitudes and Longitudes" @ [1])
 */
function gmap_polyutil_e5_to_encoded($e5) {
  // As described in http://code.google.com/apis/maps/documentation/polylinealgorithm.html
  $work = $e5; // Make a copy.
  $work <<= 1; // 4) Shift left (Note: I have no clue what happens if PHP_INT_SIZE != 4.)
  if ($e5 < 0) {
    $work = ~$work; // 5) Invert if negative.
  }
  $out = '';
  // While we are NOT on the last chunk...
  while ($work >= 32) {
    // This combines the rest of the steps together.
    $out .= chr((32 | ($work & 31)) + 63);
    $work >>= 5;
  }
  // Last chunk doesn't get ORed with 32.
  $out .= chr(($work & 31) + 63);
  return $out;
}

function gmap_polyutil_distance_from_line() {
  // http://mathworld.wolfram.com/Point-LineDistance2-Dimensional.html
}
