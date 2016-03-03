require 'json'

all_options = (1..10).to_a.product((1..10).to_a)

def possible_places(x, y, hash)
  [[x-3, y], [x, y-3], [x+3, y], [x, y+3],
   [x+2, y+2], [x-2, y-2], [x-2, y+2], [x+2, y-2]].select { |cords| hash[cords].zero? }
end

# min, max = 4, 5
# min, max = 10, 11
# min, max = 14, 20
# min, max = 18, 25
min, max = 21, 30

chapter_number = Dir['www/levels/chapter*.json'].sort.last.match(/chapter(\d)\.json/)[1].to_i + 1
File.open("www/levels/chapter#{chapter_number}.json", 'wb') do |f|
  f.write((1..80).inject({}) do |h, lvl|
            good_board = false
            win_number = (min..(max+lvl/10)).to_a.sample
            until good_board
              board = all_options.inject(Hash.new(-1)) { |h, k| h.merge k => 0 }
              (1..win_number).inject([rand(10), rand(10)]) do |(x, y), i|
                location = possible_places(x, y, board).sample
                break unless location
                board[location] = i
                location
              end
              good_board = true
            end
            h.merge "lvl#{lvl}" => {
                      i: lvl,
                      board: board.values.map { |i| i.zero? ? 0 : -1 }.each_slice(10).to_a,
                      winNumber: win_number
                    }
          end.to_json)
end
