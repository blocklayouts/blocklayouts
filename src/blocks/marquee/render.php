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
$blocklayouts_marquee_speed          = isset( $attributes['speed'] ) ? max( 1, intval( $attributes['speed'] ) ) : 30;
$blocklayouts_marquee_direction      = ! empty( $attributes['direction'] ) ? sanitize_text_field( $attributes['direction'] ) : 'left';
$blocklayouts_marquee_pause_on_hover = ! empty( $attributes['pauseOnHover'] );
$blocklayouts_marquee_gap            = isset( $attributes['gap'] ) ? max( 0, intval( $attributes['gap'] ) ) : 40;

// Build container classes.
$blocklayouts_marquee_container_classes = array( 'marquee-container' );
if ( $blocklayouts_marquee_pause_on_hover ) {
	$blocklayouts_marquee_container_classes[] = 'pause-on-hover';
}
$blocklayouts_marquee_container_class = implode( ' ', $blocklayouts_marquee_container_classes );

// Build container styles.
$blocklayouts_marquee_container_styles = array(
	'--animation-duration: ' . $blocklayouts_marquee_speed . 's',
	'--animation-name: marquee-scroll-' . esc_attr( $blocklayouts_marquee_direction ),
);
$blocklayouts_marquee_container_style  = ' style="' . implode( '; ', $blocklayouts_marquee_container_styles ) . ';"';

// Marquee content styles.
$blocklayouts_marquee_content_style = ' style="gap: ' . esc_attr( $blocklayouts_marquee_gap ) . 'px; padding: 0 ' . esc_attr( $blocklayouts_marquee_gap / 2 ) . 'px;"';

?>
<div <?php echo wp_kses_post( get_block_wrapper_attributes() ); ?>>
    <div class="<?php echo esc_attr( $blocklayouts_marquee_container_class ); ?>"
        <?php echo wp_kses_post( $blocklayouts_marquee_container_style ); ?>>
        <div class="marquee-content" <?php echo wp_kses_post( $blocklayouts_marquee_content_style ); ?>>
            <?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Inner blocks are already rendered by core. ?></div>
        <div class="marquee-content" <?php echo wp_kses_post( $blocklayouts_marquee_content_style ); ?>>
            <?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Inner blocks are already rendered by core. ?></div>
    </div>
</div>