<?php if(!defined('IN_GS')){ die('you cannot load this page directly.'); } 
/****************************************************
*
* @File: 		footer.inc.php
* @Package:		GetSimple
* @Action:		New theme for GetSimple CMS
*
*****************************************************/
?>
	<!-- .footer -->
	<footer class="footer">
		<div class="container bg-primary contrast">
			<div class="row">
			
				<div class="col-sm-5"><?php echo date('Y'); ?> <a href="<?php get_site_url(); ?>" ><?php get_site_name(); ?></a></div>
				
				<div class="col-sm-7 text-right">New Theme by <a href="http://getsimplethemes.ru/" >GST</a> &middot; <?php get_site_credits(); ?></div>
				
			</div>
		</div>
	</footer>
	<!-- /.footer -->
	
	<?php get_footer(); ?>
	
</body>
</html>