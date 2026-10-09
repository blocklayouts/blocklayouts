<?php
/**
 * Block Registry
 *
 * Handles the registration and enqueueing of custom Gutenberg blocks.
 *
 * @package Blocklayouts
 */

namespace Blocklayouts;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Blocks Registrar class
 *
 * Manages block registration and configuration with database settings.
 */
class Blocks_Registrar {

	/**
	 * Default blocks configuration.
	 *
	 * @return array
	 */
	private static function get_default_blocks() {
		return array(
			'blocklayouts/icon'              => array(
				'title'       => __( 'Icon', 'blocklayouts' ),
				'description' => __( 'Add a customizable icon to your content.', 'blocklayouts' ),
				'premium'     => false,
				'is_core'     => true,
				'active'      => true,
			),
			'blocklayouts/marquee'           => array(
				'title'       => __( 'Marquee', 'blocklayouts' ),
				'description' => __( 'Display content in a horizontal scrolling marquee.', 'blocklayouts' ),
				'premium'     => false,
				'active'      => true,
			),
			'blocklayouts/infinite-scroll'   => array(
				'title'       => __( 'Infinite Scroll', 'blocklayouts' ),
				'description' => __( 'Load more posts automatically on scroll or with a button.', 'blocklayouts' ),
				'premium'     => false,
				'active'      => true,
			),
			'blocklayouts/table-of-contents' => array(
				'title'       => __( 'Table of Contents', 'blocklayouts' ),
				'description' => __( 'Display a table of contents based on headings in your content.', 'blocklayouts' ),
				'premium'     => false,
				'active'      => true,
			),
		);
	}

	/**
	 * Construct function
	 */
	public function __construct() {
		add_action( 'init', array( $this, 'register_custom_blocks' ) );
		add_action( 'init', array( $this, 'enqueue_block_styles' ) );
		add_filter( 'block_categories_all', array( $this, 'register_block_category' ), 10, 2 );
	}

	/**
	 * Get all blocks merged with settings from database.
	 *
	 * Merges the default blocks array with blocks data from database settings.
	 * Database settings will override default values.
	 *
	 * @return array Array of blocks with merged settings.
	 */
	public static function get_blocks() {
		// Get blocks from database settings.
		$blocklayouts_settings = get_option( 'blocklayouts_settings', array() );
		$settings_blocks       = isset( $blocklayouts_settings['blocks'] ) ? $blocklayouts_settings['blocks'] : array();

		// Start with default blocks.
		$merged_blocks = self::get_default_blocks();

		// Merge saved settings into known default blocks only. Unknown keys are
		// ignored so stale or malformed saved data can never create phantom blocks.
		foreach ( $settings_blocks as $block_name => $block_settings ) {
			if ( isset( $merged_blocks[ $block_name ] ) && is_array( $block_settings ) ) {
				$merged_blocks[ $block_name ] = wp_parse_args( $block_settings, $merged_blocks[ $block_name ] );
			}
		}

		return $merged_blocks;
	}

	/**
	 * Register all custom blocks
	 */
	public function register_custom_blocks() {
		// Get all blocks with merged settings.
		$all_blocks  = self::get_blocks();
		$blocks_path = BLOCKLAYOUTS_PLUGIN_PATH . 'build/blocks/';

		// Register each active block.
		foreach ( $all_blocks as $block_name => $block_data ) {
			// Skip if block is not active.
			if ( isset( $block_data['active'] ) && false === $block_data['active'] ) {
				continue;
			}

			// Extract the block slug from the full name (e.g., 'icon' from 'blocklayouts/icon').
			$block_slug = str_replace( 'blocklayouts/', '', $block_name );

			// Register the block type.
			$block_path = $blocks_path . $block_slug;
			if ( file_exists( $block_path . '/block.json' ) ) {
				register_block_type( $block_path );
			}
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
				'handle' => 'blocklayouts-button-block-styles',
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
	 * Register block category
	 *
	 * @param array $block_categories Block categories.
	 * @return array Block categories.
	 */
	public function register_block_category( $block_categories ) {
		$block_categories[] = array(
			'slug'  => 'blocklayouts',
			'title' => __( 'Blocklayouts', 'blocklayouts' ),
		);
		return $block_categories;
	}
}

new Blocks_Registrar();