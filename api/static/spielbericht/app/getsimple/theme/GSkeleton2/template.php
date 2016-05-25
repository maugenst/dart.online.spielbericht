<?php if(!defined('IN_GS')){ die('you cannot load this page directly.'); }
/****************************************************
*
* @File: 		template.php
* @Package:		GetSimple
* @Action:		GSkeleton2 v1.1 Boilerplate Theme for GetSimple CMS
*
*****************************************************/
?>

<!DOCTYPE html>
<html lang="en">
<head>

  <!-- Basic Page Needs
  –––––––––––––––––––––––––––––––––––––––––––––––––– -->
  <meta charset="utf-8">
  <title><?php get_page_clean_title(); ?> &mdash; <?php get_site_name(); ?></title>

  <!-- Mobile Specific Metas
  –––––––––––––––––––––––––––––––––––––––––––––––––– -->
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">

  <!-- FONT
  –––––––––––––––––––––––––––––––––––––––––––––––––– -->
  <link href='http://fonts.googleapis.com/css?family=Raleway:400,300,600' rel='stylesheet' type='text/css'>

  <!-- CSS
  –––––––––––––––––––––––––––––––––––––––––––––––––– -->
  <link rel="stylesheet" href="<?php get_theme_url(); ?>/css/normalize.css">
  <link rel="stylesheet" href="<?php get_theme_url(); ?>/css/skeleton.css">
  <link rel="stylesheet" href="<?php get_theme_url(); ?>/css/style.css">

  <!-- Favicon
  –––––––––––––––––––––––––––––––––––––––––––––––––– -->
  <link rel="icon" type="image/png" href="<?php get_theme_url(); ?>/images/favicon.png" />
  
  <!-- Required for Getimple
  –––––––––––––––––––––––––––––––––––––––––––––––––– -->
  <?php get_header(); ?>

</head>
<body id="<?php get_page_slug(); ?>" >

  <!-- Primary Page Layout
  –––––––––––––––––––––––––––––––––––––––––––––––––– -->
  <div id="container" class="container">
    <div class="row">
		<nav class="twelve columns">
			<ul><?php get_navigation(return_page_slug()); ?></ul>
		</nav>
	</div>
	
      <div class="row">
		<header class="twelve columns">
			<h1><a href="<?php get_site_url(); ?>"><?php get_site_name(); ?></a></h1>
				<h5><?php get_component('tagline');	?></h5>
			<hr />
		</header>
      </div>
	  
	  <div class="row">
		<section class="two-thirds column">
			<h3><?php get_page_title(); ?></h3>
			<?php get_page_content(); ?>
		</section>
		<aside class="one-third column">
			<?php get_component('sidebar');	?>
		</aside>
		<hr />
      </div>

	<div class="row">
		<hr>
		<footer>
			<div class ="six columns" >
				<?php get_site_name(); ?> &copy; <?php echo date('Y'); ?>
			</div>
			<div class ="six columns" >
				<?php get_site_credits(); ?>
			</div>
			<?php get_footer(); ?>
		</footer>
	</div>
	  
  </div><!-- close container -->

<!-- End Document
  –––––––––––––––––––––––––––––––––––––––––––––––––– -->
</body>
</html>