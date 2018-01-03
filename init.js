(function(){
	"use strict";

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
					var file_number = obj.id.replace('_f_', '');
					theWebUI.getData(theWebUI.dID, file_number);
					return(false);
				} else {
					var lnk = this.getAttr(obj.id, "link");
					if (lnk==null) {
						theWebUI.getData(theWebUI.dID, obj.id.substr(3));
						return(false);
					}
				}
			}
			return(oldDblClick.call(this,obj));
		}
	};

	theWebUI.getData = function( hash, no ) {
		window.location = './plugins/whatbox-data/action.php?hash=' + hash + '&no=' + no;
	};

	if (plugin.canChangeMenu()) {
		plugin.createFileMenu = theWebUI.createFileMenu;
		theWebUI.createFileMenu = function( e, id ) {
			if (plugin.createFileMenu.call(this, e, id)) {
				if (plugin.enabled) {
					theContextMenu.add([CMENU_SEP]);
					var fno = null;
					var table = this.getTable("fls");
					if (table.selCount != 1) {
						return false;
					}

					var fid = table.getFirstSelected();
					if (this.settings["webui.fls.view"]) {
						fno = obj.id.replace('_f_', '');
					} else if (!this.dirs[this.dID].isDirectory(fid)) {
						fno = fid.substr(3);
					}
					theContextMenu.add( [theUILang.getData, "theWebUI.getData('" + theWebUI.dID + "',"+fno+")"] );
				}
				return(true);
			}
			return(false);
		}
	}
})();
