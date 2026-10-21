<?php
/**
 * Smooth scroll vendors — GSAP, ScrollTrigger and Lenis, loaded from
 * js/vendor/ ahead of theme.min.js (which wires them up in
 * src/js/lenis-init.js and guards against any of them being absent).
 *
 * Priority 5 so these enqueue before cb_js_skeleton_enqueue_scripts() — the
 * footer script queue prints in enqueue order, and ScrollTrigger extends
 * window.gsap, so gsap must execute first.
 *
 * @package cb-js-skeleton2026
 */

defined( 'ABSPATH' ) || exit;

/**
 * Enqueue GSAP/ScrollTrigger/Lenis.
 *
 * @return void
 */
function cb_js_skeleton_enqueue_smooth_scroll() {
	// gsap.min.js 3.12.5 cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js
	cb_js_skeleton_enqueue_vendor( 'gsap', 'gsap.min.js' );
	// ScrollTrigger.min.js 3.12.5 cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js
	cb_js_skeleton_enqueue_vendor( 'gsap-scrolltrigger', 'ScrollTrigger.min.js', false, array( 'gsap' ) );
	// lenis.css / lenis.min.js 1.3.11 unpkg.com/lenis@1.3.11/dist/
	cb_js_skeleton_enqueue_vendor( 'lenis-style', 'lenis.css', true );
	cb_js_skeleton_enqueue_vendor( 'lenis', 'lenis.min.js' );
}
add_action( 'wp_enqueue_scripts', 'cb_js_skeleton_enqueue_smooth_scroll', 5 );
