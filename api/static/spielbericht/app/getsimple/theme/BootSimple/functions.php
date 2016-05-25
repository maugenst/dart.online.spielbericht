<?php if(!defined('IN_GS')){ die('you cannot load this page directly.'); }
/****************************************************
*
* @File: 		functions.php
* @Package:		BootSimple
* @Action:		Bootsimple theme for GetSimple CMS
*
*****************************************************/

/**
 * 
 *
 * 
 *
 * @param string $name - This is the slug of the link you want to create
 * @return string
 */

function get_bootsimple_navigation($currentpage){

    // Put all visible parentmenuitems in the Array $menu_parents
    // Put all visible submenuitems (only one level deep),
    // in the Array $menu_children.
    // Items are also sorted 
	$menu = '';
	global $pagesArray;
	$menu_parents  = array();
    $menu_children = array();
	$pagesSorted = subval_sort($pagesArray,'menuOrder');
	if (count($pagesSorted) != 0) { 
		foreach ($pagesSorted as $page) {
			$sel = ''; $classes = '';
			$url_nav = $page['url'];
			if ($page['menuStatus'] == 'Y') {
                if ( empty($page['parent']) ){
                    $menu_parents[] = $page;
                } else {
                    $menu_children[] = $page;
                }
			}
		}
	}
    //echo "<pre>parents\n----------\n" . print_r($menu_parents, 1) . "</pre>";
    foreach($menu_parents as $ppage) {
        $menuchildren = array();
        //$classes = '';
        $parent_tab_class='';
		$url_nav = $ppage['url'];
        foreach($menu_children as $cpage){
            if ($ppage['slug'] == $cpage['parent']){
                $menuchildren[] = $cpage;
				if ($cpage['url'] == $currentpage){
					$parent_tab_class = " active";
				}	
            }
        }
        
        if (sizeof($menuchildren) == 0){
            // parent without children, so normal link
            if ("$currentpage" == "$url_nav") $parent_tab_class .= " active";
            $menu .= '<li class="'. $parent_tab_class .'"><a href="'. find_url($ppage['url'],$ppage['parent']) . '" title="'. encode_quotes(cl($ppage['title'])) .'">'.strip_decode($ppage['menu']).'</a></li>'."\n";
        } else {
            // parent has children so use special bootstrap menuitems and classes
            $menu .= '<li class="dropdown ' . $parent_tab_class . '">';
            $menu .= '<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">'.strip_decode($ppage['menu']).'<span class="caret"></span></a>';
            $menu .= '<ul class="dropdown-menu" role="menu">';
            // Now put the children under the parent, highlicht is submenu is current page
            foreach($menu_children as $cpage){
                if ($ppage['slug'] == $cpage['parent']){
                   if ($cpage['url'] == $currentpage){
                       // Highlight submenuitem
                       $child_tab_class = " active";
                   }else{
                       $child_tab_class = '';
                   } 
                   $menu .= '<li class="'  . $child_tab_class .  '"><a href="'  . find_url($cpage['url'],$cpage['parent']) .
				   '" title="' . encode_quotes(cl($cpage['title'])) .  '">' . $cpage['menu'] . '</a></li>'."\n";  
                }
            }
            $menu .= '</ul></li>';
        }    
    }    
	echo exec_filter('menuitems',$menu);
}
