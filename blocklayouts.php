<?php
/**
 * Plugin Name:       Blocklayouts
 * Description:       Custom blocks, enhanced core blocks, and pre-designed patterns to build WordPress sites faster
 * Plugin URI:        https://blocklayouts.com/
 * Author:            blocklayouts
 * Author URI:        https://github.com/blocklayouts/
 * Requires at least: 6.5
 * Requires PHP:      7.4
 * Version:           0.2.1
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       blocklayouts
 *
 * @package Blocklayouts
 */

namespace Blocklayouts;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Define plugin constants.
define( 'BLOCKLAYOUTS_PLUGIN_PATH', plugin_dir_path( __FILE__ ) );
define( 'BLOCKLAYOUTS_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'BLOCKLAYOUTS_VERSION', '0.2.1' );

/**
 * Initialize.
 */
require_once __DIR__ . '/inc/class-blocklayouts-license.php';
require_once __DIR__ . '/inc/class-blocklayouts-api.php';
require_once __DIR__ . '/inc/class-blocklayouts-rest-api.php';
require_once __DIR__ . '/inc/class-blocklayouts-cron.php';
require_once __DIR__ . '/inc/class-blocklayouts-custom-blocks.php';

( new Blocklayouts_Cron() )->init();

/**
 * Enqueue editor assets.
 *
 * @since 0.1.0
 */
function blocklayouts_enqueue_editor_assets() {

	$asset_file = include BLOCKLAYOUTS_PLUGIN_PATH . 'build/index.asset.php';
	$license    = License::get_instance();

	wp_enqueue_style(
		'blocklayouts-core-extensions-editor-styles',
		BLOCKLAYOUTS_PLUGIN_URL . 'build/index.css',
		array( 'wp-codemirror' ),
		BLOCKLAYOUTS_VERSION
	);

	wp_enqueue_script(
		'blocklayouts-library-editor',
		BLOCKLAYOUTS_PLUGIN_URL . 'build/index.js',
		array_merge( $asset_file['dependencies'], array( 'wp-codemirror' ) ),
		$asset_file['version'],
		false
	);

	// Set up script translations for JavaScript localization.
	wp_set_script_translations(
		'blocklayouts-library-editor',
		'blocklayouts',
		BLOCKLAYOUTS_PLUGIN_PATH . 'languages'
	);

	$config = array(
		'license'       => $license->get_license_config(),
		'instance_name' => $license->get_instance_name(),
		'version'       => BLOCKLAYOUTS_VERSION,
		'api'           => array(
			'nonce' => wp_create_nonce( 'wp_rest' ),
			'root'  => esc_url_raw( rest_url() ),
		),
	);

	wp_localize_script(
		'blocklayouts-library-editor',
		'blocklayouts_config',
		$config
	);
}
add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\blocklayouts_enqueue_editor_assets' );

/**
 * Enqueue CSS & JavaScript files.
 *
 * @since 0.1.0
 */
function blocklayouts_enqueue_css_and_js() {

	if ( is_admin() ) {
		return;
	}

	wp_enqueue_style(
		'blocklayouts-main-styles',
		BLOCKLAYOUTS_PLUGIN_URL . 'assets/css/blocklayouts.css', // TODO: minify this file
		array(),
		BLOCKLAYOUTS_VERSION
	);

	// JS.
	wp_register_script(
		'blocklayouts-main-scripts',
		BLOCKLAYOUTS_PLUGIN_URL . 'assets/js/blocklayouts.js', // TODO: minify this file
		array(),
		BLOCKLAYOUTS_VERSION,
		true
	);

	wp_enqueue_script( 'blocklayouts-main-scripts' );
}
add_action( 'wp_enqueue_scripts', __NAMESPACE__ . '\blocklayouts_enqueue_css_and_js' );

/**
 * Register new block category
 *
 * @param array $block_categories Block categories.
 * @return array Block categories.
 */
function blocklayouts_register_block_category( $block_categories ) {

	$block_categories[] = array(
		'slug'  => 'blocklayouts',
		'title' => __( 'Blocklayouts', 'blocklayouts' ),
	);

	return $block_categories;
}
add_filter( 'block_categories_all', __NAMESPACE__ . '\blocklayouts_register_block_category', 10, 2 );

/**
 * Plugin deactivation hook
 */
function blocklayouts_deactivate() {
	// Clean up scheduled events.
	wp_clear_scheduled_hook( 'blocklayouts_validate_license' );
}
register_deactivation_hook( __FILE__, __NAMESPACE__ . '\blocklayouts_deactivate' );