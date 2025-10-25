tính score :node scripts/compute_popularity_score.js

mã hoá dữ liệu thành file xwalk_exercise.normalized rồi đó, giờ có thêm dữ liệu thì thêm vào đây.
sau khi thêm dữ liệu xong thì chạy npm run xwalk:prepare
sau đó chạy npm run xwalk:import -> dữ liệu các bài tập 

cách bắn các instruction json ở xwalk_exercise_steps.import.json san g database

node scripts/import_exercise_steps_json.js


đẩy image_exercises thành các hình ảnh:
node ./scripts/import-image-exercise-from-data.js


bắn nó lên database:
node ./scripts/import-image-exercise-from-data.js --commit
