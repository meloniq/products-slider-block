<?php
$product   = wc_get_product( $post );
$url       = get_permalink( $post );
$css_class = 'product';
?>

<li class="<?php echo esc_attr( $css_class ); ?>">
	<div class="psb-slider-product-item-wrapper">
		<?php include( dirname( __FILE__ ) . '/slider-product-item-thumbnail.php' ); ?>
		<?php include( dirname( __FILE__ ) . '/slider-product-item-title.php' ); ?>
		<?php include( dirname( __FILE__ ) . '/slider-product-item-price.php' ); ?>
		<?php include( dirname( __FILE__ ) . '/slider-product-item-button.php' ); ?>
	</div>
</li>
