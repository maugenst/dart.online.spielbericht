<?php if(!defined('IN_GS')){ die('you cannot load this page directly.'); }
/****************************************************
*
* @File: 		header.inc.php
* @Package:		GetSimple
* @Action:	    New theme for GetSimple CMS
*
*****************************************************/
?>
<!DOCTYPE html>
<html lang="<?php global $language; echo @$language ? $language : 'en'; ?>">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

	<title><?php get_page_clean_title(); ?> - <?php get_site_name(); ?></title>
	
	<!-- Latest compiled and minified CSS -->
	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">

	<link rel="stylesheet" type="text/css" href="<?php get_theme_url(); ?>/css/style.css">
	
	<!-- Font Awesome -->
	<link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css">
	
	<!-- Scripts -->
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
	<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>
	
	<?php get_header(); ?>
	
	<!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
      <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->
	
</head> 
<body id="<?php get_page_slug(); ?>">

	<!-- .atop -->
	<div class="atop">
		<div class="container">
			<div class="row">
			
				<div class="col-md-6 phone"><i class="fa fa-mobile fa-lg"></i> <a href="tel:+1234567890"> +1234567890</a></div>
				
				<div class="col-md-6 text-right social">
					<?php
						if($innov_settings){
							foreach($innov_settings as $id=>$setting){
								if ($setting  != '' ){
									echo '<a href="'.$setting.'"><i class="fa fa-'.$id.'"></i></a>';
								}
							}
						}
		?>
				</div>
				
			</div>
		</div>
	</div>
	<!-- /.atop -->

	<!-- .navbar-wrapper -->
    <div class="navbar-wrapper">
		<div class="container">
		
			<!-- .navbar -->
			<nav class="navbar bg-primary contrast">
				<div class="container">
				
					<!-- .navbar-header -->
					<div class="navbar-header">
						<button type="button" class="navbar-toggle collapsed contrast" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
							<span class="sr-only">Toggle navigation</span>
							<span class="icon-bar"></span>
							<span class="icon-bar"></span>
							<span class="icon-bar"></span>
						</button>
						<a class="navbar-brand" href="<?php get_site_url(); ?>"><?php get_site_name(); ?></a>
					</div>
					<!-- /.navbar-header -->
					
					<!-- .navbar-collapse -->
					<div id="navbar" class="navbar-collapse collapse navbar-right">
						<ul class="nav navbar-nav">
							<?php function_exists('get_i18n_navigation') ? get_i18n_navigation(return_page_slug(), 0, 99, I18N_SHOW_MENU) : get_navigation(return_page_slug()); ?>
						</ul>
					</div>
					<!-- /.navbar-collapse -->
					
				</div>
			</nav>
			<!-- /.navbar -->

		</div>
    </div>
	<!-- /.navbar-wrapper -->
	
	<!-- .header -->
	<header class="header">	
		<div class="container">
			
			<?php if ( return_page_slug() == 'index' ) { ?>
			
			<div class="jumbotron">
				<h1><?php get_page_title(); ?></h1>
				<p><?php get_component('tagline'); ?></p>
			</div>
			
			<?php } else {?>

			<div class="page-header">
				<h1><?php get_page_title(); ?></h1>
			</div>
			<!-- .breadcrumb -->
			<ol class="breadcrumb">
				<li><a href="<?php get_site_url(); ?>">Home</a></li>
				<?php Innovation_Parent_Link(get_parent(FALSE)); ?>
				<li class="active"><?php get_page_clean_title(); ?></li>
			</ol>
			<!-- /.breadcrumb -->
			
			<?php } ?>
		
		</div>
	</header>
	<!-- /.header -->