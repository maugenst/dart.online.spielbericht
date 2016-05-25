<?php if(!defined('IN_GS')){ die('you cannot load this page directly.'); } 
/****************************************************
*
* @File: 			sidebar.inc.php
* @Package:		GetSimple
* @Action:		Iridium theme for GetSimple CMS
*
*****************************************************/
?>

				<!-- Sidebar -->
				<div id="sidebar" class="4u">
					<section>
						<?php  
							if (component_exists('sidebar-'.get_page_slug(false)))
								{get_component('sidebar-'.get_page_slug(false));}
							else {get_component('sidebar');}	
						?>
					</section>
				</div>