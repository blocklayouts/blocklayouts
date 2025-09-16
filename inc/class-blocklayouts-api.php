<?php

namespace Blocklayouts;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Blocklayouts_Api {

	private static $instance                   = null;
	private const BLOCKLAYOUTS_API_URL         = 'https://patterns.blocklayouts.com/api/v2';
	private const BLOCKLAYOUTS_LICENSE_API_URL = 'https://api.lemonsqueezy.com/v1/licenses';

	public function get_patterns( array $args = array() ) {
		return $this->request( 'GET', self::BLOCKLAYOUTS_API_URL . '/patterns', $args );
	}

	public function get_page_templates( array $args = array() ) {
		return $this->request( 'GET', self::BLOCKLAYOUTS_API_URL . '/page-templates', $args );
	}

	public function get_categories( array $args = array() ) {
		return $this->request( 'GET', self::BLOCKLAYOUTS_API_URL . '/categories', $args );
	}

	public function get_industries( array $args = array() ) {
		return $this->request( 'GET', self::BLOCKLAYOUTS_API_URL . '/industries', $args );
	}

	public function activate_license( array $args = array() ) {
		return $this->request( 'POST', self::BLOCKLAYOUTS_LICENSE_API_URL . '/activate', $args );
	}

	public function deactivate_license( array $args = array() ) {
		return $this->request( 'POST', self::BLOCKLAYOUTS_LICENSE_API_URL . '/deactivate', $args );
	}

	public function validate_license( array $args = array() ) {
		return $this->request( 'POST', self::BLOCKLAYOUTS_LICENSE_API_URL . '/validate', $args );
	}

	private function request( string $method, string $path, array $body ): array|\WP_Error {
		if ( $method === 'GET' && ! empty( $body ) ) {
			$path .= '?' . http_build_query( $body );
			$body  = null;
		}

		$response = wp_remote_request(
			$path,
			array(
				'body'      => $body,
				'method'    => $method,
				'timeout'   => 20,
				'sslverify' => false,
				'headers'   => array(
					'Referer' => home_url(),
					'Accept'  => 'application/json',
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
				'Invalid JSON response from Blocklayouts API',
				array( 'status' => $response_code )
			);
		}

		if ( $response_code >= 500 ) {
			return new \WP_Error(
				'api_server_error',
				"API server error with status {$response_code}",
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

	public static function get_instance(): static {
		if ( self::$instance === null ) {
			self::$instance = new self();
		}
		return self::$instance;
	}
}