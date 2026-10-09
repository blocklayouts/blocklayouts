<?php

namespace Blocklayouts;

defined( 'WP_UNINSTALL_PLUGIN' ) || exit;

delete_option( 'blocklayouts_license_data' );
delete_option( 'blocklayouts_settings' );

// Remove cached pattern-library transients created by the plugin.
global $wpdb;
$wpdb->query( // phpcs:ignore WordPress.DB.DirectDatabaseQuery
	"DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_blocklayouts_%' OR option_name LIKE '_transient_timeout_blocklayouts_%'"
);