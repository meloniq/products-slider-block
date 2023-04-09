<?php
$title = get_the_title( $post );
?>

<div class="psb-slider-product-item-title-wrap">
	<a href="<?php echo esc_url( $url ); ?>" class="psb-loop-product__link">
		<?php echo esc_html( $title ); ?>
	</a>
</div>
