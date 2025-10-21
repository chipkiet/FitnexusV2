tính score :node scripts/compute_popularity_score.js

mã hoá dữ liệu thành file xwalk_exercise.normalized rồi đó, giờ có thêm dữ liệu thì thêm vào đây.
sau khi thêm dữ liệu xong thì chạy npm run xwalk:prepare
sau đó chạy npm run xwalk:import -> dữ liệu các bài tập 


cách import dữ liệu steps từ exercise.json qua xwalk_exercise_steps.import.json rồi bắn nó qua database exercise_steps_json 

sử dụng scripts/import_exercise_steps_json.js:1


giờ cập nhật lại các instruction đó, xong chạy lại : node scripts/import_exercise_steps_json.js
Script sẽ ghi đè toàn bộ steps cho từng exercise_id (idempotent).