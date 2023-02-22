args=(
  "x=-10 y=-5 team=SOLARY"
  "x=-10 y=0 team=SOLARY"
  "x=-10 y=5 team=SOLARY"
  "x=-10 y=-5 team=NONSOLARY"
  "x=-10 y=0 team=NONSOLARY"
  "x=-10 y=5 team=NONSOLARY"
)
input=(
  "goto 15 15 true; remember goto 15 -15 true; remember goto -15 -15 true; remember goto -15 15 true; remember goto 15 15 true; remember goto 15 -15 true; remember goto -15 -15 true; remember goto -15 15 true"

  "follow \"SOLARY\" 1"

  "follow \"SOLARY\" 2"

  "follow \"SOLARY\" 3"

  "follow \"NONSOLARY\" 1"

  "follow \"NONSOLARY\" 2"
)

for i in "${!args[@]}"; do
  node app.js ${args[$i]} <<EOF &
${input[$i]}
EOF
  sleep 0.1
done

wait
