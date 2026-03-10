import { mockExercisesDataset } from "./mockExercises";

const cache = {};

export const fetchExercisesForMuscle = async (muscleKey) => {

  if (cache[muscleKey]) {
    return cache[muscleKey];
  }

  return new Promise((resolve) => {

    setTimeout(() => {

      const data = mockExercisesDataset[muscleKey] || [];

      cache[muscleKey] = data;

      resolve(data);

    }, 150);

  });

};