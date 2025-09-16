<?php

namespace Blocklayouts;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * REST API endpoints class
 * Handles WordPress REST API endpoints and caching
 */
class Blocklayouts_REST_API {

	private static $instance = null;
	private $cache_prefix    = 'blocklayouts_';
	private $cache_duration  = 3600;

	/**
	 * Initialize the REST API handler
	 */
	public function init() {
		add_action( 'rest_api_init', array( $this, 'register_rest_routes' ) );
	}

	/**
	 * Register REST API routes
	 */
	public function register_rest_routes() {
		// Patterns
		register_rest_route(
			'blocklayouts/v1',
			'/patterns',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'rest_get_patterns' ),
				'permission_callback' => array( $this, 'check_editor_permission' ),
			)
		);

		register_rest_route(
			'blocklayouts/v1',
			'/page-templates',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'rest_get_page_templates' ),
				'permission_callback' => array( $this, 'check_editor_permission' ),
			)
		);

		register_rest_route(
			'blocklayouts/v1',
			'/categories',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'rest_get_categories' ),
				'permission_callback' => array( $this, 'check_editor_permission' ),
				'args'                => array(
					'layout_type' => array(
						'default'           => '',
						'sanitize_callback' => 'sanitize_text_field',
					),
				),
			)
		);

		register_rest_route(
			'blocklayouts/v1',
			'/industries',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'rest_get_industries' ),
				'permission_callback' => array( $this, 'check_editor_permission' ),
			)
		);

		// License endpoints
		register_rest_route(
			'blocklayouts/v1',
			'/license/activate',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'rest_activate_license' ),
				'permission_callback' => array( $this, 'check_admin_permission' ),
				'args'                => array(
					'nonce' => array(
						'required'          => true,
						'validate_callback' => array( $this, 'validate_nonce' ),
					),
				),
			)
		);

		register_rest_route(
			'blocklayouts/v1',
			'/license/deactivate',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'rest_deactivate_license' ),
				'permission_callback' => array( $this, 'check_admin_permission' ),
				'args'                => array(
					'nonce' => array(
						'required'          => true,
						'validate_callback' => array( $this, 'validate_nonce' ),
					),
				),
			)
		);
	}


	public function validate_nonce( $nonce ) {
		return wp_verify_nonce( $nonce, 'wp_rest' );
	}

	public function rest_get_patterns( $request ) {
		$params = $request->get_params();

		$cache_key = $this->get_cache_key( 'patterns', $params );

		// Try to get from cache first
		$cached_data = $this->get_cached_data( $cache_key );
		if ( $cached_data !== false ) {
			return rest_ensure_response( $cached_data );
		}

		$response = Blocklayouts_Api::get_instance()->get_patterns( $params );

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		// Filter patterns based on dependencies.
		if ( isset( $response['patterns'] ) && is_array( $response['patterns'] ) ) {
			$response['patterns'] = $this->filter_patterns_by_dependencies( $response['patterns'] );
		}

		$this->set_cached_data( $cache_key, $response );

		return rest_ensure_response( $response );
	}

	public function rest_get_page_templates( $request ) {
		$params = $request->get_params();

		$cache_key = $this->get_cache_key( 'page_templates', $params );

		$cached_data = $this->get_cached_data( $cache_key );
		if ( $cached_data !== false ) {
			return rest_ensure_response( $cached_data );
		}

		$response = Blocklayouts_Api::get_instance()->get_page_templates( $params );

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		// Filter page templates based on dependencies
		if ( isset( $response['pages'] ) && is_array( $response['pages'] ) ) {
			$response['pages'] = $this->filter_patterns_by_dependencies( $response['pages'] );
		}

		$this->set_cached_data( $cache_key, $response );

		return rest_ensure_response( $response );
	}


	public function rest_get_categories( $request ) {
		$params = $request->get_params();

		$cache_key = $this->get_cache_key( 'categories', $params );

		$cached_data = $this->get_cached_data( $cache_key );
		if ( $cached_data !== false ) {
			return rest_ensure_response( $cached_data );
		}

		$response = Blocklayouts_Api::get_instance()->get_categories( $params );

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$this->set_cached_data( $cache_key, $response );

		return rest_ensure_response( $response );
	}


	public function rest_get_industries( $request ) {
		$cache_key = $this->get_cache_key( 'industries' );

		$cached_data = $this->get_cached_data( $cache_key );
		if ( $cached_data !== false ) {
			return rest_ensure_response( $cached_data );
		}

		$response = Blocklayouts_Api::get_instance()->get_industries();

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$this->set_cached_data( $cache_key, $response );

		return rest_ensure_response( $response );
	}

	public function rest_activate_license( $request ) {
		$license_key = sanitize_text_field( $request->get_param( 'license_key' ) );

		if ( empty( $license_key ) || strlen( $license_key ) < 8 ) {
			return new \WP_Error( 'missing_license_key', 'License key is required.', array( 'status' => 400 ) );
		}
		$args = array(
			'license_key'   => $license_key,
			'instance_name' => License::get_instance()->get_instance_name(),
		);

		$response = Blocklayouts_Api::get_instance()->activate_license( $args );

		if ( ! empty( $response['activated'] && $response['activated'] ) ) {
			$result = License::get_instance()->save_license_data( $response );
			if ( $result ) {
				return rest_ensure_response(
					array(
						'success' => true,
						'data'    => License::get_instance()->get_license_data(),
					)
				);
			} else {
				return rest_ensure_response(
					array(
						'error' => 'Failed to save license information. Please try again or contact support.',
					)
				);
			}
		}

		return rest_ensure_response(
			array(
				'error' => ! empty( $response['error'] ) ? $response['error'] : 'License activation failed!',
			)
		);
	}

	public function rest_deactivate_license( $request ) {

		$license_key = $request->get_param( 'license_key' );
		$instance_id = $request->get_param( 'instance_id' );

		if ( empty( $license_key ) ) {
			return new \WP_Error( 'missing_license_key', 'License key is required.', array( 'status' => 400 ) );
		}
		if ( empty( $instance_id ) ) {
			return new \WP_Error( 'missing_instance_id', 'Instance id key is required.', array( 'status' => 400 ) );
		}

		$args = array(
			'license_key' => $license_key,
			'instance_id' => $instance_id,
		);

		$response = Blocklayouts_Api::get_instance()->deactivate_license( $args );

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		if ( ! empty( $response['deactivated'] ) && $response['deactivated'] ) {
			$result = License::get_instance()->remove_license_data();
			if ( $result ) {
				return rest_ensure_response(
					array(
						'success' => true,
						'data'    => License::get_instance()->get_license_data(),
					)
				);
			} else {
				return rest_ensure_response(
					array(
						'error' => 'Failed to remove license information. Please try again or contact support.',
					)
				);
			}
		}

		return rest_ensure_response(
			array(
				'error' => ! empty( $response['error'] ) ? $response['error'] : 'Failed to remove license information. Please try again or contact support.',
			)
		);
	}

	/**
	 * Filter patterns based on client dependencies
	 */
	private function filter_patterns_by_dependencies( array $patterns ): array {
		$filtered_patterns = array();

		foreach ( $patterns as $pattern ) {
			if ( $this->check_pattern_dependencies( $pattern ) ) {
				$filtered_patterns[] = $pattern;
			}
		}

		return $filtered_patterns;
	}

	/**
	 * Check if pattern dependencies are met
	 */
	private function check_pattern_dependencies( array $pattern ): bool {
		if ( ! isset( $pattern['dependencies'] ) || ! is_array( $pattern['dependencies'] ) ) {
			return true;
		}

		foreach ( $pattern['dependencies'] as $dependency ) {
			if ( ! $this->is_dependency_satisfied( $dependency ) ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Check if a specific dependency is satisfied
	 */
	private function is_dependency_satisfied( string $dependency ): bool {
		$parts = explode( ':', $dependency, 2 );
		if ( count( $parts ) !== 2 ) {
			return false;
		}

		$type  = $parts[0];
		$value = $parts[1];

		switch ( $type ) {
			case 'plugin':
				return $this->is_plugin_active( $value );
			case 'version':
				return $this->is_version_compatible( $value );
			default:
				return false;
		}
	}

	/**
	 * Check if plugin is active
	 */
	private function is_plugin_active( string $plugin_slug ): bool {
		$plugin_paths = array(
			$plugin_slug . '/' . $plugin_slug . '.php',
			$plugin_slug . '/index.php',
			$plugin_slug . '.php',
		);

		foreach ( $plugin_paths as $plugin_path ) {
			if ( is_plugin_active( $plugin_path ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Check if version is compatible
	 */
	private function is_version_compatible( string $required_version ): bool {
		if ( ! defined( 'BLOCKLAYOUTS_VERSION' ) ) {
			return false;
		}

		return version_compare( BLOCKLAYOUTS_VERSION, $required_version, '>=' );
	}

	/**
	 * Generate cache key
	 */
	private function get_cache_key( string $endpoint, array $params = array() ): string {
		return $this->cache_prefix . $endpoint . '_' . md5( serialize( $params ) );
	}

	/**
	 * Get cached data
	 */
	private function get_cached_data( string $cache_key ) {
		// Try object cache first, then transients
		$data = wp_cache_get( $cache_key, 'blocklayouts' );
		if ( $data !== false ) {
			return $data;
		}

		return get_transient( $cache_key );
	}

	/**
	 * Set cached data
	 */
	private function set_cached_data( string $cache_key, $data ): void {
		set_transient( $cache_key, $data, $this->cache_duration );
	}

	/**
	 * Check if user has admin permission
	 */
	public function check_admin_permission(): bool {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Check if user has editor permission (can edit posts)
	 * This ensures only authenticated users with content editing capabilities can access patterns
	 */
	public function check_editor_permission(): bool {
		return current_user_can( 'edit_posts' );
	}

	/**
	 * Get singleton instance
	 */
	public static function get_instance(): static {
		if ( self::$instance === null ) {
			self::$instance = new self();
		}
		return self::$instance;
	}
}

Blocklayouts_REST_API::get_instance()->init();
