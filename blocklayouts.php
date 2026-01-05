<?php
/**
 * Plugin Name:       Blocklayouts
 * Description:       Custom blocks, enhanced core blocks, and pre-designed patterns to build WordPress sites faster
 * Plugin URI:        https://blocklayouts.com/
 * Author:            blocklayouts
 * Author URI:        https://github.com/blocklayouts/
 * Requires at least: 6.5
 * Requires PHP:      7.4
 * Version:           0.1.9
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
define( 'BLOCKLAYOUTS_VERSION', '0.1.9' );

// Initialize plugin updater.
require plugin_dir_path( __FILE__ ) . 'inc/class-plugin-updater.php';

new \Blocklayouts_Plugin_Updater(
	plugin_basename( __FILE__ ),
	'blocklayouts',
	BLOCKLAYOUTS_VERSION,
	'https://blocklayouts.com/wp-json/lsq/v1'
);

/**
 * Initialize.
 */
require_once __DIR__ . '/inc/class-blocklayouts-license.php';
require_once __DIR__ . '/inc/blocks/class-blocklayouts-block-registry.php';
require_once __DIR__ . '/inc/extensions/extensions.php';
require_once __DIR__ . '/inc/class-blocklayouts-api.php';
require_once __DIR__ . '/inc/class-blocklayouts-rest-api.php';
require_once __DIR__ . '/inc/class-blocklayouts-cron.php';


( new Blocklayouts_Cron() )->init();

// Initialize Dashboard UI (admin only).
if ( is_admin() ) {
	require_once __DIR__ . '/inc/class-blocklayouts-dashboard.php';
}

/**
 * Load plugin textdomain.
 *
 * @since 0.1.0
 */
function blocklayouts_load_textdomain() {
	load_plugin_textdomain(
		'blocklayouts',
		false,
		dirname( plugin_basename( __FILE__ ) ) . '/languages'
	);
}
add_action( 'init', __NAMESPACE__ . '\blocklayouts_load_textdomain' );

/**
 * Enqueue editor assets.
 *
 * @since 0.1.0
 */
function blocklayouts_enqueue_editor_assets() {

	$asset_file = include BLOCKLAYOUTS_PLUGIN_PATH . 'build/index.asset.php';
	$license    = License::get_instance();

	// Ensure asset file is valid array with expected keys.
	if ( ! is_array( $asset_file ) ) {
		$asset_file = array(
			'dependencies' => array(),
			'version'      => BLOCKLAYOUTS_VERSION,
		);
	}

	$asset_file = wp_parse_args(
		$asset_file,
		array(
			'dependencies' => array(),
			'version'      => BLOCKLAYOUTS_VERSION,
		)
	);

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
		BLOCKLAYOUTS_PLUGIN_URL . 'assets/css/blocklayouts.css',
		array(),
		BLOCKLAYOUTS_VERSION
	);

	// JS.
	wp_register_script(
		'blocklayouts-main-scripts',
		BLOCKLAYOUTS_PLUGIN_URL . 'assets/js/blocklayouts.min.js',
		array(),
		BLOCKLAYOUTS_VERSION,
		true
	);

	wp_enqueue_script( 'blocklayouts-main-scripts' );
}
add_action( 'wp_enqueue_scripts', __NAMESPACE__ . '\blocklayouts_enqueue_css_and_js' );

/**
 * Plugin deactivation hook
 */
function blocklayouts_deactivate() {
	// Clean up scheduled events.
	wp_clear_scheduled_hook( 'blocklayouts_validate_license' );
}
register_deactivation_hook( __FILE__, __NAMESPACE__ . '\blocklayouts_deactivate' );