=== Blocklayouts ===
Contributors:      blocklayouts, qarayahya
Tags:              gutenberg, blocks, patterns, block editor, custom blocks
Tested up to:      7.1
Requires at least: 6.5
Stable tag:        0.2.1
License:           GPL-2.0-or-later
License URI:       https://www.gnu.org/licenses/gpl-2.0.html

Custom blocks, enhanced core blocks, and pre-designed patterns to build WordPress sites faster.

== Description ==

[Blocklayouts](https://blocklayouts.com/) supercharges WordPress with custom Gutenberg blocks, enhanced core block functionality, and a growing library of professional pre-designed patterns for faster site building.

== Features ==

**Improve what WordPress already has, add what it doesn’t, make everything feel native.**

= Custom Blocks =

* **Icon Block** - Add beautiful, scalable icons with extensive icon library, custom SVG support, and advanced styling options
* **Marquee Block** - Create eye-catching scrolling text and content with customizable speed, direction, and hover effects
* **Table of Contents** - Automatically generate a navigable table of contents from headings in your content
* **Infinite Scroll** - Automatically load more posts as you scroll
* **Related Posts** - Display posts related to the current post based on categories, tags, or custom taxonomies
* **More blocks coming soon**: Slider, Content Toggle, and many more!

= Block Extensions & Enhancements =

* **Color Controls** - Enhanced color management with hover effects
* **Effects Controls** - Animation, transforms, and visual effects
* **Link Controls** - Add link functionality to core/group block
* **Icon Button** - Enable icon selection and positioning for core/button block
* **Masonry** - Transform gallery and group (grid) blocks into beautiful masonry layouts

= Pattern Library =

blocklayouts includes access to our [pattern library](https://blocklayouts.com/patterns) service that provides:

* **Free Patterns** - Access to a collection of free block patterns and page templates
* **Premium Patterns** - Exclusive premium patterns and templates for licensed users
* **Page Templates** - Complete page layouts for various use cases
* **Category Organization** - Patterns organized by industry and category
* **Regular Updates** - New patterns added regularly

== Why Choose Blocklayouts ==

**Built for WordPress Developers & Designers**

* **Native Integration** - Seamlessly integrates with Gutenberg editor, feeling like a natural part of WordPress
* **Performance Optimized** - Lightweight plugin that doesn't slow down your site or editor
* **Future Proof** - Built with modern WordPress standards and regularly updated for compatibility

**Professional Quality & Support**

* **Premium Patterns** - Access to exclusive, professionally designed patterns and templates
* **Regular Updates** - New features, blocks, and patterns added monthly
* **Expert Support** - Get help from WordPress professionals who understand your needs
* **Community Driven** - Features and improvements based on real user feedback

**Time-Saving Features**

* **Quick Pattern Insertion** - Find and insert patterns in seconds, not minutes
* **Block Extensions** - Enhance existing blocks without learning new interfaces

== Privacy ==

Blocklayouts doesn't track your visitors, set cookies, or collect personal data on the front end of your site.

The pattern library is a SaaS (software as a service) feature that fetches patterns and page templates from Blocklayouts servers. These requests are only made when a logged-in user opens the library in the editor, and they include your site URL. If you activate a license key, the key, your site URL and your site name are sent to activate it and to re-validate it once a day. No other personal or site data is collected or transmitted. See "External services" below for the full details.

By using Blocklayouts and accessing our pattern library, you agree to our [privacy policy](https://blocklayouts.com/privacy-policy/) and [terms of service](https://blocklayouts.com/terms-of-service/).

== External services ==

This plugin connects to the Blocklayouts pattern library service to provide block patterns, page templates, and their categories inside the editor, and to manage an optional premium license. Every custom block and block extension included in the plugin works fully without these requests; only the online pattern/template library and premium-license features rely on them.

**Blocklayouts Pattern Library API** (https://patterns.blocklayouts.com)

* What it is used for: fetching block patterns, page templates, and their categories for display in the editor's pattern library.
* When requests are sent: only when a logged-in user with editing permissions opens the Blocklayouts pattern library or browses its tabs and categories.
* What data is sent: your site URL (as the HTTP Referer header). No post content, user data, or other personal information is transmitted.
* Pattern preview images, and any images used in the patterns you insert, may be loaded from Blocklayouts servers. As with any image, your browser sends its IP address and user agent when loading them.

**Blocklayouts Licensing API** (https://patterns.blocklayouts.com)

* What it is used for: activating, validating, and deactivating an optional premium license that unlocks access to premium patterns and page templates.
* When requests are sent: only when an administrator activates or deactivates a license key, and periodically (via a scheduled task) to re-validate a license key you have entered. No requests are made if you never enter a license key.
* What data is sent: the license key you enter and your site URL and site name (used together as the license instance identifier).

These services are provided by Blocklayouts. By using them you agree to the Blocklayouts [terms of service](https://blocklayouts.com/terms-of-service/) and [privacy policy](https://blocklayouts.com/privacy-policy/).

== Screenshots ==

1. Browse our collection of free and premium block patterns to speed up your website building process.
2. Upgrade button blocks with icon integration for more engaging and professional-looking call-to-action elements.
3. Add stunning animations and visual effects to any block with our comprehensive effects controls.
4. Browse our extensive icon collection with search tools and organized categories for efficient icon selection.
5. Create and customize icon blocks with full control over size, color, styling, and positioning.

== Installation ==

1. In your WordPress admin, go to **Plugins** → **Add New Plugin**.
2. Search for **Blocklayouts** and click **Install Now**.
3. Click **Activate**.

To install manually, go to **Plugins** → **Add New Plugin** → **Upload Plugin**, choose the plugin zip file, click **Install Now**, then activate it.

After activation, open the block editor and click the Blocklayouts icon in the top toolbar to open the pattern library. Plugin settings are under **Settings** → **Blocklayouts**.

== Development ==

Source code and development tools are available at: https://github.com/blocklayouts/blocklayouts

== Frequently Asked Questions ==

= Is Blocklayouts free? =

Yes! Blocklayouts is completely free to download and use. You get access to all the custom blocks, block extensions, and free patterns. Premium patterns and templates are available for licensed users, but the core plugin functionality is free.

= Is Blocklayouts compatible with my theme? =

Yes! Blocklayouts is designed to work with any properly coded WordPress theme. The blocks & patterns inherit your theme's styling while adding their own functionality.

= Can I use Blocklayouts with page builders like Elementor? =

Blocklayouts is specifically designed for the Gutenberg block editor. While it may work with some page builders, we recommend using it with Gutenberg for the best experience.

= Do I need coding knowledge to use this plugin? =

Not at all! Blocklayouts is designed for users of all skill levels.

= Is there support available? =

For premium support options, please visit [our website](https://blocklayouts.com/support/).


== Changelog ==

= 0.2.1 - 2026-08-01 =

- Removed: Custom CSS block controls
- Fixed: Pattern preview thumbnail now displays at full width with auto height and centered

= 0.2.0 - 2026-08-01 =

- Changed: All custom blocks and block extensions are now free; the premium tier is now limited to the pattern library
- Removed: Self-hosted plugin updater
- Added: External services disclosure in the readme
- Fixed: Blank plugin dashboard screen
- Fixed: Empty category list in the pattern library modal

= 0.1.9 - 2025-12-29 =

- Added: Admin menu dashboard for centralized plugin management
- Added: Ability to activate or deactivate individual blocks
- Enhanced: Pattern library with improved UI
- Various minor fixes and improvements

= 0.1.8 - 2025-12-20 =

- Added: Table of Contents block
- Added: Masonry extension to core/gallery block
- Added: Masonry extension to core/group (grid) block
- Enhanced: Infinite Scroll block now supports two types (button and infinite)
- Fixed: Icon library styles

= 0.1.7 - 2025-11-05 =

- Added: Preference Settings
- Added: Infinite Scroll block (Beta)
- Added: Related Posts block
- Various minor fixes and improvements

= 0.1.6 - 2025-10-18 =

- Security: Prevented direct file access
- Improved: Fix the modal pattern library layout

= 0.1.5 - 2025-09-25 =

- Improved: Better compatibility with third-party plugins that add inline styles

= 0.1.4 - 2025-09-21 =

- Changed: Group link now uses stretched link instead of wrapper link to avoid nested links
- Improved: Pattern library functionality and user experience
- Fixed: Padding issues on the icon block
- Various minor fixes and improvements

= 0.1.3 - 2025-09-18 =

- Fix: "Link to current post" feature now working correctly in Query blocks

= 0.1.2 - 2025-09-16 =

- Added color controls for button icon extension

= 0.1.1 - 2025-09-06 =

- Fix: Added user permission checks for REST API endpoints
- Added 'edit_posts' requirement for accessing pattern library data

= 0.1.0 =

- Initial release