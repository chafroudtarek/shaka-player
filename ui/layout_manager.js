/*! @license
 * Shaka Player
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.provide('shaka.ui.LayoutManager');

goog.requireType('shaka.ui.Controls');
goog.require('shaka.ui.Element');
goog.require('shaka.log');
goog.require('goog.asserts');

/**
 * @typedef {{
 *   playerName: string,
 *   controlPanelElements: !Array<string>,
 *   addSeekBar: boolean,
 *   overflowMenuButtons: !Array<string>,
 *   confirmBeforeAutoResume: boolean,
 *   enableAirPlay: boolean,
 *   enableAutoResumeLocal: boolean,
 *   enableChromecast: boolean,
 *   enableChapters: boolean,
 *   addBigPlayButton: boolean,
 *   enableDoubleTapSkip: boolean,
 *   enableKeyboardShortcuts: boolean,
 *   enableLockControls: boolean,
 *   enablePiP: boolean,
 *   enableReportBug: boolean,
 *   enableSaveOffline: boolean,
 *   hideControlsOnPause: boolean,
 *   playbackRates: !Array<string>,
 *   primaryColor: string,
 *   showCaptionsControl: boolean,
 *   showFullScreen: boolean,
 *   showPlayPauseBtn: boolean,
 *   showProgressBar: boolean,
 *   showQualityControl: boolean,
 *   showReplayAtEnd: boolean,
 *   showScrubbingPreview: boolean,
 *   showSpeedControl: boolean,
 *   showTimeText: boolean,
 *   skipDuration: number,
 *   conserveVolumeAcrossSession: boolean,
 *   conserveSpeedAcrossSession: boolean,
 *   conserveQualityAcrossSession: boolean,
 *   conserveSelectedCaptionLanguage: boolean,
 *   initialPlayButtonShape: string,
 *   initialDurationPosition: string,
 *   buttonShape: string,
 *   seekBarColors: {
 *     base: string,
 *     buffered: string,
 *     played: string,
 *     adBreaks: string
 *   },
 *   enableTooltips: boolean,
 *   collapseInSettings: !Array<string>
 * }}
 *
 * @description
 * Configuration options for the LayoutManager.
 *
 * @property {string} playerName
 *   The name of the player instance.
 * @property {!Array<string>} controlPanelElements
 *   List of UI elements to display in the control panel.
 * @property {boolean} addSeekBar
 *   Whether to add a seek bar to the control panel.
 * @property {!Array<string>} overflowMenuButtons
 *   List of buttons to display in the overflow menu.
 * @property {boolean} confirmBeforeAutoResume
 *   Whether to confirm before auto-resuming playback.
 * @property {boolean} enableAirPlay
 *   Whether to enable AirPlay support.
 * @property {boolean} enableAutoResumeLocal
 *   Whether to enable local auto-resume.
 * @property {!Array<string>} playbackRates
 *   List of available playback rates.
 * @property {string} primaryColor
 *   Primary color for UI elements.
 * @property {string} initialPlayButtonShape
 *   Shape of the initial play button ('Circle' or 'Square').
 * @property {string} initialDurationPosition
 *   Position of the duration display.
 * @property {string} buttonShape
 *   Shape of the play button ('Circle' or 'Square').
 * @property {{
*   base: string,
*   buffered: string,
*   played: string,
*   adBreaks: string
* }} seekBarColors Colors for the seek bar.
 * @property {boolean} enableTooltips
 *   Whether to enable tooltips.
 * @property {!Array<string>} collapseInSettings
 *   List of settings to collapse in the settings menu.
 */
shaka.ui.LayoutManager.Options;

/**
 * A UI component that manages the layout and configuration of the video player.
 * @extends {shaka.ui.Element}
 * @final
 * @export
 */
shaka.ui.LayoutManager = class extends shaka.ui.Element {
  /**
   * @param {!HTMLElement} parent
   * @param {!shaka.ui.Controls} controls
   */
  constructor(parent, controls) {
    super(parent, controls);

    /** @private {!Object} */
    this.currentConfig_ = {};

    /** @private {!shaka.ui.Controls} */
    this.controls_ = controls;
  }

  /**
   * Gets the controls container element.
   * @return {!HTMLElement}
   * @private
   */
  getControlsContainer_() {
    goog.asserts.assert(this.controls_, 'Controls must be initialized');
    return /** @type {!HTMLElement} */ (this.controls_.getControlsContainer());
  }

  /**
   * Applies the provided configuration to the player layout.
   * @param {!shaka.ui.LayoutManager.Options} config
   * @export
   */
  applyConfig(config) {
    this.currentConfig_ = Object.assign({}, this.currentConfig_, config);

    // Get the controls container
    const container = this.getControlsContainer_();
    if (!container) {
      return;
    }

    // Apply custom styles first
    this.applyCustomStyles_(config);

    // Handle visibility of UI elements based on controlPanelElements
    if (config.controlPanelElements) {
      shaka.log.debug('Applying control panel elements config');

      // Define the control elements we want to manage
      const controlSelectors = [
        '.shaka-play-button',
        '.shaka-small-play-button',
        '.shaka-volume-container',
        '.shaka-time-container',
        '.shaka-current-time',
        '.shaka-fullscreen-button',
        '.shaka-overflow-menu-button',
        '.shaka-quality-button',
        '.shaka-captions-button',
        '.shaka-playback-rate-button',
        '.shaka-rewind-button',
        '.shaka-fast-forward-button',
        '.shaka-mute-button',
        '.shaka-spacer',
      ];

      // First hide all control elements
      for (let i = 0; i < controlSelectors.length; i++) {
        const selector = controlSelectors[i];
        const elements = container.querySelectorAll(selector);
        for (let j = 0; j < elements.length; j++) {
          const element = elements[j];
          shaka.log.debug('Hiding control:', selector);
          element.style.display = 'none';
        }
      }

      for (let i = 0; i < config.controlPanelElements.length; i++) {
        const elementName = config.controlPanelElements[i];
        let selector;
        let shouldShow = true;

        switch (elementName) {
          case 'play_pause':
            selector = ['.shaka-play-button', '.shaka-small-play-button'];
            shouldShow = config.showPlayPauseBtn !== false;
            break;
          case 'time_and_duration':
            selector = ['.shaka-time-container', '.shaka-current-time'];
            shouldShow = config.showTimeText !== false;
            break;
          case 'volume':
            selector = '.shaka-volume-container';
            break;
          case 'fullscreen':
            selector = '.shaka-fullscreen-button';
            shouldShow = config.showFullScreen !== false;
            break;
          case 'overflow_menu':
            selector = '.shaka-overflow-menu-button';
            break;
          case 'quality':
            selector = '.shaka-quality-button';
            shouldShow = config.showQualityControl !== false;
            break;
          case 'captions':
            selector = '.shaka-captions-button';
            break;
          case 'playback_rate':
            selector = '.shaka-playback-rate-button';
            shouldShow = config.showSpeedControl !== false;
            break;
          case 'rewind':
            selector = '.shaka-rewind-button';
            break;
          case 'fast_forward':
            selector = '.shaka-fast-forward-button';
            break;
          case 'mute':
            selector = '.shaka-mute-button';
            break;
          case 'spacer':
            selector = '.shaka-spacer';
            break;
        }

        if (selector && shouldShow) {
          if (Array.isArray(selector)) {
            for (let i = 0; i < selector.length; i++) {
              const sel = selector[i];
              const elements = container.querySelectorAll(sel);
              for (let j = 0; j < elements.length; j++) {
                const element = elements[j];
                if (element) {
                  shaka.log.debug('Showing element:', sel);
                  element.style.display = '';
                }
              }
            }
          } else {
            const element = container.querySelector(selector);
            if (element) {
              shaka.log.debug('Showing element:', selector);
              element.style.display = '';
            }
          }
        }
      }
    }

    // Update control panel with individual settings
    this.updateControlPanel_(config);

    // Handle settings menu items
    if ('collapseInSettings' in config) {
      shaka.log.debug('Handling settings menu items');

      // Get all settings menu buttons
      const settingsMenu = container.querySelector('.shaka-overflow-menu');
      if (settingsMenu) {
        // Hide all settings buttons first
        const buttons = settingsMenu.querySelectorAll(
            '.shaka-overflow-button, ' +
            '.shaka-pip-button, ' +
            '.shaka-save.video-frame-button',
        );
        for (let i = 0; i < buttons.length; i++) {
          const button = buttons[i];
          shaka.log.debug('Hiding settings button:', button.className);
          button.style.display = 'none';
        }

        // Show only the specified items
        for (let i = 0; i < config.collapseInSettings.length; i++) {
          const item = config.collapseInSettings[i];
          let selector;
          switch (item) {
            case 'quality':
              selector = '.shaka-resolution-button';
              break;
            case 'playback_rate':
              selector = '.shaka-playbackrate-button';
              break;
            case 'captions':
              selector = '.shaka-caption-button';
              break;
            case 'language':
              selector = '.shaka-language-button';
              break;
            case 'picture_in_picture':
              selector = '.shaka-pip-button';
              break;
            case 'video_frame':
              selector = '.shaka-save.video-frame-button';
              break;
          }

          if (selector) {
            const button = settingsMenu.querySelector(selector);
            if (button) {
              shaka.log.debug('Showing settings button:', selector);
              button.style.display = '';
            }
          }
        }
      }
    }
  }

  /**
   * Applies custom styles based on the configuration.
   * @param {!shaka.ui.LayoutManager.Options} config
   * @private
   */
  applyCustomStyles_(config) {
    const container = this.getControlsContainer_();

    // Apply primary color to controls container
    if (config.primaryColor) {
      // Get the controls and update its configuration
      const controls = this.controls_;
      const uiConfig = controls.getConfig();

      // Update the seek bar colors in the UI configuration
      uiConfig.seekBarColors = {
        base: '#ffffff',  // white
        buffered: 'rgba(255, 255, 255, 0.54)',  // semi-transparent white
        played: config.primaryColor, // use the primary color
        adBreaks: 'rgba(255, 255, 255, 0.7)',
      };

      // Apply the updated configuration
      controls.configure(uiConfig);

      // Also set the CSS variable for immediate effect
      const seekBar = container.querySelector('.shaka-seek-bar');
      if (seekBar) {
        seekBar.style.setProperty('--shaka-seek-bar-played-color',
            config.primaryColor);
      }
    }
  }

  /**
   * Convert hex color to RGB values
   * @param {string} hex
   * @return {?{r: number, g: number, b: number}}
   * @private
   */
  hexToRGB_(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : null;
  }

  /**
   * Updates the control panel based on configuration.
   * @param {!shaka.ui.LayoutManager.Options} config
   * @private
   */
  updateControlPanel_(config) {
    goog.asserts.assert(this.controls_, 'Controls must be initialized');
    const controls = this.controls_;


    if ('showPlayPauseBtn' in config && config.showPlayPauseBtn !== undefined) {
      this.toggleControl_('.shaka-play-button', config.showPlayPauseBtn);
    }

    if ('showTimeText' in config && config.showTimeText !== undefined) {
      this.toggleControl_('.shaka-time-container', config.showTimeText);
      this.toggleControl_('.shaka-current-time', config.showTimeText);
    }

    if ('showFullScreen' in config && config.showFullScreen !== undefined) {
      this.toggleControl_('.shaka-fullscreen-button', config.showFullScreen);
    }

    // Update skip duration
    if ('skipDuration' in config && config.skipDuration &&
        typeof controls.setSkipDuration === 'function') {
      controls.setSkipDuration(config.skipDuration);
    }

    // Update playback rates
    if ('playbackRates' in config && 'showSpeedControl' in config &&
        config.playbackRates && config.showSpeedControl &&
        typeof controls.setPlaybackRates === 'function') {
      controls.setPlaybackRates(config.playbackRates);
    }
  }

  /**
   * Toggles the visibility of a control element.
   * @param {string} selector
   * @param {boolean} show
   * @private
   */
  toggleControl_(selector, show) {
    const element = this.getControlsContainer_()
        .querySelector(selector);
    if (element) {
      element.style.display = show ? '' : 'none';
    }
  }

  /**
   * Updates the settings menu with collapsed items.
   * @param {!Array<string>} collapsedItems
   * @private
   */
  updateSettingsMenu_(collapsedItems) {
    goog.asserts.assert(this.controls_, 'Controls must be initialized');
    const controls = this.controls_;
    if (typeof controls.setSettingsMenuItems === 'function') {
      controls.setSettingsMenuItems(collapsedItems);
    }
  }

  /**
   * Gets the current configuration.
   * @return {!Object}
   * @export
   */
  getCurrentConfig() {
    return this.currentConfig_;
  }
};
