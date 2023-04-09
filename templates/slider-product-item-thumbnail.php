<?php
$image = get_the_post_thumbnail( $post );
?>

<div class="psb-slider-product-item-thumbnail-wrap">
	<a href="<?php echo esc_url( $url ); ?>">
		<?php echo $image; ?>
	</a>
</div>
