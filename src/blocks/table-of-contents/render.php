<?php
/**
 * Table of Contents block rendering.
 *
 * @package BlockLayouts
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Block content.
 * @var WP_Block $block      Block instance.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

// Get block attributes with defaults.
$blocklayouts_toc_ordered          = isset( $attributes['ordered'] ) ? $attributes['ordered'] : false;
$blocklayouts_toc_heading_title    = isset( $attributes['headingTitle'] ) ? $attributes['headingTitle'] : __( 'Table of Contents', 'blocklayouts' );
$blocklayouts_toc_show_title       = isset( $attributes['showTitle'] ) ? $attributes['showTitle'] : true;
$blocklayouts_toc_allowed_headings = isset( $attributes['allowedHeadings'] ) ? $attributes['allowedHeadings'] : array( 1, 2, 3, 4, 5, 6 );
$blocklayouts_toc_smooth_scroll    = isset( $attributes['smoothScroll'] ) ? $attributes['smoothScroll'] : true;

// Get the post content.
$blocklayouts_toc_post = get_post();
if ( ! $blocklayouts_toc_post ) {
	return;
}

$blocklayouts_toc_content = $blocklayouts_toc_post->post_content;

// Parse blocks from content.
$blocklayouts_toc_blocks = parse_blocks( $blocklayouts_toc_content );

// Define anonymous function to recursively extract heading blocks.
$blocklayouts_toc_extract_headings = function ( $blocklayouts_toc_blocks ) use ( &$blocklayouts_toc_extract_headings ) {
	$headings = array();

	foreach ( $blocklayouts_toc_blocks as $block ) {
		if ( 'core/heading' === $block['blockName'] ) {
			$headings[] = $block;
		}

		// Recursively check inner blocks.
		if ( ! empty( $block['innerBlocks'] ) ) {
			$headings = array_merge( $headings, $blocklayouts_toc_extract_headings( $block['innerBlocks'] ) );
		}
	}

	return $headings;
};


// Extract all heading blocks.
$blocklayouts_toc_all_headings = $blocklayouts_toc_extract_headings( $blocklayouts_toc_blocks );


// Filter headings based on allowed levels.
$blocklayouts_toc_filtered_headings = array_filter(
	$blocklayouts_toc_all_headings,
	function ( $blocklayouts_toc_heading ) use ( $blocklayouts_toc_allowed_headings ) {
		$blocklayouts_toc_level = isset( $blocklayouts_toc_heading['attrs']['level'] ) ? $blocklayouts_toc_heading['attrs']['level'] : 2;
		return in_array( $blocklayouts_toc_level, $blocklayouts_toc_allowed_headings, true );
	}
);

// If no headings found, don't render.
if ( empty( $blocklayouts_toc_filtered_headings ) ) {
	return;
}

// Get block wrapper attributes.
$blocklayouts_toc_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => 'wp-block-blocklayouts-table-of-contents',
	)
);

$blocklayouts_toc_list_tag = $blocklayouts_toc_ordered ? 'ol' : 'ul';

// Add smooth scroll class.
$blocklayouts_toc_nav_class = 'wp-block-blocklayouts-table-of-contents__wrapper';
if ( $blocklayouts_toc_smooth_scroll ) {
	$blocklayouts_toc_nav_class .= ' smooth-scroll';
}

?>
<div <?php echo $blocklayouts_toc_wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
    <nav class="<?php echo esc_attr( $blocklayouts_toc_nav_class ); ?>">
        <?php if ( $blocklayouts_toc_show_title && ! empty( $blocklayouts_toc_heading_title ) ) : ?>
        <h2 class="wp-block-blocklayouts-table-of-contents__title wp-block-heading">
            <?php echo wp_kses_post( $blocklayouts_toc_heading_title ); ?>
        </h2>
        <?php endif; ?>

        <?php
		// Build hierarchical structure.
		$blocklayouts_toc_current_level = 0;
		$blocklayouts_toc_open_lists    = 0;

		foreach ( $blocklayouts_toc_filtered_headings as $blocklayouts_toc_index => $blocklayouts_toc_heading ) :
			$blocklayouts_toc_level   = isset( $blocklayouts_toc_heading['attrs']['level'] ) ? $blocklayouts_toc_heading['attrs']['level'] : 2;
			$blocklayouts_toc_content = isset( $blocklayouts_toc_heading['innerHTML'] ) ? $blocklayouts_toc_heading['innerHTML'] : '';
			$blocklayouts_toc_anchor  = '';

			$blocklayouts_toc_p = new WP_HTML_Tag_Processor( $blocklayouts_toc_content );
			if ( $blocklayouts_toc_p->next_tag() ) {
				$blocklayouts_toc_anchor = $blocklayouts_toc_p->get_attribute( 'id' );
			}

			// Generate anchor if not present.
			if ( empty( $blocklayouts_toc_anchor ) ) {
				$blocklayouts_toc_anchor_regex = '/[\s#]/';
				$blocklayouts_toc_anchor       = trim( wp_strip_all_tags( $blocklayouts_toc_content ) );
				$blocklayouts_toc_anchor       = strtolower( $blocklayouts_toc_anchor );
				$blocklayouts_toc_anchor       = preg_replace( $blocklayouts_toc_anchor_regex, '-', $blocklayouts_toc_anchor );
			}

			// Clean content for display.
			$blocklayouts_toc_clean_content = wp_strip_all_tags( $blocklayouts_toc_content );

			// Handle level changes.
			if ( 0 === $blocklayouts_toc_current_level ) {
				// First item - open the main list.
				echo '<' . esc_attr( $blocklayouts_toc_list_tag ) . ' class="wp-block-blocklayouts-table-of-contents__list">';
				$blocklayouts_toc_open_lists    = 1;
				$blocklayouts_toc_current_level = $blocklayouts_toc_level;
			} elseif ( $blocklayouts_toc_level > $blocklayouts_toc_current_level ) {
				// Going deeper - open nested lists.
				$blocklayouts_toc_depth_diff = $blocklayouts_toc_level - $blocklayouts_toc_current_level;
				for ( $blocklayouts_toc_i = 0; $blocklayouts_toc_i < $blocklayouts_toc_depth_diff; ++$blocklayouts_toc_i ) {
					echo '<' . esc_attr( $blocklayouts_toc_list_tag ) . ' class="wp-block-blocklayouts-table-of-contents__list">';
					++$blocklayouts_toc_open_lists;
				}
				$blocklayouts_toc_current_level = $blocklayouts_toc_level;
			} elseif ( $blocklayouts_toc_level < $blocklayouts_toc_current_level ) {
				// Going up - close nested lists and list items.
				$blocklayouts_toc_depth_diff = $blocklayouts_toc_current_level - $blocklayouts_toc_level;
				for ( $blocklayouts_toc_i = 0; $blocklayouts_toc_i < $blocklayouts_toc_depth_diff; ++$blocklayouts_toc_i ) {
					echo '</li>';
					echo '</' . esc_attr( $blocklayouts_toc_list_tag ) . '>';
					--$blocklayouts_toc_open_lists;
				}
				echo '</li>';
				$blocklayouts_toc_current_level = $blocklayouts_toc_level;
			} else {
				// Same level - close previous item.
				echo '</li>';
			}
			?>
        <li class="wp-block-blocklayouts-table-of-contents__item">
            <a href="#<?php echo esc_attr( $blocklayouts_toc_anchor ); ?>" class="wp-block-blocklayouts-table-of-contents__link">
                <?php echo esc_html( $blocklayouts_toc_clean_content ); ?>
            </a>
            <?php
		endforeach;

		// Close all remaining open tags.
		if ( $blocklayouts_toc_open_lists > 0 ) {
			echo '</li>'; // Close last item.
			for ( $blocklayouts_toc_i = 0; $blocklayouts_toc_i < $blocklayouts_toc_open_lists; $blocklayouts_toc_i++ ) {
				echo '</' . esc_attr( $blocklayouts_toc_list_tag ) . '>';
			}
		}
		?>
    </nav>
</div>