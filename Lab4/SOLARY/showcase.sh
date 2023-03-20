rcssserver > rcssserver.log 2>&1 &
rcssmonitor > rcssmonitor.log 2>&1 &
export MONITOR=$!

pr=(
  "x=-10 y=0 team=SOLARY"
  "x=-15 y=2 team=SOLARY"
  "x=-51 y=0 team=NONSOLARY role=goalie"
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