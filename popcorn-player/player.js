// Helper function to get elements
var ready01 = false,
    ready02 = false,
    url = "http://172.22.38.148:4567";

function element(id) {
  return document.getElementById(id);
}

document.addEventListener('DOMContentLoaded', function() {
  var paused = true,
      right = false,
      from_play = false;
      from_ended = false;
      popcorn = Popcorn("#ourvideo");

  popcorn = popcorn
  .on('timeupdate', function() {
    console.log("timeupdate");
  })
  .on('ended', function() {
    console.log("ended");
    from_ended = true;
  })
  .on('play', function() {
    var request = new XMLHttpRequest();

    request.open("POST", url + '/play', true);

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
    request.send(JSON.stringify({'c_id':c_id, 'user':user}));

    if (!right) {
      from_play = true;
      popcorn.pause();
    }
    //else {
    //  paused = false;

    //  ready01 = false;
    //  ready02 = false;

    //  element('btn-play-pause').innerHTML = 'Pause 01';
    //  element('btn-play-pause-02').innerHTML = 'Pause 02';
    //}
  })
  .on('pause', function() {
    if (from_play){
        from_play = false;
        return;
    }
    var request = new XMLHttpRequest();
    //var data = new FormData();

    request.open("POST", url + '/stop', true);

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
    request.send(JSON.stringify({'c_id':c_id, 'user':user}));

    //data.append("c_id", c_id);
    //data.append("user", user);

    //request.send(data);

    //paused = true;

    //ready01 = false;
    //ready02 = false;

    //element('btn-play-pause').innerHTML = 'Play 01';
    //element('btn-play-pause-02').innerHTML = 'Play 02';
    //console.log(popcorn.currentTime());
  });

  // Play-pause buttons
  /*
  element('btn-play-pause').addEventListener('click', function() {
    ready01 = true;
    if (paused && ready02) {
      right = true;
      popcorn.play();
    }
    else {
      right = false;
      popcorn.pause();
    }
  }, false);
  element('btn-play-pause-02').addEventListener('click', function() {
    ready02 = true;
    if ( paused && ready01) {
      right = true;
      popcorn.play();
    }
    else {
      right = false;
      popcorn.pause();
    }
  }, false);
  */

  // function setTimeToZero() {
  //   if(from_ended) {
  //     popcorn.currentTime = 0.0;
  //     popcorn.pause();
  //     from_ended = false;
  //   }

  //   setTimeout(setTimeToZero, 200);
  // };

  // setTimeToZero();

  function keepAlive() {
    var request = new XMLHttpRequest();

    request.open("POST", url + "/keepalive", true);
    request.responseType = 'json';
    request.onload = function() {
      if (request.response['skip'] && from_ended != true) {
        right = true;
        popcorn.play();
      }
      else {
        right = false;

        if (from_ended) {
          popcorn.pause(0.0);
          setTimeout(function(){popcorn.pause(0.0)}, 500);
        }
        else {
          popcorn.pause(request.response['time']);
        }

        from_ended = false;
      }
    }
    request.setRequestHeader("Content-Type", "application/json");
    request.send(JSON.stringify({'c_id':c_id, 'user':user, 'time':popcorn.currentTime()}));
    //request.send();

    setTimeout(keepAlive, 500);
  };

  keepAlive();
}, false );
