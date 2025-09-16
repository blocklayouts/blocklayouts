<?php

namespace Blocklayouts;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Handles the registration and enqueueing of custom Gutenberg blocks.
 */
class Blocklayouts_Blocks_Registrar {

	private $custom_css = array();

	/**
	 * Construct function
	 */
	public function __construct() {
		add_action( 'init', array( $this, 'register_custom_blocks' ) );
		add_action( 'init', array( $this, 'enqueue_block_styles' ) );
		add_action( 'enqueue_block_editor_assets', array( $this, 'setup_block_script_translations' ), 20 );
		add_filter( 'render_block', array( $this, 'apply_custom_css_to_block' ), 10, 2 );
		add_filter( 'render_block', array( $this, 'add_wrapper_link_to_block' ), 10, 2 );
		add_filter( 'render_block_core/button', array( $this, 'add_inline_icon_to_button' ), 10, 2 );
		add_action( 'wp_head', array( $this, 'output_custom_css' ) );
		add_filter( 'load_script_translations', array( $this, 'fix_script_translations_path' ), 10, 3 );
	}

	/**
	 * Register all custom blocks
	 */
	public function register_custom_blocks() {

		$blocks = array(
			'icon',
			'marquee',
			// TODO: Slider, Content Toggle...
		);

		$blocks_path = BLOCKLAYOUTS_PLUGIN_PATH . 'build/blocks/';

		foreach ( $blocks as $block ) {
			register_block_type(
				$blocks_path . $block
			);
		}

	}

	/**
	 * Set up script translations for block scripts
	 */
	public function setup_block_script_translations() {
		// This method is called after block editor assets are enqueued.
		// The individual block scripts should be registered by now.
		$blocks = array(
			'icon',
			'marquee',
		);

		foreach ( $blocks as $block ) {
			$textdomain = 'blocklayouts-' . $block;
			
			// Try different possible script handle patterns.
			$possible_handles = array(
				'blocklayouts-' . $block . '-editor-script',
				'blocklayouts-' . $block . '-editor',
				'blocklayouts-' . $block,
			);
			
			foreach ( $possible_handles as $handle ) {
				if ( wp_script_is( $handle, 'registered' ) ) {
					wp_set_script_translations(
						$handle,
						$textdomain,
						BLOCKLAYOUTS_PLUGIN_PATH . 'languages'
					);
					break; // Only set up translations for the first matching handle.
				}
			}
		}
	}

	/**
	 * Fix script translations path issues
	 *
	 * @param string $file   Translation file path.
	 * @param string $handle Script handle.
	 * @param string $domain Text domain.
	 * @return string Fixed file path.
	 */
	public function fix_script_translations_path( $file, $handle, $domain ) {
		// Only handle our plugin's text domains.
		if ( strpos( $domain, 'blocklayouts' ) === 0 ) {
			// Ensure the file path is valid.
			if ( empty( $file ) || ! file_exists( $file ) ) {
				$file = BLOCKLAYOUTS_PLUGIN_PATH . 'languages/' . $domain . '-' . get_locale() . '.json';
				if ( ! file_exists( $file ) ) {
					$file = BLOCKLAYOUTS_PLUGIN_PATH . 'languages/' . $domain . '.json';
				}
			}
		}

		return $file;
	}

	/**
	 * Enqueue block styles
	 * (Applies to both frontend and Editor)
	 */
	public function enqueue_block_styles() {

		wp_enqueue_block_style(
			'core/button',
			array(
				'handle' => 'blocklayouts-inline-icon-block-styles',
				'src'    => BLOCKLAYOUTS_PLUGIN_URL . 'assets/css/core-button.css',
				'path'   => BLOCKLAYOUTS_PLUGIN_PATH . 'assets/css/core-button.css',
				'ver'    => BLOCKLAYOUTS_VERSION,
			)
		);

		wp_enqueue_block_style(
			'core/group',
			array(
				'handle' => 'blocklayouts-group-block-styles',
				'src'    => BLOCKLAYOUTS_PLUGIN_URL . 'assets/css/core-group.css',
				'path'   => BLOCKLAYOUTS_PLUGIN_PATH . 'assets/css/core-group.css',
				'ver'    => BLOCKLAYOUTS_VERSION,
			)
		);
	}

	/**
	 * Apply inline icon to button
	 *
	 * @param string $block_content The block content.
	 * @return string The block content with the inline icon.
	 */
	public function add_inline_icon_to_button( $block_content ) {
		// Check if the button contains our inline icon.
		if ( strpos( $block_content, 'wp-blocklayouts-inline-icon' ) === false ) {
			return $block_content;
		}

		$processor = new \WP_HTML_Tag_Processor( $block_content );

		// Find the inline icon image.
		if ( $processor->next_tag(
			array(
				'tag_name'   => 'img',
				'class_name' => 'wp-blocklayouts-inline-icon',
			)
		) ) {

			// Extract attributes we need.
			$width        = $processor->get_attribute( 'width' );
			$icon_svg     = $processor->get_attribute( 'icon' );
			$icon_type    = $processor->get_attribute( 'icon-type' );
			$margin_left  = $processor->get_attribute( 'margin-left' );
			$margin_right = $processor->get_attribute( 'margin-right' );
			$color        = $processor->get_attribute( 'custom-color' );

			if ( $icon_svg ) {
				$icon_svg = html_entity_decode( $icon_svg );

				$styles = array();
				if ( $width ) {
					$styles[] = 'width: ' . esc_attr( $width ) . 'px';
					$styles[] = 'height: ' . esc_attr( $width ) . 'px';
				}
				if ( ! empty( $margin_left ) ) {
					$styles[] = 'margin-left: ' . esc_attr( $margin_left ) . 'px';
				}
				if ( ! empty( $margin_right ) ) {
					$styles[] = 'margin-right: ' . esc_attr( $margin_right ) . 'px';
				}
				if ( ! empty( $color ) ) {
					$styles[] = 'color: ' . esc_attr( $color );
				}
				$style_attr = $styles ? 'style="' . implode( '; ', $styles ) . ';"' : '';

				// Build class string with custom color class if color is set.
				$class_parts = array( 'wp-blocklayouts-inline-icon', 'is-' . esc_attr( $icon_type ) );
				if ( ! empty( $color ) ) {
					$class_parts[] = 'has-custom-color';
				}
				$class_string = implode( ' ', $class_parts );

				// Create the replacement span with inline SVG.
				$replacement   = sprintf(
					'<span class="%s" %s>%s</span>',
					$class_string,
					$style_attr,
					$icon_svg
				);
				$block_content = $processor->get_updated_html();

				// Remove the inline icon image and replace with SVG span.
				$block_content = preg_replace(
					'/<img[^>]*class="[^"]*wp-blocklayouts-inline-icon[^"]*"[^>]*>/',
					$replacement,
					$block_content
				);
			}
		}

		return $block_content;
	}

	/**
	 * Apply wrapper link to block
	 *
	 * @param string $block_content The block content.
	 * @param array  $block The block data.
	 * @return string The block content with the wrapper link.
	 */
	public function add_wrapper_link_to_block( $block_content, $block ) {

		if ( ! isset( $block['attrs']['wrapperLink']['linkDestination'] ) || ! isset( $block['attrs']['wrapperLink']['href'] ) ) {
			return $block_content;
		}

		$href             = $block['attrs']['wrapperLink']['href'] ?? '';
		$link_destination = $block['attrs']['wrapperLink']['linkDestination'] ?? '';
		$link_target      = $block['attrs']['wrapperLink']['linkTarget'] ?? '_self';
		$link_rel         = '_blank' === $link_target ? 'noopener noreferrer' : 'follow';

		$link = '';

		if ( 'custom' === $link_destination && $href ) {
			$link = $href;
		} elseif ( 'post' === $link_destination ) {
			$link = get_permalink();
		}

		if ( ! $link ) {
			return $block_content;
		}

		$p = new \WP_HTML_Tag_Processor( $block_content );

		if ( $p->next_tag( array( 'tag_name' => 'a' ) ) ) {
			$p->add_class( 'is-linked' );
			$p->set_attribute( 'href', $link );
			$p->set_attribute( 'target', $link_target );
			$p->set_attribute( 'rel', $link_rel );
			$p->set_attribute( 'aria-hidden', 'true' );
		}

		$block_content = $p->get_updated_html();

		return $block_content;
	}

	/**
	 * Apply custom css to block
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
	 * Output custom CSS in the head
	 */
	public function output_custom_css() {
		$output = '
			 /* Blocklayouts CSS - Hovers */
			.has-hover__color:not(.wp-block-button):hover {
				color: var(--hover-color) !important;
			}
			.has-hover__background-color:not(.wp-block-button):hover {
				background-color: var(--hover-background-color) !important;
			}
			.has-hover__border-color:not(.wp-block-button):hover {
				border-color: var(--hover-border-color) !important;
			}
			.wp-block-button.has-hover__color:hover .wp-element-button {
				color: var(--hover-color) !important;
			}
			.wp-block-button.has-hover__background-color:hover .wp-element-button {
				background-color: var(--hover-background-color) !important;
			}
			.wp-block-button.has-hover__border-color:hover .wp-element-button {
				border-color: var(--hover-border-color) !important;
			}';

		// Add block-specific CSS.
		if ( ! empty( $this->custom_css ) ) {
			$output .= "\n/* Blocklayouts CSS - Block Specific */\n";
			foreach ( $this->custom_css as $selector => $css ) {
				if ( ! empty( $css ) ) {

					$css = str_replace( 'selector', ".{$selector}", $css );

					// Responsive CSS handling
					$css = preg_replace( '/@mobile\s*{([^}]*)}/s', '@media (max-width: 779px) {$1}', $css );
					$css = preg_replace( '/@tablet\s*{([^}]*)}/s', '@media (min-width: 780px) and (max-width: 1024px) {$1}', $css );
					$css = preg_replace( '/@desktop\s*{([^}]*)}/s', '@media (min-width: 1025px) {$1}', $css );

					$sanitized_css = $this->sanitize_css( $css );
					$output       .= "{$sanitized_css}\n";
				}
			}
		}
		// Output the CSS if we have any.
		if ( ! empty( $output ) ) {
			echo wp_kses(
				"<style id=\"blocklayouts-blocks-custom-css\">\n{$output}</style>\n",
				array(
					'style' => array(
						'id' => array(),
					),
				)
			);
		}
	}

	/**
	 * Sanitize CSS content.
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

new Blocklayouts_Blocks_Registrar();