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
$blocklayouts_infinite_scroll_loading_text     = $attributes['loadingText'] ?? __( 'Loading more posts...', 'blocklayouts' );
$blocklayouts_infinite_scroll_no_more_text     = $attributes['noMoreText'] ?? __( 'No more posts to load', 'blocklayouts' );
$blocklayouts_infinite_scroll_trigger_distance = $attributes['triggerDistance'] ?? 100;
$blocklayouts_infinite_scroll_justify_content  = $attributes['justifyContent'] ?? 'center';

// Get query context.
$blocklayouts_infinite_scroll_query     = $block->context['query'] ?? array();
$blocklayouts_infinite_scroll_max_pages = $blocklayouts_infinite_scroll_query['pages'] ?? 0;

// Initialize interactivity state.
wp_interactivity_state(
	'blocklayouts/infinite-scroll',
	array(
		'hasMore'  => $blocklayouts_infinite_scroll_max_pages > 1 && ( $blocklayouts_infinite_scroll_query['paged'] ?? 1 ) < $blocklayouts_infinite_scroll_max_pages,
		'paged'    => $blocklayouts_infinite_scroll_query['paged'] ?? 1,
		'maxPages' => $blocklayouts_infinite_scroll_max_pages,
	)
);

// Context for the interactive elements.
$blocklayouts_infinite_scroll_context = array(
	'queryId'   => $block->context['queryId'] ?? 0,
	'isLoading' => false,
);

// Build wrapper attributes.
$blocklayouts_infinite_scroll_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'data-wp-interactive' => 'blocklayouts/infinite-scroll',
		'data-wp-context'     => wp_json_encode( $blocklayouts_infinite_scroll_context ),
		'class'               => "justify-{$blocklayouts_infinite_scroll_justify_content}",
	)
);
?>

<div <?php echo wp_kses_post( $blocklayouts_infinite_scroll_wrapper_attributes ); ?>>
    <div class="wp-block-blocklayouts-infinite-scroll__trigger" data-wp-watch="callbacks.infiniteScroll"
        data-trigger-distance="<?php echo esc_attr( $blocklayouts_infinite_scroll_trigger_distance ); ?>"
        data-wp-bind--hidden="!state.hasMore">
        <div class="wp-block-blocklayouts-infinite-scroll__loading" data-wp-class--is-visible="context.isLoading">
            <div class="wp-block-blocklayouts-infinite-scroll__loading-spinner"></div>
            <span><?php echo esc_html( $blocklayouts_infinite_scroll_loading_text ); ?></span>
        </div>
    </div>

    <p class="wp-block-blocklayouts-infinite-scroll__no-more-content" data-wp-bind--hidden="state.hasMore">
        <?php echo esc_html( $blocklayouts_infinite_scroll_no_more_text ); ?>
    </p>
</div>