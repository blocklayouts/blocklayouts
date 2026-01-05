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
$ordered          = isset( $attributes['ordered'] ) ? $attributes['ordered'] : false;
$heading_title    = isset( $attributes['headingTitle'] ) ? $attributes['headingTitle'] : __( 'Table of Contents', 'blocklayouts' );
$show_title       = isset( $attributes['showTitle'] ) ? $attributes['showTitle'] : true;
$allowed_headings = isset( $attributes['allowedHeadings'] ) ? $attributes['allowedHeadings'] : array( 1, 2, 3, 4, 5, 6 );
$smooth_scroll    = isset( $attributes['smoothScroll'] ) ? $attributes['smoothScroll'] : true;

// Get the post content.
global $post;
if ( ! $post ) {
	return;
}

$content = $post->post_content;

// Parse blocks from content.
$blocks = parse_blocks( $content );

// Define anonymous function to recursively extract heading blocks.
$extract_headings = function ( $blocks ) use ( &$extract_headings ) {
	$headings = array();

	foreach ( $blocks as $block ) {
		if ( 'core/heading' === $block['blockName'] ) {
			$headings[] = $block;
		}

		// Recursively check inner blocks.
		if ( ! empty( $block['innerBlocks'] ) ) {
			$headings = array_merge( $headings, $extract_headings( $block['innerBlocks'] ) );
		}
	}

	return $headings;
};


// Extract all heading blocks.
$all_headings = $extract_headings( $blocks );


// Filter headings based on allowed levels.
$filtered_headings = array_filter(
	$all_headings,
	function ( $heading ) use ( $allowed_headings ) {
		$level = isset( $heading['attrs']['level'] ) ? $heading['attrs']['level'] : 2;
		return in_array( $level, $allowed_headings, true );
	}
);

// If no headings found, don't render.
if ( empty( $filtered_headings ) ) {
	return;
}

// Get block wrapper attributes.
$wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => 'wp-block-blocklayouts-table-of-contents',
	)
);

$list_tag = $ordered ? 'ol' : 'ul';

// Add smooth scroll class.
$nav_class = 'wp-block-blocklayouts-table-of-contents__wrapper';
if ( $smooth_scroll ) {
	$nav_class .= ' smooth-scroll';
}

?>
<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
    <nav class="<?php echo esc_attr( $nav_class ); ?>">
        <?php if ( $show_title && ! empty( $heading_title ) ) : ?>
        <h2 class="wp-block-blocklayouts-table-of-contents__title wp-block-heading">
            <?php echo wp_kses_post( $heading_title ); ?>
        </h2>
        <?php endif; ?>

        <?php
		// Build hierarchical structure.
		$current_level = 0;
		$open_lists    = 0;

		foreach ( $filtered_headings as $index => $heading ) :
			$level   = isset( $heading['attrs']['level'] ) ? $heading['attrs']['level'] : 2;
			$content = isset( $heading['innerHTML'] ) ? $heading['innerHTML'] : '';
			$anchor  = '';

			$p = new WP_HTML_Tag_Processor( $content );
			if ( $p->next_tag() ) {
				$anchor = $p->get_attribute( 'id' );
			}

			// Generate anchor if not present.
			if ( empty( $anchor ) ) {
				$anchor_regex = '/[\s#]/';
				$anchor       = trim( wp_strip_all_tags( $content ) );
				$anchor       = strtolower( $anchor );
				$anchor       = preg_replace( $anchor_regex, '-', $anchor );
			}

			// Clean content for display.
			$clean_content = wp_strip_all_tags( $content );

			// Handle level changes.
			if ( 0 === $current_level ) {
				// First item - open the main list.
				echo '<' . esc_attr( $list_tag ) . ' class="wp-block-blocklayouts-table-of-contents__list">';
				$open_lists    = 1;
				$current_level = $level;
			} elseif ( $level > $current_level ) {
				// Going deeper - open nested lists.
				$depth_diff = $level - $current_level;
				for ( $i = 0; $i < $depth_diff; ++$i ) {
					echo '<' . esc_attr( $list_tag ) . ' class="wp-block-blocklayouts-table-of-contents__list">';
					++$open_lists;
				}
				$current_level = $level;
			} elseif ( $level < $current_level ) {
				// Going up - close nested lists and list items.
				$depth_diff = $current_level - $level;
				for ( $i = 0; $i < $depth_diff; ++$i ) {
					echo '</li>';
					echo '</' . esc_attr( $list_tag ) . '>';
					--$open_lists;
				}
				echo '</li>';
				$current_level = $level;
			} else {
				// Same level - close previous item.
				echo '</li>';
			}
			?>
        <li class="wp-block-blocklayouts-table-of-contents__item">
            <a href="#<?php echo esc_attr( $anchor ); ?>" class="wp-block-blocklayouts-table-of-contents__link">
                <?php echo esc_html( $clean_content ); ?>
            </a>
            <?php
		endforeach;

		// Close all remaining open tags.
		if ( $open_lists > 0 ) {
			echo '</li>'; // Close last item.
			for ( $i = 0; $i < $open_lists; $i++ ) {
				echo '</' . esc_attr( $list_tag ) . '>';
			}
		}
		?>
    </nav>
</div>