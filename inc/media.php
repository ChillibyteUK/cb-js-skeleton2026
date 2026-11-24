<?php
/**
 * Media — convert JPEG/PNG uploads to WebP on upload.
 *
 * The original is converted straight after it lands in uploads/ and before
 * WordPress creates the attachment, so the attachment, its generated
 * sub-sizes and every URL handed to the editor are all WebP. If WebP output
 * isn't smaller than the source (tiny flat PNGs, say) the original is kept.
 *
 * Gated on the server actually being able to write WebP: if neither Imagick
 * (with its WebP delegate) nor GD (built with WebP) is available, none of
 * this runs, uploads behave exactly as stock WordPress, and an admin notice
 * on the Media Library says why.
 *
 * @package cb-js-skeleton2026
 */

defined( 'ABSPATH' ) || exit;

/**
 * Longest edge, in pixels, an upload is scaled down to.
 *
 * @var int
 */
define( 'CB_JS_SKELETON_MAX_UPLOAD_EDGE', 2560 );

/**
 * Can this server write WebP images?
 *
 * Asks WordPress's own image-editor layer, which checks the PHP extension
 * (Imagick or GD) and its WebP support in one go. Result is cached for the
 * request. Return false from the `cb_js_skeleton_webp_enabled` filter to
 * switch conversion off for a project.
 *
 * @return bool
 */
function cb_js_skeleton_webp_supported() {
	static $supported = null;

	if ( null === $supported ) {
		$supported = (bool) apply_filters( 'cb_js_skeleton_webp_enabled', true )
			&& wp_image_editor_supports(
				array(
					'mime_type' => 'image/webp',
					'methods'   => array( 'resize', 'save' ),
				)
			);
	}

	return $supported;
}

/**
 * Tell admins on the Media Library when conversion can't run.
 *
 * @return void
 */
function cb_js_skeleton_webp_unsupported_notice() {
	$screen = get_current_screen();
	if ( ! $screen || 'upload' !== $screen->id || ! current_user_can( 'upload_files' ) ) {
		return;
	}
	if ( ! apply_filters( 'cb_js_skeleton_webp_enabled', true ) || cb_js_skeleton_webp_supported() ) {
		return;
	}
	printf(
		'<div class="notice notice-warning"><p>%s</p></div>',
		esc_html__( 'Automatic WebP conversion is off: this server\'s PHP has no WebP support (it needs Imagick with WebP, or GD built with WebP). Uploads are stored as they are.', 'cb-js-skeleton2026' )
	);
}
add_action( 'admin_notices', 'cb_js_skeleton_webp_unsupported_notice' );

/**
 * WebP quality for the full-size image and every generated sub-size.
 *
 * @return int
 */
function cb_js_skeleton_webp_quality() {
	return (int) apply_filters( 'cb_js_skeleton_webp_quality', 80 );
}

/**
 * Convert one image file to WebP, scaling down past the max edge.
 *
 * @param string $source Absolute path to a JPEG or PNG.
 * @param string $dest   Absolute path for the .webp result.
 * @return bool True if $dest was written and is smaller than $source.
 */
function cb_js_skeleton_convert_to_webp( $source, $dest ) {
	$editor = wp_get_image_editor( $source );
	if ( is_wp_error( $editor ) ) {
		return false;
	}

	$size = $editor->get_size();
	$max  = CB_JS_SKELETON_MAX_UPLOAD_EDGE;
	if ( $size && max( $size['width'], $size['height'] ) > $max ) {
		$editor->resize( $max, $max, false );
	}

	$editor->set_quality( cb_js_skeleton_webp_quality() );
	$saved = $editor->save( $dest, 'image/webp' );

	if ( is_wp_error( $saved ) || ! file_exists( $dest ) ) {
		return false;
	}
	if ( filesize( $dest ) >= filesize( $source ) ) {
		wp_delete_file( $dest );
		return false;
	}
	return true;
}

/**
 * Swap a freshly uploaded JPEG/PNG for its WebP version.
 *
 * @param array $upload Result of wp_handle_upload(): file, url, type.
 * @return array
 */
function cb_js_skeleton_webp_on_upload( $upload ) {
	if ( empty( $upload['file'] ) || ! in_array( $upload['type'], array( 'image/jpeg', 'image/png' ), true ) ) {
		return $upload;
	}
	if ( ! cb_js_skeleton_webp_supported() ) {
		return $upload;
	}

	$dest = preg_replace( '/\.(jpe?g|png)$/i', '.webp', $upload['file'] );
	if ( $dest === $upload['file'] ) {
		return $upload;
	}
	$dest = wp_unique_filename( dirname( $dest ), basename( $dest ) );
	$dest = dirname( $upload['file'] ) . '/' . $dest;

	if ( ! cb_js_skeleton_convert_to_webp( $upload['file'], $dest ) ) {
		return $upload;
	}

	wp_delete_file( $upload['file'] );

	return array(
		'file' => $dest,
		'url'  => dirname( $upload['url'] ) . '/' . basename( $dest ),
		'type' => 'image/webp',
	);
}
add_filter( 'wp_handle_upload', 'cb_js_skeleton_webp_on_upload' );

/**
 * Generated sub-sizes use the same quality as the full-size conversion.
 *
 * @param int    $quality   Default quality.
 * @param string $mime_type Output mime type.
 * @return int
 */
function cb_js_skeleton_editor_quality( $quality, $mime_type ) {
	return 'image/webp' === $mime_type ? cb_js_skeleton_webp_quality() : $quality;
}
add_filter( 'wp_editor_set_quality', 'cb_js_skeleton_editor_quality', 10, 2 );

/**
 * Uploads are already capped at the max edge when conversion runs, so
 * WordPress's own "-scaled" copy is redundant. Without WebP support nothing
 * caps them, so leave WordPress's default in place.
 *
 * @param int|false $threshold Default big-image threshold.
 * @return int|false
 */
function cb_js_skeleton_big_image_threshold( $threshold ) {
	return cb_js_skeleton_webp_supported() ? false : $threshold;
}
add_filter( 'big_image_size_threshold', 'cb_js_skeleton_big_image_threshold' );
