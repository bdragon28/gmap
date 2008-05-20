$Id$

NOTE: Some parts of the documentation are out of date for Drupal 5. They should,
as of May 20 2008, be clearly marked as such.

Description
-----------

GMap is an api and a set of modules to add Google Maps functionality to a Drupal
site. It also contains a filter to turn special "gmap macros" into working maps
with minimal effort.

gmap.module: The main module. Contains the API and the basic map functions.
gmap_location.module: GMap <-> Location.module (v2 and v3) interface.
gmap_macro_builder.module: End-user UI for easily creating GMap macros.
gmap_taxonomy.module: API and utility for changing map markers based on
  taxonomy terms.
gmap_views.module: GMap <-> Views.module interface.


Installation
------------
**editor's note: remove notes on VML when the api version is forced to >= 2.91.


Follow the general directions available at:

* http://drupal.org/getting-started/5/install-contrib/modules

Special notes regarding your theme:

* It is recommended by Google that your theme be standards-compliant XHTML.

* Google recommends the following DOCTYPE:

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">

Note: Google Maps may have rendering issues when not using an XHTML doctype!

* In addition, for polylines to work in Internet Explorer, you will need to add
the VML namespace to your <html> tag. Google recommends the following:

  <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml">

* See http://code.google.com/apis/maps/documentation/index.html#XHTML_and_VML
for more information.

Other things needed:

* You will need a Google Maps API key for your website. You can get one at:

http://www.google.com/apis/maps/signup.html

* If you would like to use third party functionality such as mousewheel support
or Clusterer, read thirdparty/README.txt for download links and instructions.

Additional configuration:

* If you would like to use GMap macros directly in nodes, you will need to
configure an input format.

Read http://drupal.org/node/213156 for more information on input formats.

If you are using the HTML filter, it will need to appear BEFORE the GMap filter.
To modify the order of filters in an input format, click "Configure" on a format
at admin/settings/filters and then click the "Rearrange" tab.

Instructions
------------

Macro
-----
**NOTE: This section needs revision still!**

A gmap macro can be created on the map/macro page, or by hand, and the macro
copied and pasted into any node where the gmap filter is enabled, or into
any GMap related setting that allows a macro.

Default settings will be the initial settings and will be used for any
parameter not specified by the macro.

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

(((If the user functions are enables (on the settings page) then users are
able to edit their location using an interactive google map on the edit
user page.  Alternatively they can enter in their Latitude and Longitude
and the map will set their location.))) -- LOCATION 2 SPECIFIC -- DELETE OR REWRITE

Any user that has the 'show user map' permission can see a map of user locations
at map/user. If a user has the 'user locations' permission they can additionally
click on a marker to see information on the user the marker is representing.

Nodes
-----

Node locations work in conjunction with location.module. gmap_location provides
three built-in features to work with node locations:

* "Location map" block
This block will display the markers associated with the node being viewed.

* "Author map" block
This block will display the marker associated with the author of the node being
viewed.

* "Node locations"
A page containing a map that shows a map of the entire site. Users with the
'show node map' permission can see it at map/node.

(((In order to set the location of a node using an interactive gmap, the user
must have access permission to enter lat/longitude in location.module.)))-- MOVE TO LOCATION DOCS

Markers
-------

GMap supports custom markers. The markers/ directory contains many useful markers,
and the system supports addition of additional custom markers using an INI file
format.

If you have created custom markers and are willing to release them under the GPL
for inclusion in GMap, please file an issue in the issue queue at
http://drupal.org/project/issues/gmap.

Markers must be in PNG format.

Demo
----

** This section needs updated for the Drupal 5 version. **

For a few pages that show some of the items mentioned above see:
http://www.webgeer.com/map/macro
http://www.webgeer.com/gmapdemo
http://www.webgeer.com/map/users

For a website that uses the location.module and gmap.module integration
with gmap_location.module see:
http://photo-tips.ca/

Credit
------

DRUPAL 4.6-4.7:

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

DRUPAL 5:

Maintainer:
Brandon Bergren (Bdragon)
