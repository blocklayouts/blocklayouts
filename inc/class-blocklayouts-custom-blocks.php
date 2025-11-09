<?php

namespace Blocklayouts;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Handles the registration and enqueueing of custom Gutenberg blocks.
 */
class Blocklayouts_Blocks_Registrar {

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
		add_action( 'init', array( $this, 'register_custom_blocks' ) );
		add_action( 'init', array( $this, 'enqueue_block_styles' ) );
		add_filter( 'render_block', array( $this, 'apply_custom_css_to_block' ), 10, 2 );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_custom_css' ), 20 );

		add_filter( 'render_block_core/button', array( $this, 'add_inline_icon_to_button' ), 10, 2 );
		add_filter( 'render_block_core/group', array( $this, 'add_wrapper_link_to_group' ), 10, 2 );

		// Related posts.
		add_filter( 'query_loop_block_query_vars', array( $this, 'modify_related_posts_query_vars' ), 10, 2 );
		add_filter( 'render_block_context', array( $this, 'add_related_posts_context' ), 10, 3 );
	}

	/**
	 * Register all custom blocks
	 */
	public function register_custom_blocks() {

		$blocks = array(
			'icon',
			'marquee',
			'infinite-scroll',
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
	 * Modify related posts query vars
	 *
	 * @param array $query_vars The query vars.
	 * @param mixed $block The block instance.
	 * @return array The modified query vars.
	 */
	public function modify_related_posts_query_vars( $query_vars, $block ) {
		$parsed_block = $block->parsed_block;

		if ( ! isset( $parsed_block['attrs']['namespace'] ) || 'blocklayouts/related-posts-template' !== $parsed_block['attrs']['namespace'] ) {
			return $query_vars;
		}

		// Ensure we have a valid post ID (we're on a single post).
		$current_post_id = get_the_ID();
		if ( ! $current_post_id || ! is_singular() ) {
			return $query_vars;
		}

		$context = $block->context;

		$query_vars['inherit']      = false;
		$query_vars['post_type']    = get_post_type();
		$query_vars['post__not_in'] = array( $current_post_id );

		// Get the selected taxonomies from block attributes.
		$selected_taxonomies = isset( $context['relatedPostsTaxonomies'] )
			? $context['relatedPostsTaxonomies']
			: array();

		// Get current post's taxonomy terms.
		$tax_query = array( 'relation' => 'AND' ); // All selected taxonomies must match.

		// If no specific taxonomies are selected, use current post type's taxonomies.
		if ( empty( $selected_taxonomies ) ) {
			$selected_taxonomies = get_object_taxonomies( get_post_type(), 'names' );
			$tax_query           = array( 'relation' => 'OR' ); // Any of the taxonomies in the current post type can match.
		}

		// Build tax_query based on selected taxonomies.
		foreach ( $selected_taxonomies as $taxonomy ) {
			// Check if taxonomy exists.
			if ( ! taxonomy_exists( $taxonomy ) ) {
				continue;
			}

			// Get terms for this taxonomy for the current post.
			$terms = wp_get_post_terms( $current_post_id, $taxonomy, array( 'fields' => 'ids' ) );

			if ( ! empty( $terms ) && ! is_wp_error( $terms ) ) {
				$tax_query[] = array(
					'taxonomy' => $taxonomy,
					'field'    => 'term_id',
					'terms'    => $terms,
				);
			}
		}

		// Only apply tax_query if we have valid taxonomy queries.
		if ( count( $tax_query ) > 1 ) {
			$query_vars['tax_query'] = $tax_query;
		}

		return $query_vars;
	}

	/**
	 * Add related posts context
	 *
	 * @param array $context The context.
	 * @param array $block The block data.
	 * @return array The modified context.
	 */
	public function add_related_posts_context( $context, $parsed_block, $parent_block ) {

		if ( ! isset( $parsed_block['attrs']['namespace'] ) || 'blocklayouts/related-posts-template' !== $parsed_block['attrs']['namespace'] ) {
			return $context;
		}

		$parsed_parent_block = $parent_block->parsed_block;

		$context['relatedPostsTaxonomies'] = $parsed_parent_block['attrs']['relatedPostsTaxonomies'] ?? array();

		return $context;
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
	 * Apply wrapper link to group
	 *
	 * @param string $block_content The block content.
	 * @param array  $block The block data.
	 * @return string The block content with the wrapper link.
	 */
	public function add_wrapper_link_to_group( $block_content, $block ) {

		if ( ! isset( $block['attrs']['wrapperLink']['linkDestination'] ) && ! isset( $block['attrs']['wrapperLink']['href'] ) ) {
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

		// Add the is-linked class to the group block.
		$p = new \WP_HTML_Tag_Processor( $block_content );
		if ( $p->next_tag() ) {
			$p->add_class( 'is-linked' );
		}
		$block_content = $p->get_updated_html();

		$link_markup = sprintf(
			'<a class="wp-block-group__link" href="%1$s" target="%2$s" rel="%3$s" aria-hidden="true" tabindex="-1">&nbsp;</a>',
			esc_url( $link ),
			esc_attr( $link_target ),
			esc_attr( $link_rel )
		);

		// Insert the link markup after the opening tag.
		$block_content = preg_replace(
			'/^\s*<(\w+)([^>]*)>/m',
			'<$1$2>' . $link_markup,
			$block_content,
			1
		);

		return $block_content;
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

new Blocklayouts_Blocks_Registrar();