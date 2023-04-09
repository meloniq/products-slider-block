<?php
/**
 * Plugin Name:       Products Slider Block for WooCommerce
 * Plugin URI:        https://blog.meloniq.net/products-slider-block/
 * Description:       Products slider block for WooCommerce.
 *
 * Requires at least: 6.1
 * Requires PHP:      7.4
 * Version:           1.0
 *
 * Author:            MELONIQ.NET
 * Author URI:        https://blog.meloniq.net
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       products-slider-block
 *
 * @package           meloniq
 */


/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Registers also all assets so they can be enqueued.
 *
 * @return void
 */
function psb_block_init() {
	wp_register_style(
		'slick-style',
		plugins_url( 'assets/slick.css', __FILE__ ),
		array(),
		'1.8.1'
	);

	wp_register_script(
		'slick-js',//essential-blocks-slickjs
		plugins_url( 'assets/slick.min.js', __FILE__ ),
		array( 'jquery' ),
		'1.8.1'
	);

	register_block_type( __DIR__ . '/build', array(
		'render_callback' => 'psb_block_render_content',
	) );
}
add_action( 'init', 'psb_block_init' );


/**
 * Enqueue scripts in page footer if slider block detected.
 *
 * @return void
 */
function psb_block_wp_footer() {
	if ( did_action( 'psb_block_prepared_content' ) ) {
		wp_enqueue_style( 'slick-style' );
		wp_enqueue_script( 'slick-js' );//essential-blocks-slickjs
	}
}
add_action( 'wp_footer', 'psb_block_wp_footer', 1 );


/**
 * Frontend block renderer.
 *
 * @param array $attr
 *
 * @return string
 */
function psb_block_render_content( $attr ) {
	$products  = psb_block_get_products( $attr );
	$slider_id = wp_unique_id( 'products-slider-' );
	$slider_cn = 'products-slider slider-style-classic';

	if ( empty( $products ) ) {
		return '';
	}

	$output = '<div ' . get_block_wrapper_attributes() . '>' . PHP_EOL;
	$output .= '<div class="products-slider-wrapper">' . PHP_EOL;
	$output .= '<ul class="' . $slider_cn . '" id="' . $slider_id . '">' . PHP_EOL;

	foreach ( $products as $post ) {
		ob_start();
		include( dirname( __FILE__ ) . '/templates/slider-product-item.php' );
		$output .= ob_get_clean();
	}

	$output .= '</ul>' . PHP_EOL;
	$output .= '</div>' . PHP_EOL;
	$output .= '</div>' . PHP_EOL;

	$output .= psb_block_get_slider_js_init( $attr, $slider_id );
	$output .= psb_block_get_custom_css( $attr, $slider_id );

	do_action( 'psb_block_prepared_content' );

	return apply_filters( 'psb_block_render_content', $output, $attr, $products );
}


/**
 * Get products by block attr.
 *
 * @param array $attr
 *
 * @return array
 */
function psb_block_get_products( $attr ) {
	$args = array(
		'post_type'      => 'product',
		'post_status'    => 'publish',
		'posts_per_page' => $attr['numberOfItems'],
		'orderby'        => $attr['itemsOrderBy'],
		'order'          => $attr['itemsOrder'],
	);

	if ( $attr['categoryId'] ) {
		$args['tax_query'] = array(
			array(
				'taxonomy' => 'product_cat',
				'field'    => 'term_id',
				'terms'    => $attr['categoryId'],
			),
		);
	}

	if ( $attr['itemsExclude'] ) {
		$args['post__not_in'] = $attr['itemsExclude'];
	}

	$products_q = new WP_Query( $args );

	if ( empty( $products_q->posts ) ) {
		return array();
	}

	return $products_q->posts;
}


/**
 * Prepares JS code to initialize slider.
 *
 * @param array $attr
 * @param string $slider_id
 *
 * @return string
 */
function psb_block_get_slider_js_init( $attr, $slider_id ) {
	$params = psb_block_get_slider_js_params( $attr );
	ob_start();
	?>
	<script>
	jQuery(document).ready(function($){
		$("#<?php echo esc_js( $slider_id ); ?>").slick(<?php echo wp_json_encode( $params ); ?>);
	});
	</script>
	<?php
	return ob_get_clean();
}


/**
 * Prepares CSS code to customize slider display.
 *
 * @param array $attr
 * @param string $slider_id
 *
 * @return string
 */
function psb_block_get_custom_css( $attr, $slider_id ) {
	$custom_css = '';

	if ( $attr['buttonColor'] ) {
		$custom_css .= '#' . $slider_id . ' .order_now_button {background-color: ' . $attr['buttonColor'] . ' !important;}' . PHP_EOL;
	}

	if ( $attr['buttonColorHover'] ) {
		$custom_css .= '#' . $slider_id . ' .order_now_button:hover {background-color: ' . $attr['buttonColorHover'] . ' !important;}' . PHP_EOL;
	}

	if ( $attr['buttonColorFont'] ) {
		$custom_css .= '#' . $slider_id . ' .order_now_button {color: ' . $attr['buttonColorFont'] . ' !important;}' . PHP_EOL;
	}

	$default_sizes = array(
		'top'    => '0px',
		'bottom' => '0px',
		'left'   => '0px',
		'right'  => '0px',
	);

	if ( $attr['paddingSize'] ) {
		$attr['paddingSize'] = array_merge( $default_sizes, $attr['paddingSize'] );
		$custom_css .= '#' . $slider_id . ' .psb-slider-product-item-wrapper {
			padding-top: ' . $attr['paddingSize']['top'] . ' !important;
			padding-bottom: ' . $attr['paddingSize']['bottom'] . ' !important;
			padding-left: ' . $attr['paddingSize']['left'] . ' !important;
			padding-right: ' . $attr['paddingSize']['right'] . ' !important;
		}' . PHP_EOL;
	}

	if ( $attr['marginSize'] ) {
		$attr['marginSize'] = array_merge( $default_sizes, $attr['marginSize'] );
		$custom_css .= '#' . $slider_id . ' .psb-slider-product-item-wrapper {
			margin-top: ' . $attr['marginSize']['top'] . ' !important;
			margin-bottom: ' . $attr['marginSize']['bottom'] . ' !important;
			margin-left: ' . $attr['marginSize']['left'] . ' !important;
			margin-right: ' . $attr['marginSize']['right'] . ' !important;
		}' . PHP_EOL;
	}

	if ( $attr['paddingSizeButton'] ) {
		$attr['paddingSizeButton'] = array_merge( $default_sizes, $attr['paddingSizeButton'] );
		$custom_css .= '#' . $slider_id . ' .order_now_button {
			padding-top: ' . $attr['paddingSizeButton']['top'] . ' !important;
			padding-bottom: ' . $attr['paddingSizeButton']['bottom'] . ' !important;
			padding-left: ' . $attr['paddingSizeButton']['left'] . ' !important;
			padding-right: ' . $attr['paddingSizeButton']['right'] . ' !important;
		}' . PHP_EOL;
	}

	if ( empty( $custom_css ) ) {
		return $custom_css;
	}

	return '<style>' . $custom_css . '</style>';
}


/**
 * Prepares slider params.
 *
 * @param array $attr
 *
 * @return array
 */
function psb_block_get_slider_js_params( $attr ) {
	$params = array(
		'arrows'         => true,
		'autoplay'       => $attr['slidesAutoplay'],
		'autoplaySpeed'  => $attr['slidesAutoplaySpeed'] * 1000,
		'pauseOnHover'   => $attr['slidesPauseOnHover'],
		'infinite'       => $attr['slidesInfinite'],
		'slidesToShow'   => $attr['slidesToShowDesktop'],
		'slidesToScroll' => $attr['slidesToScrollDesktop'],
		'speed'          => $attr['slidesAnimationSpeed'] * 100,
		'responsive'     => array(
			array(
				'breakpoint' => 1024,
				'settings'   => array(
					'slidesToShow' => $attr['slidesToShowTablet'],
				),
			),
			array(
				'breakpoint' => 767,
				'settings'   => array(
					'slidesToShow' => $attr['slidesToShowMobile'],
				),
			),
		),
		'prevArrow' => '<button type="button" class="slick-prev slick-arrow fa fa-angle-left" aria-label="Previous"></button>',
		'nextArrow' => '<button type="button" class="slick-next slick-arrow fa fa-angle-right" aria-label="Next"></button>',
	);

	return $params;
}


/**
 * Register additional fields for the 'posts' endpoint.
 *
 * @return void
 */
function psb_block_rest_register_fields() {
	// register fields on demand
	if ( empty( $_GET['psb_block'] ) ) {
		return;
	}

	// Product Price HTML
	register_rest_field( 'product', 'product_price_html', array(
		'get_callback' => 'psb_block_get_product_price_html',
		'schema' => array(
			'description' => __( 'Product Price HTML.', 'healy-ps-block' ),
			'type'        => 'string'
		),
	) );
}
add_action( 'rest_api_init', 'psb_block_rest_register_fields', 10 );


/**
 * Returns Product Price HTML.
 *
 * @param array $post_arr
 *
 * @return string
 */
function psb_block_get_product_price_html( $post_arr ) {
	$post_id = $post_arr['id'];

	if ( ! function_exists( 'wc_get_product' ) ) {
		return '';
	}

	if ( ! $post_id || ! $product = wc_get_product( $post_id ) ) {
		return '';
	}

	return $product->get_price_html();
}

