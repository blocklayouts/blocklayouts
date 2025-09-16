<?php

namespace Blocklayouts;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class License {

	private const OPTION_NAME = 'blocklayouts_license_data';

	private static $instance = null;
	private $error           = '';

	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	public function get_license_data() {
		$license_data = get_option( self::OPTION_NAME, false );

		if ( ! $license_data || ! is_array( $license_data ) ) {
			return false;
		}

		$license_data['is_active']          = $this->is_license_active( $license_data );
		$license_data['is_expired']         = $this->is_license_expired( $license_data );
		$license_data['is_about_to_expire'] = $this->is_license_about_to_expire( 7, $license_data );

		return $license_data;
	}

	public function get_instance_name() {
		return home_url() . ' - ' . get_bloginfo( 'name' );
	}

	public function save_license_data( $license_data ) {
		if ( ! is_array( $license_data ) ) {
			return false;
		}

		$license_data['last_updated'] = time();
		return update_option( self::OPTION_NAME, $license_data );
	}

	public function update_license_key( $license_key ) {
		$license_data = $this->get_license_data();
		if ( ! is_array( $license_data ) ) {
			$license_data = array();
		}

		$license_data['license_key'] = $license_key;
		return $this->save_license_data( $license_data );
	}


	public function remove_license_data() {
		$license_data = $this->get_license_data();

		if ( ! $license_data || empty( $license_data['license_key'] ) ) {
			$this->set_error( 'No license data found' );
			return false;
		}

		return delete_option( self::OPTION_NAME );
	}


	public function is_license_expired( $license_data = null ) {
		if ( null === $license_data ) {
			$license_data = $this->get_license_data();
		}

		if ( ! $license_data ) {
			return true;
		}

		if ( isset( $license_data['license_key']['status'] ) && 'expired' === $license_data['license_key']['status'] ) {
			return true;
		}

		return false;
	}

	public function is_license_about_to_expire( $days = 7, $license_data = null ) {
		if ( null === $license_data ) {
			$license_data = $this->get_license_data();
		}

		if ( ! $license_data || ! isset( $license_data['license_key']['expires_at'] ) || empty( $license_data['license_key']['expires_at'] ) ) {
			return false;
		}

		$expires_at = strtotime( $license_data['license_key']['expires_at'] );
		if ( false === $expires_at ) {
			return false;
		}

		$now               = time();
		$time_until_expiry = $expires_at - $now;

		if ( $time_until_expiry <= 0 ) {
			return false;
		}

		// Check if within warning period
		return $time_until_expiry <= ( $days * DAY_IN_SECONDS );
	}

	public function is_license_active( $license_data = null ) {
		if ( null === $license_data ) {
			$license_data = $this->get_license_data();
		}

		if ( ! $license_data ) {
			return false;
		}

		// Check if license key status is active
		if ( ! isset( $license_data['license_key']['status'] ) || 'active' !== $license_data['license_key']['status'] ) {
			return false;
		}

		// Check if not expired
		return ! $this->is_license_expired( $license_data );
	}

	public function set_error( $error ) {
		$this->error = $error;
	}

	public function get_error() {
		return $this->error;
	}

	public function get_license_config() {
		$license_data = $this->get_license_data();

		if ( ! is_array( $license_data ) ) {
			$license_data = array();
		}

		return array(
			'instance'           => $license_data['instance'] ?? '',
			'license_key'        => $license_data['license_key'] ?? '',
			'key'                => $license_data['license_key']['key'] ?? '',
			'meta'               => $license_data['meta'] ?? array(),
			'is_active'          => $this->is_license_active( $license_data ),
			'is_expired'         => $this->is_license_expired( $license_data ),
			'is_about_to_expire' => $this->is_license_about_to_expire( 7, $license_data ),
		);
	}
}