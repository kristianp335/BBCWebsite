# BBC-Inspired Liferay Fragments and Client Extensions

## Deployment Package Contents

This package contains BBC-inspired Liferay fragments and client extensions ready for deployment to your Liferay instance.

### Package Structure

#### Individual Fragment Packages
- `bbc-header-fragment.zip` - Site header with navigation and search
- `bbc-footer-fragment.zip` - Site footer with links and social media
- `bbc-hero-banner-fragment.zip` - Featured content banner with background images
- `bbc-news-card-fragment.zip` - News article cards with images and metadata
- `bbc-video-player-fragment.zip` - Video player with custom controls
- `bbc-podcast-card-fragment.zip` - Podcast episode cards with audio controls
- `bbc-live-content-fragment.zip` - Live content updates with real-time features
- `bbc-navigation-menu-fragment.zip` - Section navigation with dropdowns
- `bbc-section-header-fragment.zip` - Page headers with breadcrumbs
- `bbc-sidebar-content-fragment.zip` - Configurable sidebar content

#### Client Extension Packages
- `bbc-global-scripts-client-extension.zip` - Shared JavaScript functionality
- `bbc-main-styles-client-extension.zip` - Global CSS styles and BBC design tokens

#### Comprehensive Packages
- `all-bbc-fragments.zip` - All 10 fragments in one package
- `all-bbc-client-extensions.zip` - Both client extensions in one package

## Deployment Instructions

### Prerequisites
- Liferay 7.4+ instance
- Admin access to Liferay Control Panel
- Fragment and Client Extension deployment permissions

### Step 1: Deploy Client Extensions First
Client extensions provide global styles and scripts that fragments depend on.

1. Log into Liferay Control Panel
2. Navigate to **Apps** → **App Manager**
3. Click **Upload** 
4. Upload `bbc-global-scripts-client-extension.zip`
5. Upload `bbc-main-styles-client-extension.zip`
6. Wait for deployment to complete

### Step 2: Deploy Fragments
You can deploy fragments individually or all at once.

#### Option A: Deploy All Fragments at Once
1. Navigate to **Site Builder** → **Page Fragments**
2. Click **Import**
3. Upload `all-bbc-fragments.zip`
4. Click **Import**

#### Option B: Deploy Individual Fragments
1. Navigate to **Site Builder** → **Page Fragments**
2. Click **Import**
3. Upload each fragment zip file individually
4. Click **Import** for each

### Step 3: Fragment Configuration

Each fragment includes editable content areas using `data-lfr-editable-type` attributes:

#### Editable Elements
- **Text Content**: Headlines, descriptions, categories
- **Images**: Background images, article images, thumbnails
- **Links**: Navigation URLs, article links
- **Rich Text**: Formatted descriptions and content

#### Configuration Options
Available through the fragment configuration panel:
- Layout variants (size, position, style)
- Display options (show/hide elements)
- Color schemes and styling
- Behavioral settings

### Step 4: Using Fragments in Pages

1. Create or edit a page
2. Add fragments from the **BBC Fragments** collection
3. Configure each fragment using the configuration panel
4. Edit content directly by clicking on editable areas
5. Publish the page

## Fragment Details

### Layout Components
- **BBC Header**: Logo, navigation menu, search functionality
- **BBC Footer**: Links, social media, copyright information
- **BBC Navigation Menu**: Section navigation with mobile support

### Content Components
- **BBC News Card**: Article display with lazy loading images
- **BBC Hero Banner**: Featured content with background images
- **BBC Video Player**: Full-featured video player with analytics
- **BBC Podcast Card**: Audio content with playback controls
- **BBC Live Content**: Real-time content updates
- **BBC Section Header**: Page headers with action buttons
- **BBC Sidebar Content**: Related content and widgets

### Global Resources
- **BBC Global Scripts**: Shared JavaScript utilities and analytics
- **BBC Main Styles**: CSS design system with BBC styling

## Technical Features

### Responsive Design
All fragments are fully responsive with mobile-first design approach.

### Accessibility
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

### Performance
- Lazy loading for images
- Optimized CSS and JavaScript
- Progressive enhancement
- Analytics integration

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- IE11+ compatibility
- Mobile browser support

## Customization

### Styling
Fragments use CSS custom properties for easy theming:
- `--bbc-red`: Primary brand color
- `--bbc-blue`: Secondary color
- `--bbc-grey-*`: Grayscale palette
- `--bbc-spacing-*`: Consistent spacing scale

### Configuration
Each fragment includes extensive configuration options accessible through Liferay's fragment configuration panel.

### Content Management
All text and images are editable directly in the page editor using Liferay's inline editing capabilities.

## Support

For technical support or customization requests, refer to your Liferay documentation or contact your system administrator.

## Version Information

- **Version**: 1.0.0
- **Compatible with**: Liferay 7.4+
- **Last Updated**: July 1, 2025
- **Package Type**: Production Ready

## License

These fragments are designed to be compatible with BBC design patterns while being independent implementations suitable for Liferay deployment.