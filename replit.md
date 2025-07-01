# BBC-Inspired Fragment Components System

## Overview

This repository contains a comprehensive collection of BBC-inspired UI fragments and components designed for content management systems. The system provides modular, reusable components that mirror the BBC's visual design language and user experience patterns, including headers, footers, navigation menus, news cards, video players, and specialized content types like live feeds and podcasts.

## System Architecture

### Fragment-Based Architecture
The system is built around a fragment-based architecture where each component is self-contained with its own:
- Configuration schema (fragment.json)
- HTML template (index.html) using FreeMarker templating
- JavaScript functionality (main.js)
- Component-specific styling (embedded in templates)

### Client Extensions
Global functionality is provided through client extensions:
- **bbc-global-scripts**: Shared JavaScript utilities, analytics, and component initialization
- **bbc-main-styles**: Global CSS variables, base styles, and BBC design system tokens

## Key Components

### Content Display Components
1. **BBC News Card**: Article display with images, headlines, metadata, and lazy loading
2. **BBC Hero Banner**: Featured content banners with background images and overlay text
3. **BBC Video Player**: Full-featured video player with custom controls, captions, and analytics
4. **BBC Podcast Card**: Audio content cards with play controls and episode information
5. **BBC Live Content**: Real-time content updates with live indicators and notifications

### Navigation Components
6. **BBC Header**: Site header with logo, navigation, and search functionality
7. **BBC Footer**: Site footer with links, social media, and copyright information
8. **BBC Navigation Menu**: Section navigation with dropdowns and mobile support
9. **BBC Section Header**: Page headers with breadcrumbs and action buttons

### Layout Components
10. **BBC Sidebar Content**: Configurable sidebar for related content, trending stories, and widgets

## Data Flow

### Template Rendering
Components use FreeMarker templating engine for server-side rendering with:
- Configuration-driven content injection
- JSON-based data structures for complex content (navigation items, social links, etc.)
- Conditional rendering based on feature flags
- Default values and fallback content

### Client-Side Enhancement
JavaScript enhances components with:
- Progressive enhancement for interactivity
- Analytics tracking for user interactions
- Lazy loading for images and media
- Responsive behavior and mobile optimizations
- Real-time updates for live content

### Analytics Integration
All components include built-in analytics tracking:
- View tracking for component visibility
- Click tracking for user interactions
- Custom event tracking for media playback
- Category-based analytics organization

## External Dependencies

### Core Technologies
- **FreeMarker**: Template engine for server-side rendering
- **Vanilla JavaScript**: No framework dependencies for maximum compatibility
- **CSS Custom Properties**: Modern styling with fallback support
- **SVG Icons**: Scalable vector graphics for UI elements

### Media Support
- HTML5 video and audio elements
- Progressive image loading
- Responsive image techniques
- Media accessibility features (captions, ARIA labels)

### Browser APIs
- Intersection Observer for lazy loading
- Web Notifications API for live content alerts
- Local Storage for user preferences
- Fullscreen API for video player

## Deployment Strategy

### Fragment Deployment
Each fragment is deployable as an independent unit with:
- Self-contained configuration and assets
- Versioned component updates
- A/B testing capability through configuration
- Environment-specific defaults

### Client Extension Deployment
Global resources are deployed separately:
- Shared CSS and JavaScript bundles
- CDN-optimized asset delivery
- Cache-friendly versioning strategy
- Progressive enhancement approach

### Content Management Integration
Components integrate with CMS platforms through:
- JSON-based configuration schemas
- Template variable injection
- Dynamic content population
- Multi-language support readiness

## Changelog

- July 01, 2025. Initial setup
- July 01, 2025. Updated all fragments to proper Liferay structure:
  - Renamed fragment.json to configuration.json 
  - Created new fragment.json files with configurationPath, cssPath, htmlPath, jsPath structure
  - Added lfr-editable-id attributes to all text and image content for Liferay editing
  - Created index.css files for each fragment (separate CSS architecture)
  - Ensured all content elements are editable: headlines, descriptions, categories, images
- July 01, 2025. Moved all embedded styles from HTML to separate CSS files:
  - Extracted CSS from all fragment HTML files to index.css files
  - Removed all <style> tags from HTML templates
  - Maintained clean separation between structure (HTML) and styling (CSS)
- July 01, 2025. Created deployment packages:
  - Generated individual zip files for each fragment (10 fragments)
  - Generated individual zip files for each client extension (2 extensions)
  - Created comprehensive zip files (all fragments, all client extensions)
  - Added deployment README with detailed Liferay deployment instructions
- July 01, 2025. Fixed FreeMarker template errors by adding default values to all variables
- July 01, 2025. Cleaned up fragment configurations and templates:
  - Removed redundant configuration fields that are now handled by Liferay editable elements
  - Simplified HTML templates by removing unnecessary FreeMarker conditionals
  - Kept only styling/layout configuration options (card size, text position, show/hide features)
  - All content (text, images, links) now uses data-lfr-editable-type attributes for direct editing
  - Updated deployment packages with cleaned configurations
- July 01, 2025. Fixed Liferay configuration schema errors:
  - Corrected configuration.json files to use proper Liferay schema (only fieldSets structure)
  - Removed extraneous metadata fields (fragmentEntryKey, name, description, type, thumbnail)
  - Fixed "required key [fieldSets] not found" and "extraneous key" errors
  - Updated all deployment packages with corrected configurations

## User Preferences

Preferred communication style: Simple, everyday language.