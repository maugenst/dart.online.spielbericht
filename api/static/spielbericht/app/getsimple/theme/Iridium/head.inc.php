<?php if(!defined('IN_GS')){ die('you cannot load this page directly.'); } 
/****************************************************
*
* @File: 			head.inc.php
* @Package:		GetSimple
* @Action:		Iridium theme for GetSimple CMS
*
*****************************************************/
?>
	<!-- Site Title -->
	<title><?php get_page_clean_title(); ?> &mdash; <?php get_site_name(); ?></title>	
	<meta http-equiv="content-type" content="text/html; charset=utf-8" />
	<!--[if lte IE 8]><script src="<?php get_theme_url(); ?>js/html5shiv.js"></script><![endif]-->
		<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
		<script src="<?php get_theme_url(); ?>/js/skel.min.js"></script>
		<script src="<?php get_theme_url(); ?>/js/skel-panels.min.js"></script>
		<script> var prefixUrl = '<?php get_theme_url(); ?>'; </script>
		<script src="<?php get_theme_url(); ?>/js/init.js"></script>
		<noscript>
			<link rel="stylesheet" href="<?php get_theme_url(); ?>/css/skel-noscript.css" />
			<link rel="stylesheet" href="<?php get_theme_url(); ?>/css/style.css" />
			<link rel="stylesheet" href="<?php get_theme_url(); ?>/css/style-desktop.css" />
		</noscript>
		<!--[if lte IE 8]><link rel="stylesheet" href="<?php get_theme_url(); ?>css/ie/v8.css" /><![endif]-->
		<!--[if lte IE 9]><link rel="stylesheet" href="<?php get_theme_url(); ?>css/ie/v9.css" /><![endif]-->	
	<link href='http://fonts.googleapis.com/css?family=Arimo:400,700' rel='stylesheet' type='text/css'>
	<?php get_header(); ?>