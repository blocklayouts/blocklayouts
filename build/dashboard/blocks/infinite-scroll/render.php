<?php
/**
 * Render the Infinite Scroll block.
 *
 * @package Gutenberg Infinite Scroll
 * @param array    $attributes Block attributes.
 * @param string   $content    Block content.
 * @param WP_Block $block      Block instance.
 * @return string  Rendered block output.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

// Get block attributes with defaults.
$blocklayouts_infinite_scroll_infinite_type    = $attributes['infiniteType'] ?? 'infinite';
$blocklayouts_infinite_scroll_button_text      = $attributes['buttonText'] ?? __( 'Load More', 'blocklayouts' );
$blocklayouts_infinite_scroll_loading_text     = $attributes['loadingText'] ?? __( 'Loading more posts...', 'blocklayouts' );
$blocklayouts_infinite_scroll_no_more_text     = $attributes['noMoreText'] ?? __( 'No more posts to load', 'blocklayouts' );
$blocklayouts_infinite_scroll_trigger_distance = $attributes['triggerDistance'] ?? 100;
$blocklayouts_infinite_scroll_justify_content  = $attributes['justifyContent'] ?? '';

// How many pages are shown, and how many exist (with filters applied).
$blocklayouts_infinite_scroll_query_id  = (int) ( $block->context['queryId'] ?? 0 );
$blocklayouts_infinite_scroll_inherit   = ! empty( $block->context['query']['inherit'] );
$blocklayouts_infinite_scroll_param     = \Blocklayouts\bl_infinite_scroll_param( $blocklayouts_infinite_scroll_query_id, $blocklayouts_infinite_scroll_inherit );
$blocklayouts_infinite_scroll_loaded    = \Blocklayouts\bl_infinite_scroll_get_loaded( $blocklayouts_infinite_scroll_param );
$blocklayouts_infinite_scroll_max_pages = \Blocklayouts\bl_infinite_scroll_total_pages( $block );
$blocklayouts_infinite_scroll_has_more  = $blocklayouts_infinite_scroll_loaded < $blocklayouts_infinite_scroll_max_pages
	&& $blocklayouts_infinite_scroll_loaded < \Blocklayouts\BL_INFINITE_SCROLL_MAX_LOADED;

// Progress lives in state, keyed per Query Loop: the router refreshes server
// state after each load (it doesn't refresh data-wp-context), and the key
// keeps several Query Loops on one page apart.
$blocklayouts_infinite_scroll_key = 'q' . $blocklayouts_infinite_scroll_query_id;

wp_interactivity_state(
	'blocklayouts/infinite-scroll',
	array(
		'queries' => array(
			$blocklayouts_infinite_scroll_key => array(
				'loaded'  => $blocklayouts_infinite_scroll_loaded,
				'hasMore' => $blocklayouts_infinite_scroll_has_more,
			),
		),
	)
);

// Context for the interactive elements.
$blocklayouts_infinite_scroll_context = array(
	'key'          => $blocklayouts_infinite_scroll_key,
	'region'       => 'query-' . $blocklayouts_infinite_scroll_query_id,
	'param'        => $blocklayouts_infinite_scroll_param,
	'pageParam'    => $blocklayouts_infinite_scroll_inherit ? '' : 'query-' . $blocklayouts_infinite_scroll_query_id . '-page',
	'infiniteType' => $blocklayouts_infinite_scroll_infinite_type,
	'isLoading'    => false,
);
$blocklayouts_infinite_scroll_has_more_path = 'state.queries.' . $blocklayouts_infinite_scroll_key . '.hasMore';

// Build wrapper attributes.
$blocklayouts_infinite_scroll_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'data-wp-interactive' => 'blocklayouts/infinite-scroll',
		'data-wp-context'     => wp_json_encode( $blocklayouts_infinite_scroll_context ),
		'data-wp-watch'       => 'callbacks.syncProgress',
		'class'               => "justify-{$blocklayouts_infinite_scroll_justify_content}",
	)
);
?>

<div <?php echo wp_kses_post( $blocklayouts_infinite_scroll_wrapper_attributes ); ?>>
    <?php if ( 'button' === $blocklayouts_infinite_scroll_infinite_type ) : ?>
    <div class="wp-block-blocklayouts-infinite-scroll__button-container"
        data-wp-bind--hidden="!<?php echo esc_attr( $blocklayouts_infinite_scroll_has_more_path ); ?>">
        <?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Inner blocks are already rendered by core. ?>
        <div class="wp-block-blocklayouts-infinite-scroll__loading" data-wp-class--is-visible="context.isLoading">
            <div class="wp-block-blocklayouts-infinite-scroll__loading-spinner"></div>
            <span><?php echo esc_html( $blocklayouts_infinite_scroll_loading_text ); ?></span>
        </div>
    </div>
    <?php else : ?>
    <div class="wp-block-blocklayouts-infinite-scroll__trigger" data-wp-watch="callbacks.infiniteScroll"
        data-trigger-distance="<?php echo esc_attr( $blocklayouts_infinite_scroll_trigger_distance ); ?>"
        data-wp-bind--hidden="!<?php echo esc_attr( $blocklayouts_infinite_scroll_has_more_path ); ?>">
        <?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Inner blocks are already rendered by core. ?>

        <div class="wp-block-blocklayouts-infinite-scroll__loading" data-wp-class--is-visible="context.isLoading">
            <div class="wp-block-blocklayouts-infinite-scroll__loading-spinner"></div>
            <span><?php echo esc_html( $blocklayouts_infinite_scroll_loading_text ); ?></span>
        </div>
    </div>
    <?php endif; ?>

    <p class="wp-block-blocklayouts-infinite-scroll__no-more-content" data-wp-bind--hidden="<?php echo esc_attr( $blocklayouts_infinite_scroll_has_more_path ); ?>">
        <?php echo esc_html( $blocklayouts_infinite_scroll_no_more_text ); ?>
    </p>
</div>