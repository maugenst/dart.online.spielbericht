<?php if(!defined('IN_GS')){ die('you cannot load this page directly.'); }
/****************************************************
*
* @File: 		template.php
* @Package:		GetSimple
* @Action:		New theme for GetSimple CMS
*
*****************************************************/


# Get this theme's settings based on what was entered within its plugin. 
# This function is in functions.php 
$innov_settings = Innovation_Settings();

# Include the header template
include('header.inc.php'); 
?>
	<!-- .content -->
	<div class="content">
		<div class="container">
			<div class="row">
				
				<!-- .main -->
				<div class="col-sm-8 main">				
					<?php get_page_content(); ?>				
					<div class="pade-footer">
						<p>Published on <time datetime="<?php get_page_date('Y-m-d'); ?>" pubdate><?php get_page_date('F jS, Y'); ?></time></p>
					</div>
				</div>
				<!-- /.main -->
				
				<!-- .sidebar -->
				<aside class="col-sm-4 sidebar">	
					<?php get_component('sidebar');	?>
				</aside>
				<!-- /.sidebar -->
				
			</div>
		</div>
	</div>
	<!-- /.content -->
	
<!-- include the footer template -->
<?php include('footer.inc.php'); ?>