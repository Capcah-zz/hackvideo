// Helper function to get elements
var ready01 = false,
    ready02 = false,
    url = "http://172.22.38.148:4567";

function element(id) {
  return document.getElementById(id);
}

document.addEventListener('DOMContentLoaded', function() {
  var paused = true,
      right = false;
      popcorn = Popcorn("#ourvideo");

  popcorn = popcorn
  .on('play', function() {
    var request = new XMLHttpRequest();
    var data = new FormData();

    request.open("POST", url, true);

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
      else if (request.readyState == 4/* && request.status == 200*/) {
          element('status').innerHTML = "Ok";
      }
    } 

    request.onerror = function() {
      element('status').innerHTML = "An error occurred.\nConnection timed out.";
    }

    data.append("c_id", c_id);
    data.append("user", user);

    request.send(data);

    if (!right) {
      popcorn.pause();
    }
    else {
      paused = false;

      ready01 = false;
      ready02 = false;

      element('btn-play-pause').innerHTML = 'Pause 01';
      element('btn-play-pause-02').innerHTML = 'Pause 02';
    }
  })
  .on('pause', function() {
    var request = new XMLHttpRequest();
    var data = new FormData();

    request.open("POST", url, true);

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
      else if (request.readyState == 4) {
          element('status').innerHTML = "Ok";
      }
    } 

    request.onerror = function() {
      element('status').innerHTML = "An error occurred.\nConnection timed out.";
    }

    data.append("c_id", c_id);
    data.append("user", user);

    request.send(data);

    paused = true;

    ready01 = false;
    ready02 = false;

    element('btn-play-pause').innerHTML = 'Play 01';
    element('btn-play-pause-02').innerHTML = 'Play 02';
    console.log(popcorn.currentTime());
  });

  // Play-pause buttons
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

  keepAlive = function() {
    var request = new XMLHttpRequest();
    
    request.open("GET", url + "/keepAlive/" + c_id, true);

    request.onload = function() {
      if (request.status == 200) {
        right = true;
      }
      else {
        right = false;
      }
      sleep(0.5);
      keepAlive();
    }

    request.send();
  };
}, false );