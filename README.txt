$Id$

Description
-----------

The GMap filter module uses filters to allow the insertion of a Google map
into a node.  It includes a page to create the macro and a filter to insert
a map based on the macro.

Installation
------------

1) copy the gmap directory into the modules directory

2) edit the theme files to ensure that the html file has the following at
   the top of each page (the first one  is recommended by Google, the
   second is required for the lines to work in IE:
   <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
   <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml">

3) Get a GMap API Key at http://www.google.com/apis/maps/signup.html

4) enable the 'gmap module' in drupal

5) edit admin/settings/gmap to include the key you received from google and
   change any other default setting.

6) configure an 'input format' so that the gmap filter is activated.  If
   this will be on a 'html filtered' format, ensure that the weighting is
   such that the HTML filter comes before the gmap filter.

Instructions
------------

A gmap macro can be created on the gmapmacro page and the text can then be
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

Demo
----

To see the macro creation tool go to:
http://vancouver.cyclehome.org/gmapmacro

To see an example a node with the macro inserted go to:
http://vancouver.cyclehome.org/

It should be noted that because of the way the gmap api works much of the
development can only be done on-line and therefore, I am not able to test
the module on my home server.  As a result the version on this webpage
is likely to be a little more developed than the one in the drupal CVS.
These pages may also occasionally have errors on them.

Bugs & quirks
-------------

- When you preview a node, if the map is shown in the short version, it
  will not be shown on the long version of the node, this is because only
  one copy of a mapid can be shown on the same page.

To do
-----

- create interface to geocoding for address or postal code to Long, Lat
  conversion.  Preferably on the client side of the javascript gmapmacro
  page.
- Change so number of markers is not limited. (currently maximum of 3).
- Create an API that will allow the use of the macro creation tool in any
  module.
- Create setting to suppress the option of changing some of the settings in
  the macro creation page.  This could be used so that all maps generated
  are the same size, or the same magnification.
- Add more settings (for example fixed/draggable map)

Credit
------

Written by:
James Blake
http://www.webgeer.com/James

History
-------

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

