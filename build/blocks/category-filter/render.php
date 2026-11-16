<?php
/**
 * Render the Category Filter block.
 *
 * Every option is a real link, so the filter works (and can be crawled)
 * without JavaScript. When the target Query Loop has client-side navigation
 * enabled, view.js upgrades the links to instant filtering through the
 * Interactivity API router.
 *
 * @package Blocklayouts
 * @param array    $attributes Block attributes.
 * @param string   $content    Block content.
 * @param WP_Block $block      Block instance.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

$blocklayouts_filter_taxonomy = $attributes['taxonomy'] ?? 'category';

if ( ! taxonomy_exists( $blocklayouts_filter_taxonomy ) ) {
	return;
}

$blocklayouts_filter_tax_object = get_taxonomy( $blocklayouts_filter_taxonomy );
$blocklayouts_filter_mode       = ( $attributes['mode'] ?? 'query' ) === 'archive' ? 'archive' : 'query';
$blocklayouts_filter_has_query  = isset( $attributes['queryId'] ) && is_numeric( $attributes['queryId'] );
$blocklayouts_filter_query_id   = $blocklayouts_filter_has_query ? absint( $attributes['queryId'] ) : 0;
$blocklayouts_filter_post_type  = ! empty( $attributes['postType'] ) ? $attributes['postType'] : ( $blocklayouts_filter_tax_object->object_type[0] ?? 'post' );
$blocklayouts_filter_show_count = ! empty( $attributes['showCount'] );
$blocklayouts_filter_include    = array_filter( array_map( 'absint', (array) ( $attributes['includeTerms'] ?? array() ) ) );

// A query-mode filter needs a target Query Loop (queryId 0 is valid).
if ( 'query' === $blocklayouts_filter_mode && ! $blocklayouts_filter_has_query ) {
	return;
}

// Fetch the terms.
list( $blocklayouts_filter_orderby, $blocklayouts_filter_order ) = array_pad( explode( '/', $attributes['orderBy'] ?? 'count/desc' ), 2, 'desc' );

$blocklayouts_filter_term_args = array(
	'taxonomy'               => $blocklayouts_filter_taxonomy,
	'hide_empty'             => ! empty( $attributes['hideEmpty'] ),
	'orderby'                => in_array( $blocklayouts_filter_orderby, array( 'name', 'count' ), true ) ? $blocklayouts_filter_orderby : 'count',
	'order'                  => 'asc' === $blocklayouts_filter_order ? 'ASC' : 'DESC',
	'update_term_meta_cache' => false,
);

if ( $blocklayouts_filter_include ) {
	$blocklayouts_filter_term_args['include'] = $blocklayouts_filter_include;
	$blocklayouts_filter_term_args['orderby'] = 'include';
} elseif ( ! empty( $attributes['topLevelOnly'] ) && $blocklayouts_filter_tax_object->hierarchical ) {
	$blocklayouts_filter_term_args['parent'] = 0;
}

$blocklayouts_filter_terms = get_terms( $blocklayouts_filter_term_args );

if ( is_wp_error( $blocklayouts_filter_terms ) || empty( $blocklayouts_filter_terms ) ) {
	return;
}

// Work out the current selection and how links are built.
if ( 'archive' === $blocklayouts_filter_mode ) {
	$blocklayouts_filter_queried = get_queried_object();
	$blocklayouts_filter_param   = '';
	$blocklayouts_filter_page    = '';
	$blocklayouts_filter_current = ( $blocklayouts_filter_queried instanceof WP_Term && $blocklayouts_filter_queried->taxonomy === $blocklayouts_filter_taxonomy )
		? $blocklayouts_filter_queried->slug
		: '';
	$blocklayouts_filter_all_url = get_post_type_archive_link( $blocklayouts_filter_post_type );
} else {
	$blocklayouts_filter_param   = \Blocklayouts\bl_category_filter_param( $blocklayouts_filter_query_id, $blocklayouts_filter_taxonomy );
	$blocklayouts_filter_page    = 'query-' . $blocklayouts_filter_query_id . '-page';
	$blocklayouts_filter_current = \Blocklayouts\bl_category_filter_get_selected( $blocklayouts_filter_query_id, $blocklayouts_filter_taxonomy );
	$blocklayouts_filter_reset   = array( $blocklayouts_filter_page, 'query-' . $blocklayouts_filter_query_id . '-loaded' );
	$blocklayouts_filter_all_url = remove_query_arg( array_merge( array( $blocklayouts_filter_param ), $blocklayouts_filter_reset ) );
}

// Build the list of options.
$blocklayouts_filter_items = array();

if ( ! empty( $attributes['showAll'] ) && $blocklayouts_filter_all_url ) {
	$blocklayouts_filter_all_count = null;
	if ( $blocklayouts_filter_show_count && post_type_exists( $blocklayouts_filter_post_type ) ) {
		$blocklayouts_filter_all_count = (int) wp_count_posts( $blocklayouts_filter_post_type )->publish;
	}

	$blocklayouts_filter_items[] = array(
		'slug'  => '',
		'name'  => '' !== trim( $attributes['allLabel'] ?? '' ) ? $attributes['allLabel'] : __( 'All', 'blocklayouts' ),
		'url'   => $blocklayouts_filter_all_url,
		'count' => $blocklayouts_filter_all_count,
	);
}

foreach ( $blocklayouts_filter_terms as $blocklayouts_filter_term ) {
	if ( 'archive' === $blocklayouts_filter_mode ) {
		$blocklayouts_filter_url = get_term_link( $blocklayouts_filter_term );
		if ( is_wp_error( $blocklayouts_filter_url ) ) {
			continue;
		}
	} else {
		$blocklayouts_filter_url = add_query_arg(
			$blocklayouts_filter_param,
			$blocklayouts_filter_term->slug,
			remove_query_arg( $blocklayouts_filter_reset )
		);
	}

	$blocklayouts_filter_items[] = array(
		'slug'  => $blocklayouts_filter_term->slug,
		'name'  => $blocklayouts_filter_term->name,
		'url'   => $blocklayouts_filter_url,
		'count' => $blocklayouts_filter_show_count ? (int) $blocklayouts_filter_term->count : null,
	);
}

// Style variables.
$blocklayouts_filter_styles = array();
$blocklayouts_filter_gap    = \Blocklayouts\bl_category_filter_css_value( $attributes['style']['spacing']['blockGap'] ?? '' );
$blocklayouts_filter_radius = $attributes['style']['border']['radius'] ?? '';

if ( $blocklayouts_filter_gap ) {
	$blocklayouts_filter_styles[] = '--bl-filter-gap:' . $blocklayouts_filter_gap;
}
if ( is_string( $blocklayouts_filter_radius ) && '' !== $blocklayouts_filter_radius ) {
	$blocklayouts_filter_styles[] = '--bl-filter-radius:' . \Blocklayouts\bl_category_filter_css_value( $blocklayouts_filter_radius );
}
// Color settings, each exposed as a CSS custom property.
$blocklayouts_filter_color_vars = array(
	'itemBackgroundColor'   => '--bl-filter-item-background',
	'itemBorderColor'       => '--bl-filter-item-border',
	'hoverBackgroundColor'  => '--bl-filter-hover-background',
	'countColor'            => '--bl-filter-count-color',
	'countBackgroundColor'  => '--bl-filter-count-background',
	'activeColor'           => '--bl-filter-accent',
	'activeTextColor'       => '--bl-filter-active-color',
	'activeBackgroundColor' => '--bl-filter-active-background',
	'activeCountColor'      => '--bl-filter-active-count-color',
	'activeCountBackgroundColor' => '--bl-filter-active-count-background',
);
foreach ( $blocklayouts_filter_color_vars as $blocklayouts_filter_attr => $blocklayouts_filter_var ) {
	if ( ! empty( $attributes[ $blocklayouts_filter_attr ] ) && is_string( $attributes[ $blocklayouts_filter_attr ] ) ) {
		$blocklayouts_filter_styles[] = $blocklayouts_filter_var . ':' . $attributes[ $blocklayouts_filter_attr ];
	}
}

$blocklayouts_filter_is_carousel = false !== strpos( $attributes['className'] ?? '', 'is-style-carousel' );
$blocklayouts_filter_label       = '' !== trim( $attributes['label'] ?? '' )
	? $attributes['label']
	/* translators: %s: Taxonomy singular name, e.g. "Category". */
	: sprintf( __( 'Filter by %s', 'blocklayouts' ), $blocklayouts_filter_tax_object->labels->singular_name );

$blocklayouts_filter_classes = array();
if ( ! empty( $attributes['justifyContent'] ) ) {
	$blocklayouts_filter_classes[] = 'is-content-justification-' . sanitize_html_class( $attributes['justifyContent'] );
}

$blocklayouts_filter_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class'      => implode( ' ', $blocklayouts_filter_classes ),
		'style'      => safecss_filter_attr( implode( ';', $blocklayouts_filter_styles ) ),
		'aria-label' => $blocklayouts_filter_label,
	)
);

$blocklayouts_filter_context = array(
	'mode'          => $blocklayouts_filter_mode,
	'queryId'       => $blocklayouts_filter_query_id,
	'param'         => $blocklayouts_filter_param,
	'pageParam'     => $blocklayouts_filter_page,
	'selected'      => $blocklayouts_filter_current,
	'isLoading'     => false,
	'canScrollPrev' => false,
	'canScrollNext' => false,
);

$blocklayouts_filter_arrow = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="%s"/></svg>';
?>
<nav <?php echo $blocklayouts_filter_wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escaped by get_block_wrapper_attributes(). ?>
	data-wp-interactive="blocklayouts/category-filter"
	<?php echo wp_interactivity_data_wp_context( $blocklayouts_filter_context ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escaped by wp_interactivity_data_wp_context(). ?>
	data-wp-init="callbacks.init"
	data-wp-class--is-loading="context.isLoading">
	<?php if ( $blocklayouts_filter_is_carousel ) : ?>
	<button type="button" class="wp-block-blocklayouts-category-filter__nav is-prev" tabindex="-1" aria-hidden="true"
		data-wp-on--click="actions.scrollPrev" data-wp-bind--disabled="!context.canScrollPrev">
		<?php echo sprintf( $blocklayouts_filter_arrow, 'm15 18-6-6 6-6' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Static SVG. ?>
	</button>
	<?php endif; ?>
	<div class="wp-block-blocklayouts-category-filter__viewport"
		<?php if ( $blocklayouts_filter_is_carousel ) : ?>
		data-wp-init="callbacks.initCarousel"
		data-wp-class--has-prev="context.canScrollPrev"
		data-wp-class--has-next="context.canScrollNext"
		<?php endif; ?>>
		<ul class="wp-block-blocklayouts-category-filter__list" role="list">
			<?php foreach ( $blocklayouts_filter_items as $blocklayouts_filter_item ) : ?>
				<?php $blocklayouts_filter_is_current = $blocklayouts_filter_item['slug'] === $blocklayouts_filter_current; ?>
			<li class="wp-block-blocklayouts-category-filter__item">
				<a class="wp-block-blocklayouts-category-filter__link<?php echo $blocklayouts_filter_is_current ? ' is-active' : ''; ?>"
					href="<?php echo esc_url( $blocklayouts_filter_item['url'] ); ?>"
					<?php echo $blocklayouts_filter_is_current ? 'aria-current="page"' : ''; ?>
					<?php echo wp_interactivity_data_wp_context( array( 'slug' => $blocklayouts_filter_item['slug'] ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escaped by wp_interactivity_data_wp_context(). ?>
					data-wp-on--click="actions.select"
					data-wp-on--mouseenter="actions.prefetch"
					data-wp-on--focus="actions.prefetch"
					data-wp-watch="callbacks.syncLink">
					<span class="wp-block-blocklayouts-category-filter__label"><?php echo esc_html( $blocklayouts_filter_item['name'] ); ?></span>
					<?php if ( null !== $blocklayouts_filter_item['count'] ) : ?>
					<span class="wp-block-blocklayouts-category-filter__count"><?php echo esc_html( number_format_i18n( $blocklayouts_filter_item['count'] ) ); ?></span>
					<?php endif; ?>
				</a>
			</li>
			<?php endforeach; ?>
		</ul>
	</div>
	<?php if ( $blocklayouts_filter_is_carousel ) : ?>
	<button type="button" class="wp-block-blocklayouts-category-filter__nav is-next" tabindex="-1" aria-hidden="true"
		data-wp-on--click="actions.scrollNext" data-wp-bind--disabled="!context.canScrollNext">
		<?php echo sprintf( $blocklayouts_filter_arrow, 'm9 18 6-6-6-6' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Static SVG. ?>
	</button>
	<?php endif; ?>
</nav>
