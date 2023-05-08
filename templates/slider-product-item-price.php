<?php
$price = $product->get_price_html();
?>

<div class="psb-slider-product-item-price-wrap">
	<span class="price">
		<?php echo wp_kses_post( $price ); ?>
	</span>
</div>
