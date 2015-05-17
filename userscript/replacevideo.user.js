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
// @require     http://popcornjs.org/code/dist/popcorn-complete.min.js
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
          '<a id="sync_watch_button">Watch in sync</a>'+
        ' </div>';
        hackvideo.header.insertAdjacentHTML('beforeend',hackvideo.header_newhtml);
        console.debug("FBHack header");

        document.querySelectorAll("#sync_watch_button")[0].addEventListener('click',
          function(){
            // Helper function to get elements
            var ready01 = false,
                ready02 = false,
                url = "http://hackvideo.herokuapp.com";
            
            function element(id) {
              return document.getElementById(id);
            }
            
              var paused = true,
                  right = false,
                  from_play = false;
                  from_ended = false;
                  c_id = 0,
                  user = 3;
                  popcorn = Popcorn("#hackvideo");
            
              popcorn = popcorn
               .on('timeupdate', function() {
                 console.log("timeupdate");
               })
               .on('ended', function() {
                 console.log("ended");
                 from_ended = true;
               })
            
              .on('play', function() {
                console.debug("play");
                var request = new XMLHttpRequest();
            
                request.open("POST", url+'/play', true);
            
                console.log(request.readyState + " & " + request.status);
            
                request.onreadystatechange = function() {
                  console.log(request.readyState + " & " + request.status);
                  if (request.readyState == 0) {
                    element('status').innerHTML = "0";
                  }
                  else if (request.readyState == 1) {
                    element('status').innerHTML = "1";
                  }
                  else if (request.readyState == 2) {
                    element('status').innerHTML = "2";
                  }
                  else if (request.readyState == 3) {
                    element('status').innerHTML = "3";
                  }
                  else if (request.readyState == 4 && request.status == 200) {
                      element('status').innerHTML = "Ok";
                  }
                }
            
                request.onerror = function() {
                  element('status').innerHTML = "An error occurred.\nConnection timed out.";
                }
            
                request.setRequestHeader("Content-Type", "application/json");
                request.send(JSON.stringify({'c_id':c_id,'user':user}));
            
                if (!right) {
                  from_play = true;
                  popcorn.pause();
                }
              })
              .on('pause', function() {
                if(from_play){
                    from_play = false;
                    return;
                }
                var request = new XMLHttpRequest();
            
                request.open("POST", url+'/stop', true);
            
                console.log(request.readyState + " & " + request.status);
            
                request.onreadystatechange = function() {
                  console.log(request.readyState + " & " + request.status);
                  if (request.readyState == 0) {
                    element('status').innerHTML = "0";
                  }
                  else if (request.readyState == 1) {
                    element('status').innerHTML = "1";
                  }
                  else if (request.readyState == 2) {
                    element('status').innerHTML = "2";
                  }
                  else if (request.readyState == 3) {
                    element('status').innerHTML = "3";
                  }
                  else if (request.readyState == 4 && request.status == 200) {
                      element('status').innerHTML = "Ok";
                  }
                }
            
                request.onerror = function() {
                  element('status').innerHTML = "An error occurred.\nConnection timed out.";
                }
            
                request.setRequestHeader("Content-Type", "application/json");
                request.send(JSON.stringify({'c_id':c_id,'user':user}));
            
              });
            
              function keepAlive() {
                var request = new XMLHttpRequest();
                request.open("POST", url + "/keepalive/", true);
                request.onload = function() {
                  if (request.status == 200 && from_ended != true) {
                    right = true;
                    popcorn.play();
                  } else {
                    right = false;
                    if (from_ended) {
                      popcorn.pause(0.0);
                    }
                    else {
                      popcorn.pause();
                    }
            
                    from_ended = false;
            
                    popcorn.pause();
                  }
                }
                request.setRequestHeader("Content-Type", "application/json");
                request.send(JSON.stringify({'c_id':c_id,'user':user, 'time':popcorn.currentTime}));
                setTimeout(keepAlive,500);
              };
              keepAlive();
          }
        );

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
