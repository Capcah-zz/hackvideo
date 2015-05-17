// ==UserScript==
// @name		FBHack
// @version		2015.05.16
// @description		FB Hackathon
// @author		victorjtfranco
// @namespace		https://github.com/victorjtfranco
// @icon		http://s3.amazonaws.com/uso_ss/icon/87011/large.png
// @include		http://facebook.com*
// @include		http://www.facebook.com*
// @include		https://facebook.com*
// @include		https://www.facebook.com*
// @grant		GM_xmlhttpRequest
// @grant		GM_setValue
// @grant		GM_getValue
// ==/UserScript==

(function() {

  var userscript = 'FBHack';
  console.debug("FBHack extension");

  try{
    if (window.top != window.self) return;
    if (!window.location.href.match('facebook.com/(video.php|.*/videos/)')) return;

    var flashvars = {};
    var hackvideo = {};

    function replace_video(){
      console.debug("FBHack replace_video");
      flashvars.s = document.querySelectorAll(".stageWrapper embed").item(0).getAttribute("flashvars");
      flashvars.params = JSON.parse(decodeURIComponent(flashvars.s.split("&")[0].slice(7)));
      flashvars.other = flashvars.s.split("&").slice(1).map(function(x){return x.split("=")}).reduce(function(p,c,i,a){p[c[0]]=c[1]; return p;},{});

      hackvideo.sd_src = flashvars.params.video_data[0].sd_src;
      hackvideo.hd_src = flashvars.params.video_data[0].hd_src;
      if(hackvideo.sd_src != null) hackvideo.video_src = hackvideo.sd_src;
      if(hackvideo.hd_src != null) hackvideo.video_src = hackvideo.hd_src;

      hackvideo.old_videoel = document.querySelectorAll("#"+flashvars.other.div_id)[0];
      hackvideo.new_videoel_html =
        '<video id="hackvideo" '+
          'style="position: absolute; top: 0px; left: 0px; height: '+flashvars.other.height+'px; width: '+flashvars.other.width+'px"'+
          'controls'+
        '>'+
          '<source src="'+hackvideo.video_src+'" type=\'video/mp4; codecs="avc1.42E01E, mp4a.40.2"\' />'+
        '</video>';
      hackvideo.old_videoel.insertAdjacentHTML('beforebegin',hackvideo.new_videoel_html);
      hackvideo.old_videoel.hidden = true;

      hackvideo.header = document.querySelectorAll("#fbPhotoPageHeader>div:nth-child(2)");
      if(hackvideo.header.length !== 0) {
        hackvideo.header = hackvideo.header[0];
        hackvideo.header_newhtml =
        '<div style="float: right;">'+
          //'<a href="'+hackvideo.video_src+'">Download</a>'+
          //'<div style="width: 20px"></div>'+
          '<a onclick="fbhack.load_player_js()">Watch in sync</a>'+
        ' </div>';
        hackvideo.header.insertAdjacentHTML('beforeend',hackvideo.header_newhtml);
        console.debug("FBHack header");
      }

      var player_el = document.createElement('script');
      player_el.setAttribute("type","text/javascript");
      player_el.innerHTML =
        "fbhack = {};\n"+
        "fbhack.load_player_js = function(){\n"+
          "console.debug('fbhack.load_player_js')\n"+
          "var player_el = document.createElement('script');\n"+
          "player_el.setAttribute(\"type\",\"text/javascript\");\n"+
          "player_el.setAttribute(\"src\", \"//hackvideo.herokuapp.com/assets/player.js\");\n"+
          "document.getElementsByTagName(\"head\")[0].appendChild(player_el);\n"+
        "}";
      document.getElementsByTagName("head")[0].appendChild(player_el);


    }

    var timeout_counter = 0;
    console.debug("FBHack extension 1");
    function timeout(){
      console.debug("FBHack extension timeout");
      setTimeout(function() {
        if(timeout_counter > 25) return;
        timeout_counter++;
        if(document.querySelectorAll(".stageWrapper embed").length !== 0){
          replace_video();
          return;
        }
        timeout();
      }, 200);
    }
    timeout();

  } catch(e) { console.log(e); }

})();
