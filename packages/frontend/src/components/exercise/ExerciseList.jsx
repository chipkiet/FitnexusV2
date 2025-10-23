import React from "react";

export default function ExerciseList({ exercises, loading, error }) {
  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white/5 p-4 rounded-lg">
              <div className="h-4 bg-purple-200/20 rounded w-3/4"></div>
              <div className="space-y-2 mt-4">
                <div className="h-3 bg-purple-200/10 rounded"></div>
                <div className="h-3 bg-purple-200/10 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  if (!exercises.length) {
    return (
      <div className="p-8 text-center text-purple-200/60">
        Select a body part to see available exercises
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {exercises.map((exercise) => (
        <div
          key={exercise.id}
          className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors cursor-pointer group"
        >
          <h3 className="text-purple-100 font-medium group-hover:text-white transition-colors">
            {exercise.name}
          </h3>
          
          <div className="mt-2 space-y-2">
            {exercise.equipment && (
              <div className="flex items-center gap-2 text-sm text-purple-300/80">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <span>{exercise.equipment}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-sm text-purple-300/80">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>{exercise.difficulty}</span>
            </div>

            {exercise.muscle_target && (
              <div className="flex items-center gap-2 text-sm text-purple-300/80">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span>{exercise.muscle_target}</span>
              </div>
            )}
          </div>

          {exercise.description && (
            <p className="mt-3 text-sm text-purple-200/60 line-clamp-2">
              {exercise.description}
            </p>
          )}

          {exercise.video_url && (
            <a
              href={exercise.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Watch Video
            </a>
          )}
        </div>
      ))}
    </div>
  );
}