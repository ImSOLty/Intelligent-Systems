args=(
  "x=-15 y=0 team=SOLARY"
)
input=(
  "goto 30 15 true"
)

for i in "${!args[@]}"; do
  node app.js ${args[$i]} <<EOF &
${input[$i]}
EOF
  sleep 0.1
done

wait
