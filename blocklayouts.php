<?php
/**
 * Plugin Name:       Blocklayouts
 * Description:       Custom blocks, enhanced core blocks, and pre-designed patterns to build WordPress sites faster
 * Plugin URI:        https://blocklayouts.com/
 * Author:            blocklayouts
 * Author URI:        https://github.com/blocklayouts/
 * Requires at least: 6.3
 * Requires PHP:      7.4
 * Version:           0.1.3
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       blocklayouts
 * Domain Path:       /languages
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
define( 'BLOCKLAYOUTS_VERSION', '0.1.3' );

require BLOCKLAYOUTS_PLUGIN_PATH . 'inc/plugin-update-checker/plugin-update-checker.php';
use YahnisElsts\PluginUpdateChecker\v5\PucFactory;

$blocklayouts_update_checker = PucFactory::buildUpdateChecker(
	'https://github.com/blocklayouts/blocklayouts',
	__FILE__,
	'blocklayouts'
);

$blocklayouts_update_checker->setBranch( 'main' );
$blocklayouts_update_checker->getVcsApi()->enableReleaseAssets();

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
 * Enqueue animation CSS file.
 *
 * @since 0.1.0
 */
function blocklayouts_enqueue_animation_css() {
	wp_enqueue_style(
		'blocklayouts-animation-css',
		BLOCKLAYOUTS_PLUGIN_URL . 'assets/css/animation.min.css',
		array(),
		BLOCKLAYOUTS_VERSION
	);
}
add_action( 'wp_enqueue_scripts', __NAMESPACE__ . '\blocklayouts_enqueue_animation_css' );

/**
 * Enqueue effects frontend JavaScript
 *
 * @since 0.1.0
 */
function blocklayouts_add_effects_script_to_footer() {
	if ( is_admin() ) {
		return;
	}

	?>
<script>
document.addEventListener("DOMContentLoaded", function() {
    const effectsController = {
        init() {
            this.setupScrollTriggers();
        },
        setupScrollTriggers() {
            const scrollElements = document.querySelectorAll(
                ".has-animation-effect.animation-trigger-onScroll");
            if (scrollElements.length === 0) return;
            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("animation-play");
                    } else {
                        entry.target.classList.remove("animation-play");
                        entry.target.offsetHeight;
                    }
                });
            }, {
                threshold: 0.4,
                rootMargin: "50px"
            });
            scrollElements.forEach(el => observer.observe(el));
        }
    };
    effectsController.init();
});
</script>
<?php
}
add_action( 'wp_footer', __NAMESPACE__ . '\blocklayouts_add_effects_script_to_footer' );

/**
 * Plugin deactivation hook
 */
function blocklayouts_deactivate() {
	// Clean up scheduled events.
	wp_clear_scheduled_hook( 'blocklayouts_validate_license' );
}
register_deactivation_hook( __FILE__, __NAMESPACE__ . '\blocklayouts_deactivate' );