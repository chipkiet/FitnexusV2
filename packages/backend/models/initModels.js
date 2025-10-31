// models/initModels.js
import User from "./user.model.js";
import PasswordReset from "./passwordReset.model.js";
import OnboardingStep from "./onboarding.step.model.js";
import OnboardingField from "./onboarding.field.model.js";
import OnboardingSession from "./onboarding.session.model.js";
import OnboardingAnswer from "./onboarding.answer.model.js";
import Exercise from "./exercise.model.js";
import WorkoutPlan from "./workout.plan.model.js";
import PlanExerciseDetail from "./plan.exercise.detail.model.js";
import UserWorkoutLog from "./user.workout.log.model.js";
import UserWorkoutLogDetail from "./user.workout.log.detail.model.js";
import ExerciseImage from "./exercise.image.model.js";
import LoginHistory from "./login.history.model.js";
import ExerciseFavorite from "./exercise.favorite.model.js"; // ✅ giữ lại phần local
import WorkoutSession from "./workout.session.model.js"; // ✅ giữ lại phần remote
import WorkoutSessionExercise from "./workout.session.exercise.model.js";
import WorkoutSessionSet from "./workout.session.set.model.js";
import AIUsage from "./ai.usage.model.js";

export function initModels() {
  // Khai báo quan hệ 1-n: User hasMany PasswordReset
  User.hasMany(PasswordReset, {
    foreignKey: "user_id",
    sourceKey: "user_id",
    onDelete: "CASCADE",
  });

  PasswordReset.belongsTo(User, {
    foreignKey: "user_id",
    targetKey: "user_id",
    onDelete: "CASCADE",
  });

  // Onboarding relations
  OnboardingStep.hasMany(OnboardingField, { foreignKey: 'step_id', sourceKey: 'step_id', as: 'fields' });
  OnboardingField.belongsTo(OnboardingStep, { foreignKey: 'step_id', targetKey: 'step_id', as: 'step' });

  User.hasMany(OnboardingSession, { foreignKey: 'user_id', sourceKey: 'user_id', as: 'onboardingSessions' });
  OnboardingSession.belongsTo(User, { foreignKey: 'user_id', targetKey: 'user_id', as: 'user' });

  OnboardingSession.hasMany(OnboardingAnswer, { foreignKey: 'session_id', sourceKey: 'session_id', as: 'answers' });
  OnboardingAnswer.belongsTo(OnboardingSession, { foreignKey: 'session_id', targetKey: 'session_id', as: 'session' });

  OnboardingStep.hasMany(OnboardingAnswer, { foreignKey: 'step_id', sourceKey: 'step_id', as: 'answers' });
  OnboardingAnswer.belongsTo(OnboardingStep, { foreignKey: 'step_id', targetKey: 'step_id', as: 'step' });

  // Users ↔ WorkoutPlans
  User.hasMany(WorkoutPlan, { foreignKey: 'creator_id', sourceKey: 'user_id', as: 'plans' });
  WorkoutPlan.belongsTo(User, { foreignKey: 'creator_id', targetKey: 'user_id', as: 'creator' });

  WorkoutPlan.hasMany(PlanExerciseDetail, { foreignKey: 'plan_id', sourceKey: 'plan_id', as: 'items' });
  PlanExerciseDetail.belongsTo(WorkoutPlan, { foreignKey: 'plan_id', targetKey: 'plan_id', as: 'plan' });

  Exercise.hasMany(PlanExerciseDetail, { foreignKey: 'exercise_id', sourceKey: 'exercise_id', as: 'planItems' });
  PlanExerciseDetail.belongsTo(Exercise, { foreignKey: 'exercise_id', targetKey: 'exercise_id', as: 'exercise' });

  Exercise.hasMany(ExerciseImage, { foreignKey: 'exercise_id', sourceKey: 'exercise_id', as: 'images' });
  ExerciseImage.belongsTo(Exercise, { foreignKey: 'exercise_id', targetKey: 'exercise_id', as: 'exercise' });

  // Exercises ↔ ExerciseFavorites
  Exercise.hasMany(ExerciseFavorite, { foreignKey: 'exercise_id', sourceKey: 'exercise_id', as: 'favorites' });
  ExerciseFavorite.belongsTo(Exercise, { foreignKey: 'exercise_id', targetKey: 'exercise_id', as: 'exercise' });

  User.hasMany(ExerciseFavorite, { foreignKey: 'user_id', sourceKey: 'user_id', as: 'favoriteExercises' });
  ExerciseFavorite.belongsTo(User, { foreignKey: 'user_id', targetKey: 'user_id', as: 'user' });

  // Users ↔ UserWorkoutLogs
  User.hasMany(UserWorkoutLog, { foreignKey: 'user_id', sourceKey: 'user_id', as: 'workoutLogs' });
  UserWorkoutLog.belongsTo(User, { foreignKey: 'user_id', targetKey: 'user_id', as: 'user' });

  WorkoutPlan.hasMany(UserWorkoutLog, { foreignKey: 'plan_id', sourceKey: 'plan_id', as: 'logs' });
  UserWorkoutLog.belongsTo(WorkoutPlan, { foreignKey: 'plan_id', targetKey: 'plan_id', as: 'plan' });

  UserWorkoutLog.hasMany(UserWorkoutLogDetail, { foreignKey: 'log_id', sourceKey: 'log_id', as: 'sets' });
  UserWorkoutLogDetail.belongsTo(UserWorkoutLog, { foreignKey: 'log_id', targetKey: 'log_id', as: 'log' });

  Exercise.hasMany(UserWorkoutLogDetail, { foreignKey: 'exercise_id', sourceKey: 'exercise_id', as: 'performedSets' });
  UserWorkoutLogDetail.belongsTo(Exercise, { foreignKey: 'exercise_id', targetKey: 'exercise_id', as: 'exercise' });

  // ===== Workout tracking (session-based) =====
  User.hasMany(WorkoutSession, { foreignKey: 'user_id', sourceKey: 'user_id', as: 'workoutSessions' });
  WorkoutSession.belongsTo(User, { foreignKey: 'user_id', targetKey: 'user_id', as: 'user' });

  WorkoutPlan.hasMany(WorkoutSession, { foreignKey: 'plan_id', sourceKey: 'plan_id', as: 'sessions' });
  WorkoutSession.belongsTo(WorkoutPlan, { foreignKey: 'plan_id', targetKey: 'plan_id', as: 'plan' });

  WorkoutSession.hasMany(WorkoutSessionExercise, { foreignKey: 'session_id', sourceKey: 'session_id', as: 'exercises' });
  WorkoutSessionExercise.belongsTo(WorkoutSession, { foreignKey: 'session_id', targetKey: 'session_id', as: 'session' });

  Exercise.hasMany(WorkoutSessionExercise, { foreignKey: 'exercise_id', sourceKey: 'exercise_id', as: 'sessionExercises' });
  WorkoutSessionExercise.belongsTo(Exercise, { foreignKey: 'exercise_id', targetKey: 'exercise_id', as: 'exercise' });

  PlanExerciseDetail.hasMany(WorkoutSessionExercise, { foreignKey: 'plan_exercise_id', sourceKey: 'plan_exercise_id', as: 'sessionItems' });
  WorkoutSessionExercise.belongsTo(PlanExerciseDetail, { foreignKey: 'plan_exercise_id', targetKey: 'plan_exercise_id', as: 'planItem' });

  WorkoutSessionExercise.hasMany(WorkoutSessionSet, { foreignKey: 'session_exercise_id', sourceKey: 'session_exercise_id', as: 'sets' });
  WorkoutSessionSet.belongsTo(WorkoutSessionExercise, { foreignKey: 'session_exercise_id', targetKey: 'session_exercise_id', as: 'sessionExercise' });
  
  // Users + LoginHistory
  User.hasMany(LoginHistory, { foreignKey: 'user_id', sourceKey: 'user_id', as: 'loginHistory' });
  LoginHistory.belongsTo(User, { foreignKey: 'user_id', targetKey: 'user_id', as: 'user' });
  
  // Trả ra để dùng nếu bạn muốn

  return {
    User,
    PasswordReset,
    OnboardingStep,
    OnboardingField,
    OnboardingSession,
    OnboardingAnswer,
    Exercise,
    ExerciseImage,
    ExerciseFavorite,
    WorkoutPlan,
    PlanExerciseDetail,
    UserWorkoutLog,
    UserWorkoutLogDetail,
    LoginHistory,
    WorkoutSession,
    WorkoutSessionExercise,
    WorkoutSessionSet,
    AIUsage,
  };
}
