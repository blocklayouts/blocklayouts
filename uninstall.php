<?php

namespace Blocklayouts;

defined( 'WP_UNINSTALL_PLUGIN' ) || exit;

// delete_option( 'blocklayouts-config' );
delete_option( 'blocklayouts_license_data' );