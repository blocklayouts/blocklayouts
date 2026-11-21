<?php

namespace Blocklayouts;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Blocklayouts_Api {

	private static $instance           = null;
	private const BLOCKLAYOUTS_API_URL = 'https://blocklayouts.com/wp-json/blocklayouts/v1';

	/**
	 * Base URL of the Blocklayouts API.
	 *
	 * @return string
	 */
	private function api_url(): string {
		/**
		 * Filters the Blocklayouts API base URL (e.g. to test against a staging site).
		 *
		 * @param string $url Base URL, without a trailing slash.
		 */
		return untrailingslashit( (string) apply_filters( 'blocklayouts_api_url', self::BLOCKLAYOUTS_API_URL ) );
	}

	public function get_patterns( array $args = array() ) {
		return $this->request( 'GET', $this->api_url() . '/patterns', $args, true );
	}

	public function get_page_templates( array $args = array() ) {
		return $this->request( 'GET', $this->api_url() . '/page-templates', $args, true );
	}

	public function get_categories( array $args = array() ) {
		return $this->request( 'GET', $this->api_url() . '/categories', $args );
	}

	public function get_industries( array $args = array() ) {
		return $this->request( 'GET', $this->api_url() . '/industries', $args );
	}

	public function activate_license( array $args = array() ) {
		return $this->request( 'POST', $this->api_url() . '/licenses/activate', $args );
	}

	public function deactivate_license( array $args = array() ) {
		return $this->request( 'POST', $this->api_url() . '/licenses/deactivate', $args );
	}

	public function validate_license( array $args = array() ) {
		return $this->request( 'POST', $this->api_url() . '/licenses/validate', $args );
	}

	/**
	 * License headers, so the library includes the code of premium patterns
	 * for sites with an active license.
	 *
	 * @return array
	 */
	private function license_headers(): array {
		$license = License::get_instance();
		$data    = $license->get_license_data();
		if ( ! is_array( $data ) || ! $license->is_license_active( $data ) || empty( $data['license_key']['key'] ) || empty( $data['instance']['id'] ) ) {
			return array();
		}
		return array(
			'X-Blocklayouts-License'  => (string) $data['license_key']['key'],
			'X-Blocklayouts-Instance' => (string) $data['instance']['id'],
		);
	}

	/**
	 * Send a request to the Blocklayouts API.
	 *
	 * @param string $method       HTTP method.
	 * @param string $path         Request URL.
	 * @param array  $body         Request arguments.
	 * @param bool   $with_license Send the license headers.
	 * @return array|\WP_Error Decoded response data or an error.
	 */
	private function request( string $method, string $path, array $body, bool $with_license = false ) {
		if ( $method === 'GET' && ! empty( $body ) ) {
			$path .= '?' . http_build_query( $body );
			$body  = null;
		}

		$response = wp_remote_request(
			$path,
			array(
				'body'    => $body,
				'method'  => $method,
				'timeout' => 20,
				'headers' => array_merge(
					array(
						'Referer' => home_url(),
						'Accept'  => 'application/json',
					),
					$with_license ? $this->license_headers() : array()
				),
			)
		);

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$response_code = wp_remote_retrieve_response_code( $response );
		$body          = wp_remote_retrieve_body( $response );
		$data          = json_decode( $body, true );

		if ( json_last_error() !== JSON_ERROR_NONE ) {
			return new \WP_Error(
				'api_json_error',
				__( 'Invalid JSON response from the Blocklayouts API.', 'blocklayouts' ),
				array( 'status' => $response_code )
			);
		}

		if ( $response_code >= 500 ) {
			return new \WP_Error(
				'api_server_error',
				sprintf(
					/* translators: %d: HTTP status code. */
					__( 'API server error with status %d.', 'blocklayouts' ),
					$response_code
				),
				array(
					'status'        => $response_code,
					'response_data' => $data,
				)
			);
		}

		if ( $response_code >= 400 ) {
			$data['http_status'] = $response_code;
		}

		return $data;
	}

	public static function get_instance(): self {
		if ( self::$instance === null ) {
			self::$instance = new self();
		}
		return self::$instance;
	}
}