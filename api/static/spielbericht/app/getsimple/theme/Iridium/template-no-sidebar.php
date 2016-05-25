<?php if(!defined('IN_GS')){ die('you cannot load this page directly.'); }
/****************************************************
*
* @File: 			template.php
* @Package:		GetSimple
* @Action:		Iridium theme for GetSimple CMS
*
*****************************************************/
?>
<!DOCTYPE html>
<html>
<head>
	<?php include('head.inc.php'); ?>
</head>

<body id="<?php get_page_slug(); ?>" <?php if (return_page_slug()=='index') echo 'class="homepage"'; ?>>
	<!-- Header -->
	<div id="header">
			<div class="container"> 
				<div id="logo">
					<h1><a href="<?php get_site_url(); ?>"><?php get_site_name(); ?></a></h1>
					<span><?php get_component('tagline');	?></span>
				</div>		
				
				<nav id="nav">	
					<ul><?php get_navigation(return_page_slug()); ?></ul>			
				</nav>
			</div><!-- end container -->
	</div><!-- end header -->
	
	<!-- Main -->
	<div id="main">
		<div class="container">
			<div class="row"> 	
			
				<!-- Content -->
				<div id="content" class="12u skel-cell-important">
					<section>
						<header>
							<h2><?php get_page_title(); ?></h2>
							<span class="byline"><?php get_component('tagline');	?></span>
						</header>
						<?php get_page_content(); ?>
					</section>
				</div><!-- end content -->
			
			</div><!-- end row -->
		</div><!-- end container -->
	</div><!-- end main -->
	
	<?php include('featured.inc.php'); ?>
	<?php include('footer.inc.php'); ?>
</body>
</html>
