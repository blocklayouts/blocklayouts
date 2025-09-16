<?php
namespace Blocklayouts;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Schedule events.
 */

class Blocklayouts_Cron {

	private string $event_name;

	public function __construct() {
		$this->event_name = 'blocklayouts_validate_license';
	}

	public function init() {
		add_action( 'init', array( $this, 'schedule_event' ) );
		add_action( $this->event_name, array( $this, 'validate' ) );
	}

	public function schedule_event() {
		if ( ! wp_next_scheduled( $this->event_name ) ) {
			wp_schedule_event( time(), 'daily', $this->event_name );
		}
	}

	public function clear_scheduled_event() {
		if ( wp_next_scheduled( $this->event_name ) ) {
			wp_clear_scheduled_hook( $this->event_name );
		}
	}

	public function validate() {
		$license      = License::get_instance();
		$license_data = $license->get_license_data();

		if ( ! is_array( $license_data ) || empty( $license_data['license_key']['key'] || empty( $license_data['instance']['id'] ) ) ) {
			return;
		}
		$args = array(
			'license_key' => $license_data['license_key']['key'],
			'instance_id' => $license_data['instance']['id'],
		);

		$response = Blocklayouts_Api::get_instance()->validate_license( $args );

		if ( is_wp_error( $response ) ) {
			return;
		}

		if ( isset( $response['valid'] ) && ! $response['valid'] ) {
			$license->remove_license_data();
		} elseif ( isset( $response['license_key'] ) && isset( $response['valid'] ) && $response['valid'] ) {
			$license->update_license_key( $response['license_key'] );
		}
	}
}
