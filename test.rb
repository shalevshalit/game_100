all_options = (1..10).to_a.product((1..10).to_a)
arr = all_options.inject(Hash.new(-1)) { |h, k| h.merge k => 0 }

def find(number, last_x = nil, last_y = nil, hash = nil)
  if last_x
    print_board hash if number == 101
    find(number+1, *(possible_places(last_x, last_y, hash).map do |x, y|
                   new_hash = hash.clone
                   new_hash[[x, y]] = number
                   [x, y, new_hash]
                 end.min_by { |x, y, h| possible_places(x, y, h).length }))
  end
end

def possible_places(x, y, hash)
  [[x-3, y], [x, y-3], [x+3, y], [x, y+3],
   [x+2, y+2], [x-2, y-2], [x-2, y+2], [x+2, y-2]].select { |cords| hash[cords].zero? }
end

def print_board(hash)
  hash.values.each_slice(10) do |vals|
    puts vals.map { |v| v.nonzero?.to_s.rjust(2) }.join(' - ')
  end
  puts
end

all_options.each do |x, y|
  start_hash = arr.clone
  start_hash[[x, y]] = 1
  find(2, x, y, start_hash)
end
