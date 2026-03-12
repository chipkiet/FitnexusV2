import { muscleExerciseMap } from "./muscleExerciseMap";

const cache = {};

/**
 * Returns a list of { id, name } exercise objects for the given muscle key.
 * Results are cached per key for the session.
 */
export const fetchExercisesForMuscle = async (muscleKey) => {

  if (cache[muscleKey]) {
    return cache[muscleKey];
  }

  return new Promise((resolve) => {

    setTimeout(() => {

      const data = muscleExerciseMap[muscleKey] || [];

      cache[muscleKey] = data;

      resolve(data);

    }, 150);

  });

};