// Copyright 2014 Flávio Ribeiro <flavio@bem.tv>.
// All rights reserved.
// Use of this source code is governed by Apache
// license that can be found in the LICENSE file.

var log = require('./log')
var Settings = require('./settings')
var ResourceRequester = require('./resource_requester')
var UploadHandler = require('./upload_handler')
var PlaybackInfo = require('./playback_info')
var AdaptiveStreaming = require('./adaptive_streaming')

var JST = require('./jst')
var HLS = require('./hls')

class P2PHLS extends HLS {
  get name() { return 'p2phls' }
  get tagName() { return 'object' }
  get template() { return JST.p2phls }
  get attributes() {
    return {
      'data-p2phls': '',
      'type': 'application/x-shockwave-flash'
    }
  }

  constructor(options) {
    options.swfPath = "http://cdn.clappr.io/bemtv/latest/assets/P2PHLSPlayer.swf"
    this.resourceRequester = new ResourceRequester({swarm: btoa(options.src), tracker: options.tracker})
    this.uploadHandler = UploadHandler.getInstance()
    this.playbackInfo = PlaybackInfo.getInstance()
    super(options)
  }

  addListeners() {
    Clappr.Mediator.on(this.uniqueId + ':flashready', () => this.bootstrap())
    Clappr.Mediator.on(this.uniqueId + ':timeupdate', () => this.updateTime())
    Clappr.Mediator.on(this.uniqueId + ':playbackstate', (state) => this.setPlaybackState(state))
    Clappr.Mediator.on(this.uniqueId + ':highdefinition', (isHD) => this.updateHighDefinition(isHD))
    Clappr.Mediator.on(this.uniqueId + ':playbackerror', () => this.flashPlaybackError())
    Clappr.Mediator.on(this.uniqueId + ':requestresource', (url) => this.requestResource(url))
  }

  stopListening() {
    Clappr.Mediator.off(this.uniqueId + ':flashready')
    Clappr.Mediator.off(this.uniqueId + ':timeupdate')
    Clappr.Mediator.off(this.uniqueId + ':playbackstate')
    Clappr.Mediator.off(this.uniqueId + ':highdefinition')
    Clappr.Mediator.off(this.uniqueId + ':playbackerror')
  }

  bootstrap() {
    super()
    this.playbackInfo.setMain(this)
    this.adaptiveStreaming = new AdaptiveStreaming(this)
    this.el.playerSetminBufferLength(6)
    this.el.playerSetlowBufferLength(Settings.lowBufferLength)
  }

  setPlaybackState(state) {
    if (state === 'PLAYING' && this.resourceRequester.isInitialBuffer) {
      this.resourceRequester.isInitialBuffer = false
    }
    super(state)
  }

  requestResource(url) {
    this.currentUrl = url
    this.playbackInfo.updateData({
      'segmentSize': this.getAverageSegmentSize(),
      'levels': this.getLevels(),
    })
    this.resourceRequester.requestResource(url, this.bufferLength, (chunk, method) => this.resourceLoaded(chunk, method))
  }

  resourceLoaded(chunk, method) {
    if (this.currentUrl) {
      this.currentUrl = null
      this.el.resourceLoaded(chunk)
      this.playbackInfo.updateChunkStats(method)
    } else {
      log.debug("It seems a deadlock happened with timers on swarm.")
    }
  }

  getAverageSegmentSize() {
    if (!this.avgSegmentSize || this.avgSegmentSize === 0 && this.getLevels().length > 0) {
      this.avgSegmentSize = Math.round(this.getLevels()[0].averageduration) || 0
    }
    return this.avgSegmentSize
  }
}

P2PHLS.canPlay = function(resource) {
  return !!(window.webkitRTCPeerConnection || window.mozRTCPeerConnection) && !!resource.match(/^http(.*).m3u8/)
}

module.exports = window.P2PHLS = P2PHLS;
