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
 *   showBackward: boolean,
 *   showCaptionsControl: boolean,
 *   showForward: boolean,
 *   showFullScreen: boolean,
 *   showPlayPauseBtn: boolean,
 *   showProgressBar: boolean,
 *   showQualityControl: boolean,
 *   showReplayAtEnd: boolean,
 *   showScrubbingPreview: boolean,
 *   showSpeedControl: boolean,
 *   showTimeText: boolean,
 *   showVolume: boolean,
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
 *     played: string
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
 * @property {{base: string, buffered: string, played: string}} seekBarColors
 *   Colors for the seek bar.
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
        '.shaka-volume-container',
        '.shaka-time-container',
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
        const element = container.querySelector(selector);
        if (element) {
          shaka.log.debug('Hiding control:', selector);
          element.style.display = 'none';
        }
      }

      // Then show only the ones in controlPanelElements
      for (let i = 0; i < config.controlPanelElements.length; i++) {
        const elementName = config.controlPanelElements[i];
        let selector;
        shaka.log.debug('Showing control:', elementName);

        switch (elementName) {
          case 'play_pause':
            selector = '.shaka-play-button';
            break;
          case 'volume':
            selector = '.shaka-volume-container';
            break;
          case 'time_and_duration':
            selector = '.shaka-time-container';
            break;
          case 'fullscreen':
            selector = '.shaka-fullscreen-button';
            break;
          case 'overflow_menu':
            selector = '.shaka-overflow-menu-button';
            break;
          case 'quality':
            selector = '.shaka-quality-button';
            break;
          case 'captions':
            selector = '.shaka-captions-button';
            break;
          case 'playback_rate':
            selector = '.shaka-playback-rate-button';
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

        if (selector) {
          const element = container.querySelector(selector);
          if (element) {
            shaka.log.debug('Showing element:', selector);
            element.style.display = '';
          }
        }
      }
    }

    // Update control panel with individual settings
    this.updateControlPanel_(config);

    // Handle settings menu items
    if ('collapseInSettings' in config) {
      // Hide all settings menu items first
      const settingsButtons = container
          .querySelectorAll('.shaka-settings-menu button');
      for (let i = 0; i < settingsButtons.length; i++) {
        settingsButtons[i].style.display = 'none';
      }

      // Show only the specified items
      for (let i = 0; i < config.collapseInSettings.length; i++) {
        const item = config.collapseInSettings[i];
        let selector;
        switch (item) {
          case 'quality':
            selector = '.shaka-quality-button';
            break;
          case 'playback_rate':
            selector = '.shaka-playback-rate-button';
            break;
          case 'captions':
            selector = '.shaka-captions-button';
            break;
        }
        if (selector) {
          const element = container.querySelector(selector);
          if (element) {
            element.style.display = '';
          }
        }
      }

      // Update settings menu
      this.updateSettingsMenu_(config.collapseInSettings);
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
    if ('primaryColor' in config && config.primaryColor) {
      container.style.setProperty('--shaka-primary-color', config.primaryColor);

      // Also apply to specific elements
      const playButton = container.querySelector('.shaka-play-button');
      if (playButton) {
        playButton.style.backgroundColor = config.primaryColor;
      }

      const progressBar = container.querySelector('.shaka-progress-bar');
      if (progressBar) {
        progressBar.style.backgroundColor = config.primaryColor;
      }
    }

    // Apply button shape
    if ('buttonShape' in config && config.buttonShape) {
      const buttons = container.querySelectorAll('.shaka-play-button');
      for (let i = 0; i < buttons.length; i++) {
        const button = /** @type {!HTMLElement} */ (buttons[i]);
        button.style.borderRadius =
            config.buttonShape === 'Circle' ? '100%' : '10%';
      }
    }

    // Apply seek bar colors
    if ('seekBarColors' in config && config.seekBarColors) {
      const seekBar = /** @type {!HTMLElement} */
          (container.querySelector('.shaka-seek-bar'));
      if (seekBar) {
        if (config.seekBarColors.base) {
          seekBar.style.setProperty('--shaka-seek-bar-base-color',
              config.seekBarColors.base);
        }
        if (config.seekBarColors.buffered) {
          seekBar.style.setProperty('--shaka-seek-bar-buffered-color',
              config.seekBarColors.buffered);
        }
        if (config.seekBarColors.played) {
          seekBar.style.setProperty('--shaka-seek-bar-played-color',
              config.seekBarColors.played);
        }
      }
    }

    // Apply progress bar visibility
    if ('showProgressBar' in config) {
      const progressBar = container.querySelector('.shaka-seek-bar');
      if (progressBar) {
        progressBar.style.display = config.showProgressBar ? '' : 'none';
      }
    }
  }

  /**
   * Updates the control panel based on configuration.
   * @param {!shaka.ui.LayoutManager.Options} config
   * @private
   */
  updateControlPanel_(config) {
    goog.asserts.assert(this.controls_, 'Controls must be initialized');
    const controls = this.controls_;

    // Update control panel elements visibility
    if ('showBackward' in config && config.showBackward !== undefined) {
      this.toggleControl_('.shaka-rewind-button', config.showBackward);
    }

    if ('showForward' in config && config.showForward !== undefined) {
      this.toggleControl_('.shaka-fast-forward-button', config.showForward);
    }

    if ('showPlayPauseBtn' in config && config.showPlayPauseBtn !== undefined) {
      this.toggleControl_('.shaka-play-button', config.showPlayPauseBtn);
    }

    if ('showTimeText' in config && config.showTimeText !== undefined) {
      this.toggleControl_('.shaka-time-container', config.showTimeText);
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
