
var flashvars = {};
flashvars.s = document.querySelectorAll(".stageWrapper embed").item(0).getAttribute("flashvars");
flashvars.params = JSON.parse(decodeURIComponent(flashvars.s.split("&")[0].slice(7)));
flashvars.other = flashvars.s.split("&").slice(1).map(function(x){return x.split("=")}).reduce(function(p,c,i,a){p[c[0]]=c[1]; return p;},{});

var hackvideo = {};
hackvideo.sd_src = flashvars.params.video_data[0].sd_src;
hackvideo.hd_src = flashvars.params.video_data[0].hd_src;
if(hackvideo.sd_src != null) hackvideo.video_src = hackvideo.sd_src;
if(hackvideo.hd_src != null) hackvideo.video_src = hackvideo.hd_src;

hackvideo.old_videoel = document.querySelectorAll("#"+flashvars.other.div_id)[0];
hackvideo.new_videoel_html =
  '<video id="hackvideo" style="position: absolute; top: 0px; left: 0px; height: '+flashvars.other.height+'px; width: '+flashvars.other.width+'px">'+
  '<source src="'+hackvideo.video_src+'" type=\'video/mp4; codecs="avc1.42E01E, mp4a.40.2"\' />'+
  '</video>';
hackvideo.old_videoel.insertAdjacentHTML('beforebegin',hackvideo.new_videoel_html);
hackvideo.old_videoel.hidden = true;
