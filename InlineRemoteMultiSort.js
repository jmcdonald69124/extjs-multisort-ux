/*
 Author          : Joshua McDonald
 Email           : joshuamcdonald69124@gmail.com
 Compatability   : Extjs 4.1
 Date            : August 14, 2012

 Notes:
 This plugin adds multiple remote sorting to the extjs grid by allowing for the selection of multiple
 columns.

 Instructions:
 In your extjs grid please include the plugin with any default columns named in the following manner.

 Ext.create('Ext.ux.InlineRemoteMultiSort', {
 defaultSorters: [
 {property:'col1',   direction:'ASC'},
 {property:'col2',   direction:'ASC'},
 {property:'col3',   direction:'ASC'}
 // ....
 ]
 })

 Please place the file in the extjs/src/ux/ folder, and place the CSS file in the extjs/src/ux/css folder.

 Output:
 The sort parameters will be sent as follows:
 sort:[{'item':'col1','direction:'ASC'},{'item':'col2','direction:'ASC'},{'item':'col3','direction:'ASC'}]

 Remember that the code will pass a set of empty brackets if there are no sorters present, please handle
 this on the server side.

 TODO : Numbered images to show the user the sort order would be a great addition.
 */

Ext.define('Ext.ux.InlineRemoteMultiSort', {
    extend          : 'Ext.AbstractPlugin',
    alias           : 'plugin.multisort',

    init: function(grid) {
        var defkeys = [];
        this.grid = grid;
        this.grid.defaultSorters = this.defaultSorters;
        // Provide a copy of initial config to the sort
        // change function. Do not remove!
        this.grid.initialSorters = this.defaultSorters;
        this.store = grid.getStore();
        this.store.remoteSort = true;

        Ext.each(
            // Loop through the defaults and add the
            // appropriate icon image
            this.grid.defaultSorters,
            function(element){
                defkeys.push(element.property);
                grid.getStore().sorters.add(new Ext.util.Sorter({
                    property :element.property,
                    direction: 'ASC'
                }));
            }
        );


        this.store.addListener('beforeload', this.onBeforeLoad, this);
        this.grid.addListener('afterrender', this.onAfterRender,  this);
        this.grid.addListener('sortchange', this.onSortChange,  this);

        this.grid.initialKeys    = defkeys;
        this.grid.defaultKeys    = defkeys;

    },

    onSortChange: function(ct, column, direction){
        var cols = this.grid.columns;
        Ext.each(
            // Loop through the defaults
            this.grid.defaultSorters,
            function(element) {
                Ext.Array.some(
                    cols,
                    function (item, index) {
                        if (element.property == item.dataIndex ) {
                            if(!Ext.get(item.el).hasCls('x-column-header-sort-' + element.direction)) {
                                Ext.fly(item.el).addCls('x-column-header-sort-' + element.direction);
                            }
                            return true;
                        }
                    });
            });
        if(Ext.Array.contains(this.grid.initialKeys,column.dataIndex)){
            var newSortDir = this.grid.initialSorters[Ext.Array.indexOf(this.grid.initialKeys, column.dataIndex)].direction;
            var oldSortDir = newSortDir == 'ASC' ? 'DESC': 'ASC';
            Ext.fly(column.el).removeCls('x-column-header-sort-' + oldSortDir);
            Ext.fly(column.el).addCls('x-column-header-sort-' + newSortDir);

        } else {
            Ext.fly(column.el).addCls('x-column-header-sort-' + direction);
        }
    },

    onBeforeLoad: function(store){

        var newSortItem =   store.sorters.length == 1 ?  store.sorters.items[0].property : '~',
            newSortDir,
            oldSortDir;

        if(Ext.Array.contains(this.grid.initialKeys,newSortItem)){
            oldSortDir = this.grid.initialSorters[Ext.Array.indexOf(this.grid.initialKeys, newSortItem)].direction;
            newSortDir = oldSortDir == 'ASC' ? 'DESC': 'ASC';
            this.grid.initialSorters.splice( Ext.Array.indexOf(this.grid.initialKeys,newSortItem),1,{property:newSortItem,direction:newSortDir});
        } else {
            newSortDir  =   store.sorters.length == 1 ?  store.sorters.items[0].direction : 'ASC';
        }
        // Reset the sort variable
        store.proxy.extraParams.sort = '';
        if(!Ext.Array.contains(this.grid.defaultKeys,newSortItem) && newSortItem != '~'){
            this.grid.defaultSorters.push({property:newSortItem,direction:newSortDir});
            this.grid.defaultKeys.push(Ext.String.trim(newSortItem));
        } else if(Ext.Array.contains(this.grid.defaultKeys,newSortItem) && newSortItem != '~'){
            // Update the direction as that could change, but keep the order in the array
            this.grid.defaultSorters.splice( Ext.Array.indexOf(this.grid.defaultKeys,newSortItem),1,{property:newSortItem,direction:newSortDir});
        }

        // Reverse the sort for initial ASC columns

        Ext.each(
            this.grid.defaultSorters,
            function(element){
                // Add new values to the sorter, uses double quote to allow for cold fusion's
                // deserialize json method.
                // CF Server side code to parse into array :  <cfset sorters = deserializeJSON(#form.sort#) />
                store.proxy.extraParams.sort = store.proxy.extraParams.sort + '{"item":"' + element.property + '","direction":"' + element.direction + '"},';
                // Single quote version for other server side programming languages
                //store.proxy.extraParams.sort = store.proxy.extraParams.sort + '{\'item\':\'' + element.property + '\',\'direction\:\'' + element.direction + '\'},';
            }
        );
        store.proxy.extraParams.sort = '[' + store.proxy.extraParams.sort.replace(/(^,)|(,$)/g, "") + ']';
    },

    onAfterRender : function(me) {
        var menu = me.headerCt.getMenu();
        // Build the menu items for the grid drop downs
        menu.add([
            {
                text:'Remove Sorting',
                iconCls:'remove_sort_icon',
                handler:function (me) {

                    var columnDataIndex = menu.activeHeader.dataIndex,
                        element = menu.activeHeader.el,
                        grid = me.up('grid');

                    grid.defaultSorters.splice(Ext.Array.indexOf(grid.defaultKeys, columnDataIndex), 1);
                    grid.defaultKeys.splice(Ext.Array.indexOf(grid.defaultKeys, columnDataIndex), 1);

                    grid.initialSorters.splice(Ext.Array.indexOf(grid.initialKeys, columnDataIndex), 1);
                    grid.initialKeys.splice(Ext.Array.indexOf(grid.initialKeys, columnDataIndex), 1);

                    Ext.fly(element).removeCls('x-column-header-sort-DESC');
                    Ext.fly(element).removeCls('x-column-header-sort-ASC');

                    grid.getStore().load();
                }
            }
        ]);
    }
});