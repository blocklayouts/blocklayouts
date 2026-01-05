<?php

namespace Blocklayouts;

/**
 * Handles the additional CSS extension.
 */
class AdditionalCSS {
	/**
	 * Array to store custom CSS for blocks.
	 *
	 * @var array
	 */
	private $custom_css = array();

	/**
	 * Construct function
	 */
	public function __construct() {
		add_filter( 'render_block', array( $this, 'apply_custom_css_to_block' ), 10, 2 );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_custom_css' ), 20 );
	}

	/**
	 * Enqueue custom CSS.
	 */
	public function enqueue_custom_css() {
		$output = '';

		// Add block-specific CSS.
		if ( ! empty( $this->custom_css ) ) {
			$output .= "\n/* Blocklayouts CSS - Block Specific */\n";
			foreach ( $this->custom_css as $selector => $css ) {
				if ( ! empty( $css ) ) {

					$css = str_replace( 'selector', ".{$selector}", $css );

					// Responsive CSS handling.
					$css = preg_replace( '/@mobile\s*{([^}]*)}/s', '@media (max-width: 779px) {$1}', $css );
					$css = preg_replace( '/@tablet\s*{([^}]*)}/s', '@media (min-width: 780px) and (max-width: 1024px) {$1}', $css );
					$css = preg_replace( '/@desktop\s*{([^}]*)}/s', '@media (min-width: 1025px) {$1}', $css );

					$sanitized_css = $this->sanitize_css( $css );
					$output       .= "{$sanitized_css}\n";
				}
			}
		}

		// Only enqueue if we have CSS to output.
		if ( ! empty( $output ) ) {

			// Add inline CSS using wp_add_inline_style.
			wp_add_inline_style( 'blocklayouts-main-styles', $output );
		}
	}

	/**
	 * Apply custom css to block
	 *
	 * @param string $block_content The block content.
	 * @param array  $block The block data.
	 * @return string The modified block content.
	 */
	public function apply_custom_css_to_block( $block_content, $block ) {
		if ( ! empty( $block['attrs']['additionalCSS']['customCSS'] ) && ! empty( $block['attrs']['additionalCSS']['selector'] ) ) {
			$custom_css = wp_strip_all_tags( $block['attrs']['additionalCSS']['customCSS'] );
			$selector   = esc_attr( $block['attrs']['additionalCSS']['selector'] );

			$this->custom_css[ $selector ] = $custom_css;

			$processor = new \WP_HTML_Tag_Processor( $block_content );

			if ( $processor->next_tag() ) {
				if ( ! $processor->has_class( $selector ) ) {
					$processor->add_class( $selector );
					$block_content = $processor->get_updated_html();
				}
			}

			return $block_content;
		}

		return $block_content;
	}

	/**
	 * Sanitize CSS content.
	 *
	 * @param string $css The CSS content to sanitize.
	 * @return string The sanitized CSS content.
	 */
	private function sanitize_css( $css ) {
		// Remove potentially dangerous CSS.
		$dangerous_patterns = array(
			'/javascript:/i',
			'/expression\s*\(/i',
			'/behavior\s*:/i',
			'/binding\s*:/i',
			'/@import/i',
			'/data\s*:/i',
		);

		$css = preg_replace( $dangerous_patterns, '', $css );

		// Remove HTML tags if any.
		$css = wp_strip_all_tags( $css );

		// Trim whitespace.
		$css = trim( $css );

		return $css;
	}
}

new AdditionalCSS();