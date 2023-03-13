pr=(
  "x=-20 y=-5 team=SOLARY"
  "x=-10 y=0 team=SOLARY"
  "x=-20 y=5 team=SOLARY"
  "x=-51 y=0 team=NONSOLARY role=goalie"
)

for i in "${!pr[@]}"; do
  node app.js ${pr[$i]} &
  sleep 0.1
done

wait