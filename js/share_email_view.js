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
 * @author muzny@google.com (Grace Muzny)
 */
goog.provide('cm.ShareEmailView');

goog.require('cm.css');
goog.require('cm.events');
goog.require('cm.ui');
goog.require('goog.net.XhrIo');

/** @desc Heading of the dialog for inviting another user to collaborate. */
var MSG_INVITE_TITLE = goog.getMsg('Invite someone to collaborate');

/**
 * @desc Error message to show for a server error when trying to invite
 *     another user to collaborate (this is pretty rare).
 */
var MSG_EMAIL_ERROR = goog.getMsg(
    'Sorry, there was a problem inviting someone to collaborate on this map.');

/**
 * @desc Label for text box for a personal message to include when
 *     inviting another user to collaborate.
 */
var MSG_INVITE_MESSAGE = goog.getMsg('Message text');

/**
 * @desc Placeholder inside the text box for a personal message to include
 *     when inviting another user to collaborate.
 */
var MSG_INVITE_MESSAGE_PLACEHOLDER =
    goog.getMsg('Include a personal message...');

/** @desc Label for input field for the e-mail address of a user to invite. */
var MSG_EMAIL = goog.getMsg('E-mail address');

/** @desc Radio button label for granting view-only access. */
var MSG_VIEWER = goog.getMsg('Viewer');

/** @desc Radio button label for granting edit access. */
var MSG_EDITOR = goog.getMsg('Editor');

/** @desc Radio button label for granting full ownership access. */
var MSG_OWNER = goog.getMsg('Owner');

/** @desc Label for radio buttons for choosing the level of access to grant. */
var MSG_PERMISSION = goog.getMsg('Permission type');

/** @desc Label for the Invite button on the "Invite a collaborator" dialog. */
var MSG_INVITE_BUTTON = goog.getMsg('Invite');

/** @desc Label for the Cancel button on the "Invite a collaborator" dialog. */
var MSG_CANCEL_BUTTON = goog.getMsg('Cancel');

/** Regex for verifying email addresses on a shallow level. */
var EMAIL_PATTERN = '^(.+)@(.+)$';

/**
 * Popup to invite a user to edit a map.
 * @constructor
 */
cm.ShareEmailView = function() {
  /**
   * @type Element
   * @private
   */
  this.popup_;

  /**
   * @type Element
   * @private
   */
  this.titleElem_;

  /**
   * @type Element
   * @private
   */
  this.tableElem_;

  /**
   * @type Element
   * @private
   */
  this.emailLabel_;

  /**
   * @type Element
   * @private
   */
  this.emailInput_;

  /**
   * @type Element
   * @private
   */
  this.viewer_;

  /**
   * @type Element
   * @private
   */
  this.editor_;

  /**
   * @type Element
   * @private
   */
  this.owner_;

  /**
   * @type Element
   * @private
   */
  this.messageLabel_;

  /**
   * @type Element
   * @private
   */
  this.messageBox_;

  /**
   * @type Element
   * @private
   */
  this.inviteBtn_;

  /**
   * @type Element
   * @private
   */
  this.cancelBtn_;

  this.popup_ = cm.ui.create('div',
                             {'class': [cm.css.SHARE_EMAILER, cm.css.POPUP]},
      this.titleElem_ = cm.ui.create('h2', {}, MSG_INVITE_TITLE),
      this.tableElem_ = cm.ui.create('table', {'class': 'cm-editors'}),
      cm.ui.create('div', {'class': cm.css.BUTTON_AREA},
      this.inviteBtn_ = cm.ui.create(
          'button', {'class': [cm.css.BUTTON, cm.css.SUBMIT]},
          MSG_INVITE_BUTTON),
      this.cancelBtn_ = cm.ui.create(
          'button', {'class': cm.css.BUTTON}, MSG_CANCEL_BUTTON)));

  cm.events.listen(this.inviteBtn_, 'click', this.handleShare_, this);
  cm.events.listen(this.cancelBtn_, 'click', this.handleCancel_, this);
};

/**
 * Build and show the share and email popup box.
 * @param {string} share_url The object to share with another user.
 */
cm.ShareEmailView.prototype.share = function(share_url) {
  this.shareUrl_ = share_url;

  cm.ui.clear(this.tableElem_);
  this.emailInput_ = cm.ui.create(
      'input', {'type': 'text', 'id': 'cm-input-email'});
  this.messageBox_ = cm.ui.create(
      'textarea', {'id': 'cm-input-message',
                   'placeholder': MSG_INVITE_MESSAGE_PLACEHOLDER});
  this.viewer_ = cm.ui.create(
      'input', {'type': 'radio', 'name': 'role', 'id': 'cm-role-viewer',
                'value': 'MAP_VIEWER', 'checked': 'true'});
  this.editor_ = cm.ui.create(
      'input', {'type': 'radio', 'name': 'role', 'id': 'cm-role-editor',
                'value': 'MAP_EDITOR'});
  this.owner_ = cm.ui.create(
      'input', {'type': 'radio', 'name': 'role', 'id': 'cm-role-owner',
                'value': 'MAP_OWNER'});
  this.emailLabel_ = cm.ui.create(
      'label', {'for': 'cm-input-email'}, MSG_EMAIL);

  cm.ui.append(
      this.tableElem_,
      cm.ui.create(
          'tr', {'class': 'cm-text-input-row'},
          cm.ui.create('th', {}, this.emailLabel_),
          cm.ui.create('td', {}, this.emailInput_)),
      cm.ui.create(
          'tr', {},
          cm.ui.create(
              'th', {}, cm.ui.create('label', {}, MSG_PERMISSION)),
          cm.ui.create(
              'td', {}, this.viewer_,
              cm.ui.create('label', {'for': 'cm-role-viewer'}, MSG_VIEWER),
              ' ', this.editor_,
              cm.ui.create('label', {'for': 'cm-role-editor'}, MSG_EDITOR),
              ' ', this.owner_,
              cm.ui.create('label', {'for': 'cm-role-owner'}, MSG_OWNER))),
      cm.ui.create(
          'tr', {'class': 'cm-textarea-row'},
          cm.ui.create('th', {}, cm.ui.create('label', {}, MSG_INVITE_MESSAGE)),
          cm.ui.create('td', {}, this.messageBox_)));
  cm.ui.showPopup(this.popup_);
  this.emailInput_.focus();
};

/**
 * Shows an error popup for if the share handler does not return a 201.
 */
cm.ShareEmailView.prototype.emailError = function() {
  var okayBtn;
  var errorPopup = cm.ui.create('div',
                                {'class': [cm.css.SHARE_EMAILER, cm.css.POPUP]},
      cm.ui.create('p', {'class': cm.css.EMAIL_ERROR}, MSG_EMAIL_ERROR),
      cm.ui.create('div', {'class': cm.css.BUTTON_AREA},
                   okayBtn = cm.ui.create(
                       'button',
                       {'class': [cm.css.BUTTON, cm.css.SUBMIT]}, MSG_OK)));
  cm.ui.showPopup(errorPopup);
  cm.events.listen(okayBtn, 'click', function() {
      cm.ui.remove(errorPopup);
    }, this);
};

/**
 * Shares the map at the proper permission level to the specified user.
 * @private
 */
cm.ShareEmailView.prototype.handleShare_ = function() {
  var messageText = this.messageBox_.value;
  var recipientEmail = this.emailInput_.value;

  if (recipientEmail.length === 0 || !recipientEmail.match(EMAIL_PATTERN)) {
    goog.dom.classes.add(this.emailLabel_, cm.css.EMAIL_ERROR);
    return;
  }
  var permission = this.viewer_.value;
  if (this.editor_.checked) {
    permission = this.editor_.value;
  } else if (this.owner_.checked) {
    permission = this.owner_.value;
  }
  var postArgs = 'role=' + encodeURIComponent(permission) +
                 '&recipient=' + encodeURIComponent(recipientEmail) +
                 '&message=' + encodeURIComponent(messageText);
  goog.net.XhrIo.send(this.shareUrl_, function(e) {
      var success = (e.target.getStatus() === 201);
      cm.events.emit(goog.global, success ? cm.events.SHARE_EMAIL_SENT :
                     cm.events.SHARE_EMAIL_FAILED);
    }, 'POST', postArgs);
  cm.ui.remove(this.popup_);
};

/**
 * Cancels the user's decision to share.
 * @private
 */
cm.ShareEmailView.prototype.handleCancel_ = function() {
  cm.ui.remove(this.popup_);
};
