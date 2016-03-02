require 'json'

all_options = (1..10).to_a.product((1..10).to_a)

def possible_places(x, y, hash)
  [[x-3, y], [x, y-3], [x+3, y], [x, y+3],
   [x+2, y+2], [x-2, y-2], [x-2, y+2], [x+2, y-2]].select { |cords| hash[cords].zero? }
end

File.open('chapter1.json', 'wb') do |f|
  f.write((1..80).inject({}) do |h, lvl|
            win_number = (4..(5+lvl/10)).to_a.sample
            board = all_options.inject(Hash.new(-1)) { |h, k| h.merge k => 0 }
            (1..win_number).inject([rand(10), rand(10)]) do |(x, y), i|
              location = possible_places(x, y, board).sample
              board[location] = i
              location
            end
            h.merge "lvl#{lvl}" => {
                      i: lvl,
                      board: board.values.map { |i| i.zero? ? 0 : -1 }.each_slice(10).to_a,
                      winNumber: win_number
                    }
          end.to_json)
end
