args=(
  "x=-15 y=-10 team=SOLARY"
  "x=-15 y=10 team=SOLARY"
  "x=-15 y=-10 team=NONSOLARY"
  "x=-15 y=10 team=NONSOLARY"
)
input=(
  "goto 35 0 true"
  "goto 35 0 true"
  "goto -35 0 true"
  "goto -35 0 true"
)

for i in "${!args[@]}"; do
  node app.js ${args[$i]} <<EOF &
${input[$i]}
EOF
  sleep 0.1
done

wait
