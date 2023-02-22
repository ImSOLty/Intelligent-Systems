args=(
  "x=-15 y=0 team=SOLARY"
)
input=(
  "goto -20 -20 true; remember goto 20 -20 true; remember goto 20 20 true; remember goto -20 20 true"
)

for i in "${!args[@]}"; do
  node app.js ${args[$i]} <<EOF &
${input[$i]}
EOF
  sleep 0.1
done

wait
