$Id$

!!WARNING!! THESE INSTRUCTIONS ARE OUT OF DATE! !!WARNING!!

Description
-----------

The main GMap module is primarily an API module.  The API that allows
other modules or administrators to convert either an array of
specifications or a macro text into a html/javascript text that
will include the google map on their page.

The module includes a macro generator which will allow you to interactively
create a gmap macro suitable for using for a variety of purposes with this
module.

Included with this module is a filter, which allows you to take the text
created from the macro and insert it into a node and the filter will
convert this into a google map shown on the node.

Also packaged with this module is the module gmap_location.module.  This
lets one display location information from nodes or users on google maps.


Installation
------------

1) Copy the gmap directory into the modules directory (recommended: sites/all/modules)

2) edit the theme files to ensure that the html file has the following at
   the top of each page (the first one  is recommended by Google, the
   second is required for the lines overlays to work in IE:
   <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
   <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml">

3) Get a GMap API Key at http://www.google.com/apis/maps/signup.html

4) enable the 'gmap module' in drupal

5) edit admin/settings/gmap to include the key you received from google and
   change any other default setting.

6) configure an 'input format' so that the gmap filter is activated.  If
   this will be on a 'html filtered' format, ensure that the weighting is
   such that the HTML filter comes before the gmap filter.

7) (optional) To use clusterer.js (useful if you have more than about 100 markers on a page)
   get the javascript file from http://www.acme.com/javascript/#Clusterer and copy into
   your gmap directory
   
8) (optional) To use wms features get the script http://dist.codehaus.org/geoserver/gmaps-geoserver_scripts/wms-gs-1_0_0.js
   and install it in your gmap directory.

Instructions
------------

Macro
-----

A gmap macro can be created on the map/macro page and the text can then be
copied and pasted into any node where the gmap filter is enabled.

Default settings will be the initial settings and will be used for any
parameter not inserted into the macro.

A gmap can also be inserted into any page or template by using either the
macro text and the function gmap_from_text($macro); or using the
function gmap_from_var($gmapvar); where $gmapvar is an associative array.

After you insert the macro into a node, you can edit it using raw values
that you get from elsewhere to create a set of points or lines on the map.
It should be noted that when editing the macro you are not limited to 3
points on the map.  An unlimited number of points may be added separated
by the '+' symbol. This could be used, for example, to plot a series of
points that you get from a GPS.

It should be noted that currently the macro parsing (filter) has much more
functionality than can be created using the macro creator.

User
----

If the user functions are enables (on the settings page) then users are
able to edit their location using an interactive google map on the edit
user page.  Alternatively they can enter in their Latitude and Longitude
and the map will set their location.

Any user that has permission for "show user map" will then be able to see
a map of all of the user locations at: q=gmapusers if a user has permission
to "user location" when they click on the marker they will see what user it
is.

Nodes
-----

In order to set the location of a node using an interactive gmap, the user
must have access permission to enter lat/longitude in location.module.

The location of the current node can be shown by activating the block
"location".  This block can be displayed below the content or anywhere
else that blocks can be displayed.

A map showing all of the nodes with location information can be viewed at
map/node


Markers
-------

You can set a custom marker.  A number of custom markers are located in the
markers directory.  Markers that don't use the standard shape are located in
subdirectories.  small is for a small markers, large is for an oversized marker
and flat is for markers without shadows.

If you would like to create your own marker, the best way to do it is to take
an existing marker and make the changes you want, you should keep the same
size and shape.  it must be saved with a '.png' extension.

I would like to increase the library of markers, so if you create an interesting
marker, please e-mail it to me.

Demo
----

For a few pages that show some of the items mentioned above see:
http://www.webgeer.com/map/macro
http://www.webgeer.com/gmapdemo
http://www.webgeer.com/map/users

For a website that uses the location.module and gmap.module integration
with gmap_location.module see:
http://photo-tips.ca/

Bugs & quirks
-------------

- The gmap.module user location setting functionality is not compatible with
  the location.module module user setting functionality.  Furthermore, the
  location.module does not let you insert the lat/long manually.  If you
  would like to display ther users on a map, I recommend disabling the
  user functionality within location.module.
- If a gmap is in a collapsed area when it is uncollapsed it will not display
  the whole map, if you drag the map, it will be redrawn and the whole map
  will be visible.
- xmaps does not work with google map v2 yet, so that functionality has been
  disabled.
- There is a conflict between the xmaps script and the javascript that does
  the collapsing menus.  If want to use the xmaps functionality, it is
  recommended that you comment out all of the statements in the function
  "collapseEnsureErrorsVisible()" in misc/collapse.js.
  (xmaps not currently available  so this is irreleveant now)
- The "dynamic" gmap method of inserting the initialization script does not
  work with the filter functionality.  (It does work with user functionality).
- When you preview a node, if the map is shown in the short version, it
  will not be shown on the long version of the node, this is because only
  one copy of a mapid can be shown on the same page.

To do
-----

- rationalize all of the different default map variables, so that most of them
  use the 'default map' settings of the gmap.
- Significantly upgrade the macro creator.
- The documentation (both in the code and this file) needs to be significantly
  improved.
- create interface to geocoding for address or postal code to Long, Lat
  conversion.  Preferably on the client side of the javascript gmapmacro
  page.   (Probably wont do this, leave this functionality to location.module)
- Create an API that will allow the use of the macro creation tool in any
  module.
- Create setting to suppress the option of changing some of the settings in
  the macro creation page.  This could be used so that all maps generated
  are the same size, or the same magnification.

Credit
------

Written by:
James Blake
http://www.webgeer.com/James

Thanks to the following for their contributions:
Robert Douglass - for revamping some parts that really needed to be
  revamped and cleaning up a lot of little things.
Paul Rollo - for his contribution on showing how to include a location map
  in a block.
Nick Jehlen - who commissioned much of the initial work of gmap_location.module
  for the website http://enoughfear.com.
  



History
-------
(I haven't been keeping up with this sorry)

2005-12-xx:
 - forked the 4.6/4.7 version, both versions will continue to be developed
   for a while longer.
 - added gmap user functionality
 - width and height can be either px or %
 - gmapmacro no longer needs to reload page (now works without clean url's)
 - generalized gmap_from_var so that uses an array of points, or an array
   of lines, ...
 - 37518-Info windows associated with points (markers) can be shown
 - can optionally include xgmap options such as circle/polygon/style types


2005-10-15 Quite a few fixes.  (some reported in the project and some just
noted myself)
  -Map controls are properly initialized in the gmapmacro page (can be
   removed or changed)
  -33949-Prevent errors from occurring if the Google Map key still blank
   (not yet set)
  -34036-Hybrid and Satellite maps now show in nodes
  -33951-Long,Lat order and terminology corrected (note old Macros will
   still work)
  -33730-Alignment problem fixed.  Now uses css.
  -A few other little bugs

2005-10-10 Fix a number of little things and improve the macro interface

2005-10-09 Initial Release (probably too early)

