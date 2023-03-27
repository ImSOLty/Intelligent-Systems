rcssserver >rcssserver.log 2>&1 &
rcssmonitor >rcssmonitor.log 2>&1 &
export MONITOR=$!

pr=(
  "x=-10 y=0 team=SOLARY"
  "x=-5 y=-25 team=SOLARY"
  "x=-5 y=25 team=SOLARY"
  "x=-25 y=-3 team=SOLARY"
  "x=-25 y=3 team=SOLARY"
  "x=-25 y=-15 team=SOLARY"
  "x=-25 y=15 team=SOLARY"
  "x=-35 y=-25 team=SOLARY"
  "x=-35 y=0 team=SOLARY"
  "x=-35 y=25 team=SOLARY"
  "x=-50 y=0 team=SOLARY role=goalie"

  "x=-10 y=0 team=NONSOLARY"
  "x=-5 y=-25 team=NONSOLARY"
  "x=-5 y=25 team=NONSOLARY"
  "x=-25 y=-3 team=NONSOLARY"
  "x=-25 y=3 team=NONSOLARY"
  "x=-25 y=-15 team=NONSOLARY"
  "x=-25 y=15 team=NONSOLARY"
  "x=-35 y=-25 team=NONSOLARY"
  "x=-35 y=0 team=NONSOLARY"
  "x=-35 y=25 team=NONSOLARY"
  "x=-50 y=0 team=NONSOLARY role=goalie"
)

for i in "${!pr[@]}"; do
  node app.js ${pr[$i]} &
  sleep 0.1
done

wait $MONITOR

kill $(pidof rcssmonitor)
kill $(pidof rcssserver)

sleep 0.1

rm *.rcg
rm *.rcl
rm *.log
