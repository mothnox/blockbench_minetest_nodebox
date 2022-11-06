/*
     This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>. 
*/

/*
Some code of this plugin was copied and modified from java_block.js of the master branch of blockbench (https://github.com/JannisX11/blockbench), on Nov. 5, 2022.
*/

Plugin.register('minetest_nodebox', {
	title: 'Minetest Nodebox',
	author: 'mothnox',
	icon: 'placeholder',
	description: 'Adds a format for creating nodeboxes for Minetest',
	about: 'It works. Sort of.',
	version: '0.1.0',
	variant: 'both',
	onload(){
		
		nodebox_codec = new Codec("minetest_nodebox_codec", {
			name: "Minetest Nodebox",
			extension: "lua",
			remember: true,
			compile(){
				var clear_elements = [];
				function computeCube(s) {
					if (s.export == false) return;
					
					var element = s.from.slice();
					var e_to = s.to.slice();
					for (var i = 0; i < e_to.length; i++) {
						element.splice(element.length, 0, e_to[i]);
					}
					
					for (var i = 0; i < element.length; i++) {
						element[i] = (element[i]/16.0)
					}
					
					element[1] = element[1] - 0.5
					element[4] = element[4] - 0.5

					clear_elements.push(element)

				}
				
				function iterate(arr) {
					var i = 0;
					if (!arr || !arr.length) {
						return;
					}
					for (i=0; i<arr.length; i++) {
						if (arr[i].type === 'cube') {
							computeCube(arr[i])
						} else if (arr[i].type === 'group') {
							iterate(arr[i].children)
						}
					}
				}
				
				iterate(Outliner.root)
				
				var blockmodel = {}
				blockmodel.elements = clear_elements
				
				this.dispatchEvent("compile", {blockmodel})

        return autoStringify(blockmodel)
			},
			parse(){
				
			},
		})
		
		nodebox_format = new ModelFormat({
			id: "minetest_nodebox",
			name: "Minetest Nodebox",
			description: "Minetest nodebox format",
			show_on_start_screen: true,
			box_uv: true,
			optional_box_uv: true,
			single_texture: false,
			centered_grid: true,
			bone_rig: false,
			rotate_cubes: false,
			integer_size: false,
			locators: false,
			canvas_limit:false,
			animation_mode:false,
			nodebox_codec,
			
		})
		nodebox_codec.format = nodebox_format;
		
		action = new Action("export_minetest_nodebox", {
      name: "Export Minetest Nodebox",
      icon: "icon-format_block",
      click: function () { nodebox_codec.export() }
    })
    MenuBar.addAction(action, "file.export.0")
    nodebox_codec.export_action = action
    
	},
	on_unload() {
		nodebox_codec.delete()
		nodebox_format.delete()
		action.delete()
		MenuBar.removeAction("file.export.export_minetest_nodebox")
	}
});