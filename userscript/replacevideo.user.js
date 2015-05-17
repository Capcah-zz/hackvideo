// ==UserScript==
// @name    FBHack
// @version   2015.05.16
// @description   FB Hackathon
// @author    victorjtfranco
// @namespace   https://github.com/victorjtfranco
// @icon    http://s3.amazonaws.com/uso_ss/icon/87011/large.png
// @include   http://facebook.com*
// @include   http://www.facebook.com*
// @include   https://facebook.com*
// @include   https://www.facebook.com*
// @grant   GM_xmlhttpRequest
// @grant   GM_setValue
// @grant   GM_getValue
// @require     http://popcornjs.org/code/dist/popcorn-complete.min.js
// ==/UserScript==

(function() {

  var userscript = 'FBHack';
  console.debug("FBHack extension");
  
  function get_id(){
    document.querySelectorAll('[id^="profile_pic"]')[0].id.split('_').pop();
  };

  try{
    if (window.top != window.self) return;
    if (!window.location.href.match('facebook.com/(video.php|.*/videos/)')) return;

    var flashvars = {};
    var hackvideo = {};
    var url = "http://hackvideo.herokuapp.com";
      
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

        document.querySelectorAll("body")[0].insertAdjacentHTML('beforeend',
          '<div id="overlay"'+
            'style="visibility: hidden; position: absolute; left: 0px; top: 0px; width:100%; height:100%; text-align:center; z-index: 1000;"'+
          '>'+
          '<div '+
            'style="width:600px; height: 400px; margin: 100px auto; background-color: #fff; border:1px solid #000; padding:15px; text-align:center;"'+
          '>'+
          '<a onclick=\'document.getElementById(&quot;overlay&quot;).style.visibility = &quot;hidden&quot; \'>close</a>'+
          '<div style="overflow-y: scroll; width: 90%; height: 300px; border:1px solid #000;">'+
          '<form action="#">'+
          '<ul>'+
          '</ul>'+
          '</form>'+
          '</div>'+
          '<button type="button" id="watch2"> Watch together </button>'+
          '</div>'+
          '</div>'
        );

        function friends_id(){
          var a = [].slice.call(document.querySelectorAll("input[type=checkbox]")).filter(function(x){return x.checked}).map(function(x){return parseInt(x.getAttribute('value'))})
          console.log(a);
          console.log(hackvideo.video_src);
//console.log(JSON.stringify({'users':friends_id(),'video':hackvideo.video_src}),
          return [].slice.call(a);
        }
        document.querySelectorAll("#watch2")[0].addEventListener('click',
          function(){
            GM_xmlhttpRequest({
              method: 'POST',
              url: url+'/start',
              headers: {"Content-Type" : "application/json"},
              data: JSON.stringify({'users':friends_id(),'video':hackvideo.video_src}),
              onload: function(response) {
                console.log(response.responseText);
                //var session_id = JSON.parse(response)['session_id'];
                var session_id = JSON.parse(response.responseText)['session_id'];
                console.log("Your url is "+document.location.href+"/?cid="+session_id);
            }});
          }
        );

        console.debug("ul_friends");
        //debugger;
        ul_el = document.querySelectorAll("body #overlay ul")[0];
        ul_friends = [].slice.call(document.querySelectorAll("div .fbChatSidebarBody li [data-id]"))
                       .map(function(e){return e.getAttribute('data-id')});
        ul_friends.forEach(function(e){
          ul_el.insertAdjacentHTML('beforeend','<li>'+e+'</li>')
        });


        document.querySelectorAll("#sync_watch_button")[0].addEventListener('click',
          function(){

            console.debug("ul_friends");
            //debugger;
            ul_el = document.querySelectorAll("body #overlay ul")[0];
            ul_friends = [].slice.call(document.querySelectorAll("div .fbChatSidebarBody li [data-id]"))
                           .map(function(e){return e.getAttribute('data-id')});
            ul_friends.forEach(function(e){

              ul_el.insertAdjacentHTML('beforeend',
                '<li>'+
                '<label>'+
                '<input type="checkbox" value="'+e+'">'+
                '<img src="//graph.facebook.com/'+e+'/picture?type=square">'+
                e+
                '</label>'+
                '</li>')
            });

            console.debug("#sync_watch_button click");
            document.querySelectorAll("#overlay")[0].style.visibility = "visible";

            // Helper function to get elements

          }); }

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
        if(timeout_counter > 100) return;
        timeout_counter++;
        if(document.querySelectorAll(".stageWrapper embed").length !== 0){
          replace_video();
            if(document.location.href.match(/cid=([0-9]+)/)){
            console.log("Hello!");
            console.log(document.location.href.match(/cid=([0-9]+)/)[0]);
            var session_id = document.location.href.match(/cid=([0-9]+)/)[1];
            console.log(session_id);
            var ready01 = false,
                ready02 = false,
                url = "http://hackvideo.herokuapp.com";

            function element(id) {
              return document.getElementById(id);
            }
            console.log(document.location.href);
              var paused = true,
                  right = false,
                  from_ended = false;
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
                GM_xmlhttpRequest({
                  method: 'POST',
                  url: url+'/play',
                  headers: {"Content-Type" : "application/json"},
                    data: JSON.stringify({'c_id':session_id,'user':get_id()})
                });
                if (!right) {
                  from_play = true;
                  popcorn.pause();
                }
              })
              .on('pause', function() {
                GM_xmlhttpRequest({
                  method: 'POST',
                  url: url+'/stop',
                  headers: {"Content-Type" : "application/json"},
                  data: JSON.stringify({'c_id':session_id,'user':get_id()})
                })});

              function keepAlive() {
                GM_xmlhttpRequest({
                  method: 'POST',
                  url: url+'/keepalive',
                  headers: {"Content-Type" : "application/json"},
                  data: JSON.stringify({'c_id':session_id, 'user':get_id(), 'time':popcorn.currentTime()}),
                    onload: function(response) {
                    robj = JSON.parse(response.responseText);
                    if (robj['skip'] && !from_ended) {
                      right = true;
                      popcorn.play();
                    } else {
                      right = false;
                      from_ended = false;
                      popcorn.pause(request.response['time']);}}});
                //request.responseType = 'json';
                setTimeout(keepAlive,500);
              };
              keepAlive();
            };
          return;
        }
        timeout();
      }, 200);
    }
    timeout();

  } catch(e) { console.log(e); }

})();
