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

Demo
----

To see the macro creation tool go to:
http://vancouver.cyclehome.org/gmapmacro

To see an example a node with the macro inserted go to:
http://vancouver.cyclehome.org/

To do
-----

- Create an API that will allow the use of the macro creation tool in any
  module.
- Create setting to supress the option of changing some of the settings in
  the macro.

Credit
------

Written by:
James Blake
http://www.webgeer.com/James
