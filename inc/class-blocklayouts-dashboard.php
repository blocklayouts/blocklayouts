<?php
/**
 * BlockLayouts Dashboard
 *
 * @package Blocklayouts
 */

namespace Blocklayouts;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Dashboard class
 */
class Blocklayouts_Dashboard {

	/**
	 * Instance of this class
	 *
	 * @var Blocklayouts_Dashboard
	 */
	private static $instance = null;

	/**
	 * Get instance
	 *
	 * @return Blocklayouts_Dashboard
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Constructor
	 */
	private function __construct() {
		add_action( 'admin_menu', array( $this, 'add_option_menu' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_assets' ) );
	}

	/**
	 * Add option menu.
	 */
	public function add_option_menu() {
		add_options_page(
			__( 'Blocklayouts', 'blocklayouts' ),
			__( 'Blocklayouts', 'blocklayouts' ),
			'manage_options',
			'blocklayouts',
			array( $this, 'render_dashboard' )
		);
	}

	/**
	 * Render dashboard
	 */
	public function render_dashboard() {
		echo '<div id="blocklayouts-dashboard"></div>';
	}

	/**
	 * Enqueue assets
	 *
	 * @param string $hook Current admin page hook.
	 */
	public function enqueue_assets( $hook ) {
		if ( 'settings_page_blocklayouts' !== $hook ) {
			return;
		}

		$asset_file = include BLOCKLAYOUTS_PLUGIN_PATH . 'build/dashboard/index.asset.php';

		// Ensure asset file is valid array with expected keys.
		if ( ! is_array( $asset_file ) ) {
			$asset_file = array(
				'dependencies' => array(),
				'version'      => '1.0.0',
			);
		}

		$asset_file = wp_parse_args(
			$asset_file,
			array(
				'dependencies' => array(),
				'version'      => '1.0.0',
			)
		);

		wp_enqueue_style(
			'blocklayouts-dashboard',
			BLOCKLAYOUTS_PLUGIN_URL . 'build/dashboard/index.css',
			array( 'wp-components' ),
			$asset_file['version']
		);

		wp_enqueue_script(
			'blocklayouts-dashboard',
			BLOCKLAYOUTS_PLUGIN_URL . 'build/dashboard/index.js',
			$asset_file['dependencies'],
			$asset_file['version'],
			true
		);

		// Pass configuration to JavaScript.
		$this->localize_script();
	}

	/**
	 * Localize script
	 */
	private function localize_script() {
		$license = \Blocklayouts\License::get_instance();

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
			'blocklayouts-dashboard',
			'blocklayouts_config',
			$config
		);
	}
}

Blocklayouts_Dashboard::get_instance();