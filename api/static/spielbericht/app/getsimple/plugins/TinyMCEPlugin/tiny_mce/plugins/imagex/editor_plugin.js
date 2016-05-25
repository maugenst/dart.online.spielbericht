(function() {
	
	tinymce.create('tinymce.plugins.ImageXPlugin', {
		init : function(ed, url) {
			// Register commands
			ed.addCommand('mceImageX', function() {
				// Internal image object like a flash placeholder
				if (ed.dom.getAttrib(ed.selection.getNode(), 'class').indexOf('mceItem') != -1)
					return;

				ed.windowManager.open({
					file : url + '/image.htm',
					width : 480 + parseInt(ed.getLang('imagex.delta_width', 0)),
					height : 385 + parseInt(ed.getLang('imagex.delta_height', 0)),
					inline : 1
				}, {
					plugin_url : url
				});
			});

			// Register buttons
			ed.addButton('image', {
				title : 'imagex.image_desc',
				cmd : 'mceImageX'
			});
		},

		getInfo : function() {
			return {
				longname : 'mceImageX (based on advimage)',
				author : 'iDeFiX',
				authorurl : 'http://www.idefix4u.nl',
				infourl : '',
				version : '0.1-dev'
			};
		}
	});

	// Register plugin
	tinymce.PluginManager.add('imagex', tinymce.plugins.ImageXPlugin);
})();