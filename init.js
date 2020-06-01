/* jshint strict: true */
/* globals plugin, theWebUI, theContextMenu */
(function(){
    "use strict";

	// While in the context menu we can simply use
	// a a[href][download] to process file downloads,
	// the double-click process is more complex.
	const DOWNLOAD_LINK = document.createElement('a');
    DOWNLOAD_LINK.setAttribute('download', '');

    function whatboxDownload ( hash, no ) {
        document.body.appendChild(DOWNLOAD_LINK);
        DOWNLOAD_LINK.href = './plugins/whatbox-data/action.php?hash=' + hash + '&no=' + no;
        DOWNLOAD_LINK.click();
        DOWNLOAD_LINK.remove();
    }


    plugin.loadLang();

    plugin.config = theWebUI.config;
    theWebUI.config = function(data)
    {
        plugin.config.call(this,data);
        var oldDblClick = this.getTable("fls").ondblclick;
        this.getTable("fls").ondblclick = function(obj)
        {
            if (plugin.enabled && (theWebUI.dID!="") && (theWebUI.dID.length==40))
            {
                if (theWebUI.settings["webui.fls.view"]) {
                    var file_number = obj.id.split('_f_')[1];
					whatboxDownload(theWebUI.dID, file_number);
                    return(false);
                } else {
                    var lnk = this.getAttr(obj.id, "link");
                    if (lnk==null) {
                        whatboxDownload(theWebUI.dID, obj.id.substr(3));
                        return(false);
                    }
                }
            }
            return(oldDblClick.call(this,obj));
        };
    };


    if (plugin.canChangeMenu()) {
        plugin.createFileMenu = theWebUI.createFileMenu;
        theWebUI.createFileMenu = function( e, id ) {
            var chain_result = plugin.createFileMenu.call(this, e, id);
            if (plugin.enabled) {
                theContextMenu.add([CMENU_SEP]);
                var fno = null;
                var table = this.getTable("fls");
                if (table.selCount != 1) {
                    return chain_result;
                }

                var fid = table.getFirstSelected();
                if (this.settings["webui.fls.view"]) {
                    fno = fid.split('_f_')[1];
                } else if (!this.dirs[this.dID].isDirectory(fid)) {
                    fno = fid.substr(3);
                }
                theContextMenu.add([
                    theUILang.getData,
                    function() {
                        this.href = './plugins/whatbox-data/action.php?hash=' + theWebUI.dID + '&no=' + fno;
                        this.setAttribute('download', '');
                    }
                ]);
            }

            return chain_result;
        };
    }
})();
