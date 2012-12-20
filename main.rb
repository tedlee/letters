require 'sinatra'
require 'erb'

get '/' do
  File.read(File.join('public', 'index.html'))
end
