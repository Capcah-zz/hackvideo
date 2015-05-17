require 'net/http'
require 'json'
#require 'debug'

def tesp(n)
  res = Net::HTTP.get_response(URI($base + 'keepalive/'+ $cid.to_s))
  puts "ping#{$user[n]}: #{res.code}"
end

def test_ping
  sleep(0.05)
  [1,0].each{|i| tesp(i)}
  sleep(0.05)
end

def testf(n,f)
  response = $http.post(f,
                      {"user" => $user[n], "c_id" => $cid}.to_json,
                      $json_headers)
  puts response.body
end

$user = [1,3]
uri = URI('http://localhost:4567/')
$base = 'http://localhost:4567/'
$json_headers ={"Content-Type" => "application/json", "Accept" => "application/json"}
$http = Net::HTTP.new(uri.host, uri.port)

#req = Net::HTTP::Post.new(
#req.content_type = 'json'
#req.body = {"users" => ["1","3"], "video" => '4'}.to_json
5.times do
  response = $http.post('/start',
                        {"users" => ["1","3"], "video" => '4'}.to_json,
                        $json_headers)
  $cid = JSON.parse(response.body)["session_id"]
  puts $cid
  test_ping
  testf(0,'/play')
  test_ping
  testf(1,'/play')
  test_ping
  testf(0,'/stop')
  test_ping
  res = Net::HTTP.get_response(URI($base + 'caguei/' + $cid.to_s))
end
