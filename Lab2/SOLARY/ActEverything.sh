args=(
  "x=-15 y=0 team=SOLARY"
  "x=-15 y=0 team=NONSOLARY"
)
input=(
  "goto -15 -16 true; remember goto 10 -24 true; remember goto 9 20 true; remember goto -10 5 true; remember goto 30 0 true"
  "remember goto 0 -10 false; remember goto -10 -20 false; remember follow \"SOLARY\" 1"
)

for i in "${!args[@]}"; do
  node app.js ${args[$i]} <<EOF &
${input[$i]}
EOF
  sleep 0.1
done

wait
