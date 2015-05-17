require 'sinatra'
#require 'sinatra/activerecord'
#require './config/environments' #database configuration
#require './models/model'        #Model class
require 'json'
require 'set'

$connections = {}
$conlist = []

def tuple(params)
  users,video = params["users"].sort,params["video"]
  return "#{params["users"].join(",")} => #{params["video"]}"
end

def validate_json(data)
  data && data['users'] && !data['users'].empty? && data['video']
end

def json_error(msg)
  return {Error: msg}.to_json
end 

get '/' do
  'Noone should see this'
end

#This method checks if everyone is ok with stuff playing
get '/keepalive/:c_id' do
  return $conlist[params[:c_id].to_i][:rdy].empty? ? 200 : 406
end

get '/redirect/:c_cid/:uid' do
end

get '/caguei/:c_id' do
  cid = params[:c_id].to_i
  $connections.delete($conlist[cid][:state])
  $conlist[cid] = nil
end

before do
  request.body.rewind
  body = request.body.read
  @data= JSON.parse body unless body.empty?
end

#=> Post:
#users: Arr(Str)    List of users IDs
#video: Int         Video id to be watched
#=> Return:
#session_id : Int   Session id for the watch
post '/start' do
  content_type :json
  return json_error("empty data")  unless validate_json(@data)
  state = tuple(@data)
  return json_error("duplicate video")  if $connections[state]
  num = ($conlist <<
         ($connections[state] =
          {rdy: Set.new(@data["users"]), time: 0, state: state})).size
  return {session_id: num-1}.to_json
end

#This method signals that the user is ready and waiting for the others
#=> Post:
#c_id: Int          Connection ID for the session
#user: Int          User ID
#=> Return
#ack: Bool          Everything is OK
post '/play' do
  id,user = ["c_id","user"].map{|x| @data[x]}
  return json_error("missing user") unless user
  return json_error("video not registered") unless id && $conlist[id]
  $conlist[id][:rdy].delete(user.to_s)
  ncon = $conlist[id][:rdy]
  return {ok: ncon.empty?}.to_json
end

#The user stopped the player
#=> Post:
#c_id: Int          Connection ID for the session
#user: Int          User ID
#=> Return
#ack: Bool          Everything is OK
post '/stop' do
  id,user = ["c_id","user"].map{|x| @data[x]}
  return json_error("missing user") unless user
  return json_error("video not registered") unless id && $conlist[id]
  $conlist[id][:rdy].add(user.to_s)
  ncon = $conlist[id][:rdy]
  return {ok: ncon.empty?}.to_json
end

after do
  response['Access-Control-Allow-Origin'] = "*"
end
