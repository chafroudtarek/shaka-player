/*! @license
 * Shaka Player
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.provide('shaka.ui.LayoutManager');

goog.require('shaka.ui.Element');
goog.requireType('shaka.ui.Controls');

/**
 * @typedef {{
 *   background: string,
 *   height: string,
 *   width: string,
 *   opacity: number,
 *   borderRadius: string,
 *   padding: string,
 *   backdropFilter: string,
 *   boxShadow: string
 * }}
 */
shaka.ui.LayoutManager.ControlsStyle;

/**
 * @typedef {{
 *   base: string,
 *   buffered: string,
 *   played: string,
 *   hover: string
 * }}
 */
shaka.ui.LayoutManager.ProgressBarColors;

/**
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
    this.currentConfig_ = this.getDefaultConfig_();
  }

  /**
   * @return {!Object}
   * @private
   */
  getDefaultConfig_() {
    return {
      controls: {
        background: 'rgba(0, 0, 0, 0.7)',
        height: '48px',
        width: '100%',
        opacity: 1,
        borderRadius: '4px',
        padding: '0 16px',
        backdropFilter: 'none',
        boxShadow: 'none',
      },
      progressBar: {
        base: 'rgba(255, 255, 255, 0.3)',
        buffered: 'rgba(255, 255, 255, 0.5)',
        played: '#ffffff',
        hover: 'rgba(255, 255, 255, 0.7)',
      },
    };
  }

  /**
   * Apply custom layout configuration
   * @param {!Object} config
   * @export
   */
  applyConfig(config) {
    this.currentConfig_ = this.mergeConfigs_(this.currentConfig_, config);
    this.updateLayout_();
  }

  /**
   * @param {!Object} baseConfig
   * @param {!Object} newConfig
   * @return {!Object}
   * @private
   */
  mergeConfigs_(baseConfig, newConfig) {
    const merged = Object.assign({}, baseConfig);

    for (const key in newConfig) {
      if (typeof newConfig[key] === 'object' && newConfig[key] !== null) {
        merged[key] = this.mergeConfigs_(baseConfig[key] || {}, newConfig[key]);
      } else {
        merged[key] = newConfig[key];
      }
    }

    return merged;
  }

  /**
   * @private
   */
  updateLayout_() {
    const container = this.controls.getControlsContainer();
    if (!container) {
      return;
    }

    /** @type {!Object} */
    const config = this.currentConfig_;
    const controls = config['controls'];
    const progressBar = config['progressBar'];

    // Apply container styles
    container.style.background = controls['background'];
    container.style.height = controls['height'];
    container.style.width = controls['width'];
    container.style.borderRadius = controls['borderRadius'];
    container.style.opacity = controls['opacity'];
    container.style.padding = controls['padding'];
    container.style.backdropFilter = controls['backdropFilter'];
    container.style.boxShadow = controls['boxShadow'];

    // Position controls
    container.classList.add('shaka-controls-container');
    container.classList.add('shaka-bottom-controls');
    container.style.bottom = '0';
    container.style.top = 'auto';

    // Apply progress bar colors
    const seekBar = container.querySelector('.shaka-seek-bar');
    if (seekBar) {
      // Style the range container (background track)
      const rangeContainer = seekBar.closest('.shaka-range-container');
      if (rangeContainer) {
        rangeContainer.style.background = progressBar['base'];
      }

      // Style the buffered progress
      const buffered = container.querySelector('.shaka-buffered');
      if (buffered) {
        buffered.style.background = progressBar['buffered'];
      }

      // Style the played progress
      const played = container.querySelector('.shaka-played');
      if (played) {
        played.style.background = progressBar['played'];
      }

      // Add hover styles
      const style = document.createElement('style');
      style.textContent = `
        .shaka-seek-bar:hover::-webkit-slider-thumb {
          background: ${progressBar['hover']} !important;
        }
        .shaka-seek-bar:hover::-moz-range-thumb {
          background: ${progressBar['hover']} !important;
        }
        .shaka-seek-bar:hover::-ms-thumb {
          background: ${progressBar['hover']} !important;
        }
      `;
      document.head.appendChild(style);
    }
  }
};
