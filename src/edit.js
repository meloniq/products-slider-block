/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-i18n/
 */
import { __ } from '@wordpress/i18n';

/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import {
	useBlockProps,
	InspectorControls,
	PanelColorSettings,
} from '@wordpress/block-editor';

import {
	FormTokenField,
	PanelBody,
	PanelRow,
	QueryControls,
	RangeControl,
	SelectControl,
	ToggleControl,
	__experimentalBoxControl as BoxControl,
} from '@wordpress/components';

import { useDisabled } from '@wordpress/compose';
import { useSelect } from '@wordpress/data';
import { forEach } from 'lodash';
import Slider from 'react-slick';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './editor.scss';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @param  root0
 * @param  root0.attributes
 * @param  root0.setAttributes
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {WPElement} Element to render.
 */
export default function Edit( { attributes, setAttributes } ) {
	const {
		numberOfItems,
		categoryId,
		slidesToShowDesktop,
		slidesToShowTablet,
		slidesToShowMobile,
		slidesAutoplay,
		slidesAutoplaySpeed,
		slidesPauseOnHover,
		slidesInfinite,
		slidesToScrollDesktop,
		slidesAnimationSpeed,
		itemsExclude,
		itemsOrderBy,
		itemsOrder,
		buttonColor,
		buttonColorHover,
		buttonColorFont,
		paddingSize,
		marginSize,
		paddingSizeButton,
	} = attributes;

	const { __experimentalGetPreviewDeviceType } = useSelect( ( select ) => {
		return select( 'core/edit-post' );
	} );

	const slidesToShowPreview = () => {
		if ( __experimentalGetPreviewDeviceType() === 'Mobile' ) {
			return slidesToShowMobile;
		} else if ( __experimentalGetPreviewDeviceType() === 'Tablet' ) {
			return slidesToShowTablet;
		}

		return slidesToShowDesktop;
	};

	const terms = useSelect( ( select ) => {
		return select( 'core' ).getEntityRecords( 'taxonomy', 'product_cat', {
			per_page: -1,
			_fields: 'id,name',
		} );
	} );

	const categoryIds = [
		{
			value: 0,
			label: __( '-- Select --', 'products-slider-block' ),
		},
	];

	if ( terms ) {
		forEach( terms, ( term ) => {
			categoryIds.push( {
				value: term.id,
				label: term.name,
			} );
		} );
	}

	const products = useSelect(
		( select ) => {
			return select( 'core' ).getEntityRecords( 'postType', 'product', {
				per_page: numberOfItems,
				post_status: 'publish',
				psb_block: true,
				...( categoryId &&
					'0' !== categoryId && { product_cat: categoryId } ),
				...( itemsExclude && { exclude: itemsExclude } ),
				orderby: itemsOrderBy,
				order: itemsOrder,
				_embed: true,
			} );
		},
		[ numberOfItems, categoryId, itemsExclude, itemsOrderBy, itemsOrder ]
	);

	const productsAll = useSelect( ( select ) => {
		return select( 'core' ).getEntityRecords( 'postType', 'product', {
			per_page: -1,
			post_status: 'publish',
		} );
	} );

	let productNames = [];
	let productsExcludeFieldValue = [];
	if ( productsAll !== null ) {
		productNames = productsAll.map( ( post ) => post.title.raw );

		productsExcludeFieldValue = itemsExclude.map( ( postId ) => {
			const wantedProduct = productsAll.find( ( post ) => {
				return post.id === postId;
			} );
			if ( wantedProduct === undefined || ! wantedProduct ) {
				return false;
			}
			return wantedProduct.title.raw;
		} );
	}

	const orderByOptions = [
		{
			value: 'date',
			label: __( 'Date', 'products-slider-block' ),
		},
		{
			value: 'title',
			label: __( 'Title', 'products-slider-block' ),
		},
	];

	const orderOptions = [
		{
			value: 'desc',
			label: __( 'Descending', 'products-slider-block' ),
		},
		{
			value: 'asc',
			label: __( 'Ascending', 'products-slider-block' ),
		},
	];

	//Slider Settings
	const settings = {
		arrows: true,
		autoplay: slidesAutoplay,
		autoplaySpeed: slidesAutoplaySpeed * 1000,
		pauseOnHover: slidesPauseOnHover,
		infinite: slidesInfinite,
		slidesToShow: slidesToShowPreview(),
		slidesToScroll: slidesToScrollDesktop,
		speed: slidesAnimationSpeed * 100,
		responsive: [
			{
				breakpoint: 1024,
				settings: {
					slidesToShow: slidesToShowTablet,
				},
			},
			{
				breakpoint: 767,
				settings: {
					slidesToShow: slidesToShowMobile,
				},
			},
		],
		prevArrow: <SlickPrevArrow />,
		nextArrow: <SlickNextArrow />,
	};

	// requires WordPress 6.1
	const disabledRef = useDisabled();

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Filter by', 'products-slider-block' ) }
				>
					<PanelRow>
						<SelectControl
							label={ __( 'Category', 'products-slider-block' ) }
							value={ categoryId }
							options={ categoryIds }
							onChange={ ( value ) =>
								setAttributes( {
									categoryId: parseInt( value ),
								} )
							}
						/>
					</PanelRow>
					<PanelRow>
						<SelectControl
							label={ __( 'Order by', 'products-slider-block' ) }
							value={ itemsOrderBy }
							options={ orderByOptions }
							onChange={ ( value ) =>
								setAttributes( { itemsOrderBy: value } )
							}
						/>
					</PanelRow>
					<PanelRow>
						<SelectControl
							label={ __( 'Order', 'products-slider-block' ) }
							value={ itemsOrder }
							options={ orderOptions }
							onChange={ ( value ) =>
								setAttributes( { itemsOrder: value } )
							}
						/>
					</PanelRow>
					<PanelRow>
						<FormTokenField
							label={ __(
								'Exclude products',
								'products-slider-block'
							) }
							value={ productsExcludeFieldValue }
							suggestions={ productNames }
							maxSuggestions={ 20 }
							onChange={ ( itemsExcludeArr ) => {
								// Build array of selected products.
								const selectedProductsArray = [];
								itemsExcludeArr.map( ( productName ) => {
									const matchingProduct = productsAll.find(
										( post ) => {
											return (
												post.title.raw === productName
											);
										}
									);
									if ( matchingProduct !== undefined ) {
										selectedProductsArray.push(
											matchingProduct.id
										);
									}
									return true;
								} );

								setAttributes( {
									itemsExclude: selectedProductsArray,
								} );
							} }
						/>
					</PanelRow>
				</PanelBody>
				<PanelBody
					title={ __( 'Slider Settings', 'products-slider-block' ) }
					initialOpen={ false }
				>
					<PanelRow>
						<QueryControls
							numberOfItems={ numberOfItems }
							onNumberOfItemsChange={ ( value ) =>
								setAttributes( { numberOfItems: value } )
							}
							minItems={ 3 }
							maxItems={ 15 }
						/>
					</PanelRow>
					<PanelRow>
						<RangeControl
							label={ __(
								'Slides to show - Desktop',
								'products-slider-block'
							) }
							value={ slidesToShowDesktop }
							onChange={ ( value ) =>
								setAttributes( { slidesToShowDesktop: value } )
							}
							min={ 1 }
							max={ 6 }
							required
						/>
					</PanelRow>
					<PanelRow>
						<RangeControl
							label={ __(
								'Slides to show - Tablet',
								'products-slider-block'
							) }
							value={ slidesToShowTablet }
							onChange={ ( value ) =>
								setAttributes( { slidesToShowTablet: value } )
							}
							min={ 1 }
							max={ 6 }
							required
						/>
					</PanelRow>
					<PanelRow>
						<RangeControl
							label={ __(
								'Slides to show - Mobile',
								'products-slider-block'
							) }
							value={ slidesToShowMobile }
							onChange={ ( value ) =>
								setAttributes( { slidesToShowMobile: value } )
							}
							min={ 1 }
							max={ 6 }
							required
						/>
					</PanelRow>
					<PanelRow>
						<ToggleControl
							label={ __( 'Autoplay', 'products-slider-block' ) }
							checked={ slidesAutoplay }
							onChange={ () =>
								setAttributes( {
									slidesAutoplay: ! slidesAutoplay,
								} )
							}
						/>
					</PanelRow>
					<PanelRow>
						<RangeControl
							label={ __(
								'Autoplay speed',
								'products-slider-block'
							) }
							value={ slidesAutoplaySpeed }
							onChange={ ( value ) =>
								setAttributes( { slidesAutoplaySpeed: value } )
							}
							min={ 1 }
							max={ 20 }
							required
						/>
					</PanelRow>
					<PanelRow>
						<ToggleControl
							label={ __(
								'Pause on hover',
								'products-slider-block'
							) }
							checked={ slidesPauseOnHover }
							onChange={ () =>
								setAttributes( {
									slidesPauseOnHover: ! slidesPauseOnHover,
								} )
							}
						/>
					</PanelRow>
					<PanelRow>
						<ToggleControl
							label={ __(
								'Infinite loop sliding',
								'products-slider-block'
							) }
							checked={ slidesInfinite }
							onChange={ () =>
								setAttributes( {
									slidesInfinite: ! slidesInfinite,
								} )
							}
						/>
					</PanelRow>
					<PanelRow>
						<RangeControl
							label={ __(
								'Slides to scroll',
								'products-slider-block'
							) }
							value={ slidesToScrollDesktop }
							onChange={ ( value ) =>
								setAttributes( {
									slidesToScrollDesktop: value,
								} )
							}
							min={ 1 }
							max={ 4 }
							required
						/>
					</PanelRow>
					<PanelRow>
						<RangeControl
							label={ __(
								'Animation speed',
								'products-slider-block'
							) }
							value={ slidesAnimationSpeed }
							onChange={ ( value ) =>
								setAttributes( { slidesAnimationSpeed: value } )
							}
							min={ 1 }
							max={ 10 }
							required
						/>
					</PanelRow>
				</PanelBody>
				<PanelColorSettings
					title={ __( 'Color Settings', 'products-slider-block' ) }
					colorSettings={ [
						{
							value: buttonColor,
							onChange: ( colorValue ) =>
								setAttributes( {
									buttonColor: colorValue,
								} ),
							label: __(
								'Button',
								'products-slider-block'
							),
						},
						{
							value: buttonColorHover,
							onChange: ( colorValue ) =>
								setAttributes( {
									buttonColorHover: colorValue,
								} ),
							label: __(
								'Button Hover',
								'products-slider-block'
							),
						},
						{
							value: buttonColorFont,
							onChange: ( colorValue ) =>
								setAttributes( {
									buttonColorFont: colorValue,
								} ),
							label: __(
								'Button Font',
								'products-slider-block'
							),
						},
					] }
				></PanelColorSettings>
				<PanelBody
					title={ __( 'Dimensions', 'products-slider-block' ) }
					initialOpen={ false }
				>
					<BoxControl
						label={ __( 'Item Padding', 'products-slider-block' ) }
						values={ paddingSize }
						allowReset={ false }
						onChange={ ( value ) =>
							setAttributes( {
								paddingSize: value,
							} )
						}
					/>
					<BoxControl
						label={ __( 'Item Margin', 'products-slider-block' ) }
						values={ marginSize }
						allowReset={ false }
						onChange={ ( value ) =>
							setAttributes( {
								marginSize: value,
							} )
						}
					/>
					<BoxControl
						label={ __(
							'Button Padding',
							'products-slider-block'
						) }
						values={ paddingSizeButton }
						allowReset={ false }
						onChange={ ( value ) =>
							setAttributes( {
								paddingSizeButton: value,
							} )
						}
					/>
				</PanelBody>
			</InspectorControls>
			<div { ...useBlockProps() }>{ productsSlider() }</div>
		</>
	);

	function productsSlider() {
		const sliderClassName = 'products-slider slider-style-classic';

		return (
			<ul className={ sliderClassName }>
				<Slider { ...settings }>
					{ products &&
						products.map( ( product ) => {
							return productListItem( product );
						} ) }
				</Slider>
			</ul>
		);
	}

	function productListItem( product ) {
		const itemClassName = 'product';

		const elStyles = {};
		if ( paddingSize ) {
			elStyles.paddingTop = paddingSize.top;
			elStyles.paddingBottom = paddingSize.bottom;
			elStyles.paddingLeft = paddingSize.left;
			elStyles.paddingRight = paddingSize.right;
		}
		if ( marginSize ) {
			elStyles.marginTop = marginSize.top;
			elStyles.marginBottom = marginSize.bottom;
			elStyles.marginLeft = marginSize.left;
			elStyles.marginRight = marginSize.right;
		}

		return (
			<li
				className={ itemClassName }
				key={ product.id }
				ref={ disabledRef }
			>
				<div
					className="psb-slider-product-item-wrapper"
					style={ elStyles }
				>
					{ productItemThumbnail( product ) }
					{ productItemTitle( product ) }
					{ productItemPrice( product ) }
					{ productItemButton( product ) }
				</div>
			</li>
		);
	}

	function productItemThumbnail( product ) {
		return (
			<div className="psb-slider-product-item-thumbnail-wrap">
				{ product._embedded &&
					product._embedded[ 'wp:featuredmedia' ] &&
					product._embedded[ 'wp:featuredmedia' ][ 0 ] &&
					productItemThumbnailLink( product ) }
			</div>
		);
	}

	function productItemThumbnailLink( product ) {
		return (
			<a href={ product.link }>
				<img
					src={
						product._embedded[ 'wp:featuredmedia' ][ 0 ]
							.media_details.sizes.medium.source_url
					}
					alt={
						product._embedded[ 'wp:featuredmedia' ][ 0 ].alt_text
					}
				/>
			</a>
		);
	}

	function productItemTitle( product ) {
		const textStyles = {};

		return (
			<div className="psb-slider-product-item-title-wrap">
				<a
					href={ product.link }
					className="psb-loop-product__link"
					style={ textStyles }
				>
					{ product.title.raw }
				</a>
			</div>
		);
	}

	function productItemPrice( product ) {
		const textStyles = {};

		return (
			<div className="psb-slider-product-item-price-wrap">
				<span
					className="price"
					style={ textStyles }
					dangerouslySetInnerHTML={ {
						__html: product.product_price_html,
					} }
				></span>
			</div>
		);
	}

	function productItemButton( product ) {
		const buttonStyles = {};
		if ( buttonColor ) {
			buttonStyles.backgroundColor = buttonColor;
		}
		if ( buttonColorFont ) {
			buttonStyles.color = buttonColorFont;
		}
		if ( paddingSizeButton ) {
			buttonStyles.paddingTop = paddingSizeButton.top;
			buttonStyles.paddingBottom = paddingSizeButton.bottom;
			buttonStyles.paddingLeft = paddingSizeButton.left;
			buttonStyles.paddingRight = paddingSizeButton.right;
		}

		return (
			<div className="psb-slider-product-item-button-wrap">
				<a
					className="button order_now_button"
					href={ product.link }
					style={ buttonStyles }
				>
					{ __( 'Order now', 'products-slider-block' ) }
				</a>
			</div>
		);
	}
}

function SlickPrevArrow() {
	return (
		<button
			type="button"
			className="slick-prev slick-arrow fa fa-angle-left"
			aria-label="Previous"
		></button>
	);
}

function SlickNextArrow() {
	return (
		<button
			type="button"
			className="slick-next slick-arrow fa fa-angle-right"
			aria-label="Next"
		></button>
	);
}
