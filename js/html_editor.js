// Copyright 2012 Google Inc.  All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License.  You may obtain a copy
// of the License at: http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software distrib-
// uted under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES
// OR CONDITIONS OF ANY KIND, either express or implied.  See the License for
// specific language governing permissions and limitations under the License.

/**
 * @fileoverview [MODULE: edit] A text area for editing HTML code.
 * @author kpy@google.com (Ka-Ping Yee)
 */
goog.provide('cm.HtmlEditor');

goog.require('cm.Editor');
goog.require('cm.Html');
goog.require('cm.ui');

/**
 * @param {Element} parentElem The parent element in which to create the editor.
 * @param {string} id The element ID for the editor.
 * @param {Object.<{preview_class: string}>} options Editor options:
 *     options.preview_class: a CSS class for the rendered HTML preview area
 *         (which will be applied in addition to the "cm-preview" class).
 * @extends cm.Editor
 * @constructor
 */
cm.HtmlEditor = function(parentElem, id, options) {
  cm.Editor.call(this);

  /**
   * @type Element
   * @private
   */
  this.textarea_ = null;

  /**
   * @type Element
   * @private
   */
  this.preview_ = null;

  /**
   * @type Element
   * @private
   */
  this.previewTriangle_ = null;

  /**
   * @type boolean
   * @private
   */
  this.previewShown_ = false;

  this.textarea_ = cm.ui.create('textarea', {'id': id});
  var previewLabel = cm.ui.create('div', {'class': 'cm-disclosure'},
      this.previewTriangle_ = cm.ui.create('span', {'class': 'cm-triangle'}),
      cm.ui.create('span', {'class': 'cm-label'}, 'Preview'));
  var previewClass = options && options.preview_class || '';
  this.preview_ = cm.ui.create('div', {'class': 'cm-preview ' + previewClass});
  cm.ui.append(parentElem, this.textarea_, previewLabel, this.preview_);

  // When the user clicks the "Preview" triangle, toggle the HTML preview.
  this.showPreview_(false);
  cm.events.listen(previewLabel, 'click', function() {
    this.showPreview_(!this.previewShown_);
  }, this);

  // When the user makes an edit in the UI, update the MVCObject property.
  cm.events.listen(
      this.textarea_, ['keyup', 'change', 'input', 'cut', 'paste'], function() {
    var value = new cm.Html(this.textarea_.value);
    this.setValid_(value);
    value.pasteInto(this.preview_);
  }, this);
};
goog.inherits(cm.HtmlEditor, cm.Editor);

/** @override */
cm.HtmlEditor.prototype.updateUi = function(value) {
  if (!value) {
    value = new cm.Html('');
  }
  this.textarea_.value = value.getUnsanitizedHtml();
  value.pasteInto(this.preview_);
};

/**
 * Shows or hides the rendered HTML preview.
 * @param {boolean} show True/false to show/hide the preview area.
 * @private
 */
cm.HtmlEditor.prototype.showPreview_ = function(show) {
  // These constants are used only in this function.
  var TRIANGLE_RIGHT = '\u25b6';
  var TRIANGLE_DOWN = '\u25bc';

  cm.ui.setText(this.previewTriangle_, show ? TRIANGLE_DOWN : TRIANGLE_RIGHT);
  this.preview_.style.display = show ? '' : 'none';
  this.previewShown_ = show;
};