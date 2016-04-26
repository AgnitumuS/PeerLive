# BemTV Plugin for Clappr Media Player

This plugin adds peer-to-peer powers for HTTP Live Streaming (HLS) transmissions on [Clappr Player](http://github.com/globocom/clappr).

# Try it now!


# How to Use

```html
  <head>
    <script type="text/javascript" src="http://bem.tv/p2phls.js"></script>
    <script type="text/javascript" src="http://bem.tv/p2phlsstats.js"></script>
  </head>
  <body>
    <div id="player-wrapper"></div>
    <script>
      var playerElement = document.getElementById("player-wrapper");
      var player = new Clappr.Player({
				sources: ['http://cdn.bem.tv/stream/soccer2sec/playlist.m3u8'],
				plugins: {
						playback: [P2PHLS],
						container: [P2PHLSStats]
				},
				width: 640, height: 360,
				poster: "http://www.bem.tv/assets/poster.png",
				watermark: "http://bem.tv/assets/watermark3.png"
			});      
			player.attachTo(playerElement);
    </script>
  </body>
```
