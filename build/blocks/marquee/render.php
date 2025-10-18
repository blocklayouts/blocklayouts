<?php
/**
 * Server-side rendering for the marquee block.
 *
 * @param array    $attributes Block attributes.
 * @param string   $content    Block content.
 * @param WP_Block $block      Block instance.
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Set defaults and sanitize attributes.
$speed          = isset( $attributes['speed'] ) ? max( 1, intval( $attributes['speed'] ) ) : 30;
$direction      = ! empty( $attributes['direction'] ) ? sanitize_text_field( $attributes['direction'] ) : 'left';
$pause_on_hover = ! empty( $attributes['pauseOnHover'] );
$gap            = isset( $attributes['gap'] ) ? max( 0, intval( $attributes['gap'] ) ) : 40;

// Render inner blocks.
$inner_blocks_content = '';
if ( ! empty( $block->inner_blocks ) ) {
	foreach ( $block->inner_blocks as $inner_block ) {
		$inner_blocks_content .= $inner_block->render();
	}
}

// Build container classes.
$container_classes = array( 'marquee-container' );
if ( $pause_on_hover ) {
	$container_classes[] = 'pause-on-hover';
}
$container_class = implode( ' ', $container_classes );

// Build container styles.
$container_styles = array(
	'--animation-duration: ' . $speed . 's',
	'--animation-name: marquee-scroll-' . esc_attr( $direction ),
);
$container_style  = ' style="' . implode( '; ', $container_styles ) . ';"';

// Marquee content styles.
$content_style = ' style="gap: ' . esc_attr( $gap ) . 'px; padding: 0 ' . esc_attr( $gap / 2 ) . 'px;"';

?>
<div <?php echo wp_kses_post( get_block_wrapper_attributes() ); ?>>
    <div class="<?php echo esc_attr( $container_class ); ?>" <?php echo wp_kses_post( $container_style ); ?>>
        <div class="marquee-content" <?php echo wp_kses_post( $content_style ); ?>>
            <?php echo wp_kses_post( $inner_blocks_content ); ?></div>
        <div class="marquee-content" <?php echo wp_kses_post( $content_style ); ?>>
            <?php echo wp_kses_post( $inner_blocks_content ); ?></div>
    </div>
</div>