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
			'/patterns/categories',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'rest_get_patterns_categories' ),
				'permission_callback' => array( $this, 'check_editor_permission' ),
			)
		);

		register_rest_route(
			'blocklayouts/v1',
			'/page-templates/categories',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'rest_get_page_templates_categories' ),
				'permission_callback' => array( $this, 'check_editor_permission' ),
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

		register_rest_route(
			'blocklayouts/v1',
			'/license',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'rest_get_license' ),
				'permission_callback' => array( $this, 'check_editor_permission' ),
			)
		);

		register_rest_route(
			'blocklayouts/v1',
			'/license',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'rest_save_license' ),
				'permission_callback' => array( $this, 'check_admin_permission' ),
				'args'                => array(
					'nonce' => array(
						'required'          => true,
						'validate_callback' => array( $this, 'validate_nonce' ),
					),
				),
			)
		);

		// Blocks preferences endpoints
		register_rest_route(
			'blocklayouts/v1',
			'/blocks',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'rest_get_blocks' ),
				'permission_callback' => array( $this, 'check_editor_permission' ),
			)
		);

		register_rest_route(
			'blocklayouts/v1',
			'/blocks',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'rest_update_blocks' ),
				'permission_callback' => array( $this, 'check_admin_permission' ),
			)
		);
	}


	public function validate_nonce( $nonce ) {
		return wp_verify_nonce( $nonce, 'wp_rest' );
	}

	public function rest_get_patterns( $request ) {
		$params = $this->get_remote_params( $request );

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
		$params = $this->get_remote_params( $request );

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


	public function rest_get_patterns_categories( $request ) {
		return $this->get_categories_by_post_type( 'component' );
	}

	public function rest_get_page_templates_categories( $request ) {
		return $this->get_categories_by_post_type( 'page-template' );
	}

	/**
	 * Proxy category listing for a given remote post type, with caching.
	 *
	 * @param string $post_type Remote post type ('component' or 'page-template').
	 * @return \WP_REST_Response|\WP_Error
	 */
	private function get_categories_by_post_type( string $post_type ) {
		$args      = array( 'post_type' => $post_type );
		$cache_key = $this->get_cache_key( 'categories', $args );

		$cached_data = $this->get_cached_data( $cache_key );
		if ( $cached_data !== false ) {
			return rest_ensure_response( $cached_data );
		}

		$response = Blocklayouts_Api::get_instance()->get_categories( $args );

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$this->set_cached_data( $cache_key, $response );

		return rest_ensure_response( $response );
	}

	public function rest_get_categories( $request ) {
		$params = $this->get_remote_params( $request );

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
			return new \WP_Error( 'missing_license_key', __( 'License key is required.', 'blocklayouts' ), array( 'status' => 400 ) );
		}
		$args = array(
			'license_key'   => $license_key,
			'instance_name' => License::get_instance()->get_instance_name(),
		);

		$response = Blocklayouts_Api::get_instance()->activate_license( $args );

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		if ( ! empty( $response['activated'] ) && $response['activated'] ) {
			$result = License::get_instance()->save_license_data( $response );
			if ( $result ) {
				return rest_ensure_response(
					array(
						'success' => true,
						'data'    => License::get_instance()->get_license_config(),
					)
				);
			} else {
				return rest_ensure_response(
					array(
						'error' => __( 'Failed to save license information. Please try again or contact support.', 'blocklayouts' ),
					)
				);
			}
		}

		return rest_ensure_response(
			array(
				'error' => ! empty( $response['message'] ) ? $response['message'] : __( 'License activation failed.', 'blocklayouts' ),
			)
		);
	}

	public function rest_deactivate_license( $request ) {

		$license_key = sanitize_text_field( $request->get_param( 'license_key' ) );
		$instance_id = sanitize_text_field( $request->get_param( 'instance_id' ) );

		if ( empty( $license_key ) ) {
			return new \WP_Error( 'missing_license_key', __( 'License key is required.', 'blocklayouts' ), array( 'status' => 400 ) );
		}
		if ( empty( $instance_id ) ) {
			return new \WP_Error( 'missing_instance_id', __( 'Instance ID is required.', 'blocklayouts' ), array( 'status' => 400 ) );
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
						'error' => __( 'Failed to remove license information. Please try again or contact support.', 'blocklayouts' ),
					)
				);
			}
		}

		return rest_ensure_response(
			array(
				'error' => ! empty( $response['error'] ) ? $response['error'] : __( 'Failed to remove license information. Please try again or contact support.', 'blocklayouts' ),
			)
		);
	}

	/**
	 * Save the license record (used by the editor and dashboard account dropdown).
	 *
	 * The client persists the "license" entity via saveEntityRecord(), which POSTs to
	 * this route. The desired operation is provided in the payload's "action" field and
	 * is delegated to the matching activate/deactivate handler.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function rest_save_license( $request ) {
		$action = sanitize_text_field( (string) $request->get_param( 'action' ) );

		if ( 'deactivate' === $action ) {
			return $this->rest_deactivate_license( $request );
		}

		return $this->rest_activate_license( $request );
	}

	/**
	 * Get license data
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response
	 */
	public function rest_get_license( $request ) {
		$license_data = License::get_instance()->get_license_config();

		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => $license_data,
			)
		);
	}

	/**
	 * Get blocks preferences
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response
	 */
	public function rest_get_blocks( $request ) {
		$blocks = $this->get_available_blocks();

		// Convert associative array to indexed array with id included.
		$blocks_array = array();
		foreach ( $blocks as $name => $details ) {
			$blocks_array[] = array_merge(
				array( 'name' => $name ),
				$details
			);
		}

		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => $blocks_array,
			)
		);
	}

	/**
	 * Update blocks preferences
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response
	 */
	public function rest_update_blocks( $request ) {
		$blocks = $request->get_param( 'blocks' );

		// The dashboard saves the "blocks" entity as a plain array of block objects,
		// so fall back to the raw JSON body when there is no explicit "blocks" param.
		if ( ! is_array( $blocks ) ) {
			$body = $request->get_json_params();
			if ( is_array( $body ) ) {
				$blocks = $body;
			}
		}

		if ( ! is_array( $blocks ) ) {
			return new \WP_Error( 'invalid_blocks', __( 'Blocks must be an array.', 'blocklayouts' ), array( 'status' => 400 ) );
		}

		// Get current settings and the set of real, known blocks.
		$blocklayouts_settings = get_option( 'blocklayouts_settings', array() );
		$known_blocks          = Blocks_Registrar::get_blocks();

		// Rebuild the saved block preferences from scratch, keeping only real blocks.
		// The dashboard always sends the full list, so this also purges any stale or
		// malformed keys (e.g. numeric indexes) that could create phantom blocks.
		$saved_blocks = array();
		foreach ( $blocks as $key => $block_data ) {
			if ( ! is_array( $block_data ) ) {
				continue;
			}

			// Accept array-of-objects ( 'name', or legacy 'id' ) and associative maps.
			if ( isset( $block_data['name'] ) ) {
				$block_name = $block_data['name'];
			} elseif ( isset( $block_data['id'] ) ) {
				$block_name = $block_data['id'];
			} else {
				$block_name = $key;
			}

			$block_name = sanitize_text_field( (string) $block_name );

			// Ignore anything that isn't a real registered block.
			if ( ! isset( $known_blocks[ $block_name ] ) ) {
				continue;
			}

			$saved_blocks[ $block_name ] = array(
				'active' => isset( $block_data['active'] ) ? (bool) $block_data['active'] : true,
			);
		}

		$blocklayouts_settings['blocks'] = $saved_blocks;

		// Save updated settings. update_option() returns false when the value is
		// unchanged, so treat a matching stored value as success too.
		$result = update_option( 'blocklayouts_settings', $blocklayouts_settings );

		if ( $result || get_option( 'blocklayouts_settings', array() ) === $blocklayouts_settings ) {
			// Return the merged blocks with all data.
			$all_blocks = Blocks_Registrar::get_blocks();

			$blocks_array = array();
			foreach ( $all_blocks as $block_name => $block_data ) {
				$blocks_array[] = array_merge(
					array( 'name' => $block_name ),
					$block_data
				);
			}

			return rest_ensure_response(
				array(
					'success' => true,
					'data'    => $blocks_array,
				)
			);
		}

		return rest_ensure_response(
			array(
				'error' => __( 'Failed to save block preferences.', 'blocklayouts' ),
			)
		);
	}

	/**
	 * Get available blocks
	 * Fetches block metadata from WordPress Block Type Registry
	 */
	private function get_available_blocks(): array {
		$all_blocks = Blocks_Registrar::get_blocks();
		return $all_blocks;
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
		if ( ! function_exists( 'is_plugin_active' ) ) {
			require_once ABSPATH . 'wp-admin/includes/plugin.php';
		}

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
	 * Collect the query parameters that are forwarded to the remote API.
	 *
	 * Only known parameters are kept, so arbitrary input is never forwarded
	 * and can't be used to create an unlimited number of cache entries.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return array Sanitized parameters.
	 */
	private function get_remote_params( $request ): array {
		$allowed = array(
			'page'        => 'absint',
			'per_page'    => 'absint',
			'search'      => 'sanitize_text_field',
			'category'    => 'sanitize_text_field',
			'industry'    => 'sanitize_text_field',
			'post_type'   => 'sanitize_key',
			'layout_type' => 'sanitize_key',
		);

		$params = array();
		foreach ( $allowed as $key => $sanitize ) {
			$value = $request->get_param( $key );
			if ( null === $value || '' === $value || is_array( $value ) ) {
				continue;
			}
			$params[ $key ] = call_user_func( $sanitize, $value );
		}

		ksort( $params );

		return $params;
	}

	/**
	 * Generate cache key
	 */
	private function get_cache_key( string $endpoint, array $params = array() ): string {
		return $this->cache_prefix . $endpoint . '_' . md5( wp_json_encode( $params ) );
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
	public static function get_instance(): self {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}
}

Blocklayouts_REST_API::get_instance()->init();