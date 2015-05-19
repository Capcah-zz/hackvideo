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

def mintime(hash)
  return hash.values.min
end

#This method checks if everyone is ok with stuff playing
post '/keepalive' do
  content_type :json
  user = @data['user']
  tnew = @data['time']
  conn = $conlist[@data['c_id']]
  time = conn[:time][user]
  puts ">>>>#{conn[:time][user]}"
  conn[:time][user] = time < tnew ? tnew : time
  #if conn[:seeking]
  return {skip: conn[:rdy].empty? , time: mintime(conn[:time])}.to_json
  #else
  #  return conn[:rdy].empty? ? 200 : 406
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
  users = @data["users"]
  puts ">>>>>>#{users.inspect}"
  return json_error("duplicate video")  if $connections[state]
  num = ($conlist <<
         ($connections[state] =
          { rdy: Set.new(users),
            time:Hash[users.zip([0]*users.size)],
            state: state})).size
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
  $conlist[id][:rdy].delete(user)
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
  $conlist[id][:rdy].add(user)
  ncon = $conlist[id][:rdy]
  return {ok: ncon.empty?}.to_json
end

post '/seek' do
  id,user,time = ["c_id",'user',"time"].map{|x| @data[x]}
  puts $conlist.inspect
  con = $conlist[id]
  con[:time].each do |k,v|
    con[:time][k] = time.to_i
  end
  con[:rdy] = Set.new(con[:time].keys.select{|x| x != user})
end

post '/seek-ack' do
  id,user= ["c_id","user"].map{|x| @data[x]}
  $conlist[id][:rdy].delete(user)
end

options '/*' do
  response.headers["Access-Control-Allow-Origin"] = "*"
  response.headers["Access-Control-Allow-Methods"] = "POST, GET"
  response.headers["Access-Control-Allow-Headers"] = "origin, content-type, accept"
end

after do
  response['Access-Control-Allow-Origin'] = "*"
end
