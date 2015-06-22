extjs-multisort-ux
==================

This plugin adds multiple remote sorting to the extjs grid by allowing for the selection of multiple columns.

Author          : Joshua McDonald
Email           : joshuamcdonald69124@gmail.com
Compatability   : Extjs 4.1
Date            : August 14, 2012

Notes:
-

This plugin adds multiple remote sorting to the extjs grid by allowing for the selection of multiple
columns.

Instructions
-

In your extjs grid please include the plugin with any default columns named in the following manner.

```js
Ext.create('Ext.ux.InlineRemoteMultiSort', {
  defaultSorters: [
    {property:'col1',   direction:'ASC'},
    {property:'col2',   direction:'ASC'},
    {property:'col3',   direction:'ASC'}
    // ....
  ]
})
```

Please place the file in the `extjs/src/ux/` folder, and place the CSS file in the `extjs/src/ux/css` folder.

Output
-
The sort parameters will be sent as follows:
```js
sort:[{'item':'col1','direction:'ASC'},{'item':'col2','direction:'ASC'},{'item':'col3','direction:'ASC'}]
```

Remember that the code will pass a set of empty brackets if there are no sorters present, please handle
this on the server side.

TODO
-
Numbered images to show the user the sort order would be a great addition.
